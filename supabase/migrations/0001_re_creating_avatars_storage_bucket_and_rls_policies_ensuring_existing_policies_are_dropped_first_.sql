-- Create a storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', TRUE)
ON CONFLICT (id) DO NOTHING; -- Prevents error if bucket already exists

-- Drop policies if they exist to prevent errors on re-creation
DROP POLICY IF EXISTS "Allow authenticated users to upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;

-- Policy for authenticated users to upload their own avatars
CREATE POLICY "Allow authenticated users to upload their own avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

-- Policy for authenticated users to update their own avatars
CREATE POLICY "Allow authenticated users to update their own avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- Policy for authenticated users to delete their own avatars
CREATE POLICY "Allow authenticated users to delete their own avatars"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- Policy for anyone to view avatars (public read)
CREATE POLICY "Allow public read access to avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');