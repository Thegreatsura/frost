import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { getSetting } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const [projects, domain] = await Promise.all([
    db.selectFrom("projects").selectAll().execute(),
    getSetting("domain"),
  ]);

  const projectsWithDetails = await Promise.all(
    projects.map(async (project) => {
      const services = await db
        .selectFrom("services")
        .selectAll()
        .where("projectId", "=", project.id)
        .execute();

      const latestDeployment = await db
        .selectFrom("deployments")
        .innerJoin("services", "services.id", "deployments.serviceId")
        .select([
          "deployments.status",
          "deployments.commitMessage",
          "deployments.createdAt",
          "services.branch",
        ])
        .where("deployments.projectId", "=", project.id)
        .orderBy("deployments.createdAt", "desc")
        .executeTakeFirst();

      const runningDeployment = await db
        .selectFrom("deployments")
        .select(["hostPort"])
        .where("projectId", "=", project.id)
        .where("status", "=", "running")
        .where("hostPort", "is not", null)
        .executeTakeFirst();

      const firstService = services[0];
      const repoUrl = firstService?.repoUrl ?? null;

      let runningUrl: string | null = null;
      if (runningDeployment?.hostPort) {
        runningUrl = domain
          ? `${domain}:${runningDeployment.hostPort}`
          : `localhost:${runningDeployment.hostPort}`;
      }

      return {
        ...project,
        servicesCount: services.length,
        latestDeployment: latestDeployment
          ? {
              status: latestDeployment.status,
              commitMessage: latestDeployment.commitMessage,
              createdAt: latestDeployment.createdAt,
              branch: latestDeployment.branch,
            }
          : null,
        repoUrl,
        runningUrl,
      };
    }),
  );

  return NextResponse.json(projectsWithDetails);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, envVars = [] } = body;

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
      envVars: JSON.stringify(envVars),
      createdAt: now,
    })
    .execute();

  const project = await db
    .selectFrom("projects")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();

  return NextResponse.json(project, { status: 201 });
}
