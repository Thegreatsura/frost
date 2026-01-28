import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const accept = request.headers.get("accept") || "";
  const prefersMarkdown =
    accept.includes("text/markdown") &&
    accept.indexOf("text/markdown") < accept.indexOf("text/html");

  if (prefersMarkdown) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/docs-markdown";
    url.searchParams.set("path", request.nextUrl.pathname.replace("/docs", ""));
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/docs/:path*",
};
