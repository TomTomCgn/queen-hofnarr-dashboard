# 👑🃏 Queen & Hofnarr

Kleines, passwortgeschütztes Dashboard: Queen und Hofnarr erfassen täglich ihre Stimmungswerte (Skala 1–10), das Dashboard zeigt Kennzahlen und Verläufe in Echtzeit, dazu gibt es eine gemeinsame Event-Liste.

**Stack:** Next.js 15 (App Router, TypeScript) · Tailwind CSS 4 · shadcn/ui · Recharts · Supabase (Postgres + Realtime) · react-hook-form + zod · Vercel

| Seite | Inhalt |
|---|---|
| `/` | Dashboard: Kennzahlen (letzter Wert, Veränderung zum vorherigen Eintrag, Ø 7 Tage), Liniendiagramme, Zeitraumfilter |
| `/queen` | Erfassung Queen: Emotionalität, „Grund ist der Hofnarr“ |
| `/hofnarr` | Erfassung Hofnarr: Joe-Genervtheit, Themenvielfalt, Ruhebedarf |
| `/events` | Event-Liste: anlegen, inline bearbeiten, abhaken, löschen, filtern |
| `/login` | Login mit gemeinsamem Passwort |

## Lokale Einrichtung

Voraussetzungen: Node.js 20+ und ein Supabase-Projekt (oder eine lokale Supabase-Instanz über die Supabase CLI).

```bash
npm install
cp .env.example .env.local   # Werte eintragen, siehe unten
npm run dev                  # http://localhost:3000
npm run seed                 # optional: ~30 Tage Beispieldaten
```

Die Datenbank-Migration liegt in `supabase/migrations/`. Einspielen entweder mit der Supabase CLI (`supabase link --project-ref <ref>` und `supabase db push`) oder indem man den Inhalt der SQL-Datei im Supabase-Dashboard unter **SQL Editor** ausführt.

### Befehle

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver |
| `npm run build` / `npm start` | Produktions-Build / -Server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript-Prüfung |
| `npm test` | Unit-Tests (Vitest): zod-Schemas, Kennzahlen, Diagrammdaten, Session |
| `npm run test:e2e` | End-to-End-Test (Playwright, Smartphone-Ansicht). Baut und startet die App selbst; nutzt `.env.local` und **schreibt in die dort konfigurierte Datenbank** – nur gegen eine Entwicklungs-DB laufen lassen. Gegen eine laufende Instanz: `E2E_BASE_URL=https://… npm run test:e2e` |
| `npm run seed` | Beispieldaten für die lokale Entwicklung |

## Umgebungsvariablen

| Variable | Wo zu finden | Hinweis |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | öffentlich |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API Keys → `anon` | öffentlich, darf per RLS nur lesen |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API Keys → `service_role` | **geheim**, nur serverseitig |
| `APP_PASSWORD` | selbst wählen | gemeinsames Login-Passwort |
| `SESSION_SECRET` | selbst erzeugen: `openssl rand -base64 48` | mind. 32 Zeichen, signiert das Session-Cookie |

`.env.local` ist per `.gitignore` ausgeschlossen.

## Deployment

### 1. Supabase

1. Auf [supabase.com](https://supabase.com) ein neues Projekt anlegen, Region **Central EU (Frankfurt)**.
2. Im Projekt **SQL Editor** öffnen, den Inhalt von `supabase/migrations/20261011120000_init.sql` einfügen und ausführen. (Alternativ: `supabase link` + `supabase db push`.)
3. Unter **Project Settings → API** die Project URL sowie den `anon`- und `service_role`-Key kopieren.

Die Migration aktiviert Realtime für alle drei Tabellen und Row Level Security (nur Lesen für `anon`).

### 2. Vercel

1. Auf [vercel.com](https://vercel.com) **Add New → Project** wählen und dieses GitHub-Repository importieren (Framework wird als Next.js erkannt).
2. Unter **Environment Variables** alle fünf Variablen aus der Tabelle oben eintragen.
3. **Deploy** klicken. Nach dem Build ist die App unter der angezeigten `*.vercel.app`-URL erreichbar.
4. Abnahme: Login, beide Erfassungen speichern, Dashboard auf einem zweiten Gerät offen lassen und prüfen, dass neue Werte ohne Neuladen erscheinen, Event anlegen/abhaken/löschen.

Jeder Push auf den Hauptbranch löst danach automatisch ein neues Deployment aus.

## Passwort ändern

1. In Vercel unter **Settings → Environment Variables** den Wert von `APP_PASSWORD` ändern.
2. Unter **Deployments** das letzte Deployment **Redeploy**en (Umgebungsvariablen greifen erst nach einem neuen Deployment).
3. Bereits angemeldete Geräte bleiben bis zum Ablauf ihres Cookies (30 Tage) angemeldet. Um alle sofort abzumelden, zusätzlich `SESSION_SECRET` durch einen neuen Zufallswert ersetzen.

## Sicherheit

- Alle Seiten und Server Actions prüfen das signierte, httpOnly-Session-Cookie (Middleware plus zusätzliche Prüfung in jeder Server Action).
- Schreibzugriffe laufen ausschließlich über Server Actions mit dem Service-Role-Key; das Modul `lib/supabase/server.ts` ist mit `server-only` markiert und kann nicht im Browser landen.
- Der Browser nutzt den Anon-Key nur für Realtime-Lesezugriffe. Weil der Anon-Key im JavaScript-Bundle steht, kann jemand, der ihn kennt, die Werte über die Supabase-API **lesen** (aber nicht ändern). Für ein privates Stimmungstagebuch ist das ein vertretbarer Kompromiss; wer das ausschließen will, müsste Realtime auf signierte Supabase-JWTs umstellen.
- Seiten sind per `robots.txt` und Meta-Tag von Suchmaschinen ausgeschlossen.

## Projektstruktur

```
app/
  (protected)/          # Dashboard, /queen, /hofnarr, /events (Layout mit Kopfzeile)
  login/                # Login-Seite
  actions/              # Server Actions: Login/Logout, Einträge (Upsert), Events (CRUD)
components/             # Formulare, Diagramme, KPI-Kacheln, Event-Liste, ui/ (shadcn)
lib/
  supabase/             # Server- (Service-Key) und Browser-Client (Anon-Key)
  validation.ts         # zod-Schemas
  kpi.ts, chart-data.ts # Kennzahlen und Diagrammreihen
  session.ts            # signierte Session-Tokens
middleware.ts           # Passwortschutz
supabase/migrations/    # SQL-Schema, RLS, Realtime
scripts/seed.ts         # Beispieldaten
e2e/                    # Playwright-Test
```
