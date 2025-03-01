# Nathan's Portfolio

## Getting Started

1. Install dependencies:
```
npm install
```

2. Run the development server:
```
npm run dev
```

## Supabase Setup

For Admin Dashboard functionality, please manually execute the following SQL in the Supabase SQL Editor to fix RLS issues:

```sql
-- First grant all permissions to service_role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Temporarily disable RLS to reset everything
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS roles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to ensure clean slate
DO $$
DECLARE
    _table text;
    _policy text;
BEGIN
    FOR _table IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        FOR _policy IN SELECT policyname FROM pg_policies 
                     WHERE schemaname = 'public' AND tablename = _table
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', _policy, _table);
        END LOOP;
    END LOOP;
END
$$;

-- Re-enable RLS on all tables
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS roles ENABLE ROW LEVEL SECURITY;

-- Create explicit bypass policies for service_role

-- Users table policies
CREATE POLICY "Service Role Bypass for Users" 
  ON users FOR ALL 
  TO service_role
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Authenticated Users Can Read Users" 
  ON users FOR SELECT 
  TO authenticated
  USING (true);

-- Announcements table policies
CREATE POLICY "Service Role Bypass for Announcements" 
  ON announcements FOR ALL 
  TO service_role
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Authenticated Users Can Read Announcements" 
  ON announcements FOR SELECT 
  TO authenticated
  USING (true);

-- Roles table policies
CREATE POLICY "Service Role Bypass for Roles" 
  ON roles FOR ALL 
  TO service_role
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Authenticated Users Can Read Roles" 
  ON roles FOR SELECT 
  TO authenticated
  USING (true);

-- Ensure the ranks column exists in roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_attribute
    WHERE attrelid = 'roles'::regclass
    AND attname = 'rank'
    AND NOT attisdropped
  ) THEN
    ALTER TABLE roles ADD COLUMN rank INTEGER DEFAULT 0;
  END IF;
END $$;

-- Set proper rank for system roles
UPDATE roles SET rank = 100 WHERE name = 'Founder';
UPDATE roles SET rank = 0 WHERE name = 'User';
```

## Features

- Portfolio website with responsive design
- Admin dashboard for content management
- User role management
- Announcements system

## Deployments

The site can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting provider

## Domain

Currently configured for: albimestudios.com