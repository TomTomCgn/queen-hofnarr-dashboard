import { loadEntry } from "@/app/actions/entries";
import { EntryForm } from "@/components/entry-form";
import { todayIso } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const metadata = { title: "Erfassung Queen · Queen & Hofnarr" };

export default async function Page() {
  const today = todayIso();
  const existing = await loadEntry("queen", today);
  return <EntryForm person="queen" initialDate={today} initialValues={existing.ok ? existing.data : null} />;
}
