-- ============================================================================
-- Migration: Add password_hash to profiles and allow student self-registration
-- ============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Backfill admin password hash
UPDATE public.profiles
SET password_hash = '1f3d10477ff4b02ceeb0e3b177e52d338319db885cbb1d6402a39043a6023483'
WHERE username IN ('admin', 'admin_dean') AND password_hash IS NULL;

-- Enable student self-registration RLS policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow student self registration'
  ) THEN
    CREATE POLICY "Allow student self registration"
      ON public.profiles FOR INSERT
      WITH CHECK (role = 'STUDENT' AND status = 'ACTIVE');
  END IF;
END
$$;
