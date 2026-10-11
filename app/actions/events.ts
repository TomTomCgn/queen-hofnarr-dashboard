"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import type { ActionResult, EventItem } from "@/lib/types";
import { createEventSchema, updateEventSchema } from "@/lib/validation";

const COLUMNS = "id,title,created_by,done,created_at,updated_at";

export async function createEvent(input: unknown): Promise<ActionResult<EventItem>> {
  await requireSession();
  const parsed = createEventSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };

  const { data, error } = await getServerSupabase().from("events").insert(parsed.data).select(COLUMNS).single();
  if (error) return { ok: false, error: "Event konnte nicht angelegt werden." };
  revalidatePath("/events");
  return { ok: true, data: data as EventItem };
}

export async function updateEvent(input: unknown): Promise<ActionResult<EventItem>> {
  await requireSession();
  const parsed = updateEventSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };

  const { id, ...changes } = parsed.data;
  const { data, error } = await getServerSupabase()
    .from("events")
    .update(changes)
    .eq("id", id)
    .select(COLUMNS)
    .single();
  if (error) return { ok: false, error: "Event konnte nicht gespeichert werden." };
  revalidatePath("/events");
  return { ok: true, data: data as EventItem };
}

export async function deleteEvent(id: unknown): Promise<ActionResult> {
  await requireSession();
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { ok: false, error: "Ungültige ID." };

  const { error } = await getServerSupabase().from("events").delete().eq("id", parsed.data);
  if (error) return { ok: false, error: "Event konnte nicht gelöscht werden." };
  revalidatePath("/events");
  return { ok: true, data: undefined };
}
