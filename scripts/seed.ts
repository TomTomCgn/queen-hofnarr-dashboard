/**
 * Füllt die Datenbank mit ~30 Tagen Beispieldaten (nur für die lokale Entwicklung).
 * Aufruf: npm run seed   (liest .env.local)
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

import { addDays, todayIso } from "../lib/dates";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen in .env.local stehen.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const clamp = (v: number) => Math.min(10, Math.max(1, Math.round(v)));
const walk = (prev: number) => clamp(prev + (Math.random() * 4 - 2));

async function main() {
  const today = todayIso();
  const queen = [];
  const fool = [];
  let q = { emotionality: 5, fool_is_reason: 4 };
  let f = { joe_annoyance: 5, topic_variety: 6, need_for_rest: 4 };

  for (let i = 29; i >= 0; i--) {
    const entry_date = addDays(today, -i);
    q = { emotionality: walk(q.emotionality), fool_is_reason: walk(q.fool_is_reason) };
    f = {
      joe_annoyance: walk(f.joe_annoyance),
      topic_variety: walk(f.topic_variety),
      need_for_rest: walk(f.need_for_rest),
    };
    // ein paar Lücken, damit man sie im Diagramm sieht
    if (i % 9 !== 4) queen.push({ entry_date, ...q });
    if (i % 7 !== 2) fool.push({ entry_date, ...f });
  }

  const events = [
    { title: "Wochenendausflug planen", created_by: "queen", done: false },
    { title: "Joe zum Essen einladen", created_by: "hofnarr", done: false },
    { title: "Neues Brettspiel ausprobieren", created_by: "hofnarr", done: true },
    { title: "Theaterkarten besorgen", created_by: "queen", done: true },
  ];

  const results = await Promise.all([
    supabase.from("queen_entries").upsert(queen, { onConflict: "entry_date" }),
    supabase.from("fool_entries").upsert(fool, { onConflict: "entry_date" }),
    supabase.from("events").insert(events),
  ]);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;

  console.log(`Seed fertig: ${queen.length} Queen-, ${fool.length} Hofnarr-Einträge, ${events.length} Events.`);
}

main().catch((error) => {
  console.error("Seed fehlgeschlagen:", error);
  process.exit(1);
});
