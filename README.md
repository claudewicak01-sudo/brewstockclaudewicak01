# BrewStock
**Coffee Shop Operational Control & Fraud Audit System**

---

## 🚀 Deploy Gratis: GitHub Pages + Supabase

### Estimasi Biaya: Rp0 / bulan (untuk ≤10 user)

---

## LANGKAH 1 — Setup Supabase (Backend)

1. Buat akun di **https://supabase.com** (gratis)
2. Klik **New Project**, isi nama dan password database
3. Setelah project dibuat, buka **SQL Editor**
4. Copy-paste isi file `supabase-schema.sql` dan klik **Run**
5. Buka **Settings > API** — catat:
   - `Project URL` → `SUPABASE_URL` - https://crdabsztgartxbhwxwzm.supabase.co/rest/v1/
   - `anon public key` → `SUPABASE_KEY`- eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZGFic3p0Z2FydHhiaHd4d3ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NDU5MjMsImV4cCI6MjEwNDMyMTkyM30.APsYeC9RJwTJY0eHFLBqLZd9dmTW4yxWqTT2UCBHjag

### Setup Storage (untuk foto nota & POS):
1. Buka **Storage** di sidebar Supabase
2. Klik **New Bucket** → nama: `brewstock-files`
3. Set **Public bucket**: OFF (private)

---

## LANGKAH 2 — Edit Config

Buka file `js/config.js` dan ganti:

```javascript
const SUPABASE_URL = 'https://XXXXX.supabase.co';  // ganti ini
const SUPABASE_KEY = 'eyJhbGci...';                 // ganti ini
```

---

## LANGKAH 3 — Deploy ke GitHub Pages

1. Buat repository baru di GitHub (bisa private atau public)
2. Upload semua file ke repository
3. Buka **Settings > Pages**
4. Source: `Deploy from branch` → branch `main` → folder `/` (root)
5. Klik **Save**
6. Akses app di: `https://[username].github.io/[repo-name]/`

---

## DEMO MODE (tanpa Supabase)

Jika `SUPABASE_URL` masih berisi `YOUR_PROJECT`, aplikasi otomatis
berjalan dalam **Demo Mode** menggunakan data dummy in-memory.

Demo credentials:
- Admin: `admin` / `admin123`
- Bartender: `bartender` / `user123`

---

## Struktur File

```
brewstock/
├── index.html              ← Entry point SPA
├── css/
│   └── main.css            ← Semua styling
├── js/
│   ├── config.js           ← SUPABASE_URL & KEY (edit ini)
│   ├── supabase.js         ← Client + Demo data
│   ├── auth.js             ← Login/logout
│   ├── ui.js               ← Helpers, Modal, Toast, Icons
│   ├── router.js           ← SPA router + nav builder
│   ├── app.js              ← Main app init
│   └── pages/
│       ├── dashboard.js
│       ├── master-bahan.js
│       ├── master-menu.js
│       ├── resep.js
│       ├── approval.js
│       ├── pembelian.js
│       ├── penjualan.js
│       ├── stock.js
│       ├── stock-opname.js
│       ├── daily-report.js
│       ├── audit-center.js
│       ├── audit-trail.js
│       └── user-management.js (via audit-trail.js)
└── supabase-schema.sql     ← SQL untuk setup database
```

---

## Fitur yang Tersedia

| Modul              | User | Admin |
|--------------------|:----:|:-----:|
| Dashboard          | ✅   | ✅    |
| Master Bahan       | ✅   | ✅    |
| Master Menu        | ✅   | ✅    |
| Resep              | ✅   | ✅    |
| Approval Center    | —    | ✅    |
| Pembelian + Nota   | ✅   | ✅    |
| Penjualan          | ✅   | ✅    |
| Stock Management   | ✅   | ✅    |
| Stock Opname       | ✅   | ✅    |
| Daily Report + POS | ✅   | ✅    |
| Audit Center       | —    | ✅    |
| Audit Trail        | —    | ✅    |
| User Management    | —    | ✅    |

---

## Catatan Penting Supabase Free Tier

- ✅ Database PostgreSQL 500MB
- ✅ Storage 1GB (foto nota & POS)
- ✅ 50.000 auth requests/bulan
- ⚠️  **Project PAUSE** jika tidak aktif selama **1 minggu**
  - Solusi: kunjungi Supabase dashboard → klik Resume
  - Atau upgrade ke Pro ($25/bln) untuk no pause

---

## Untuk Production

1. Ganti auth sistem ke **Supabase Auth** (lebih aman)
2. Aktifkan **Row Level Security (RLS)** di semua tabel
3. Simpan foto ke **Supabase Storage** (bukan boolean flag)
4. Tambahkan **domain custom** di GitHub Pages
5. Pertimbangkan Supabase Pro ($25/bln) untuk:
   - No project pause
   - Daily backups
   - More storage
