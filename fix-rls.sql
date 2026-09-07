-- BrewStock — SQL FIX FINAL
-- Copy-paste SEMUA ini ke SQL Editor Supabase → Run

-- 1. Disable RLS semua tabel
ALTER TABLE public.users        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bahan        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.resep        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pembelian    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.penjualan    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_opname DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_report DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_trail  DISABLE ROW LEVEL SECURITY;

-- 2. Grant akses penuh ke anon key
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 3. Buat login function (SECURITY DEFINER = bypass RLS)
CREATE OR REPLACE FUNCTION public.login_user(p_username TEXT, p_password TEXT)
RETURNS SETOF public.users
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.users
  WHERE LOWER(username) = LOWER(p_username)
    AND password = p_password
    AND status = 'ACTIVE'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.login_user(TEXT, TEXT) TO anon;

-- 4. Verifikasi — semua harus false
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
