/**
 * File upload & storage via multiple providers.
 * Supports: Uploadthing, Cloudflare R2, Vercel Blob, local fallback.
 */

type StorageProvider = "uploadthing" | "r2" | "vercel-blob" | "local";

function detectProvider(): StorageProvider {
  if (process.env.UPLOADTHING_SECRET) return "uploadthing";
  if (process.env.R2_ACCESS_KEY_ID) return "r2";
  if (process.env.BLOB_READ_WRITE_TOKEN) return "vercel-blob";
  return "local";
}

/** Convert File to Buffer safely without calling .arrayBuffer() on a union type. */
async function fileToBuffer(file: File): Promise<Buffer> {
  const ab = await file.arrayBuffer();
  return Buffer.from(ab);
}

/** Copy Buffer into a strict ArrayBuffer (BlobPart-compatible). */
function bufferToStrictArrayBuffer(buf: Buffer): ArrayBuffer {
  const ab = new ArrayBuffer(buf.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.byteLength; i++) {
    view[i] = buf[i] as number;
  }
  return ab;
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

  const formData = new FormData();
  let blob: Blob;
  if (file instanceof File) {
    blob = file;
  } else {
    blob = new Blob([bufferToStrictArrayBuffer(file)], {
      type: options?.contentType ?? "application/octet-stream",
    });
  }
  formData.append("file", blob, filename);

  const resp = await fetch("https://uploadthing.com/api/uploadFiles", {
    method: "POST",
    headers: { "x-uploadthing-api-key": secret },
    body: formData,
  });
  if (!resp.ok) throw new Error(`Uploadthing error: ${resp.status}`);
  const data = await resp.json() as Record<string, unknown>[];
  const result = (data[0] ?? data) as Record<string, unknown>;
  return {
    url: String(result.url ?? result.fileUrl ?? ""),
    key: String(result.key ?? result.fileKey ?? ""),
    size: Number(result.size ?? 0),
    name: filename,
  };
}

// ── Cloudflare R2 ─────────────────────────────────────────────────

async function uploadToR2(
  file: File | Buffer,
  filename: string,
  options?: { folder?: string; contentType?: string },
): Promise<UploadResult> {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const endpoint = process.env.R2_ENDPOINT;
  if (!accessKeyId || !secretAccessKey || !bucket || !endpoint) {
    throw new Error("R2 env vars not set");
  }
  const key = options?.folder ? `${options.folder}/${filename}` : filename;
  const body: Buffer = file instanceof File ? await fileToBuffer(file) : file;
  const resp = await fetch(`${endpoint}/${bucket}/${key}`, {
    method: "PUT",
    headers: { "content-type": options?.contentType ?? "application/octet-stream" },
    body,
  });
  if (!resp.ok) throw new Error(`R2 upload failed: ${resp.status}`);
  return {
    url: `${process.env.R2_PUBLIC_URL ?? endpoint}/${key}`,
    key,
    size: body.length,
    name: filename,
  };
}

async function deleteFromR2(key: string): Promise<void> {
  const endpoint = process.env.R2_ENDPOINT;
  const bucket = process.env.R2_BUCKET_NAME;
  await fetch(`${endpoint}/${bucket}/${key}`, { method: "DELETE" });
}

// ── Vercel Blob ───────────────────────────────────────────────────

async function uploadToVercelBlob(
  file: File | Buffer,
  filename: string,
  options?: { folder?: string; contentType?: string },
): Promise<UploadResult> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN not set");
  const body: Buffer = file instanceof File ? await fileToBuffer(file) : file;
  const pathname = options?.folder ? `${options.folder}/${filename}` : filename;
  const resp = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      "x-content-type": options?.contentType ?? "application/octet-stream",
    },
    body,
  });
  if (!resp.ok) throw new Error(`Vercel Blob error: ${resp.status}`);
  const data = await resp.json() as { url: string; pathname?: string };
  return { url: data.url, key: data.pathname ?? pathname, size: body.length, name: filename };
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
  const body: Buffer = file instanceof File ? await fileToBuffer(file) : file;
  await fs.writeFile(path.join(dir, filename), body);
  const key = options?.folder ? `${options.folder}/${filename}` : filename;
  return { url: `/uploads/${key}`, key, size: body.length, name: filename };
}
