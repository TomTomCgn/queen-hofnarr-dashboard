import { DashboardView } from "@/components/dashboard-view";
import { todayIso } from "@/lib/dates";
import { getServerSupabase } from "@/lib/supabase/server";
import type { FoolEntry, QueenEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = getServerSupabase();
  const [queen, fool] = await Promise.all([
    supabase.from("queen_entries").select("*").order("entry_date"),
    supabase.from("fool_entries").select("*").order("entry_date"),
  ]);
  if (queen.error || fool.error) {
    console.error("[db] Dashboard-Daten konnten nicht geladen werden", queen.error ?? fool.error);
    throw new Error("Daten konnten nicht geladen werden.");
  }

  return (
    <DashboardView
      initialQueen={queen.data as QueenEntry[]}
      initialFool={fool.data as FoolEntry[]}
      today={todayIso()}
    />
  );
}
