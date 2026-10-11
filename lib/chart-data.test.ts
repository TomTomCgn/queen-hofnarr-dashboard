import { describe, expect, it } from "vitest";

import { buildSeries, rangeStart } from "@/lib/chart-data";
import { addDays, formatDate, todayIso } from "@/lib/dates";
import { sortEvents } from "@/lib/events";
import type { EventItem } from "@/lib/types";

describe("Diagrammdaten", () => {
  it("füllt fehlende Tage mit null statt 0", () => {
    const series = buildSeries(
      [
        { entry_date: "2026-10-01", emotionality: 4 },
        { entry_date: "2026-10-03", emotionality: 6 },
      ],
      ["emotionality"],
      "2026-10-01",
      "2026-10-03",
    );
    expect(series.map((p) => p.emotionality)).toEqual([4, null, 6]);
  });

  it("berechnet den Start des Zeitraums", () => {
    expect(rangeStart("7", "2026-10-11", null)).toBe("2026-10-05");
    expect(rangeStart("30", "2026-10-11", null)).toBe("2026-09-12");
    expect(rangeStart("all", "2026-10-11", "2026-01-15")).toBe("2026-01-15");
    expect(rangeStart("all", "2026-10-11", null)).toBe("2026-10-11");
  });
});

describe("Datumshilfen", () => {
  it("formatiert als TT.MM.JJJJ", () => expect(formatDate("2026-03-07")).toBe("07.03.2026"));
  it("rechnet über Monats- und Zeitumstellungsgrenzen", () => {
    expect(addDays("2026-10-24", 2)).toBe("2026-10-26");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("bestimmt heute in Europe/Berlin", () => {
    expect(todayIso(new Date("2026-10-11T22:30:00Z"))).toBe("2026-10-12");
  });
});

describe("Event-Sortierung", () => {
  const ev = (id: string, done: boolean, created_at: string): EventItem => ({
    id,
    title: id,
    created_by: "queen",
    done,
    created_at,
    updated_at: created_at,
  });

  it("sortiert offene zuerst, dann neueste zuerst", () => {
    const sorted = sortEvents([
      ev("a", true, "2026-10-10T10:00:00Z"),
      ev("b", false, "2026-10-01T10:00:00Z"),
      ev("c", false, "2026-10-05T10:00:00Z"),
      ev("d", true, "2026-10-11T10:00:00Z"),
    ]);
    expect(sorted.map((e) => e.id)).toEqual(["c", "b", "d", "a"]);
  });
});
