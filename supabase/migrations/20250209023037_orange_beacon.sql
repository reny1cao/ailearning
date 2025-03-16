/*
  # Fix Admin Functions

  1. Changes
    - Update is_admin and get_user_role functions with explicit table aliases
    - Drop and recreate dependent policies with explicit references
    - Add table aliases to all JOIN conditions

  2. Security
    - Maintain existing RLS policies
    - Keep SECURITY DEFINER setting for functions
*/

-- First drop policies that depend on the functions
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can read audit logs" ON admin_audit_log;

-- Drop and recreate functions with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_role(uuid) CASCADE;

-- Create improved function to verify admin role with explicit table aliases
CREATE OR REPLACE FUNCTION is_admin(check_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles AS ur
    JOIN roles AS r ON r.id = ur.role_id
    WHERE ur.user_id = check_user_id
    AND r.name = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create improved function to get user role with explicit table aliases
CREATE OR REPLACE FUNCTION get_user_role(check_user_id uuid)
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT r.name
    FROM user_roles AS ur
    JOIN roles AS r ON r.id = ur.role_id
    WHERE ur.user_id = check_user_id
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies with explicit table aliases
CREATE POLICY "Users can view own roles"
  ON user_roles
  FOR SELECT
  USING (
    user_roles.user_id = auth.uid() 
    OR is_admin(auth.uid())
  );

-- Recreate admin audit log policy with explicit table aliases
CREATE POLICY "Admins can read audit logs"
  ON admin_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM user_roles AS ur
      JOIN roles AS r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );