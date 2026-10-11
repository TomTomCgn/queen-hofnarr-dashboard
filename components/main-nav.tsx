"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Dashboard", short: "Dashboard" },
  { href: "/queen", label: "Erfassung Queen", short: "👑 Queen" },
  { href: "/hofnarr", label: "Erfassung Hofnarr", short: "🃏 Hofnarr" },
  { href: "/events", label: "Events", short: "Events" },
];

export function MainNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Hauptnavigation" className="w-full sm:w-auto">
      <ul className="grid grid-cols-4 gap-1 sm:flex">
        {LINKS.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "hover:bg-accent block rounded-md px-1 py-2 text-center text-sm whitespace-nowrap transition-colors sm:px-3",
                  active ? "bg-accent font-semibold" : "text-muted-foreground",
                )}
              >
                <span className="sm:hidden">{link.short}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
