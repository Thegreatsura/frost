import { NextResponse } from "next/server";
import { clearUpdateResult, getUpdateResult } from "@/lib/updater";

export async function GET() {
  const result = getUpdateResult();

  if (result.completed) {
    clearUpdateResult();
  }

  return NextResponse.json(result);
}
