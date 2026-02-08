import { NextResponse } from "next/server";
import { getRequestOrigin } from "@/lib/request-utils";

export function GET(request: Request) {
  const origin = getRequestOrigin(request);

  return NextResponse.json({
    resource: `${origin}/api/mcp`,
    authorization_servers: [origin],
  });
}
