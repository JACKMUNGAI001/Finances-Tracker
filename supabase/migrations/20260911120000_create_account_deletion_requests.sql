create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'verified', 'completed', 'cancelled')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  completed_at timestamptz,
  admin_notes text
);

create unique index if not exists one_pending_deletion_request_per_user
  on public.account_deletion_requests (user_id)
  where status in ('pending', 'verified');

alter table public.account_deletion_requests enable row level security;

create policy "Users can create their own account deletion request"
  on public.account_deletion_requests for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can see their own account deletion requests"
  on public.account_deletion_requests for select to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert on table public.account_deletion_requests to authenticated;
