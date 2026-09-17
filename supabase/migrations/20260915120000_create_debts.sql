create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(trim(name)) > 0),
  amount numeric(12, 2) not null check (amount > 0),
  type text not null check (type in ('owed', 'lent')),
  person text not null check (char_length(trim(person)) > 0),
  due_date timestamptz,
  description text,
  status text not null check (status in ('pending', 'paid')) default 'pending',
  paid_amount numeric(12, 2) not null default 0 check (paid_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.debts enable row level security;

create policy "Users can read their own debts"
  on public.debts for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own debts"
  on public.debts for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own debts"
  on public.debts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own debts"
  on public.debts for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on table public.debts to authenticated;
