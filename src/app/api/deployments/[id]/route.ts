import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const deployment = await db
    .selectFrom("deployments")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();

  if (!deployment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(deployment);
}
