const CLOUDINARY_BASE = "https://res.cloudinary.com/dzlm6jkhv/";
const PLACEHOLDER = "/placeholder.png";

const ensureProtocol = (value) => (value.startsWith("//") ? `https:${value}` : value);

export const buildImageUrl = (src = "", base = CLOUDINARY_BASE) => {
  const normalized = String(src ?? "").trim();
  if (!normalized) return PLACEHOLDER;

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (/^\/https?:\/\//i.test(normalized)) {
    return normalized.replace(/^\/+/, "");
  }

  if (/^\/\//.test(normalized)) {
    return ensureProtocol(normalized);
  }

  const cleanedBase = base.endsWith("/") ? base : `${base}/`;
  const cleanedPath = normalized.replace(/^\/+/, "");
  return `${cleanedBase}${cleanedPath}`;
};

export const cloudinaryBaseUrl = CLOUDINARY_BASE;
