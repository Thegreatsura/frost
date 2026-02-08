import { NextResponse } from "next/server";

export function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;

  return NextResponse.json({
    resource: `${origin}/api/mcp`,
    authorization_servers: [origin],
  });
}
