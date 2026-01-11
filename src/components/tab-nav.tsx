"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  href: string;
}

interface TabNavProps {
  tabs: Tab[];
}

export function TabNav({ tabs }: TabNavProps) {
  const pathname = usePathname();

  return (
    <nav className="border-b border-neutral-800">
      <div className="container mx-auto flex gap-6 px-4">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== tabs[0].href && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative py-3 text-sm transition-colors",
                isActive
                  ? "text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-300",
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-100" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
