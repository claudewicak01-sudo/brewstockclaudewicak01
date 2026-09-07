/**
 * BrewStock — Konfigurasi Supabase
 *
 * Selama belum setup Supabase, biarkan nilai di bawah apa adanya.
 * App akan otomatis berjalan dalam DEMO MODE.
 *
 * Jika sudah siap pakai Supabase sungguhan, ganti kedua nilai ini:
 */
const SUPABASE_URL = 'YOUR_PROJECT';   // ← biarkan ini dulu
const SUPABASE_KEY = 'YOUR_ANON_KEY'; // ← biarkan ini dulu

// Konfigurasi aplikasi
const APP_CONFIG = {
  name: 'BrewStock',
  version: '1.0.0',
  variance_warning_pct:  5,
  variance_critical_pct: 10,
  purchase_anomaly_multiplier: 2.5,
};
