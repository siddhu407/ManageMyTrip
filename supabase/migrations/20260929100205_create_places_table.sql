/*
# Create places table and seed city highlights

## Purpose
Stores curated places (restaurants, cafes, landmarks, activities, shopping) per city
that power the Home dashboard recommendations, Explore page browsing, and city highlights.

## New Tables
- `places`
  - `id` (uuid, PK)
  - `name` (text, not null)
  - `category` (text, not null — eat, cafe, explore, entertainment, shopping, nature, relax, adventure, events, sightseeing, nightlife)
  - `subcategory` (text, nullable — e.g. "Street food", "Historical landmark")
  - `city` (text, not null)
  - `region` (text, nullable)
  - `country` (text, nullable)
  - `lat` (double precision, nullable)
  - `lng` (double precision, nullable)
  - `address` (text, nullable)
  - `rating` (numeric, nullable, 0-5)
  - `price_level` (integer, nullable, 1-4)
  - `open_now` (boolean, default true)
  - `opening_hours` (text, nullable)
  - `distance_km` (numeric, nullable — approx distance from city center)
  - `estimated_cost` (integer, nullable — approx cost for two in INR)
  - `description` (text, nullable)
  - `tags` (text[], default '{}')
  - `emoji` (text, nullable — for display)
  - `is_famous` (boolean, default false — featured in city highlights)
  - `is_open_now` (boolean, default true — time-aware flag)
  - `created_at` (timestamptz, default now())

## Security
- RLS enabled on `places`.
- Public read access for all users (TO anon, authenticated) — places are shared curated data.
- No INSERT/UPDATE/DELETE from the client — only managed via migrations/admin.

## Seed Data
- 15 curated places for Pune, India covering eat, cafe, explore, entertainment, shopping, nature, sightseeing categories.
- 3 of these flagged as `is_famous = true` for the "You Shouldn't Leave [City] Without" section.
*/

CREATE TABLE IF NOT EXISTS places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  subcategory text,
  city text NOT NULL,
  region text,
  country text,
  lat double precision,
  lng double precision,
  address text,
  rating numeric(2,1),
  price_level integer CHECK (price_level >= 1 AND price_level <= 4),
  open_now boolean NOT NULL DEFAULT true,
  opening_hours text,
  distance_km numeric(5,1),
  estimated_cost integer,
  description text,
  tags text[] NOT NULL DEFAULT '{}',
  emoji text,
  is_famous boolean NOT NULL DEFAULT false,
  is_open_now boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE places ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_all_places" ON places;
CREATE POLICY "read_all_places" ON places
  FOR SELECT TO anon, authenticated
  USING (true);

-- Index for category + city lookups
CREATE INDEX IF NOT EXISTS idx_places_category_city ON places(category, city);
CREATE INDEX IF NOT EXISTS idx_places_city ON places(city);
CREATE INDEX IF NOT EXISTS idx_places_famous ON places(is_famous) WHERE is_famous = true;

