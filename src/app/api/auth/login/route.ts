import { NextResponse } from "next/server";
import {
  createSessionToken,
  getAdminPasswordHash,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const { password } = body;

  if (!password) {
    return NextResponse.json(
      { error: "password is required" },
      { status: 400 },
    );
  }

  const hash = await getAdminPasswordHash();
  if (!hash) {
    return NextResponse.json({ error: "setup not complete" }, { status: 503 });
  }

  const valid = await verifyPassword(password, hash);
  if (!valid) {
    return NextResponse.json({ error: "invalid password" }, { status: 401 });
  }

  const token = createSessionToken();
  const response = NextResponse.json({ success: true });

  const isHttps =
    request.headers.get("x-forwarded-proto") === "https" ||
    request.url.startsWith("https://");

  response.cookies.set("frost_session", token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
