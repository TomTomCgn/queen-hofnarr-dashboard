import { z } from "zod";

import { isValidIsoDate, todayIso } from "@/lib/dates";

const level = z
  .number({ error: "Bitte einen Wert zwischen 1 und 10 wählen." })
  .int("Nur ganze Zahlen sind erlaubt.")
  .min(1, "Der Wert muss mindestens 1 sein.")
  .max(10, "Der Wert darf höchstens 10 sein.");

export const entryDateSchema = z
  .string()
  .refine(isValidIsoDate, "Bitte ein gültiges Datum angeben.")
  .refine((value) => value <= todayIso(), "Das Datum darf nicht in der Zukunft liegen.");

export const queenEntrySchema = z.object({
  entry_date: entryDateSchema,
  emotionality: level,
  fool_is_reason: level,
});

export const foolEntrySchema = z.object({
  entry_date: entryDateSchema,
  joe_annoyance: level,
  topic_variety: level,
  need_for_rest: level,
});

export const personSchema = z.enum(["queen", "hofnarr"], { error: "Bitte Queen oder Hofnarr wählen." });

export const eventTitleSchema = z
  .string()
  .trim()
  .min(1, "Bitte eine Bezeichnung eingeben.")
  .max(200, "Die Bezeichnung darf höchstens 200 Zeichen lang sein.");

export const createEventSchema = z.object({
  title: eventTitleSchema,
  created_by: personSchema,
});

export const updateEventSchema = z
  .object({
    id: z.uuid(),
    title: eventTitleSchema.optional(),
    created_by: personSchema.optional(),
    done: z.boolean().optional(),
  })
  .refine((v) => v.title !== undefined || v.created_by !== undefined || v.done !== undefined, {
    message: "Keine Änderung angegeben.",
  });

export const loginSchema = z.object({
  password: z.string().min(1, "Bitte das Passwort eingeben."),
});

export type QueenEntryInput = z.infer<typeof queenEntrySchema>;
export type FoolEntryInput = z.infer<typeof foolEntrySchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
