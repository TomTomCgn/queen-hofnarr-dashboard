# Plan: Queen & Hofnarr Dashboard

1. **Projekt-Setup** – Next.js 15 (App Router, TypeScript strict), Tailwind CSS 4, shadcn/ui-Komponenten, ESLint, Vitest, Playwright.
2. **Datenbank** – SQL-Migration für `queen_entries`, `fool_entries`, `events` inkl. `updated_at`-Trigger, RLS (nur `select` für `anon`) und Realtime-Publikation. Supabase-Clients: Server (Service-Key, `server-only`) und Browser (Anon-Key, nur Lesen/Realtime).
3. **Passwortschutz** – `/login`, HMAC-signiertes httpOnly-Cookie (30 Tage), Prüfung in `middleware.ts` und zusätzlich in jeder Server Action, Logout in der Kopfzeile.
4. **Erfassungsmasken** – `/queen` und `/hofnarr` mit Slidern (react-hook-form + zod), Upsert pro Tag, Hinweis und Vorbelegung bei vorhandenem Eintrag, Toast mit Link zum Dashboard.
5. **Dashboard** – KPI-Kacheln (letzter Wert, Veränderung zum vorherigen Eintrag, 7-Tage-Schnitt), Liniendiagramme (Y fest 1–10, Lücken statt 0), Zeitraumfilter 7/30/90/Alles.
6. **Echtzeit** – Supabase Realtime (`postgres_changes`) für alle drei Tabellen.
7. **Event-Liste** – `/events`: anlegen, inline bearbeiten, abhaken, löschen mit Bestätigung, Filter, Sortierung.
8. **Qualität** – Vitest (zod-Schemas, Kennzahlen), Playwright-E2E, Seed-Skript, README.
9. **Deployment** – Supabase (EU/Frankfurt) und Vercel; Schritte im README.
