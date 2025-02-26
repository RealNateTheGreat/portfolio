/*
  # Update Schema and Policies

  1. Tables
    - Add missing tables if they don't exist
    - Add missing columns if they don't exist
  
  2. Security
    - Enable RLS on tables
    - Add missing policies
*/

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  profile_image text,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id) NOT NULL,
  active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Drop users policies if they exist
  DROP POLICY IF EXISTS "Users can read own data" ON users;
  DROP POLICY IF EXISTS "Users can update own data" ON users;
  
  -- Drop announcements policies if they exist
  DROP POLICY IF EXISTS "Anyone can read active announcements" ON announcements;
  DROP POLICY IF EXISTS "Authenticated users can create announcements" ON announcements;
  DROP POLICY IF EXISTS "Admins can update announcements" ON announcements;
END $$;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can read active announcements"
  ON announcements
  FOR SELECT
  TO anon
  USING (active = true);

CREATE POLICY "Authenticated users can create announcements"
  ON announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Admins can update announcements"
  ON announcements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));