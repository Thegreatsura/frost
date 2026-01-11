"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProject } from "@/hooks/use-projects";
import { useDeleteService } from "@/hooks/use-services";
import { api } from "@/lib/api";
import { ServiceCard } from "./_components/service-card";

export default function ProjectServicesPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { data: project } = useProject(projectId);
  const deleteServiceMutation = useDeleteService(projectId);
  const [serverIp, setServerIp] = useState<string | null>(null);

  useEffect(() => {
    api.settings.get().then((s) => setServerIp(s.serverIp));
  }, []);

  async function handleDeleteService(serviceId: string) {
    if (!confirm("Delete this service?")) return;
    try {
      await deleteServiceMutation.mutateAsync(serviceId);
      toast.success("Service deleted");
    } catch {
      toast.error("Failed to delete service");
    }
  }

  if (!project) return null;

  const services = project.services || [];
  const hasServices = services.length > 0;

  if (!hasServices) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="py-12">
          <EmptyState
            title="No services yet"
            description="Add a service to get started with deployments"
            action={
              <Button asChild size="sm">
                <Link href={`/projects/${projectId}/services/new`}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Service
                </Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          projectId={projectId}
          serverIp={serverIp}
          onDelete={() => handleDeleteService(service.id)}
        />
      ))}
    </div>
  );
}
