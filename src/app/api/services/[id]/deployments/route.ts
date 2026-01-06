import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const deployments = await db
    .selectFrom("deployments")
    .selectAll()
    .where("service_id", "=", id)
    .orderBy("created_at", "desc")
    .limit(20)
    .execute();

  return NextResponse.json(deployments);
}
