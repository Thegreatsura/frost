"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Copy,
  Database,
  ExternalLink,
  GitBranch,
  GitCommitHorizontal,
  Globe,
  Package,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StatusDot } from "@/components/status-dot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useProject } from "@/hooks/use-projects";
import { useDeployService, useService } from "@/hooks/use-services";
import type { Deployment, Domain, EnvVar } from "@/lib/api";
import { api } from "@/lib/api";
import { buildConnectionString } from "@/lib/db-templates";
import { buildSslipDomain } from "@/lib/sslip";
import { getTimeAgo } from "@/lib/time";
import { ServiceMetricsCard } from "./_components/service-metrics-card";

export default function ServiceOverviewPage() {
  const params = useParams();
  const projectId = params.id as string;
  const serviceId = params.serviceId as string;

  const { data: project } = useProject(projectId);
  const { data: service } = useService(serviceId);
  const deployMutation = useDeployService(serviceId, projectId);
  const queryClient = useQueryClient();

  const [serverIp, setServerIp] = useState<string | null>(null);
  const [systemDomain, setSystemDomain] = useState<Domain | null>(null);
  const [currentDeployment, setCurrentDeployment] = useState<Deployment | null>(
    null,
  );

  const { data: tcpProxy } = useQuery({
    queryKey: ["tcp-proxy", serviceId],
    queryFn: () => api.tcpProxy.get(serviceId),
    enabled: service?.serviceType === "database",
  });

  const enableTcpProxyMutation = useMutation({
    mutationFn: () => api.tcpProxy.enable(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tcp-proxy", serviceId] });
      toast.success("External access enabled", {
        description: "Redeploy required for changes to take effect",
        duration: 10000,
        action: {
          label: "Redeploy",
          onClick: () => deployMutation.mutateAsync(),
        },
      });
    },
    onError: () => toast.error("Failed to enable external access"),
  });

  const disableTcpProxyMutation = useMutation({
    mutationFn: () => api.tcpProxy.disable(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tcp-proxy", serviceId] });
      toast.success("External access disabled", {
        description: "Redeploy required for changes to take effect",
        duration: 10000,
        action: {
          label: "Redeploy",
          onClick: () => deployMutation.mutateAsync(),
        },
      });
    },
    onError: () => toast.error("Failed to disable external access"),
  });

  useEffect(() => {
    api.settings.get().then((s) => setServerIp(s.serverIp));
  }, []);

  useEffect(() => {
    if (!serviceId) return;
    api.domains.list(serviceId).then((domains) => {
      const sys = domains.find((d) => d.isSystem === 1);
      setSystemDomain(sys ?? null);
    });
  }, [serviceId]);

  useEffect(() => {
    if (!service) return;
    async function fetchCurrentDeployment() {
      if (!service?.currentDeploymentId) {
        setCurrentDeployment(null);
        return;
      }
      const deps = await api.deployments.listByService(serviceId);
      const current = deps.find((d) => d.id === service.currentDeploymentId);
      setCurrentDeployment(current ?? null);
    }
    fetchCurrentDeployment();
    const interval = setInterval(fetchCurrentDeployment, 2000);
    return () => clearInterval(interval);
  }, [service, serviceId]);

  if (!service) return null;

  return (
    <div className="space-y-6">
      {currentDeployment && (
        <Card className="border-l-2 border-l-green-500 bg-neutral-900 border-neutral-800">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusDot status="running" />
                {systemDomain ? (
                  <a
                    href={`https://${systemDomain.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-blue-400 hover:text-blue-300"
                  >
                    {systemDomain.domain}
                  </a>
                ) : (
                  <span className="text-sm text-neutral-300">
                    Running on port {currentDeployment.hostPort}
                  </span>
                )}
              </div>
              {service.serviceType !== "database" && (
                <a
                  href={
                    systemDomain
                      ? `https://${systemDomain.domain}`
                      : `http://${serverIp || "localhost"}:${currentDeployment.hostPort}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300"
                >
                  Open
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <div className="mt-3 border-t border-neutral-800 pt-3">
              <p className="text-xs text-neutral-500 mb-2">
                {service.deployType === "repo" ? "Source" : "Image"}
              </p>
              {service.deployType === "repo" ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-neutral-300">
                    <GitBranch className="h-3.5 w-3.5 text-neutral-500" />
                    <span className="font-mono">
                      {service.branch || "main"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <GitCommitHorizontal className="h-3.5 w-3.5 text-neutral-500" />
                    <span className="font-mono">
                      {currentDeployment.commitSha}
                    </span>
                    {currentDeployment.commitMessage && (
                      <span className="text-neutral-500 truncate max-w-xs">
                        {currentDeployment.commitMessage}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-neutral-300">
                  <Package className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="font-mono">{service.imageUrl}</span>
                </div>
              )}
              <p className="mt-2 text-xs text-neutral-500">
                Deployed {getTimeAgo(new Date(currentDeployment.createdAt))}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {currentDeployment && <ServiceMetricsCard serviceId={serviceId} />}

      {service.serviceType === "database" && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-neutral-300">
              <Database className="h-4 w-4" />
              Database Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentDeployment ? (
              <>
                <div>
                  <p className="mb-1 text-xs text-neutral-500">
                    Internal Connection (within project)
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-neutral-800 px-3 py-2 font-mono text-xs text-neutral-300">
                      {buildConnectionString(
                        service.imageUrl?.split(":")[0] ?? "",
                        service.name,
                        service.containerPort ?? 5432,
                        JSON.parse(service.envVars).reduce(
                          (acc: Record<string, string>, v: EnvVar) => {
                            acc[v.key] = v.value;
                            return acc;
                          },
                          {},
                        ),
                      )}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          buildConnectionString(
                            service.imageUrl?.split(":")[0] ?? "",
                            service.name,
                            service.containerPort ?? 5432,
                            JSON.parse(service.envVars).reduce(
                              (acc: Record<string, string>, v: EnvVar) => {
                                acc[v.key] = v.value;
                                return acc;
                              },
                              {},
                            ),
                          ),
                        );
                        toast.success("Copied to clipboard");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="border-t border-neutral-800 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="flex items-center gap-2 text-sm text-neutral-300">
                        <Globe className="h-4 w-4" />
                        External Access
                      </span>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        Expose database to external connections
                      </p>
                    </div>
                    <Switch
                      checked={tcpProxy?.enabled ?? false}
                      disabled={
                        enableTcpProxyMutation.isPending ||
                        disableTcpProxyMutation.isPending
                      }
                      onCheckedChange={(checked: boolean) => {
                        if (checked) {
                          enableTcpProxyMutation.mutate();
                        } else {
                          disableTcpProxyMutation.mutate();
                        }
                      }}
                    />
                  </div>

                  {tcpProxy?.enabled && tcpProxy.port && serverIp && (
                    <div className="mt-3">
                      <p className="mb-1 text-xs text-neutral-500">
                        External Connection
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded bg-neutral-800 px-3 py-2 font-mono text-xs text-neutral-300">
                          {buildConnectionString(
                            service.imageUrl?.split(":")[0] ?? "",
                            serverIp === "localhost"
                              ? "localhost"
                              : buildSslipDomain(
                                  service.name,
                                  project?.name ?? "",
                                  serverIp,
                                ),
                            serverIp === "localhost"
                              ? (currentDeployment.hostPort ?? tcpProxy.port)
                              : tcpProxy.port,
                            JSON.parse(service.envVars).reduce(
                              (acc: Record<string, string>, v: EnvVar) => {
                                acc[v.key] = v.value;
                                return acc;
                              },
                              {},
                            ),
                          )}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              buildConnectionString(
                                service.imageUrl?.split(":")[0] ?? "",
                                serverIp === "localhost"
                                  ? "localhost"
                                  : buildSslipDomain(
                                      service.name,
                                      project?.name ?? "",
                                      serverIp,
                                    ),
                                serverIp === "localhost"
                                  ? (currentDeployment.hostPort ??
                                      tcpProxy.port!)
                                  : tcpProxy.port!,
                                JSON.parse(service.envVars).reduce(
                                  (acc: Record<string, string>, v: EnvVar) => {
                                    acc[v.key] = v.value;
                                    return acc;
                                  },
                                  {},
                                ),
                              ),
                            );
                            toast.success("Copied to clipboard");
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-neutral-500">
                Deploy the database to view connection details.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {!currentDeployment && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="py-12 text-center">
            <p className="text-neutral-500">No active deployment</p>
            <p className="mt-1 text-sm text-neutral-600">
              Click Deploy to create the first deployment
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
