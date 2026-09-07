/**
 * BrewStock — Konfigurasi Supabase
 * 
 * Ganti SUPABASE_URL dan SUPABASE_ANON_KEY dengan nilai dari
 * dashboard Supabase Anda: Settings > API
 */
const SUPABASE_URL  = 'https://crdabsztgartxbhwxwzm.supabase.co/rest/v1/';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZGFic3p0Z2FydHhiaHd4d3ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NDU5MjMsImV4cCI6MjEwNDMyMTkyM30.APsYeC9RJwTJY0eHFLBqLZd9dmTW4yxWqTT2UCBHjag';

// Konfigurasi aplikasi
const APP_CONFIG = {
  name: 'BrewStock',
  version: '1.0.0',
  variance_warning_pct:  5,   // % — tampil Warning
  variance_critical_pct: 10,  // % — tampil Critical
  purchase_anomaly_multiplier: 2.5, // x avg — anomali pembelian
};
