-- Replace the email and role values below with your real admin user.
-- First create the user in Supabase Authentication, then run this query.

insert into public.profiles (id, email, full_name)
select id, email, coalesce(raw_user_meta_data->>'full_name', email)
from auth.users
where email = 'romeshjjames@gmail.com'
on conflict (id) do update
set email = excluded.email,
    full_name = excluded.full_name,
    updated_at = now();

insert into public.admin_roles (user_id, role)
select id, 'super_admin'
from auth.users
where email = 'romeshjjames@gmail.com'
on conflict (user_id, role) do nothing;
