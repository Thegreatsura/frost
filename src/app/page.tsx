import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await db.selectFrom("projects").selectAll().execute();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link
          href="/projects/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-muted-foreground">No projects yet.</p>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block p-4 border rounded-lg hover:border-primary"
            >
              <h2 className="font-semibold">{project.name}</h2>
              <p className="text-sm text-muted-foreground">{project.repo_url}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {project.branch} · port {project.port}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
