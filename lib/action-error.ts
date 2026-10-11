import "server-only";

type DbError = { message: string; code?: string; details?: string | null; hint?: string | null };

/** Protokolliert einen Datenbankfehler (sichtbar in den Vercel-Logs) und liefert eine Meldung für die Oberfläche. */
export function failure(error: DbError, message: string): { ok: false; error: string } {
  console.error(`[db] ${message}`, { code: error.code, message: error.message, details: error.details, hint: error.hint });
  const hint =
    error.code === "42501" || /permission denied|row-level security/i.test(error.message)
      ? " (Keine Schreibrechte – ist SUPABASE_SERVICE_ROLE_KEY der service_role-/Secret-Key?)"
      : error.code === "42P01" || /does not exist|schema cache/i.test(error.message)
        ? " (Tabelle fehlt – wurde die SQL-Migration in Supabase ausgeführt?)"
        : /invalid api key|jwt/i.test(error.message)
          ? " (Supabase-Schlüssel ungültig – Umgebungsvariablen in Vercel prüfen.)"
          : "";
  return { ok: false, error: message + hint };
}
