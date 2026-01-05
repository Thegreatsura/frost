export interface ProjectsTable {
  id: string;
  name: string;
  repo_url: string;
  branch: string;
  dockerfile_path: string;
  port: number;
  created_at: number;
}

export interface DeploymentsTable {
  id: string;
  project_id: string;
  commit_sha: string;
  commit_message: string | null;
  status: string;
  container_id: string | null;
  host_port: number | null;
  build_log: string | null;
  error_message: string | null;
  created_at: number;
  finished_at: number | null;
}

export interface DB {
  projects: ProjectsTable;
  deployments: DeploymentsTable;
}
