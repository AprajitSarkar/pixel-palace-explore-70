
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table to store user profiles
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  credits INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read their own data" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update their own data" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Create policy to allow users to insert their own data
CREATE POLICY "Users can insert their own data" 
  ON users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create RPC function to create user profile that bypasses RLS
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  user_avatar TEXT,
  initial_credits INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO users (id, email, display_name, photo_url, credits)
  VALUES (user_id, user_email, user_name, user_avatar, initial_credits)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN true;
END;
$$;

-- Create table for liked videos
CREATE TABLE liked_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  video_id TEXT NOT NULL,
  video_data JSONB NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Enable Row Level Security for liked_videos
ALTER TABLE liked_videos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own liked videos
CREATE POLICY "Users can read their own liked videos" 
  ON liked_videos FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own liked videos
CREATE POLICY "Users can insert their own liked videos" 
  ON liked_videos FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own liked videos
CREATE POLICY "Users can delete their own liked videos" 
  ON liked_videos FOR DELETE 
  USING (auth.uid() = user_id);

-- Create table for video viewing history
CREATE TABLE video_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  video_id TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Enable Row Level Security for video_history
ALTER TABLE video_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own history
CREATE POLICY "Users can read their own history" 
  ON video_history FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert into their own history
CREATE POLICY "Users can insert into their own history" 
  ON video_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create table for credit purchases
CREATE TABLE credit_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  amount INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  product_id TEXT,
  purchase_date TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for credit_purchases
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own purchases
CREATE POLICY "Users can read their own purchases" 
  ON credit_purchases FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own purchases
CREATE POLICY "Users can insert their own purchases" 
  ON credit_purchases FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create table for ad views
CREATE TABLE ad_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  credits INTEGER NOT NULL,
  view_date TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for ad_views
ALTER TABLE ad_views ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own ad views
CREATE POLICY "Users can read their own ad views" 
  ON ad_views FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own ad views
CREATE POLICY "Users can insert their own ad views" 
  ON ad_views FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp on users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
