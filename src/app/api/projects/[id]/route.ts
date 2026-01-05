import { db } from "@/lib/db";
import { stopContainer } from "@/lib/docker";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const project = await db
    .selectFrom("projects")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const deployments = await db
    .selectFrom("deployments")
    .selectAll()
    .where("project_id", "=", id)
    .orderBy("created_at", "desc")
    .limit(10)
    .execute();

  return NextResponse.json({ ...project, deployments });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const deployments = await db
    .selectFrom("deployments")
    .select("container_id")
    .where("project_id", "=", id)
    .execute();

  for (const deployment of deployments) {
    if (deployment.container_id) {
      await stopContainer(deployment.container_id);
    }
  }

  await db.deleteFrom("projects").where("id", "=", id).execute();

  return NextResponse.json({ success: true });
}
