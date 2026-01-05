"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      repo_url: formData.get("repo_url"),
      branch: formData.get("branch") || "main",
      dockerfile_path: formData.get("dockerfile_path") || "Dockerfile",
      port: parseInt(formData.get("port") as string, 10) || 3000,
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const project = await res.json();
      router.push(`/projects/${project.id}`);
    } else {
      setLoading(false);
      alert("Failed to create project");
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="my-app" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repo_url">Repository URL</Label>
              <Input
                id="repo_url"
                name="repo_url"
                required
                placeholder="https://github.com/user/repo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                name="branch"
                placeholder="main"
                defaultValue="main"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dockerfile_path">Dockerfile Path</Label>
              <Input
                id="dockerfile_path"
                name="dockerfile_path"
                placeholder="Dockerfile"
                defaultValue="Dockerfile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Container Port</Label>
              <Input
                id="port"
                name="port"
                type="number"
                placeholder="3000"
                defaultValue="3000"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Project"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
