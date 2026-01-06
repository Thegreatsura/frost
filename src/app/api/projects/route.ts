import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const projects = await db.selectFrom("projects").selectAll().execute();

  const projectsWithCount = await Promise.all(
    projects.map(async (project) => {
      const servicesCount = await db
        .selectFrom("services")
        .select(db.fn.count("id").as("count"))
        .where("project_id", "=", project.id)
        .executeTakeFirst();

      return {
        ...project,
        servicesCount: Number(servicesCount?.count ?? 0),
      };
    }),
  );

  return NextResponse.json(projectsWithCount);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, env_vars = [] } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const id = nanoid();
  const now = Date.now();

  await db
    .insertInto("projects")
    .values({
      id,
      name,
      env_vars: JSON.stringify(env_vars),
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
