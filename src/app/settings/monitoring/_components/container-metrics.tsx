"use client";

import { ArrowDown, ArrowUp, Box } from "lucide-react";
import type { ContainerStats } from "@/lib/api";

interface ContainerMetricsProps {
  containers: ContainerStats[];
  isLoading: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
}

function formatBytesPerSec(bytes: number): string {
  return `${formatBytes(bytes)}/s`;
}

export function ContainerMetrics({
  containers,
  isLoading,
}: ContainerMetricsProps) {
  const sortedByMemory = [...containers].sort(
    (a, b) => b.memoryUsage - a.memoryUsage,
  );
  const sortedByCpu = [...containers].sort(
    (a, b) => b.cpuPercent - a.cpuPercent,
  );

  const topCpu = sortedByCpu[0];
  const topMemory = sortedByMemory[0];

  if (isLoading && containers.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-white">Container Metrics</h2>
        <div className="mt-6 flex items-center justify-center py-12 text-neutral-500">
          Loading...
        </div>
      </div>
    );
  }

  if (containers.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-white">Container Metrics</h2>
        <div className="mt-6 flex flex-col items-center justify-center py-12 text-neutral-500">
          <Box className="mb-2 h-8 w-8" />
          <p>No running containers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-800 p-6">
      <h2 className="text-lg font-semibold text-white">Container Metrics</h2>

      <div className="mt-6 overflow-hidden rounded-lg border border-neutral-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-400">
                Name
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-neutral-400">
                CPU
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-neutral-400">
                Memory
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-neutral-400">
                Network
              </th>
            </tr>
          </thead>
          <tbody>
            {containers.map((container) => (
              <tr
                key={container.containerId}
                className="border-b border-neutral-800 last:border-0 hover:bg-neutral-900/30"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-white">{container.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-neutral-300">
                    {container.cpuPercent.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-neutral-300">
                    {formatBytes(container.memoryUsage)}
                  </span>
                  <span className="ml-1 text-xs text-neutral-500">
                    ({container.memoryPercent.toFixed(1)}%)
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3 text-sm">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <ArrowDown className="h-3 w-3 text-green-500" />
                      {formatBytesPerSec(container.networkRx)}
                    </span>
                    <span className="flex items-center gap-1 text-neutral-400">
                      <ArrowUp className="h-3 w-3 text-blue-500" />
                      {formatBytesPerSec(container.networkTx)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(topCpu || topMemory) && (
        <div className="mt-4 flex gap-6 text-sm text-neutral-400">
          {topCpu && (
            <span>
              Top CPU: <span className="text-neutral-200">{topCpu.name}</span>{" "}
              <span className="text-blue-400">
                ({topCpu.cpuPercent.toFixed(1)}%)
              </span>
            </span>
          )}
          {topMemory && (
            <span>
              Top Memory:{" "}
              <span className="text-neutral-200">{topMemory.name}</span>{" "}
              <span className="text-purple-400">
                ({formatBytes(topMemory.memoryUsage)})
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
