
-- Create a table for user profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view profiles
CREATE POLICY "Users can view all profiles" 
  ON profiles FOR SELECT 
  USING (true);

-- Create policy to allow users to update only their profiles
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create table for liked videos
CREATE TABLE liked_videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  video_id TEXT NOT NULL,
  video_data JSONB NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE liked_videos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their likes
CREATE POLICY "Users can view their own likes" 
  ON liked_videos FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their likes
CREATE POLICY "Users can insert their own likes" 
  ON liked_videos FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their likes
CREATE POLICY "Users can delete their own likes" 
  ON liked_videos FOR DELETE 
  USING (auth.uid() = user_id);

-- Create table for user history
CREATE TABLE view_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  video_id TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE view_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their history
CREATE POLICY "Users can view their own history" 
  ON view_history FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their history
CREATE POLICY "Users can insert their own history" 
  ON view_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update timestamps on profiles table
CREATE TRIGGER update_profile_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_timestamp();
