const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const INTERNAL_BASE_URL = process.env.API_BASE_URL_INTERNAL ?? PUBLIC_BASE_URL;

const resolveBaseUrl = () => (typeof window === "undefined" ? INTERNAL_BASE_URL : PUBLIC_BASE_URL);

export const apiUrl = (path) => {
  if (!path.startsWith("/")) {
    throw new Error("apiUrl paths must start with '/'");
  }
  return `${resolveBaseUrl()}${path}`;
};
