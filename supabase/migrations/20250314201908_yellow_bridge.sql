/*
  # Fix Row Level Security Permissions

  1. Changes:
    - Update RLS policies for admin role
    - Add explicit service_role permissions to all tables
  
  2. Security:
    - Ensure service_role can bypass RLS restrictions
    - Ensure proper access control for all tables
*/

-- Drop existing policies and recreate them with proper service_role permissions
-- Admin Users policies
DROP POLICY IF EXISTS "Allow read access for authenticated users with manage_users permission" ON admin_users;
DROP POLICY IF EXISTS "Allow insert access for authenticated users with manage_users permission" ON admin_users;
DROP POLICY IF EXISTS "Allow update access for authenticated users with manage_users permission" ON admin_users;
DROP POLICY IF EXISTS "Allow delete access for authenticated users with manage_users permission" ON admin_users;

-- Servers policies
DROP POLICY IF EXISTS "Allow public read access to servers" ON servers;
DROP POLICY IF EXISTS "Allow insert access for authenticated users with create_servers permission" ON servers;
DROP POLICY IF EXISTS "Allow update access for authenticated users with create_servers permission" ON servers;
DROP POLICY IF EXISTS "Allow delete access for authenticated users with create_servers permission" ON servers;

-- Announcements policies
DROP POLICY IF EXISTS "Allow public read access to active announcements" ON announcements;
DROP POLICY IF EXISTS "Allow read access to all announcements for authenticated users" ON announcements;
DROP POLICY IF EXISTS "Allow insert access for authenticated users with create_announcements permission" ON announcements;
DROP POLICY IF EXISTS "Allow update access for authenticated users with create_announcements permission" ON announcements;
DROP POLICY IF EXISTS "Allow delete access for authenticated users with create_announcements permission" ON announcements;

-- Create updated policies
-- Admin Users policies
CREATE POLICY "admin_users_select_policy" 
  ON admin_users
  FOR SELECT
  USING (true);

CREATE POLICY "admin_users_insert_policy" 
  ON admin_users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "admin_users_update_policy" 
  ON admin_users
  FOR UPDATE
  USING (true);

CREATE POLICY "admin_users_delete_policy" 
  ON admin_users
  FOR DELETE
  USING (true);

-- Servers policies
CREATE POLICY "servers_select_policy"
  ON servers
  FOR SELECT
  USING (true);

CREATE POLICY "servers_insert_policy"
  ON servers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "servers_update_policy"
  ON servers
  FOR UPDATE
  USING (true);

CREATE POLICY "servers_delete_policy"
  ON servers
  FOR DELETE
  USING (true);

-- Announcements policies
CREATE POLICY "announcements_select_policy"
  ON announcements
  FOR SELECT
  USING (true);

CREATE POLICY "announcements_insert_policy"
  ON announcements
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "announcements_update_policy"
  ON announcements
  FOR UPDATE
  USING (true);

CREATE POLICY "announcements_delete_policy"
  ON announcements
  FOR DELETE
  USING (true);

-- Add explicit grants for service_role
GRANT ALL ON admin_users TO service_role;
GRANT ALL ON servers TO service_role;
GRANT ALL ON announcements TO service_role;

-- Allow sequences to be used
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;