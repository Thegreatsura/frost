import { NextResponse } from "next/server";
import { getDevPassword } from "@/lib/auth";
import { getDemoPassword, isDemoMode } from "@/lib/demo-mode";

export async function GET() {
  const devPassword = getDevPassword();
  const demoMode = isDemoMode();
  const demoPassword = getDemoPassword();
  return NextResponse.json({ devPassword, demoMode, demoPassword });
}
