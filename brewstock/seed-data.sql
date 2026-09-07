-- BrewStock — SEED DATA
-- Jalankan ini di SQL Editor Supabase untuk mengisi data awal

-- Bahan
INSERT INTO public.bahan (kode, nama, kategori, satuan, min_stock, max_stock, harga_ref, supplier, status, stock_current, created_by) VALUES
('BB001', 'Coffee Bean',   'Coffee',    'gram', 500,  5000,  150000, 'CV Kopi Nusantara', 'approved', 2200, 'admin'),
('BB002', 'Fresh Milk',    'Dairy',     'ml',   2000, 20000, 18000,  'PT Dairy Segar',    'approved', 8500, 'admin'),
('BB003', 'Sugar',         'Sweetener', 'gram', 500,  5000,  14000,  'Toko Manis Jaya',   'approved', 1800, 'admin'),
('BB004', 'Caramel Syrup', 'Syrup',     'ml',   200,  2000,  85000,  'PT Syrup Prima',    'approved', 650,  'admin')
ON CONFLICT (kode) DO NOTHING;

-- Menu
INSERT INTO public.menu (kode, nama, kategori, harga, status, created_by) VALUES
('MN001', 'Latte',      'Coffee', 28000, 'approved', 'admin'),
('MN002', 'Americano',  'Coffee', 22000, 'approved', 'admin'),
('MN003', 'Cappuccino', 'Coffee', 30000, 'approved', 'admin')
ON CONFLICT (kode) DO NOTHING;

-- Resep
INSERT INTO public.resep (menu_id, menu_nama, bahan_id, bahan_nama, qty, satuan, status, created_by)
SELECT m.id, m.nama, b.id, b.nama,
  CASE 
    WHEN m.kode='MN001' AND b.kode='BB001' THEN 18
    WHEN m.kode='MN001' AND b.kode='BB002' THEN 150
    WHEN m.kode='MN001' AND b.kode='BB003' THEN 10
    WHEN m.kode='MN002' AND b.kode='BB001' THEN 20
    WHEN m.kode='MN003' AND b.kode='BB001' THEN 18
    WHEN m.kode='MN003' AND b.kode='BB002' THEN 120
  END as qty,
  CASE WHEN b.kode='BB002' THEN 'ml' ELSE 'gram' END as satuan,
  'approved', 'admin'
FROM public.menu m, public.bahan b
WHERE 
  (m.kode='MN001' AND b.kode IN ('BB001','BB002','BB003')) OR
  (m.kode='MN002' AND b.kode='BB001') OR
  (m.kode='MN003' AND b.kode IN ('BB001','BB002'));

-- Cek hasil
SELECT 'bahan' as tabel, COUNT(*) as jumlah FROM public.bahan
UNION ALL SELECT 'menu', COUNT(*) FROM public.menu
UNION ALL SELECT 'resep', COUNT(*) FROM public.resep
UNION ALL SELECT 'users', COUNT(*) FROM public.users;
