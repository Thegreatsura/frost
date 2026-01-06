import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_SECRET = "frost-default-secret-change-me";

function isAuthEnabled(): boolean {
  const secret = process.env.FROST_JWT_SECRET;
  return secret !== undefined && secret !== DEFAULT_SECRET;
}

function verifySessionToken(token: string): boolean {
  const secret = process.env.FROST_JWT_SECRET;
  if (!secret) return false;

  const [data, signature] = token.split(".");
  if (!data || !signature) return false;

  const expectedSignature = createHmac("sha256", secret)
    .update(data)
    .digest("base64url");

  if (signature !== expectedSignature) return false;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAuthEnabled()) {
    return NextResponse.next();
  }

  if (pathname === "/login" || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("frost_session")?.value;

  if (!token || !verifySessionToken(token)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
