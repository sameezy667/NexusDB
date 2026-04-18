/**
 * @file route.ts
 * @description Server-side proxy for POST /api/generate.
 *   Reads the private BACKEND_API_URL env var at runtime (never exposed to
 *   the browser) and forwards the multipart/form-data request to the FastAPI
 *   backend running on Railway (or any other host).
 *
 *   Why a Route Handler instead of next.config.ts rewrites?
 *   - Rewrites bake the destination URL at *build time*. If the env var isn't
 *     present during the Vercel build the URL falls back to localhost:8000,
 *     which is unreachable from Vercel's servers → 404.
 *   - Route Handlers execute on the *server at request time*, so BACKEND_API_URL
 *     is always resolved from the live Vercel environment variables.
 *
 * @module frontend/api/generate
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000"
).replace(/\/$/, "");

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    if (!BACKEND_URL || BACKEND_URL.trim() === "") {
      return NextResponse.json(
        {
          error: "misconfiguration",
          message:
            "BACKEND_API_URL is not set. Add it to your Vercel environment variables and redeploy.",
        },
        { status: 503 }
      );
    }

    // Forward the raw multipart body exactly as received
    const formData = await req.formData();

    const backendRes = await fetch(`${BACKEND_URL}/api/generate`, {
      method: "POST",
      body: formData,
      // NOTE: Do NOT set Content-Type here — fetch sets it automatically with
      // the correct boundary for multipart/form-data.
    });

    const contentType = backendRes.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const json = await backendRes.json();
      return NextResponse.json(json, { status: backendRes.status });
    }

    // Non-JSON error from backend — surface it clearly
    const text = await backendRes.text();
    return NextResponse.json(
      {
        error: "backend_error",
        message: `Backend responded with ${backendRes.status}`,
        details: text.slice(0, 500),
      },
      { status: backendRes.status }
    );
  } catch (err: any) {
    console.error("[/api/generate proxy] Error:", err);
    return NextResponse.json(
      {
        error: "proxy_error",
        message: "Failed to reach the backend server.",
        details: err.message,
      },
      { status: 502 }
    );
  }
}
