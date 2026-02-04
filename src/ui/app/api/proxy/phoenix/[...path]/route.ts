import { NextRequest, NextResponse } from "next/server";

/**
 * Phoenix API proxy route
 * Forwards requests to the Phoenix telemetry server
 *
 * Environment variable: PHOENIX_API_URL (default: http://localhost:6006)
 */

const PHOENIX_API_URL = process.env.PHOENIX_API_URL ?? "http://localhost:6006";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const phoenixPath = path.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${PHOENIX_API_URL}/${phoenixPath}${searchParams ? `?${searchParams}` : ""}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Phoenix API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to Phoenix API" },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const phoenixPath = path.join("/");
  const url = `${PHOENIX_API_URL}/${phoenixPath}`;

  try {
    const body = await request.json();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Phoenix API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to Phoenix API" },
      { status: 502 }
    );
  }
}
