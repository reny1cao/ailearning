/*
  # Fix authentication setup

  1. Changes
    - Add missing auth schema configurations
    - Update user authentication settings
    - Add proper indexes
  
  2. Security
    - Ensure proper auth schema setup
    - Add necessary constraints
*/

-- Enable auth schema extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Update auth settings
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_sign_in_at timestamp with time zone;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users (email);

-- Update admin user with proper authentication
UPDATE auth.users
SET 
  is_admin = true,
  email_confirmed_at = now(),
  is_sso_user = false
WHERE email = 'admin@llmacademy.com';

-- Ensure proper auth settings
UPDATE auth.users
SET raw_app_meta_data = 
  CASE 
    WHEN raw_app_meta_data IS NULL THEN 
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email'])
    ELSE 
      raw_app_meta_data
  END
WHERE email = 'admin@llmacademy.com';

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can read own data" ON auth.users;

-- Add auth policies
CREATE POLICY "Users can read own data"
  ON auth.users
  FOR SELECT
  USING (auth.uid() = id);

-- Add function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role_id)
  SELECT NEW.id, id FROM public.roles WHERE name = 'student'
  ON CONFLICT (user_id, role_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();