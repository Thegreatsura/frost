export interface Project {
  id: string;
  name: string;
  deploy_type: "repo" | "image";
  repo_url: string | null;
  branch: string | null;
  dockerfile_path: string | null;
  image_url: string | null;
  port: number;
  env_vars: string;
  latestStatus?: string;
  deployments?: Deployment[];
}

export interface Deployment {
  id: string;
  commit_sha: string;
  status: string;
  host_port: number | null;
  created_at: number;
  finished_at: number | null;
  build_log: string | null;
  error_message: string | null;
}

export interface EnvVar {
  key: string;
  value: string;
}

export interface CreateProjectInput {
  name: string;
  deploy_type: "repo" | "image";
  repo_url?: string;
  branch?: string;
  dockerfile_path?: string;
  image_url?: string;
  port: number;
  env_vars?: EnvVar[];
}

export interface UpdateProjectInput {
  env_vars?: EnvVar[];
  port?: number;
  branch?: string;
  dockerfile_path?: string;
  repo_url?: string;
  image_url?: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}

export const api = {
  projects: {
    list: (): Promise<Project[]> =>
      fetch("/api/projects").then((r) => handleResponse<Project[]>(r)),

    get: (id: string): Promise<Project> =>
      fetch(`/api/projects/${id}`).then((r) => handleResponse<Project>(r)),

    create: (data: CreateProjectInput): Promise<Project> =>
      fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => handleResponse<Project>(r)),

    update: (id: string, data: UpdateProjectInput): Promise<Project> =>
      fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => handleResponse<Project>(r)),

    delete: (id: string): Promise<{ success: boolean }> =>
      fetch(`/api/projects/${id}`, { method: "DELETE" }).then((r) =>
        handleResponse<{ success: boolean }>(r)
      ),

    deploy: (id: string): Promise<{ deployment_id: string }> =>
      fetch(`/api/projects/${id}/deploy`, { method: "POST" }).then((r) =>
        handleResponse<{ deployment_id: string }>(r)
      ),
  },

  deployments: {
    get: (id: string): Promise<Deployment> =>
      fetch(`/api/deployments/${id}`).then((r) =>
        handleResponse<Deployment>(r)
      ),
  },
};
