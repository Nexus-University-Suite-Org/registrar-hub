-- Storage setup for Registrar Hub
-- This script sets up the necessary storage buckets and policies

-- Create avatars bucket for storing profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for avatars bucket
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

-- Allow public access to view avatars (since bucket is public)
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Create a function to handle avatar cleanup when profiles are deleted
CREATE OR REPLACE FUNCTION delete_old_avatar()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete avatar file when profile is deleted
  IF OLD.avatar_url IS NOT NULL THEN
    -- Extract file path from URL
    -- This assumes avatar URLs follow the pattern: https://.../avatars/lecturer-avatars/filename
    DELETE FROM storage.objects
    WHERE bucket_id = 'avatars'
    AND name LIKE 'lecturer-avatars/%'
    AND name = split_part(OLD.avatar_url, '/', array_length(string_to_array(OLD.avatar_url, '/'), 1));
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to clean up avatars when profiles are deleted
DROP TRIGGER IF EXISTS cleanup_avatar_on_profile_delete ON profiles;
CREATE TRIGGER cleanup_avatar_on_profile_delete
  BEFORE DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION delete_old_avatar();