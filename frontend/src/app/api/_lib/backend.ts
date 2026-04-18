/**
 * @file backend.ts
 * @description Resolves the FastAPI backend URL from environment variables.
 *   Handles the common misconfiguration where the URL is stored without a
 *   protocol prefix (e.g. "example.up.railway.app" instead of
 *   "https://example.up.railway.app"), which causes Node fetch() to throw
 *   "Failed to parse URL".
 * @module frontend/api/_lib
 */

/**
 * Returns the normalised backend base URL (no trailing slash, always has a
 * protocol).  Reads, in priority order:
 *   1. BACKEND_API_URL   — private, server-only, preferred
 *   2. NEXT_PUBLIC_API_URL — public build-time var, legacy fallback
 *   3. http://localhost:8000 — local development default
 */
export function getBackendUrl(): string {
  let url = (
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000"
  ).trim();

  // NOTE: Guard against URLs stored without a protocol prefix.
  // Node's fetch() throws "Failed to parse URL" if the protocol is missing.
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  // Strip trailing slash for clean path concatenation
  return url.replace(/\/$/, "");
}