-- Seed data: Pune places
INSERT INTO places (name, category, subcategory, city, region, country, lat, lng, rating, price_level, open_now, opening_hours, distance_km, estimated_cost, description, tags, emoji, is_famous, is_open_now) VALUES
-- Eat
('Vaishali', 'eat', 'South Indian', 'Pune', 'Maharashtra', 'India', 18.5163, 73.8567, 4.4, 2, true, '7:00–23:00', 1.2, 400, 'Popular South Indian restaurant on FC Road, always buzzing.', '{"breakfast","south-indian","family","veg"}', '🥞', false, true),
('Joshi Vadewale', 'eat', 'Street food', 'Pune', 'Maharashtra', 'India', 18.5196, 73.8553, 4.3, 1, true, '8:00–22:00', 0.8, 100, 'A Pune institution serving vada pav since 1959.', '{"street-food","vada-pav","snack","iconic"}', '🥟', true, true),
('German Bakery', 'eat', 'Cafe & Bakery', 'Pune', 'Maharashtra', 'India', 18.5172, 73.8561, 4.3, 2, true, '7:00–22:00', 0.8, 350, 'Cosy bakery known for fresh breads, coffee, and breakfast.', '{"cafe","bakery","breakfast","coffee"}', '☕', false, true),
('Kayani Bakery', 'eat', 'Bakery', 'Pune', 'Maharashtra', 'India', 18.5120, 73.8570, 4.5, 1, true, '7:30–21:00', 1.5, 200, 'Legendary Irani bakery famous for Shrewsbury biscuits and mawa cake.', '{"bakery","irani","biscuits","iconic"}', '🍪', false, true),
('Badshah Falooda', 'eat', 'Desserts', 'Pune', 'Maharashtra', 'India', 18.5175, 73.8568, 4.2, 1, true, '10:00–23:30', 1.0, 150, 'Famous for royal falooda and kulfi near Camp area.', '{"dessert","falooda","street-food"}', '🍨', false, true),
-- Cafe
('Cafe Goodluck', 'cafe', 'Irani Cafe', 'Pune', 'Maharashtra', 'India', 18.5165, 73.8567, 4.4, 1, true, '7:00–23:00', 1.1, 300, 'Historic Irani cafe on FC Road, unchanged since 1932.', '{"irani-cafe","breakfast","bun-maska","iconic"}', '🫖', false, true),
('The Cafe Loft', 'cafe', 'Specialty Coffee', 'Pune', 'Maharashtra', 'India', 18.5350, 73.8250, 4.5, 3, true, '9:00–23:00', 3.2, 600, 'Specialty coffee and all-day brunch in Kothrud.', '{"coffee","brunch","wifi","work-friendly"}', '☕', false, true),
-- Explore / Sightseeing
('Aga Khan Palace', 'explore', 'Historical', 'Pune', 'Maharashtra', 'India', 18.5523, 73.9047, 4.5, 1, true, '9:00–17:30', 3.5, 100, 'Historic palace and museum with beautiful gardens, linked to Gandhi.', '{"historical","museum","gardens","gandhi"}', '🏛', false, true),
('Shaniwar Wada', 'explore', 'Historical', 'Pune', 'Maharashtra', 'India', 18.5196, 73.8553, 4.4, 1, true, '9:00–18:00', 1.0, 50, 'The seat of the Peshwas, a fortified palace ruin in the heart of Pune.', '{"historical","fort","landmark","iconic"}', '🏰', true, true),
('Sinhagad Fort', 'explore', 'Trekking', 'Pune', 'Maharashtra', 'India', 18.3660, 73.7530, 4.6, 1, true, '6:00–18:00', 25.0, 0, 'Hilltop fort with panoramic views, a popular sunrise trek.', '{"trek","fort","sunrise","nature"}', '⛰', false, true),
-- Nature
('Pashan Lake', 'nature', 'Lake', 'Pune', 'Maharashtra', 'India', 18.5330, 73.7880, 4.3, 1, true, 'Always open', 6.5, 0, 'Serene lake popular for birdwatching and evening walks.', '{"lake","birdwatching","walk","peaceful"}', '🦢', false, true),
('Empress Botanical Garden', 'nature', 'Garden', 'Pune', 'Maharashtra', 'India', 18.5040, 73.8700, 4.4, 1, true, '9:30–18:00', 3.0, 50, '14-acre botanical garden with rare trees and peaceful walking paths.', '{"garden","trees","walk","family"}', '🌳', false, true),
-- Shopping
('FC Road Street Market', 'shopping', 'Street Market', 'Pune', 'Maharashtra', 'India', 18.5163, 73.8567, 4.2, 1, true, '10:00–22:00', 1.0, 500, 'Bargain hunting central — clothes, accessories, and street food.', '{"street-shopping","bargain","clothes","accessories"}', '🛍', true, true),
('Phoenix Marketcity', 'shopping', 'Mall', 'Pune', 'Maharashtra', 'India', 18.5900, 73.8950, 4.5, 4, true, '11:00–22:00', 8.0, 2000, 'Pune''s largest mall with international brands, food court, and cinema.', '{"mall","brands","cinema","ac"}', '🏬', false, true),
-- Entertainment
('Pune Okayama Friendship Garden', 'entertainment', 'Garden', 'Pune', 'Maharashtra', 'India', 18.5300, 73.8300, 4.5, 1, true, '6:00–10:00, 16:00–20:00', 4.0, 10, 'Japanese-style garden perfect for evening strolls and photography.', '{"garden","japanese","photography","peaceful"}', '🌸', false, true)
ON CONFLICT DO NOTHING;
