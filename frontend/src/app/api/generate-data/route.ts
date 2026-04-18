/**
 * @file route.ts
 * @description Server-side proxy for POST /api/generate-data.
 *   Forwards JSON body to the FastAPI backend at runtime using
 *   the private BACKEND_API_URL variable (never exposed to the browser).
 * @module frontend/api/generate-data
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

    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_URL}/api/generate-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const contentType = backendRes.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const json = await backendRes.json();
      return NextResponse.json(json, { status: backendRes.status });
    }

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
    console.error("[/api/generate-data proxy] Error:", err);
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
