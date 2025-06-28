-- Wallet funding schema
create table if not exists public.wallet_transactions (
  reference text primary key,
  email text not null,
  amount numeric(12,2) not null,
  created_at timestamptz default now()
);

alter table public.wallet_transactions enable row level security;

create or replace function public.increment_wallet_balance(p_email text, p_amount numeric)
returns void
language plpgsql
as $$
declare
  uid uuid;
begin
  select id into uid from auth.users where email = p_email;
  if uid is not null then
    update public.user_profiles
    set wallet_balance = wallet_balance + p_amount
    where id = uid;
  end if;
end;
$$;
