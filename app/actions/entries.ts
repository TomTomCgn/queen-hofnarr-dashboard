"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth";
import { PERSONS, type Person } from "@/lib/params";
import { getServerSupabase } from "@/lib/supabase/server";
import { failure } from "@/lib/action-error";
import type { ActionResult } from "@/lib/types";
import { entryDateSchema, foolEntrySchema, personSchema, queenEntrySchema } from "@/lib/validation";

export type EntryValues = Record<string, number>;

const schemas = { queen: queenEntrySchema, hofnarr: foolEntrySchema } as const;

/** Lädt den Eintrag einer Person für ein Datum (oder null). */
export async function loadEntry(person: Person, entryDate: string): Promise<ActionResult<EntryValues | null>> {
  await requireSession();
  const p = personSchema.safeParse(person);
  const d = entryDateSchema.safeParse(entryDate);
  if (!p.success || !d.success) return { ok: false, error: "Ungültige Anfrage." };

  const { table, fields } = PERSONS[p.data];
  const { data, error } = await getServerSupabase()
    .from(table)
    .select(fields.join(","))
    .eq("entry_date", d.data)
    .maybeSingle();
  if (error) return failure(error, "Eintrag konnte nicht geladen werden.");
  return { ok: true, data: (data as EntryValues | null) ?? null };
}

/** Speichert (Upsert) den Tageseintrag einer Person. */
export async function saveEntry(person: Person, input: unknown): Promise<ActionResult<{ updated: boolean }>> {
  await requireSession();
  const p = personSchema.safeParse(person);
  if (!p.success) return { ok: false, error: "Unbekannte Person." };

  const parsed = (schemas[p.data] as typeof queenEntrySchema | typeof foolEntrySchema).safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };

  const supabase = getServerSupabase();
  const { table } = PERSONS[p.data];

  const { data: existing } = await supabase
    .from(table)
    .select("id")
    .eq("entry_date", parsed.data.entry_date)
    .maybeSingle();

  const { error } = await supabase.from(table).upsert(parsed.data as Record<string, unknown>, { onConflict: "entry_date" });
  if (error) return failure(error, "Speichern fehlgeschlagen. Bitte erneut versuchen.");

  revalidatePath("/");
  return { ok: true, data: { updated: Boolean(existing) } };
}
