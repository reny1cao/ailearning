/*
  # Remove Admin Portal

  1. Changes
    - Drop admin-related tables
    - Drop admin-related functions
    - Clean up roles and permissions
*/

-- Drop admin-related tables
DROP TABLE IF EXISTS admin_settings CASCADE;
DROP TABLE IF EXISTS admin_permissions CASCADE;
DROP TABLE IF EXISTS admin_dashboard_stats CASCADE;
DROP TABLE IF EXISTS admin_audit_log CASCADE;

-- Drop admin-related functions
DROP FUNCTION IF EXISTS is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS check_admin_permission(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS log_admin_activity(uuid, text, jsonb, uuid, text) CASCADE;

-- Update roles table to remove admin role
DELETE FROM roles WHERE name = 'admin';

-- Clean up user_roles table
DELETE FROM user_roles WHERE role_id IN (
  SELECT id FROM roles WHERE name = 'admin'
);