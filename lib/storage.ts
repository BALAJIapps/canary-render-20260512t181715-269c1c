/**
 * File upload & storage via multiple providers.
 * Supports: Uploadthing, Cloudflare R2, Vercel Blob, local fallback.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type StorageProvider = "uploadthing" | "r2" | "vercel-blob" | "local";

function detectProvider(): StorageProvider {
  if (process.env.UPLOADTHING_SECRET) return "uploadthing";
  if (process.env.R2_ACCESS_KEY_ID) return "r2";
  if (process.env.BLOB_READ_WRITE_TOKEN) return "vercel-blob";
  return "local";
}

/** Normalise File | Buffer to a plain Uint8Array backed by a fresh ArrayBuffer. */
async function normalise(file: File | Buffer): Promise<Uint8Array> {
  if (file instanceof File) {
    return new Uint8Array(await file.arrayBuffer());
  }
  // Copy Buffer bytes into a brand-new ArrayBuffer (avoids ArrayBufferLike issue)
  const fresh = new ArrayBuffer(file.byteLength);
  new Uint8Array(fresh).set(file);
  return new Uint8Array(fresh);
}

/** Build a Blob from bytes without triggering strict BlobPart type errors. */
function makeBlob(bytes: Uint8Array, contentType: string): Blob {
  // Pass the underlying ArrayBuffer — it IS a strict ArrayBuffer after our copy
  return new Blob([bytes.buffer as ArrayBuffer], { type: contentType });
}

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  name: string;
}

export async function uploadFile(
  file: File | Buffer,
  filename: string,
  options?: { folder?: string; contentType?: string },
): Promise<UploadResult> {
  const provider = detectProvider();
  switch (provider) {
    case "uploadthing": return uploadToUploadthing(file, filename, options);
    case "r2": return uploadToR2(file, filename, options);
    case "vercel-blob": return uploadToVercelBlob(file, filename, options);
    case "local": return uploadToLocal(file, filename, options);
  }
}

export async function getFileUrl(key: string): Promise<string> {
  const provider = detectProvider();
  switch (provider) {
    case "uploadthing": return `https://utfs.io/f/${key}`;
    case "r2": return `${process.env.R2_PUBLIC_URL ?? ""}/${key}`;
    case "vercel-blob": return key;
    case "local": return `/uploads/${key}`;
  }
}

export async function deleteFile(key: string): Promise<void> {
  const provider = detectProvider();
  if (provider === "r2") await deleteFromR2(key);
  if (provider === "vercel-blob") await deleteFromVercelBlob(key);
}

// ── Uploadthing ───────────────────────────────────────────────────

async function uploadToUploadthing(
  file: File | Buffer,
  filename: string,
  options?: { folder?: string; contentType?: string },
): Promise<UploadResult> {
  const secret = process.env.UPLOADTHING_SECRET;
  if (!secret) throw new Error("UPLOADTHING_SECRET not set");
  const bytes = await normalise(file);
  const blob = makeBlob(bytes, options?.contentType ?? "application/octet-stream");
  const formData = new FormData();
  formData.append("file", blob, filename);
  const resp = await fetch("https://uploadthing.com/api/uploadFiles", {
    method: "POST",
    headers: { "x-uploadthing-api-key": secret },
    body: formData,
  });
  if (!resp.ok) throw new Error(`Uploadthing error: ${resp.status}`);
  const data = await resp.json() as any;
  const result = Array.isArray(data) ? data[0] : data;
  return {
    url: String(result?.url ?? result?.fileUrl ?? ""),
    key: String(result?.key ?? result?.fileKey ?? ""),
    size: Number(result?.size ?? 0),
    name: filename,
  };
}

// ── Cloudflare R2 ─────────────────────────────────────────────────

async function uploadToR2(
  file: File | Buffer,
  filename: string,
  options?: { folder?: string; contentType?: string },
): Promise<UploadResult> {
  const { R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT } = process.env;
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_ENDPOINT) {
    throw new Error("R2 env vars not set");
  }
  const key = options?.folder ? `${options.folder}/${filename}` : filename;
  const bytes = await normalise(file);
  const resp = await fetch(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`, {
    method: "PUT",
    headers: { "content-type": options?.contentType ?? "application/octet-stream" },
    body: bytes.buffer as ArrayBuffer,
  });
  if (!resp.ok) throw new Error(`R2 upload failed: ${resp.status}`);
  return {
    url: `${process.env.R2_PUBLIC_URL ?? R2_ENDPOINT}/${key}`,
    key,
    size: bytes.byteLength,
    name: filename,
  };
}

async function deleteFromR2(key: string): Promise<void> {
  const { R2_ENDPOINT, R2_BUCKET_NAME } = process.env;
  await fetch(`${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`, { method: "DELETE" });
}

// ── Vercel Blob ───────────────────────────────────────────────────

async function uploadToVercelBlob(
  file: File | Buffer,
  filename: string,
  options?: { folder?: string; contentType?: string },
): Promise<UploadResult> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN not set");
  const bytes = await normalise(file);
  const pathname = options?.folder ? `${options.folder}/${filename}` : filename;
  const resp = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      "x-content-type": options?.contentType ?? "application/octet-stream",
    },
    body: bytes.buffer as ArrayBuffer,
  });
  if (!resp.ok) throw new Error(`Vercel Blob error: ${resp.status}`);
  const data = await resp.json() as { url: string; pathname?: string };
  return { url: data.url, key: data.pathname ?? pathname, size: bytes.byteLength, name: filename };
}

async function deleteFromVercelBlob(key: string): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return;
  await fetch(`https://blob.vercel-storage.com?url=${encodeURIComponent(key)}`, {
    method: "DELETE",
    headers: { authorization: `Bearer ${token}` },
  });
}

// ── Local filesystem (dev fallback) ───────────────────────────────

async function uploadToLocal(
  file: File | Buffer,
  filename: string,
  options?: { folder?: string },
): Promise<UploadResult> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const dir = path.join(process.cwd(), "public", "uploads", options?.folder ?? "");
  await fs.mkdir(dir, { recursive: true });
  const bytes = await normalise(file);
  await fs.writeFile(path.join(dir, filename), Buffer.from(bytes));
  const key = options?.folder ? `${options.folder}/${filename}` : filename;
  return { url: `/uploads/${key}`, key, size: bytes.byteLength, name: filename };
}
