-- Hama — full schema. Run this once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run: every statement is idempotent (if not exists / on conflict do nothing).

create extension if not exists "pgcrypto";

-- ---- Tables ----------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz default now()
);

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete set null,
  hood text not null,
  area text not null,
  house_type text not null,
  rent integer not null,
  deposit integer,
  vacancy_date date not null,
  water text, security text, road text, internet text, parking text,
  created_at timestamptz default now(),
  status text default 'pending'
);

create table if not exists property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  room_type text,
  media_type text not null,       -- 'photo' | 'video'
  storage_path text not null,     -- path inside the property-media bucket
  captured_at timestamptz,
  latitude numeric, longitude numeric,
  ai_verified boolean default false,   -- true once the server-side house-photo check passed
  created_at timestamptz default now()
);

create table if not exists favorites (
  user_id uuid references profiles(id) on delete cascade,
  property_id uuid references properties(id) on delete cascade,
  created_at timestamptz default now(),
  primary key(user_id,property_id)
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  reporter_id uuid references profiles(id) on delete set null,
  reason text not null,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles(id) on delete set null,
  receiver_id uuid references profiles(id) on delete set null,
  property_id uuid references properties(id) on delete set null,
  body text not null,
  created_at timestamptz default now()
);

-- ---- Row Level Security ------------------------------------------------
alter table profiles enable row level security;
alter table properties enable row level security;
alter table property_media enable row level security;
alter table favorites enable row level security;
alter table messages enable row level security;
alter table reports enable row level security;

drop policy if exists "public can read profiles" on profiles;
create policy "public can read profiles" on profiles for select using (true);
drop policy if exists "user can insert own profile" on profiles;
create policy "user can insert own profile" on profiles for insert with check (auth.uid() = id);
drop policy if exists "user can update own profile" on profiles;
create policy "user can update own profile" on profiles for update using (auth.uid() = id);

drop policy if exists "public can read active properties" on properties;
create policy "public can read active properties" on properties for select using (status = 'active');
drop policy if exists "owner can insert property" on properties;
create policy "owner can insert property" on properties for insert with check (auth.uid() = owner_id);
drop policy if exists "owner can update property" on properties;
create policy "owner can update property" on properties for update using (auth.uid() = owner_id);

drop policy if exists "public can read media" on property_media;
create policy "public can read media" on property_media for select using (true);
drop policy if exists "owner can add media" on property_media;
create policy "owner can add media" on property_media for insert
  with check (exists (select 1 from properties p where p.id = property_id and p.owner_id = auth.uid()));

drop policy if exists "user can read own favorites" on favorites;
create policy "user can read own favorites" on favorites for select using (auth.uid() = user_id);
drop policy if exists "user can add own favorites" on favorites;
create policy "user can add own favorites" on favorites for insert with check (auth.uid() = user_id);
drop policy if exists "user can remove own favorites" on favorites;
create policy "user can remove own favorites" on favorites for delete using (auth.uid() = user_id);

drop policy if exists "anyone can file a report" on reports;
create policy "anyone can file a report" on reports for insert with check (true);

drop policy if exists "user can read own messages" on messages;
create policy "user can read own messages" on messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
drop policy if exists "user can send messages" on messages;
create policy "user can send messages" on messages for insert with check (auth.uid() = sender_id);

-- ---- Storage: bucket for room photos / walkthrough videos --------------
insert into storage.buckets (id, name, public)
  values ('property-media', 'property-media', true)
  on conflict (id) do nothing;

drop policy if exists "public read property media" on storage.objects;
create policy "public read property media" on storage.objects
  for select using (bucket_id = 'property-media');

-- Uploads must be saved under a path starting with the uploader's own user id,
-- e.g. `${userId}/${propertyId}/kitchen.jpg` — enforced by checking the first
-- path segment against auth.uid().
drop policy if exists "authenticated upload own property media" on storage.objects;
create policy "authenticated upload own property media" on storage.objects
  for insert with check (
    bucket_id = 'property-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "owner can delete own property media" on storage.objects;
create policy "owner can delete own property media" on storage.objects
  for delete using (
    bucket_id = 'property-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---- Production hardening additions ----------------------------------
create index if not exists properties_status_created_idx on properties(status, created_at desc);
create index if not exists properties_hood_area_idx on properties(hood, area);
create index if not exists properties_vacancy_idx on properties(vacancy_date);
create index if not exists property_media_property_idx on property_media(property_id, created_at desc);

-- Owners can see their own pending listings; the public can only see active ones.
drop policy if exists "public can read active properties" on properties;
create policy "public can read active properties" on properties
  for select using (status = 'active' or auth.uid() = owner_id);

drop policy if exists "public can read media" on property_media;
create policy "public can read active property media" on property_media
  for select using (
    exists (select 1 from properties p where p.id = property_id and (p.status = 'active' or p.owner_id = auth.uid()))
  );

-- Allow owners to delete their own property media when correcting a listing.
drop policy if exists "owner can delete media" on property_media;
create policy "owner can delete media" on property_media
  for delete using (
    exists (select 1 from properties p where p.id = property_id and p.owner_id = auth.uid())
  );


-- Force owner-created listings into moderation. A normal authenticated user cannot
-- make a property public by sending status='active' from the browser. Reviewers
-- should approve by changing status from the Supabase dashboard/SQL editor.
create or replace function hama_force_pending_property()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    new.status := 'pending';
  end if;
  return new;
end;
$$;

drop trigger if exists hama_force_pending_property_trigger on properties;
create trigger hama_force_pending_property_trigger
before insert or update on properties
for each row execute function hama_force_pending_property();

-- Manual approval example (run as the project owner in Supabase SQL Editor):
-- update public.properties set status = 'active' where id = '<PROPERTY_ID>';
