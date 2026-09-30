/*
# Create profiles table

## Purpose
Stores user profile data that extends Supabase's built-in auth.users table.
ManageMyTrip needs to store per-user preferences (currency, city, dietary, travel prefs)
that don't belong in auth metadata.

## New Tables
- `profiles`
  - `id` (uuid, PK, references auth.users.id ON DELETE CASCADE)
  - `full_name` (text, nullable — set during signup)
  - `avatar_url` (text, nullable)
  - `currency` (text, default 'INR')
  - `city` (text, nullable)
  - `region` (text, nullable)
  - `country` (text, nullable)
  - `lat` (double precision, nullable)
  - `lng` (double precision, nullable)
  - `location_enabled` (boolean, default false)
  - `dietary_prefs` (text[], default '{}')
  - `travel_prefs` (text[], default '{}')
  - `notification_prefs` (jsonb, default '{}')
  - `theme` (text, default 'system')
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

## Security
- RLS enabled on profiles.
- Each authenticated user can only read, insert, update, and delete their own profile row.
- No anon access — this is a signed-in app.

## Triggers
- handle_new_user: auto-inserts a profile row when a new auth.user is created.
- update_updated_at: auto-updates updated_at on every UPDATE.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  currency text NOT NULL DEFAULT 'INR',
  city text,
  region text,
  country text,
  lat double precision,
  lng double precision,
  location_enabled boolean NOT NULL DEFAULT false,
  dietary_prefs text[] NOT NULL DEFAULT '{}',
  travel_prefs text[] NOT NULL DEFAULT '{}',
  notification_prefs jsonb NOT NULL DEFAULT '{}'::jsonb,
  theme text NOT NULL DEFAULT 'system',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
