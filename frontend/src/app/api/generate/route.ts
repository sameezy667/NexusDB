/**
 * @file route.ts
 * @description Server-side proxy for POST /api/generate.
 *   Reads BACKEND_API_URL (or NEXT_PUBLIC_API_URL as fallback) at runtime and
 *   forwards the multipart/form-data request to the FastAPI backend.
 * @module frontend/api/generate
 */

import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "../_lib/backend";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const BACKEND_URL = getBackendUrl();
  try {
    if (!BACKEND_URL) {
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
