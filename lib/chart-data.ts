import { addDays, dateRange } from "@/lib/dates";

export type RangeKey = "7" | "30" | "90" | "all";

export const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: "7", label: "7 Tage" },
  { value: "30", label: "30 Tage" },
  { value: "90", label: "90 Tage" },
  { value: "all", label: "Alles" },
];

/** Erster Tag des gewählten Zeitraums (inklusive). */
export function rangeStart(range: RangeKey, today: string, earliest: string | null): string {
  if (range === "all") return earliest && earliest < today ? earliest : today;
  return addDays(today, -(Number(range) - 1));
}

export type ChartPoint = { date: string; [key: string]: number | null | string };

/**
 * Baut eine lückenlose Tagesreihe. Tage ohne Eintrag bekommen `null`,
 * damit Recharts eine Lücke zeichnet statt einer 0.
 */
export function buildSeries<T extends { entry_date: string }>(
  rows: readonly T[],
  fields: readonly (keyof T & string)[],
  from: string,
  to: string,
): ChartPoint[] {
  const byDate = new Map(rows.map((r) => [r.entry_date, r]));
  return dateRange(from, to).map((date) => {
    const row = byDate.get(date);
    const point: Record<string, number | null | string> = { date };
    for (const field of fields) {
      const value = row?.[field];
      point[field] = typeof value === "number" ? value : null;
    }
    return point as ChartPoint;
  });
}
