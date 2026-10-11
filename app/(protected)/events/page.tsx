import { EventList } from "@/components/event-list";
import { getServerSupabase } from "@/lib/supabase/server";
import type { EventItem } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Events · Queen & Hofnarr" };

export default async function EventsPage() {
  const { data, error } = await getServerSupabase()
    .from("events")
    .select("id,title,created_by,done,created_at,updated_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[db] Events konnten nicht geladen werden", error);
    throw new Error("Events konnten nicht geladen werden.");
  }
  return <EventList initialEvents={data as EventItem[]} />;
}
