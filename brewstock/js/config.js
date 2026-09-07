/**
 * BrewStock — Konfigurasi Supabase
 *
 * Selama belum setup Supabase, biarkan nilai di bawah apa adanya.
 * App akan otomatis berjalan dalam DEMO MODE.
 *
 * Jika sudah siap pakai Supabase sungguhan, ganti kedua nilai ini:
 */
const SUPABASE_URL = 'https://crdabsztgartxbhwxwzm.supabase.co';   // ← biarkan ini dulu
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZGFic3p0Z2FydHhiaHd4d3ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NDU5MjMsImV4cCI6MjEwNDMyMTkyM30.APsYeC9RJwTJY0eHFLBqLZd9dmTW4yxWqTT2UCBHjag'; // ← biarkan ini dulu

// Konfigurasi aplikasi
const APP_CONFIG = {
  name: 'BrewStock',
  version: '1.0.0',
  variance_warning_pct:  5,
  variance_critical_pct: 10,
  purchase_anomaly_multiplier: 2.5,
};
