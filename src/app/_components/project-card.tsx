import Link from "next/link";

interface ProjectCardProps {
  id: string;
  name: string;
  servicesCount: number;
}

export function ProjectCard({ id, name, servicesCount }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${id}`}
      className="group block rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:border-neutral-700 hover:bg-neutral-800/50"
    >
      <h2 className="font-medium text-neutral-100">{name}</h2>
      <p className="mt-2 text-sm text-neutral-500">
        {servicesCount} service{servicesCount !== 1 ? "s" : ""}
      </p>
    </Link>
  );
}
