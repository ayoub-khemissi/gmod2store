import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./uploads";

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function saveArchive(
  buffer: Buffer,
  originalName: string,
): Promise<{ path: string; size: number }> {
  const dir = path.join(UPLOAD_DIR, "archives");

  await ensureDir(dir);

  const ext = path.extname(originalName);
  const filename = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(dir, filename);

  await fs.writeFile(filePath, new Uint8Array(buffer));

  return { path: `/uploads/archives/${filename}`, size: buffer.length };
}

export async function saveImage(
  buffer: Buffer,
  originalName: string,
): Promise<string> {
  const dir = path.join(UPLOAD_DIR, "images");

  await ensureDir(dir);

  // Use sharp for resize/convert
  const sharp = (await import("sharp")).default;
  const filename = `${crypto.randomUUID()}.webp`;
  const filePath = path.join(dir, filename);

  await sharp(buffer)
    .resize(1200, 800, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(filePath);

  return `/uploads/images/${filename}`;
}

export async function deleteFile(filePath: string): Promise<void> {
  const fullPath = path.join(UPLOAD_DIR, filePath.replace(/^\/uploads\//, ""));

  try {
    await fs.unlink(fullPath);
  } catch {
    // File may not exist
  }
}
