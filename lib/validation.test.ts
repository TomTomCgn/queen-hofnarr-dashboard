import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createEventSchema,
  foolEntrySchema,
  queenEntrySchema,
  updateEventSchema,
} from "@/lib/validation";

describe("Erfassungs-Schemas", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-11T10:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("akzeptiert gültige Queen-Werte", () => {
    expect(queenEntrySchema.safeParse({ entry_date: "2026-10-11", emotionality: 1, fool_is_reason: 10 }).success).toBe(true);
  });

  it.each([0, 11, 5.5, Number.NaN])("lehnt den Wert %s ab", (value) => {
    expect(queenEntrySchema.safeParse({ entry_date: "2026-10-11", emotionality: value, fool_is_reason: 5 }).success).toBe(false);
  });

  it("verlangt alle Felder", () => {
    expect(foolEntrySchema.safeParse({ entry_date: "2026-10-11", joe_annoyance: 3, topic_variety: 4 }).success).toBe(false);
    expect(
      foolEntrySchema.safeParse({ entry_date: "2026-10-11", joe_annoyance: 3, topic_variety: 4, need_for_rest: 8 }).success,
    ).toBe(true);
  });

  it.each(["2026-02-30", "11.10.2026", "", "2026-10-12"])("lehnt das Datum %s ab", (date) => {
    expect(queenEntrySchema.safeParse({ entry_date: date, emotionality: 5, fool_is_reason: 5 }).success).toBe(false);
  });

  it("erlaubt Nachträge in der Vergangenheit", () => {
    expect(queenEntrySchema.safeParse({ entry_date: "2025-12-31", emotionality: 5, fool_is_reason: 5 }).success).toBe(true);
  });

  it("nutzt die Berliner Zeitzone für „heute“", () => {
    // 23:30 UTC am 11.10. ist in Berlin schon der 12.10.
    vi.setSystemTime(new Date("2026-10-11T23:30:00Z"));
    expect(queenEntrySchema.safeParse({ entry_date: "2026-10-12", emotionality: 5, fool_is_reason: 5 }).success).toBe(true);
  });
});

describe("Event-Schemas", () => {
  it("trimmt und begrenzt die Bezeichnung", () => {
    const ok = createEventSchema.safeParse({ title: "  Kino  ", created_by: "queen" });
    expect(ok.success && ok.data.title).toBe("Kino");
    expect(createEventSchema.safeParse({ title: "   ", created_by: "queen" }).success).toBe(false);
    expect(createEventSchema.safeParse({ title: "x".repeat(200), created_by: "hofnarr" }).success).toBe(true);
    expect(createEventSchema.safeParse({ title: "x".repeat(201), created_by: "hofnarr" }).success).toBe(false);
  });

  it("erlaubt nur Queen oder Hofnarr", () => {
    expect(createEventSchema.safeParse({ title: "Kino", created_by: "joe" }).success).toBe(false);
  });

  it("verlangt bei Updates eine gültige ID und mindestens eine Änderung", () => {
    const id = "6f1c2d3e-4b5a-4c6d-8e7f-9a0b1c2d3e4f";
    expect(updateEventSchema.safeParse({ id, done: true }).success).toBe(true);
    expect(updateEventSchema.safeParse({ id }).success).toBe(false);
    expect(updateEventSchema.safeParse({ id: "abc", done: true }).success).toBe(false);
  });
});
