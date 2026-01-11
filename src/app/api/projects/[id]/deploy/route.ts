import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deployProject } from "@/lib/deployer";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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

  const deploymentIds = await deployProject(id);

  return NextResponse.json({ deploymentIds }, { status: 202 });
}
