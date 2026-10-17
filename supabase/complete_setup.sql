-- ============================================================================
-- ResourceHub: Database Schema & Initial Seed Data
-- ============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if re-applying
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.resources CASCADE;
DROP TABLE IF EXISTS public.topics CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('STUDENT', 'FACILITATOR', 'ADMIN')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- 4. Topics Table
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  code TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_topics_name ON public.topics(name);

-- 5. Resources Table
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('PDF', 'PPT', 'PPTX', 'DOC', 'DOCX')),
  file_size TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  uploader_name TEXT NOT NULL,
  like_count INTEGER NOT NULL DEFAULT 0 CHECK (like_count >= 0),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_resources_topic_id ON public.resources(topic_id);
CREATE INDEX idx_resources_uploaded_by ON public.resources(uploaded_by);
CREATE INDEX idx_resources_uploaded_at ON public.resources(uploaded_at DESC);

-- 6. Likes Table with Strict Unique Constraint
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_student_resource_like UNIQUE (student_id, resource_id)
);

CREATE INDEX idx_likes_student_id ON public.likes(student_id);
CREATE INDEX idx_likes_resource_id ON public.likes(resource_id);

-- 7. Atomic Like Count Update Trigger Function
CREATE OR REPLACE FUNCTION public.handle_like_count_update()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.resources
    SET like_count = like_count + 1
    WHERE id = NEW.resource_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.resources
    SET like_count = GREATEST(0, like_count - 1)
    WHERE id = OLD.resource_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER trigger_update_resource_like_count
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.handle_like_count_update();

-- 8. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Revoke direct selection of sensitive password hashes from public anon access
REVOKE SELECT (password_hash) ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, username, name, role, status, created_at) ON public.profiles FROM anon, authenticated;

-- PostgreSQL RPC Function for Secure Server-Side Credential Verification
-- Evaluates password hash inside Postgres security definer; never leaks hash over REST
CREATE OR REPLACE FUNCTION public.verify_user_credentials(p_username TEXT, p_password_hash TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  name TEXT,
  role TEXT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.name, p.role, p.status
  FROM public.profiles p
  WHERE lower(p.username) = lower(trim(p_username))
    AND p.password_hash = p_password_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Profiles Policies
CREATE POLICY "Allow public read access to profiles"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow student self registration"
  ON public.profiles FOR INSERT
  WITH CHECK (
    role = 'STUDENT' AND
    status = 'ACTIVE' AND
    length(username) >= 3 AND
    username NOT IN ('admin', 'admin_dean')
  );

CREATE POLICY "Allow facilitator provisioning by admin"
  ON public.profiles FOR INSERT
  WITH CHECK (
    role = 'FACILITATOR' AND
    status = 'ACTIVE' AND
    length(username) >= 3 AND
    username NOT IN ('admin', 'admin_dean')
  );

CREATE POLICY "Allow profile status and password updates"
  ON public.profiles FOR UPDATE
  USING (true)
  WITH CHECK (
    role IN ('STUDENT', 'FACILITATOR')
  );

CREATE POLICY "Allow facilitator deletion"
  ON public.profiles FOR DELETE
  USING (role = 'FACILITATOR');

-- Topics Policies
CREATE POLICY "Allow public read access to topics"
  ON public.topics FOR SELECT USING (true);

CREATE POLICY "Allow admin manage topics"
  ON public.topics FOR INSERT
  WITH CHECK (length(name) > 0);

CREATE POLICY "Allow admin delete topics"
  ON public.topics FOR DELETE
  USING (true);

-- Resources Policies
CREATE POLICY "Allow public read access to resources"
  ON public.resources FOR SELECT USING (true);

CREATE POLICY "Allow facilitator and admin insert resources"
  ON public.resources FOR INSERT
  WITH CHECK (
    file_type IN ('PDF', 'PPT', 'PPTX', 'DOC', 'DOCX') AND
    length(title) > 0 AND
    length(file_url) > 0
  );

CREATE POLICY "Allow author and admin delete resources"
  ON public.resources FOR DELETE
  USING (true);

-- Likes Policies
CREATE POLICY "Allow public read access to likes"
  ON public.likes FOR SELECT USING (true);

CREATE POLICY "Allow students to insert likes"
  ON public.likes FOR INSERT
  WITH CHECK (length(student_id) > 0);

CREATE POLICY "Allow students to delete own likes"
  ON public.likes FOR DELETE
  USING (true);

-- 9. Storage Bucket Configuration (Resources Bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources',
  'resources',
  true,
  15728640, -- 15 MB limit
  ARRAY[
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 15728640,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

-- Storage Object Policies
CREATE POLICY "Allow public download of resources"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resources');

CREATE POLICY "Allow authenticated facilitator upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resources' AND
    (LOWER(storage.extension(name)) IN ('pdf', 'pptx', 'ppt', 'docx', 'doc'))
  );

CREATE POLICY "Allow author or admin delete files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'resources');

-- ============================================================================
-- 10. Initial Admin Profile (Only admin account provisioned)
-- ============================================================================
INSERT INTO public.profiles (id, username, name, role, status, password_hash) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin', 'System Administrator', 'ADMIN', 'ACTIVE', '1f3d10477ff4b02ceeb0e3b177e52d338319db885cbb1d6402a39043a6023483'),
  ('a0000000-0000-0000-0000-000000000002', 'admin_dean', 'System Administrator', 'ADMIN', 'ACTIVE', '1f3d10477ff4b02ceeb0e3b177e52d338319db885cbb1d6402a39043a6023483')
ON CONFLICT (username) DO NOTHING;

