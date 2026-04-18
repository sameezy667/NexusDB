/**
 * @file next.config.ts
 * @description Next.js configuration.
 *   NOTE: The /api/generate and /api/generate-data rewrites have been replaced
 *   by server-side Route Handlers in src/app/api/*/route.ts.
 *   Those handlers read the private BACKEND_API_URL env var at *runtime*,
 *   which is why the previous next.config.ts rewrite (which baked the URL at
 *   build time) was producing 404s on Vercel.
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
