import type { EventItem } from "@/lib/types";

export type EventFilter = "all" | "open" | "done";

/** Offene zuerst, innerhalb der Gruppen neueste zuerst. */
export function sortEvents(events: readonly EventItem[]): EventItem[] {
  return [...events].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0;
  });
}

export function filterEvents(events: readonly EventItem[], filter: EventFilter): EventItem[] {
  if (filter === "open") return events.filter((e) => !e.done);
  if (filter === "done") return events.filter((e) => e.done);
  return [...events];
}
