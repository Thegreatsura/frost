"use client";

import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAddDomain,
  useDeleteDomain,
  useDomains,
  useVerifyDomainDns,
} from "@/hooks/use-domains";
import type { Domain } from "@/lib/api";

interface DomainsSectionProps {
  serviceId: string;
  hasRunningDeployment: boolean;
}

export function DomainsSection({
  serviceId,
  hasRunningDeployment,
}: DomainsSectionProps) {
  const { data: domains, isLoading } = useDomains(serviceId);
  const addMutation = useAddDomain(serviceId);
  const deleteMutation = useDeleteDomain(serviceId);
  const verifyMutation = useVerifyDomainDns(serviceId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [domainType, setDomainType] = useState<"proxy" | "redirect">("proxy");
  const [redirectTarget, setRedirectTarget] = useState("");
  const [redirectCode, setRedirectCode] = useState<"301" | "307">("301");

  const proxyDomains = domains?.filter((d) => d.type === "proxy") || [];

  async function handleAddDomain() {
    if (!newDomain) return;

    try {
      await addMutation.mutateAsync({
        domain: newDomain,
        type: domainType,
        redirectTarget: domainType === "redirect" ? redirectTarget : undefined,
        redirectCode: domainType === "redirect" ? (Number(redirectCode) as 301 | 307) : undefined,
      });
      toast.success("Domain added");
      setNewDomain("");
      setRedirectTarget("");
      setRedirectCode("301");
      setDomainType("proxy");
      setShowAddForm(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to add domain");
    }
  }

  async function handleVerifyDns(id: string) {
    try {
      const result = await verifyMutation.mutateAsync(id);
      if (result.dnsVerified) {
        toast.success("DNS verified! Domain is now active.");
      } else {
        toast.error(`DNS not configured. Expected: ${result.serverIp}`);
      }
    } catch (err: any) {
      toast.error(err.message || "DNS verification failed");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this domain?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Domain removed");
    } catch {
      toast.error("Failed to remove domain");
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-300">
            Domains
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-neutral-300">
          <span>Domains</span>
          {!showAddForm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasRunningDeployment && domains && domains.length > 0 && (
          <div className="mb-4 rounded-md bg-yellow-900/20 p-3 text-sm text-yellow-400">
            No running deployment. Domains won't work until service is deployed.
          </div>
        )}

        {showAddForm && (
          <div className="mb-4 rounded-md border border-neutral-800 p-4">
            <h3 className="text-lg font-medium text-white">Add Domain</h3>
            <p className="mt-1 text-sm text-neutral-400">
              Add a domain to connect it to this service.
            </p>

            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example.com"
                className="h-10 pl-9 border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500"
              />
            </div>

            <div className="mt-4 space-y-3 rounded-md border border-neutral-800 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="domainType"
                  checked={domainType === "proxy"}
                  onChange={() => setDomainType("proxy")}
                  className="mt-1 h-4 w-4 border-neutral-600 bg-neutral-900 text-white"
                />
                <span className="text-sm text-neutral-200">Connect to Service</span>
              </label>

              <div className="border-t border-neutral-800" />

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="domainType"
                  checked={domainType === "redirect"}
                  onChange={() => setDomainType("redirect")}
                  className="mt-1 h-4 w-4 border-neutral-600 bg-neutral-900 text-white"
                />
                <span className="text-sm text-neutral-200">Redirect to Another Domain</span>
              </label>

              {domainType === "redirect" && (
                <div className="ml-7 flex gap-2">
                  <Select value={redirectCode} onValueChange={(v) => setRedirectCode(v as "301" | "307")}>
                    <SelectTrigger className="w-[180px] border-neutral-700 bg-neutral-900 text-neutral-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-neutral-700 bg-neutral-900">
                      <SelectItem value="301">301 Permanent</SelectItem>
                      <SelectItem value="307">307 Temporary</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={redirectTarget} onValueChange={setRedirectTarget} disabled={proxyDomains.length === 0}>
                    <SelectTrigger className="flex-1 border-neutral-700 bg-neutral-900 text-neutral-300">
                      <SelectValue placeholder={proxyDomains.length === 0 ? "No domains available" : "Select domain"} />
                    </SelectTrigger>
                    <SelectContent className="border-neutral-700 bg-neutral-900">
                      {proxyDomains.map((d) => (
                        <SelectItem key={d.id} value={d.domain}>
                          {d.domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setNewDomain("");
                  setRedirectTarget("");
                  setRedirectCode("301");
                  setDomainType("proxy");
                }}
                className="border-neutral-700 text-neutral-300"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddDomain}
                disabled={
                  addMutation.isPending ||
                  !newDomain ||
                  (domainType === "redirect" && !redirectTarget)
                }
              >
                {addMutation.isPending ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : null}
                Save
              </Button>
            </div>
          </div>
        )}

        {domains && domains.length > 0 ? (
          <div className="space-y-2">
            {domains.map((domain) => (
              <DomainRow
                key={domain.id}
                domain={domain}
                onVerify={() => handleVerifyDns(domain.id)}
                onDelete={() => handleDelete(domain.id)}
                isVerifying={verifyMutation.isPending}
              />
            ))}
          </div>
        ) : (
          !showAddForm && (
            <p className="text-sm text-neutral-500">
              No domains configured. Add a domain to access this service via a
              custom URL.
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
}

interface DomainRowProps {
  domain: Domain;
  onVerify: () => void;
  onDelete: () => void;
  isVerifying: boolean;
}

function DomainRow({
  domain,
  onVerify,
  onDelete,
  isVerifying,
}: DomainRowProps) {
  const isVerified = domain.dns_verified === 1;
  const isActive = domain.ssl_status === "active";

  return (
    <div className="flex items-center justify-between rounded-md border border-neutral-800 p-3">
      <div className="flex items-center gap-3">
        <Globe className="h-4 w-4 text-neutral-500" />
        <div>
          <div className="flex items-center gap-2">
            {domain.type === "redirect" ? (
              <span className="flex items-center gap-1 text-sm text-neutral-300">
                {domain.domain}
                <ArrowRight className="h-3 w-3 text-neutral-500" />
                <span className="text-neutral-400">
                  {domain.redirect_target}
                </span>
              </span>
            ) : isVerified ? (
              <a
                href={`https://${domain.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
              >
                {domain.domain}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="text-sm text-neutral-300">{domain.domain}</span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            {isVerified ? (
              <Badge
                variant="outline"
                className="border-green-800 text-green-400"
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                DNS verified
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-yellow-800 text-yellow-400"
              >
                <XCircle className="mr-1 h-3 w-3" />
                DNS pending
              </Badge>
            )}
            {domain.type === "redirect" && (
              <Badge
                variant="outline"
                className="border-neutral-700 text-neutral-400"
              >
                {domain.redirect_code || 301} redirect
              </Badge>
            )}
            {isActive && (
              <Badge
                variant="outline"
                className="border-green-800 text-green-400"
              >
                SSL active
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!isVerified && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onVerify}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Verify DNS"
            )}
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-neutral-500" />
        </Button>
      </div>
    </div>
  );
}
