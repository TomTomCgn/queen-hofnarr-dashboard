import { describe, expect, it } from "vitest";

import { computeKpi } from "@/lib/kpi";

const today = "2026-10-11";

describe("computeKpi", () => {
  it("liefert leere Kennzahlen ohne Einträge", () => {
    expect(computeKpi([], "emotionality", today)).toEqual({
      latest: null,
      latestDate: null,
      change: null,
      avg7: null,
    });
  });

  it("nimmt den jüngsten Eintrag unabhängig von der Reihenfolge", () => {
    const rows = [
      { entry_date: "2026-10-11", emotionality: 7 },
      { entry_date: "2026-10-09", emotionality: 4 },
      { entry_date: "2026-10-10", emotionality: 5 },
    ];
    const kpi = computeKpi(rows, "emotionality", today);
    expect(kpi.latest).toBe(7);
    expect(kpi.latestDate).toBe("2026-10-11");
    expect(kpi.change).toBe(2);
  });

  it("vergleicht mit dem vorherigen Eintrag, auch über Lücken hinweg", () => {
    const rows = [
      { entry_date: "2026-10-01", emotionality: 9 },
      { entry_date: "2026-10-08", emotionality: 3 },
    ];
    expect(computeKpi(rows, "emotionality", today).change).toBe(-6);
  });

  it("hat keine Veränderung bei nur einem Eintrag", () => {
    const kpi = computeKpi([{ entry_date: today, emotionality: 3 }], "emotionality", today);
    expect(kpi.change).toBeNull();
    expect(kpi.avg7).toBe(3);
  });

  it("mittelt nur die letzten 7 Tage inklusive heute und rundet auf eine Stelle", () => {
    const rows = [
      { entry_date: "2026-10-04", emotionality: 10 }, // 8 Tage zurück – zählt nicht
      { entry_date: "2026-10-05", emotionality: 1 }, // erster Tag im Fenster
      { entry_date: "2026-10-08", emotionality: 2 },
      { entry_date: "2026-10-11", emotionality: 2 },
    ];
    expect(computeKpi(rows, "emotionality", today).avg7).toBe(1.7);
  });

  it("gibt keinen Schnitt, wenn die letzten 7 Tage leer sind", () => {
    const kpi = computeKpi([{ entry_date: "2026-09-01", emotionality: 5 }], "emotionality", today);
    expect(kpi.latest).toBe(5);
    expect(kpi.avg7).toBeNull();
  });
});
