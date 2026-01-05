import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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
