-- ============================================================
-- SauvCoeur.re — Modération pros + notifications admin
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- ── Modération pros ───────────────────────────────────────────
alter table sc_pros
  add column if not exists moderation_status text not null default 'pending'
    check (moderation_status in ('pending','approved','rejected'));

-- Les pros déjà approuvés (is_verified=true) restent approuvés
update sc_pros set moderation_status = 'approved' where is_verified = true;

-- ── Notifications admin ───────────────────────────────────────
create table if not exists sc_notifications (
  id         bigserial primary key,
  type       text not null,           -- 'new_pro' | 'new_member' | 'new_annonce'
  title      text not null,
  message    text not null,
  read       boolean not null default false,
  data       jsonb default '{}',
  created_at timestamptz not null default now()
);

alter table sc_notifications enable row level security;
create policy "service role only notif" on sc_notifications for all using (false);
