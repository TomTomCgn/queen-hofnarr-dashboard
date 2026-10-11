export const TIME_ZONE = "Europe/Berlin";

const isoFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Heutiges Datum in Europe/Berlin als `YYYY-MM-DD`. */
export function todayIso(now: Date = new Date()): string {
  return isoFormatter.format(now);
}

/** `YYYY-MM-DD` → `TT.MM.JJJJ` */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
}

/** `YYYY-MM-DD` → `TT.MM.` (kurz für Diagrammachsen) */
export function formatDateShort(iso: string): string {
  const [, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.`;
}

/** Zeitstempel → `TT.MM.JJJJ` in Europe/Berlin */
export function formatTimestamp(ts: string): string {
  return formatDate(todayIso(new Date(ts)));
}

/** Verschiebt ein `YYYY-MM-DD`-Datum um `days` Tage (kalendarisch, ohne Zeitzonen-Effekte). */
export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

/** Alle Tage von `from` bis `to` (inklusive), aufsteigend. */
export function dateRange(from: string, to: string): string[] {
  const days: string[] = [];
  for (let current = from; current <= to; current = addDays(current, 1)) {
    days.push(current);
  }
  return days;
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}
