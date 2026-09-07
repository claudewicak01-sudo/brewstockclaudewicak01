-- BrewStock — Supabase SQL Schema
-- Jalankan di Supabase SQL Editor (Settings > SQL Editor)

-- ─── USERS ───────────────────────────────────────────────────
create table if not exists users (
  id          bigserial primary key,
  username    text unique not null,
  password    text not null,  -- di production: gunakan Supabase Auth, simpan hash
  nama        text,
  role        text default 'user' check (role in ('admin','user')),
  outlet      text default 'Main Store',
  status      text default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  created_at  date default current_date,
  last_login  text
);

-- ─── BAHAN ───────────────────────────────────────────────────
create table if not exists bahan (
  id          bigserial primary key,
  kode        text unique not null,
  nama        text not null,
  kategori    text,
  satuan      text not null,
  min_stock   numeric default 0,
  max_stock   numeric default 0,
  harga_ref   numeric default 0,
  supplier    text,
  catatan     text,
  stock_current numeric default 0,
  status      text default 'waiting' check (status in ('draft','waiting','approved','rejected')),
  created_by  text,
  created_at  date default current_date
);

-- ─── MENU ────────────────────────────────────────────────────
create table if not exists menu (
  id          bigserial primary key,
  kode        text unique not null,
  nama        text not null,
  kategori    text,
  harga       numeric not null,
  status      text default 'waiting' check (status in ('draft','waiting','approved','rejected')),
  created_by  text,
  created_at  date default current_date
);

-- ─── RESEP ───────────────────────────────────────────────────
create table if not exists resep (
  id          bigserial primary key,
  menu_id     bigint references menu(id),
  menu_nama   text,
  bahan_id    bigint references bahan(id),
  bahan_nama  text,
  qty         numeric not null,
  satuan      text,
  status      text default 'waiting',
  created_by  text
);

-- ─── PEMBELIAN ───────────────────────────────────────────────
create table if not exists pembelian (
  id          bigserial primary key,
  no          text unique,
  tanggal     date not null,
  supplier    text,
  bahan_id    bigint references bahan(id),
  bahan_nama  text,
  qty         numeric not null,
  satuan      text,
  harga_satuan numeric default 0,
  total       numeric default 0,
  metode      text,
  catatan     text,
  nota        boolean default false,
  nota_url    text,   -- Supabase Storage URL
  status      text default 'submitted',
  created_by  text,
  created_at  timestamp default now()
);

-- ─── PENJUALAN ───────────────────────────────────────────────
create table if not exists penjualan (
  id          bigserial primary key,
  tanggal     date not null,
  shift       text,
  menu_id     bigint references menu(id),
  menu_nama   text,
  qty         integer not null,
  harga       numeric,
  total       numeric,
  metode      text,
  created_by  text,
  created_at  timestamp default now()
);

-- ─── STOCK OPNAME ────────────────────────────────────────────
create table if not exists stock_opname (
  id            bigserial primary key,
  tanggal       date not null,
  shift         text,
  bahan_id      bigint references bahan(id),
  bahan_nama    text,
  system_stock  numeric,
  actual_stock  numeric,
  variance      numeric,
  reason        text,
  foto          boolean default false,
  foto_url      text,
  status        text default 'normal',
  created_by    text,
  created_at    timestamp default now()
);

-- ─── DAILY REPORT ────────────────────────────────────────────
create table if not exists daily_report (
  id          bigserial primary key,
  tanggal     date not null,
  "user"      text,
  shift       text,
  total_sales numeric default 0,
  cash        numeric default 0,
  qris        numeric default 0,
  debit       numeric default 0,
  credit      numeric default 0,
  ewallet     numeric default 0,
  other       numeric default 0,
  total_pos   numeric default 0,
  variance    numeric default 0,
  catatan     text,
  pos_foto    boolean default false,
  pos_url     text,
  status      text default 'submitted',
  created_at  timestamp default now()
);

-- ─── AUDIT TRAIL ─────────────────────────────────────────────
create table if not exists audit_trail (
  id          bigserial primary key,
  tanggal     text,
  "user"      text,
  activity    text,
  module      text,
  record      text,
  old_val     text,
  new_val     text,
  status      text,
  created_at  timestamp default now()
);

-- ─── ROW LEVEL SECURITY (RLS) ────────────────────────────────
-- Aktifkan RLS di setiap tabel agar data aman dari akses langsung
-- (Supabase Dashboard > Table Editor > RLS)
-- Karena auth pakai tabel custom (bukan Supabase Auth),
-- untuk MVP bisa gunakan anon key + validasi di app layer.
-- Untuk produksi: pindah ke Supabase Auth + RLS policies.

-- ─── SEED DATA (opsional) ────────────────────────────────────
insert into users (username, password, nama, role, outlet) values
  ('admin',     'admin123',  'Ahmad Fauzi',  'admin', 'Main Store'),
  ('bartender', 'user123',   'Budi Santoso', 'user',  'Main Store')
on conflict (username) do nothing;

insert into bahan (kode, nama, kategori, satuan, min_stock, max_stock, harga_ref, supplier, status, stock_current) values
  ('BB001', 'Coffee Bean',   'Coffee',    'gram', 500,  5000,  150000, 'CV Kopi Nusantara', 'approved', 2200),
  ('BB002', 'Fresh Milk',    'Dairy',     'ml',   2000, 20000, 18000,  'PT Dairy Segar',    'approved', 8500),
  ('BB003', 'Sugar',         'Sweetener', 'gram', 500,  5000,  14000,  'Toko Manis Jaya',   'approved', 1800),
  ('BB004', 'Caramel Syrup', 'Syrup',     'ml',   200,  2000,  85000,  'PT Syrup Prima',    'approved', 650)
on conflict (kode) do nothing;

insert into menu (kode, nama, kategori, harga, status) values
  ('MN001', 'Latte',      'Coffee', 28000, 'approved'),
  ('MN002', 'Americano',  'Coffee', 22000, 'approved'),
  ('MN003', 'Cappuccino', 'Coffee', 30000, 'approved')
on conflict (kode) do nothing;
