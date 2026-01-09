import { NextResponse } from "next/server";
import { DATABASE_TEMPLATES } from "@/lib/db-templates";

export async function GET() {
  return NextResponse.json(DATABASE_TEMPLATES);
}
