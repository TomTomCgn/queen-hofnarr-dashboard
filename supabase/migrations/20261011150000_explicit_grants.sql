-- Rechte explizit vergeben. Neue Supabase-Projekte geben neue Tabellen
-- nicht immer automatisch für die API-Rollen frei; dann scheitert sogar
-- der Service-Role-Key mit "permission denied".

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on public.queen_entries, public.fool_entries, public.events
  to service_role;

grant select on public.queen_entries, public.fool_entries, public.events to anon;
