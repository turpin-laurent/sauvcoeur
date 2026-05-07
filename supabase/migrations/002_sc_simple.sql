-- ============================================================
-- SauvCoeur.re — Tables simplifiées MVP
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- ── Animals ──────────────────────────────────────────────────
create table if not exists sc_animals (
  id                  text primary key,
  status              text not null check (status in ('lost','found','to_adopt')),
  species             text not null,
  gender              text not null default 'unknown',
  name                text,
  age_years           int,
  color               text,
  specific_signs      text,
  location_city       text not null,
  photos              text[] default '{}',
  contact_type        text default 'email',
  contact_email       text,
  contact_phone       text,
  contact_facebook    text,
  microchip_icad      text,
  last_seen_location  text,
  last_seen_at        timestamptz,
  nac_type            text,
  author_id           text,
  author_name         text,
  moderation_status   text not null default 'pending'
    check (moderation_status in ('pending','approved','rejected')),
  boosted             boolean not null default false,
  pinned              boolean not null default false,
  created_at          timestamptz not null default now()
);

create index if not exists idx_sc_animals_status     on sc_animals(status);
create index if not exists idx_sc_animals_moderation on sc_animals(moderation_status);
create index if not exists idx_sc_animals_created    on sc_animals(created_at desc);

alter table sc_animals enable row level security;
create policy "public read approved" on sc_animals
  for select using (moderation_status = 'approved');

-- ── Newsletter ────────────────────────────────────────────────
create table if not exists sc_newsletter (
  email          text primary key,
  subscribed_at  timestamptz not null default now()
);

alter table sc_newsletter enable row level security;

-- ── Pros ─────────────────────────────────────────────────────
create table if not exists sc_pros (
  id              text primary key,
  business_name   text not null,
  contact_name    text,
  category        text not null,
  description     text,
  city            text not null,
  phone           text,
  email           text,
  website         text,
  is_verified     boolean not null default false,
  is_featured     boolean not null default false,
  is_association  boolean not null default false,
  created_at      timestamptz not null default now()
);

alter table sc_pros enable row level security;
create policy "public read pros" on sc_pros for select using (true);

-- ── Banners ───────────────────────────────────────────────────
create table if not exists sc_banners (
  id      text primary key,
  slot    text not null,
  url     text not null,
  text    text not null,
  image   text,
  active  boolean not null default true
);

alter table sc_banners enable row level security;
create policy "public read banners" on sc_banners for select using (true);
