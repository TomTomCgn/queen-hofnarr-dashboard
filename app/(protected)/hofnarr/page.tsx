import { loadEntry } from "@/app/actions/entries";
import { EntryForm } from "@/components/entry-form";
import { todayIso } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const metadata = { title: "Erfassung Hofnarr · Queen & Hofnarr" };

export default async function Page() {
  const today = todayIso();
  const existing = await loadEntry("hofnarr", today);
  return <EntryForm person="hofnarr" initialDate={today} initialValues={existing.ok ? existing.data : null} />;
}
