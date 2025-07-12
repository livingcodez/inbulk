create table if not exists public.user_managed_vendors (
    id uuid primary key default uuid_generate_v4(),
    owner_id uuid references auth.users not null,
    name text not null,
    contact_info jsonb,
    addresses jsonb,
    created_at timestamp with time zone default timezone('utc', now())
);

alter table public.user_managed_vendors enable row level security;

create policy "Users manage their vendors" on public.user_managed_vendors
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

alter table public.products add column if not exists selected_user_vendor_id uuid references public.user_managed_vendors;
