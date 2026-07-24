-- Run this in your Supabase SQL Editor to set up the qrcodes table

CREATE TABLE qrcodes (
  short_id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_url TEXT,
  type TEXT NOT NULL,
  data JSONB,
  scans INTEGER DEFAULT 0,
  analytics JSONB DEFAULT '[]'::JSONB,
  password TEXT,
  expires_at TIMESTAMPTZ,
  max_scans INTEGER,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Setup Row Level Security (RLS)
ALTER TABLE qrcodes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all qrcodes (so anyone can scan them)
CREATE POLICY "Public can view all qrcodes" 
ON qrcodes FOR SELECT USING (true);

-- Allow authenticated users to insert their own qrcodes
CREATE POLICY "Users can insert their own qrcodes" 
ON qrcodes FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow authenticated users to update their own qrcodes
CREATE POLICY "Users can update their own qrcodes" 
ON qrcodes FOR UPDATE TO authenticated 
USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own qrcodes
CREATE POLICY "Users can delete their own qrcodes" 
ON qrcodes FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- Allow public updates to the scans and analytics columns (for tracking scans)
-- Note: A more secure approach is using a Supabase Edge Function or RPC, but this is a simple port of the Firebase logic
CREATE POLICY "Public can update scans" 
ON qrcodes FOR UPDATE USING (true);
