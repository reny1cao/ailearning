/*
  # Fix authentication setup

  1. Changes
    - Add missing auth schema configurations
    - Update user authentication settings
    - Add proper indexes and policies
  
  2. Security
    - Ensure proper auth schema setup
    - Add necessary constraints
*/

-- Enable RLS on auth.users if not already enabled
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON auth.users;
DROP POLICY IF EXISTS "Admins can read all users" ON auth.users;

-- Create policies for auth.users
CREATE POLICY "Users can read own data"
  ON auth.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON auth.users
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT ur.user_id 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name = 'admin'
    )
  );

-- Update auth settings
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_sign_in_at timestamp with time zone;

-- Create index for email lookups if not exists
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users (email);

-- Ensure proper auth settings for admin user
UPDATE auth.users
SET 
  is_admin = true,
  raw_app_meta_data = jsonb_build_object(
    'provider', 'email',
    'providers', ARRAY['email']
  ),
  raw_user_meta_data = jsonb_build_object(
    'name', 'Admin User'
  )
WHERE email = 'admin@llmacademy.com';

-- Add function to handle new user registration if not exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Assign student role to new users
  INSERT INTO public.user_roles (user_id, role_id)
  SELECT NEW.id, id FROM public.roles WHERE name = 'student'
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  -- Set default metadata
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_build_object(
    'provider', 'email',
    'providers', ARRAY['email']
  )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();