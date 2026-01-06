import { StatusDot } from "@/components/status-dot";
import { cn } from "@/lib/utils";

interface DeploymentRowProps {
  id: string;
  commitSha: string;
  status: string;
  createdAt: number;
  selected: boolean;
  onClick: () => void;
}

export function DeploymentRow({
  commitSha,
  status,
  createdAt,
  selected,
  onClick,
}: DeploymentRowProps) {
  const date = new Date(createdAt);
  const timeAgo = getTimeAgo(date);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full px-4 py-3 text-left transition-colors hover:bg-neutral-800/50",
        selected && "bg-neutral-800",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusDot status={status} />
          <span className="font-mono text-sm text-neutral-300">
            {commitSha}
          </span>
        </div>
        <span className="text-xs text-neutral-500">{timeAgo}</span>
      </div>
    </button>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
