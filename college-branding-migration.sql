-- Institution-specific branding (logo + college name)
-- Run this once in the Supabase SQL Editor.
--
-- Manual side (you do this in the Supabase Studio UI, not SQL):
--   1. Storage -> Create bucket -> name it "Admins".
--   2. Toggle it PUBLIC (college logos aren't sensitive; this lets logo_url be used directly
--      as an <img src> with no signed-URL/auth logic needed in the app).
--   3. Inside it, create a folder "College_Logos/" and upload each admin's logo there.
--   4. Copy the public URL (Storage -> Admins -> College_Logos -> click file -> "Get URL")
--      and paste it into that admin's `logo_url` column (Table Editor -> admins), or run:
--        UPDATE public.admins SET logo_url = 'https://<project>.supabase.co/storage/v1/object/public/Admins/College_Logos/<file>' WHERE admin_id = <id>;

ALTER TABLE public.admins
  ADD COLUMN IF NOT EXISTS logo_url text;

-- Admin dashboard: fetch the LOGGED-IN admin's own branding, token-verified (same pattern as
-- every other hardened admin RPC — see harden-admin-rpc-security.sql). Never trusts a raw
-- admin_id from the client.
CREATE OR REPLACE FUNCTION get_admin_branding(p_token TEXT)
RETURNS TABLE (
  institute_name TEXT,
  logo_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id INTEGER;
BEGIN
  SELECT admin_id INTO v_admin_id FROM verify_admin_session(p_token) LIMIT 1;
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired admin session';
  END IF;

  RETURN QUERY
  SELECT a.institute_name, a.logo_url
  FROM public.admins a
  WHERE a.admin_id = v_admin_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_branding(TEXT) TO anon, authenticated;

-- Student-facing pages (login screen, waiting lobby): no admin session exists yet on these
-- pages, so this is public — gated only by knowing a real session_code, same trust level as
-- the existing student_exam_login RPC. Only ever returns institute_name/logo_url, never any
-- other admins-table column (password, session_token, etc.).
CREATE OR REPLACE FUNCTION get_session_branding(input_session_code TEXT)
RETURNS TABLE (
  institute_name TEXT,
  logo_url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.institute_name, a.logo_url
  FROM public.live_exam_sessions les
  JOIN public.admins a ON a.admin_id = les.admin_id
  WHERE les.session_code = input_session_code;
$$;

GRANT EXECUTE ON FUNCTION get_session_branding(TEXT) TO anon, authenticated;
