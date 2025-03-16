/*
  # Admin Portal Enhancement

  1. Changes
    - Add admin settings table for configuration
    - Add admin activity tracking improvements
    - Add admin permissions table for granular access control
    - Add admin dashboard analytics table

  2. Security
    - Maintain RLS policies
    - Add granular permission checks
    - Enhance audit logging
*/

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_permissions table for granular access control
CREATE TABLE IF NOT EXISTS admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  resource text NOT NULL,
  action text NOT NULL,
  conditions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, resource, action)
);

-- Create admin_dashboard_stats table
CREATE TABLE IF NOT EXISTS admin_dashboard_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date date NOT NULL,
  total_users integer DEFAULT 0,
  total_courses integer DEFAULT 0,
  active_students integer DEFAULT 0,
  total_revenue decimal DEFAULT 0,
  course_completions integer DEFAULT 0,
  new_enrollments integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Add more detailed tracking to admin_audit_log
ALTER TABLE admin_audit_log
ADD COLUMN IF NOT EXISTS session_id uuid,
ADD COLUMN IF NOT EXISTS user_agent text,
ADD COLUMN IF NOT EXISTS success boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS error_details text;

-- Enable RLS on new tables
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_dashboard_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_settings
CREATE POLICY "Admins can manage settings"
  ON admin_settings
  USING (is_admin(auth.uid()));

-- Create policies for admin_permissions
CREATE POLICY "Admins can manage permissions"
  ON admin_permissions
  USING (is_admin(auth.uid()));

-- Create policies for admin_dashboard_stats
CREATE POLICY "Admins can view dashboard stats"
  ON admin_dashboard_stats
  USING (is_admin(auth.uid()));

-- Create function to check specific admin permissions
CREATE OR REPLACE FUNCTION check_admin_permission(
  user_id uuid,
  resource text,
  action text
) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    JOIN admin_permissions ap ON ap.role_id = r.id
    WHERE ur.user_id = user_id
    AND ap.resource = resource
    AND ap.action = action
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log admin activity with more detail
CREATE OR REPLACE FUNCTION log_admin_activity(
  admin_id uuid,
  action_name text,
  action_details jsonb,
  session_id uuid,
  user_agent text
) RETURNS void AS $$
BEGIN
  INSERT INTO admin_audit_log (
    user_id,
    action,
    details,
    session_id,
    user_agent,
    ip_address
  ) VALUES (
    admin_id,
    action_name,
    action_details,
    session_id,
    user_agent,
    current_setting('request.headers')::json->>'x-forwarded-for'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default admin permissions
INSERT INTO admin_permissions (role_id, resource, action) 
SELECT 
  r.id,
  resource,
  action
FROM roles r
CROSS JOIN (
  VALUES 
    ('courses', 'create'),
    ('courses', 'read'),
    ('courses', 'update'),
    ('courses', 'delete'),
    ('users', 'read'),
    ('users', 'update'),
    ('settings', 'read'),
    ('settings', 'update'),
    ('analytics', 'read')
) AS permissions(resource, action)
WHERE r.name = 'admin'
ON CONFLICT (role_id, resource, action) DO NOTHING;

-- Insert default admin settings
INSERT INTO admin_settings (key, value, description) VALUES
('session_timeout', '"30"', 'Admin session timeout in minutes'),
('max_login_attempts', '"5"', 'Maximum failed login attempts before lockout'),
('lockout_duration', '"15"', 'Account lockout duration in minutes'),
('password_expiry', '"90"', 'Password expiration in days'),
('require_2fa', 'true', 'Require two-factor authentication for admin access')
ON CONFLICT (key) DO NOTHING;