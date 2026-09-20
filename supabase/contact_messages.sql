create extension if not exists pgcrypto;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) <= 254),
  reason text not null check (reason in (
    'Atlas correction', 'Region suggestion', 'Partnership', 'Product feedback',
    'Press enquiry', 'Privacy request', 'Other'
  )),
  message text not null check (char_length(message) between 10 and 250),
  read_at timestamptz
);

alter table public.contact_messages enable row level security;

-- Contact data is only accessed by server routes using the service-role key.
-- No public RLS policies are intentionally defined.

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

create index if not exists contact_messages_unread_idx
  on public.contact_messages (read_at)
  where read_at is null;
