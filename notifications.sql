-- Create notifications table
create table if not exists public.notifications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    title text not null,
    message text not null,
    type text check (type in ('info', 'success', 'warning', 'error')) not null,
    link text,
    read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Create policies for notifications
create policy "Users can view own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "System can create notifications"
  on public.notifications for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update own notifications"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own notifications"
  on public.notifications for delete
  using (user_id = auth.uid());
