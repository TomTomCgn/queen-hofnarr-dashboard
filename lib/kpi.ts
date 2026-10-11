import { addDays } from "@/lib/dates";

export type Kpi = {
  /** Letzter erfasster Wert (jüngstes Datum) */
  latest: number | null;
  latestDate: string | null;
  /** Differenz zum vorherigen Eintrag (null, wenn es keinen gibt) */
  change: number | null;
  /** Durchschnitt der Einträge der letzten 7 Tage inkl. heute (null, wenn keine) */
  avg7: number | null;
};

type Row = { entry_date: string } & Record<string, unknown>;

export function computeKpi<T extends Row>(rows: readonly T[], field: keyof T & string, today: string): Kpi {
  const values = rows
    .filter((r) => typeof r[field] === "number")
    .map((r) => ({ date: r.entry_date, value: r[field] as number }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  if (values.length === 0) {
    return { latest: null, latestDate: null, change: null, avg7: null };
  }

  const [latest, previous] = values;
  const windowStart = addDays(today, -6);
  const lastWeek = values.filter((v) => v.date >= windowStart && v.date <= today);
  const avg7 =
    lastWeek.length > 0
      ? Math.round((lastWeek.reduce((sum, v) => sum + v.value, 0) / lastWeek.length) * 10) / 10
      : null;

  return {
    latest: latest.value,
    latestDate: latest.date,
    change: previous ? latest.value - previous.value : null,
    avg7,
  };
}
