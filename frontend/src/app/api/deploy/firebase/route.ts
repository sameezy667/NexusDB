/**
 * @file route.ts
 * @description Server-side proxy for POST /deploy/firebase.
 *   Forwards the request body to the FastAPI backend at runtime.
 * @module frontend/api/deploy/firebase
 */

import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "../../_lib/backend";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const BACKEND_URL = getBackendUrl();
  try {
    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_URL}/deploy/firebase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await backendRes.json();
    return NextResponse.json(json, { status: backendRes.status });
  } catch (err: any) {
    console.error("[/deploy/firebase proxy] Error:", err);
    return NextResponse.json(
      { error: "proxy_error", message: "Failed to reach the backend server.", details: err.message },
      { status: 502 }
    );
  }
}
