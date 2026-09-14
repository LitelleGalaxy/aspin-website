-- ASPIN.SITE CMS / ADMIN SECURITY SETUP
-- Run this AFTER your base tables have been created.
-- Do NOT put a service_role/secret key anywhere in frontend code.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

alter table public.admin_users enable row level security;

-- Admins can verify their own membership. No public access.
create policy "Admins can view own admin record"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

-- Existing public read policies
alter table public.promotions enable row level security;
alter table public.faqs enable row level security;
alter table public.payment_methods enable row level security;

-- Admin CRUD
create policy "Admins manage promotions"
on public.promotions
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins manage FAQs"
on public.faqs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins manage payment methods"
on public.payment_methods
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins manage site settings"
on public.site_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins view subscribers"
on public.subscribers
for select
to authenticated
using (public.is_admin());

create policy "Admins manage subscribers"
on public.subscribers
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins view analytics"
on public.analytics_events
for select
to authenticated
using (public.is_admin());

-- Public newsletter insertion.
-- The public site can INSERT a subscriber only when consent is true.
create policy "Public can subscribe"
on public.subscribers
for insert
to anon
with check (consent = true);

-- Public analytics event insertion.
create policy "Public can record analytics events"
on public.analytics_events
for insert
to anon
with check (char_length(event_name) between 1 and 40);
