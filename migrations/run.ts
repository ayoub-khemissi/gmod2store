import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "gmod2store",
    multipleStatements: true,
  });

  console.log("Connected to database.");

  // Create migrations tracking table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Get already-run migrations
  const [rows] = await connection.query<mysql.RowDataPacket[]>(
    "SELECT name FROM _migrations ORDER BY id"
  );
  const executed = new Set(rows.map((r) => r.name));

  // Read migration files
  const migrationsDir = path.join(__dirname);
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let ran = 0;
  for (const file of files) {
    if (executed.has(file)) {
      console.log(`  [skip] ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    console.log(`  [run]  ${file}`);
    await connection.query(sql);
    await connection.execute("INSERT INTO _migrations (name) VALUES (?)", [
      file,
    ]);
    ran++;
  }

  if (ran === 0) {
    console.log("No new migrations to run.");
  } else {
    console.log(`Ran ${ran} migration(s) successfully.`);
  }

  await connection.end();
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
