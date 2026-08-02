export const MAX_FILE_BYTES = 500 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/vnd.rar",
  "application/x-7z-compressed",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|svg)$/i;

const EXT_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx":
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".zip": "application/zip",
  ".rar": "application/vnd.rar",
  ".7z": "application/x-7z-compressed",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export function isAllowedMime(contentType: string) {
  return ALLOWED_MIME_TYPES.has(contentType);
}

export function contentTypeForFile(file: File) {
  if (file.type && isAllowedMime(file.type)) return file.type;
  const match = file.name.toLowerCase().match(/\.[a-z0-9]+$/);
  if (!match) return null;
  const mime = EXT_MIME[match[0]];
  return mime && isAllowedMime(mime) ? mime : null;
}

export function isImageAttachment(filenameOrKey: string) {
  return IMAGE_EXT.test(filenameOrKey);
}

export function safeFilename(name: string) {
  const base = name.split(/[/\\]/).pop() || "file";
  return base.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 180) || "file";
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export async function signDownloadUrl(chatId: string, key: string) {
  const res = await fetch("/api/attachments/sign-download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, key }),
  });
  if (!res.ok) throw new Error("sign_download_failed");
  const json = (await res.json()) as { url?: string };
  if (!json.url) throw new Error("sign_download_failed");
  return json.url;
}

export async function uploadAttachment(opts: {
  chatId: string;
  file: File;
  onProgress?: (pct: number) => void;
}) {
  const { chatId, file, onProgress } = opts;

  if (file.size <= 0) throw new Error("empty_file");
  if (file.size > MAX_FILE_BYTES) throw new Error("file_too_large");
  const contentType = contentTypeForFile(file);
  if (!contentType) throw new Error("type_not_allowed");

  const signRes = await fetch("/api/attachments/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chatId,
      filename: file.name,
      contentType,
      size: file.size,
    }),
  });

  if (!signRes.ok) {
    const err = (await signRes.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(err.error || "sign_upload_failed");
  }

  const { uploadUrl, key } = (await signRes.json()) as {
    uploadUrl: string;
    key: string;
  };

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable || !onProgress) return;
      onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error("upload_failed"));
    };
    xhr.onerror = () => reject(new Error("upload_failed"));
    xhr.send(file);
  });

  onProgress?.(100);
  return { key, size: file.size, filename: file.name };
}
