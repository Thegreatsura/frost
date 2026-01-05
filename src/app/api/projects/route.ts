import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const projects = await db.selectFrom("projects").selectAll().execute();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    name,
    repo_url,
    branch = "main",
    dockerfile_path = "Dockerfile",
    port = 3000,
  } = body;

  if (!name || !repo_url) {
    return NextResponse.json(
      { error: "name and repo_url required" },
      { status: 400 },
    );
  }

  const id = nanoid();
  const now = Date.now();

  await db
    .insertInto("projects")
    .values({
      id,
      name,
      repo_url,
      branch,
      dockerfile_path,
      port,
      created_at: now,
    })
    .execute();

  const project = await db
    .selectFrom("projects")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();

  return NextResponse.json(project, { status: 201 });
}
