create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  display_name text not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username = lower(username) and username ~ '^[a-z0-9_]{3,24}$'),
  constraint profiles_display_name_length check (char_length(trim(display_name)) between 1 and 60)
);

create unique index if not exists profiles_username_lower_uidx on public.profiles (lower(username));

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (display_name, avatar_url) on table public.profiles to authenticated;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their editable profile fields"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function app_private.handle_new_detwal_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    lower(coalesce(new.raw_user_meta_data ->> 'username', '')),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'New member')
  );
  return new;
end;
$$;

revoke all on function app_private.handle_new_detwal_user() from public, anon, authenticated;

create trigger on_auth_user_created_detwal_profile
  after insert on auth.users
  for each row execute function app_private.handle_new_detwal_user();