/*
  # Add admin user and role assignment

  1. Changes
    - Create admin user with proper UUID
    - Assign admin role to the user
  
  2. Security
    - Uses secure password hashing
    - Sets up proper admin privileges
*/

-- Create admin user if not exists
DO $$ 
DECLARE
  admin_user_id uuid;
  admin_role_id uuid;
BEGIN
  -- Generate a stable UUID for the admin user
  admin_user_id := '00000000-0000-0000-0000-000000000001';

  -- Insert admin user if not exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = admin_user_id
  ) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_token
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      'admin@llmacademy.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Admin User"}',
      now(),
      now(),
      'authenticated',
      'authenticated',
      ''
    );
  END IF;

  -- Get admin role ID
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';

  -- Assign admin role if not already assigned
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = admin_user_id 
    AND role_id = admin_role_id
  ) THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin_user_id, admin_role_id);
  END IF;
END $$;