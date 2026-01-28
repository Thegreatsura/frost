import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";

const DOCS_DIR = join(process.cwd(), "src/app/docs");

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path") || "";
  const sanitized = path.replace(/[^a-z0-9\-/]/gi, "");
  const filePath = join(DOCS_DIR, sanitized, "page.mdx");

  if (!filePath.startsWith(DOCS_DIR)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const content = await readFile(filePath, "utf-8");
    return new NextResponse(content, {
      headers: { "content-type": "text/markdown; charset=utf-8" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
