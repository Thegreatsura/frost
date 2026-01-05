"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Deployment {
  id: string;
  commit_sha: string;
  status: string;
  host_port: number | null;
  created_at: number;
  finished_at: number | null;
  build_log: string | null;
  error_message: string | null;
}

interface Project {
  id: string;
  name: string;
  repo_url: string;
  branch: string;
  dockerfile_path: string;
  port: number;
  deployments: Deployment[];
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [selectedDeployment, setSelectedDeployment] =
    useState<Deployment | null>(null);

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data);
      if (data.deployments.length > 0) {
        setSelectedDeployment(data.deployments[0]);
      }
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchProject();
    const interval = setInterval(fetchProject, 2000);
    return () => clearInterval(interval);
  }, [fetchProject]);

  async function handleDeploy() {
    setDeploying(true);
    const res = await fetch(`/api/projects/${params.id}/deploy`, {
      method: "POST",
    });
    if (res.ok) {
      await fetchProject();
    }
    setDeploying(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects/${params.id}`, { method: "DELETE" });
    router.push("/");
  }

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  const runningDeployment = project.deployments.find(
    (d) => d.status === "running",
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground text-sm">{project.repo_url}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDeploy} disabled={deploying}>
            {deploying ? "Deploying..." : "Deploy"}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      {runningDeployment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Running</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <a
                href={`http://localhost:${runningDeployment.host_port}`}
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                http://localhost:{runningDeployment.host_port}
              </a>
            </p>
            <p className="text-sm text-muted-foreground">
              Commit: {runningDeployment.commit_sha}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deployments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {project.deployments.length === 0 ? (
                <p className="p-4 text-muted-foreground">No deployments yet</p>
              ) : (
                <div className="divide-y">
                  {project.deployments.map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => setSelectedDeployment(d)}
                      className={`w-full text-left p-4 hover:bg-muted ${
                        selectedDeployment?.id === d.id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">
                          {d.commit_sha}
                        </span>
                        <StatusBadge status={d.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(d.created_at).toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          {selectedDeployment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Build Log</span>
                  <StatusBadge status={selectedDeployment.status} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDeployment.error_message && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {selectedDeployment.error_message}
                  </div>
                )}
                <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-96 whitespace-pre-wrap">
                  {selectedDeployment.build_log || "No logs yet..."}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Branch</dt>
              <dd>{project.branch}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Dockerfile</dt>
              <dd>{project.dockerfile_path}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Container Port</dt>
              <dd>{project.port}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-800",
    cloning: "bg-blue-100 text-blue-800",
    building: "bg-yellow-100 text-yellow-800",
    deploying: "bg-purple-100 text-purple-800",
    running: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || colors.pending}`}
    >
      {status}
    </span>
  );
}
