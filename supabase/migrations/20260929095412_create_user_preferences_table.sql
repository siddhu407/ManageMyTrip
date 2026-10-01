/*
# Create user_preferences table and add onboarding_completed to profiles

## Purpose
Store the onboarding answers (interests, budget, group type, time available) per user
so the recommendation engine can use them. Also track whether the user has completed
onboarding so we can skip it on future logins.

## New Tables
- `user_preferences`
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to auth.users, ON DELETE CASCADE, DEFAULT auth.uid())
  - `interests` (text[], default '{}' — array of Interest type values)
  - `budget` (integer, nullable — max budget in user's currency, null = no budget set)
  - `group_type` (text, nullable — one of: solo, partner, friends, family, kids, group)
  - `time_available` (text, nullable — one of: 1h, 2-3h, half-day, full-day, multi-day)
  - `currency` (text, default 'INR')
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

## Modified Tables
- `profiles`: add `onboarding_completed` (boolean, default false)
  - Used to determine if the user should be redirected to onboarding or straight to home

## Security
- RLS enabled on `user_preferences`.
- Each authenticated user can only read, insert, update, and delete their own preferences.
- `user_id` defaults to `auth.uid()` so inserts work without the client passing it.

## Triggers
- `update_user_preferences_updated_at`: auto-updates `updated_at` on every UPDATE.
*/

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  interests text[] NOT NULL DEFAULT '{}',
  budget integer,
  group_type text,
  time_available text,
  currency text NOT NULL DEFAULT 'INR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_preferences" ON user_preferences;
CREATE POLICY "select_own_preferences" ON user_preferences
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_preferences" ON user_preferences;
CREATE POLICY "insert_own_preferences" ON user_preferences
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_preferences" ON user_preferences;
CREATE POLICY "update_own_preferences" ON user_preferences
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_preferences" ON user_preferences;
CREATE POLICY "delete_own_preferences" ON user_preferences
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Add onboarding_completed to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Trigger: auto-update updated_at on user_preferences
CREATE OR REPLACE FUNCTION public.update_user_preferences_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_preferences_updated_at ON user_preferences;
CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_user_preferences_updated_at();
