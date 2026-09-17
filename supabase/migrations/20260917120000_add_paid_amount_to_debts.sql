alter table public.debts
  add column if not exists paid_amount numeric(12, 2) not null default 0 check (paid_amount >= 0);

grant select, insert, update, delete on table public.debts to authenticated;
