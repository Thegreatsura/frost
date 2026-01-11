"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useDeleteService,
  useService,
  useUpdateService,
} from "@/hooks/use-services";

export default function ServiceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const serviceId = params.serviceId as string;

  const { data: service } = useService(serviceId);
  const updateMutation = useUpdateService(serviceId, projectId);
  const deleteMutation = useDeleteService(projectId);

  const [editingHealth, setEditingHealth] = useState(false);
  const [healthPath, setHealthPath] = useState("");
  const [healthTimeout, setHealthTimeout] = useState(60);

  function handleEditHealth() {
    if (service) {
      setHealthPath(service.healthCheckPath ?? "");
      setHealthTimeout(service.healthCheckTimeout ?? 60);
      setEditingHealth(true);
    }
  }

  async function handleSaveHealth() {
    try {
      await updateMutation.mutateAsync({
        healthCheckPath: healthPath || null,
        healthCheckTimeout: healthTimeout,
      });
      toast.success("Health check settings saved");
      setEditingHealth(false);
    } catch {
      toast.error("Failed to save");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this service? This cannot be undone.")) return;
    try {
      await deleteMutation.mutateAsync(serviceId);
      toast.success("Service deleted");
      router.push(`/projects/${projectId}`);
    } catch {
      toast.error("Failed to delete service");
    }
  }

  if (!service) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-300">
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-3 gap-4 text-sm">
            {service.deployType === "repo" ? (
              <>
                <div>
                  <dt className="text-neutral-500">Branch</dt>
                  <dd className="mt-1 font-mono text-neutral-300">
                    {service.branch}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Dockerfile</dt>
                  <dd className="mt-1 font-mono text-neutral-300">
                    {service.dockerfilePath}
                  </dd>
                </div>
              </>
            ) : (
              <div>
                <dt className="text-neutral-500">Image</dt>
                <dd className="mt-1 font-mono text-neutral-300">
                  {service.imageUrl}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-neutral-500">Container Port</dt>
              <dd className="mt-1 font-mono text-neutral-300">
                {service.containerPort ?? 8080}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium text-neutral-300">
            <span>Health Check</span>
            {!editingHealth && (
              <Button variant="ghost" size="sm" onClick={handleEditHealth}>
                <Pencil className="mr-1 h-3 w-3" />
                Edit
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-xs text-neutral-500">
            Verify app is responding before marking deployment as successful.
          </p>
          {editingHealth ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1 block text-xs text-neutral-500">
                    Path (empty = TCP check)
                  </span>
                  <input
                    type="text"
                    value={healthPath}
                    onChange={(e) => setHealthPath(e.target.value)}
                    placeholder="/health"
                    className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 font-mono text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-neutral-500">
                    Timeout (seconds)
                  </span>
                  <input
                    type="number"
                    value={healthTimeout}
                    onChange={(e) => setHealthTimeout(Number(e.target.value))}
                    min={1}
                    max={300}
                    className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 font-mono text-sm text-neutral-200 focus:border-neutral-600 focus:outline-none"
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveHealth}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingHealth(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-neutral-500">Method</dt>
                <dd className="mt-1 font-mono text-neutral-300">
                  {service.healthCheckPath
                    ? `HTTP GET ${service.healthCheckPath}`
                    : "TCP"}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Timeout</dt>
                <dd className="mt-1 font-mono text-neutral-300">
                  {service.healthCheckTimeout ?? 60}s
                </dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>

      <Card className="border-red-900/50 bg-neutral-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-400">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-300">Delete Service</p>
              <p className="text-xs text-neutral-500">
                Permanently delete this service and all its deployments
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-1 h-4 w-4" />
              )}
              Delete Service
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
