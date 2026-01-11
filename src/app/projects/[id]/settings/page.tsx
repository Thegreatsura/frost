"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useDeleteProject,
  useProject,
  useUpdateProject,
} from "@/hooks/use-projects";

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { data: project } = useProject(projectId);
  const updateMutation = useUpdateProject(projectId);
  const deleteMutation = useDeleteProject();

  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);

  function handleEdit() {
    if (project) {
      setName(project.name);
      setEditing(true);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await updateMutation.mutateAsync({ name: name.trim() });
      toast.success("Project name updated");
      setEditing(false);
    } catch {
      toast.error("Failed to update");
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Delete this project and all its services? This cannot be undone.",
      )
    )
      return;
    try {
      await deleteMutation.mutateAsync(projectId);
      toast.success("Project deleted");
      router.push("/");
    } catch {
      toast.error("Failed to delete project");
    }
  }

  if (!project) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-300">
            General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <span className="mb-1 block text-xs text-neutral-500">
                Project Name
              </span>
              {editing ? (
                <div className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-neutral-100">{project.name}</span>
                  <Button variant="ghost" size="sm" onClick={handleEdit}>
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </div>
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
              <p className="text-sm text-neutral-300">Delete Project</p>
              <p className="text-xs text-neutral-500">
                Permanently delete this project and all its services
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
              Delete Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
