import { NextResponse } from "next/server";
import { SERVICE_TEMPLATES } from "@/lib/templates";

export async function GET() {
  return NextResponse.json(SERVICE_TEMPLATES);
}
