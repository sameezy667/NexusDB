/**
 * @file next.config.mjs
 * @description Next.js configuration (ESM format for maximum Vercel compatibility).
 *   Using .mjs instead of .ts to avoid the "Failed to load next.config.ts"
 *   build error on Vercel caused by SWC not being initialised before the
 *   config file is parsed.
 *
 *   NOTE: The /api/generate, /api/generate-data, and /deploy/* rewrites have
 *   been replaced by server-side Route Handlers in src/app/api/ * /route.ts.
 *   Those handlers read the private BACKEND_API_URL env var at *runtime*  —
 *   not at build time — which is why the previous next.config.ts rewrite was
 *   producing 404s on Vercel.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
