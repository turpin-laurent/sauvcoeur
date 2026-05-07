-- ============================================================
-- SauvCoeur.re — Admins + seed bannières/admin
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- ── Admins ────────────────────────────────────────────────────
create table if not exists sc_admins (
  id         text primary key,
  email      text not null unique,
  password   text not null,
  name       text not null,
  created_at timestamptz not null default now()
);

alter table sc_admins enable row level security;
-- Lecture interdite côté public (service role uniquement)
create policy "service role only" on sc_admins for all using (false);

-- Compte admin par défaut
insert into sc_admins (id, email, password, name, created_at)
values ('admin1', 'sauvcoeur974@gmail.com', 'Nutella974!', 'Admin principal', '2026-01-01T00:00:00Z')
on conflict (id) do nothing;

-- ── Seed bannières par défaut ────────────────────────────────
insert into sc_banners (id, slot, url, text, active)
values
  ('b1', 'Liste annonces — haut', 'https://www.facebook.com/SauvCoeurReunion', 'Votre publicité ici — Soutenez SauvCœur.re', true),
  ('b2', 'Détail annonce — haut', 'https://www.facebook.com/SauvCoeurReunion', 'Votre publicité ici — Soutenez SauvCœur.re', true),
  ('b3', 'Détail annonce — bas',  'https://www.facebook.com/SauvCoeurReunion', 'Votre publicité ici — Soutenez SauvCœur.re', true)
on conflict (id) do nothing;
