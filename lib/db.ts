import mysql, {
  Pool,
  PoolOptions,
  RowDataPacket,
  ResultSetHeader,
} from "mysql2/promise";

const poolConfig: PoolOptions = {
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "gmod2store",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool(poolConfig);
  }

  return pool;
}

export async function query<T extends RowDataPacket[]>(
  sql: string,
  params?: unknown[],
): Promise<T> {
  const [rows] = await getPool().query<T>(sql, params);

  return rows;
}

export async function execute(
  sql: string,
  params?: unknown[],
): Promise<ResultSetHeader> {
  const [result] = await getPool().execute<ResultSetHeader>(sql, params);

  return result;
}

export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>,
): Promise<T> {
  const connection = await getPool().getConnection();

  await connection.beginTransaction();

  try {
    const result = await callback(connection);

    await connection.commit();

    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
