create table if not exists public.user_plans (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  goals jsonb not null default '[]'::jsonb,
  budgets jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_plans enable row level security;

create policy "Users can read their own plan"
  on public.user_plans for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own plan"
  on public.user_plans for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own plan"
  on public.user_plans for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on table public.user_plans to authenticated;
