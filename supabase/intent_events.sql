create table if not exists public.intent_events (
  id bigserial primary key,
  session_id text not null,
  ts timestamptz not null default now(),
  timezone text,
  category text not null check (category in ('DISCOVERY', 'AFFINITY', 'PURCHASE', 'LEARNING')),
  action text not null,
  country text,
  region text,
  appellation text,
  grape text,
  style text,
  search_query text,
  food_query text,
  quiz_result text,
  dwell_bucket text check (dwell_bucket in ('glance', 'read', 'study'))
);

create index if not exists intent_events_ts_idx on public.intent_events (ts desc);
create index if not exists intent_events_appellation_idx on public.intent_events (appellation);
create index if not exists intent_events_category_idx on public.intent_events (category);
create index if not exists intent_events_country_idx on public.intent_events (country);
create index if not exists intent_events_action_idx on public.intent_events (action);

alter table public.intent_events enable row level security;

-- API routes use the server-only service-role key. No public read or write
-- policies are intentionally defined.
