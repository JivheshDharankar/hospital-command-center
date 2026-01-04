-- Promote user to admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'jivheshdharankar9923@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;