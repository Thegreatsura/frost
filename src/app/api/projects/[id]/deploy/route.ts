import { db } from "@/lib/db";
import { deploy } from "@/lib/deployer";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const project = await db
    .selectFrom("projects")
    .select("id")
    .where("id", "=", id)
    .executeTakeFirst();

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const deploymentId = await deploy(id);

  return NextResponse.json({ deployment_id: deploymentId }, { status: 202 });
}
