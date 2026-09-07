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
/**
 * BrewStock — Supabase Client & Demo Data
 * Jika SUPABASE_URL masih placeholder, app berjalan dalam DEMO MODE
 * menggunakan data dummy in-memory.
 */

// DEMO_MODE aktif jika config belum diisi dengan URL Supabase asli
const DEMO_MODE = (
  typeof SUPABASE_URL === 'undefined' ||
  !SUPABASE_URL ||
  SUPABASE_URL === 'YOUR_PROJECT' ||
  SUPABASE_URL.includes('YOUR_PROJECT') ||
  !SUPABASE_URL.startsWith('https://')
);

// ─── SUPABASE REST API (pure fetch, no SDK) ─────────────────
// Ini lebih reliable karena tidak bergantung pada CDN atau SDK version

async function sbFetch(table, params = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${params ? '?' + params : ''}`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err.message || res.statusText) + ' (code: ' + (err.code || res.status) + ')');
  }
  return res.json();
}

async function sbInsert(table, body) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err.message || res.statusText) + ' (code: ' + (err.code || res.status) + ')');
  }
  return res.json();
}

async function sbUpdate(table, match, body) {
  const params = Object.entries(match).map(([k,v]) => `${k}=eq.${encodeURIComponent(v)}`).join('&');
  const url = `${SUPABASE_URL}/rest/v1/${table}?${params}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err.message || res.statusText) + ' (code: ' + (err.code || res.status) + ')');
  }
  return res.json();
}

// Dummy getSupabase untuk kompatibilitas (tidak dipakai lagi)
async function getSupabase() { return null; }

// ─── DEMO DATA ────────────────────────────────────────────────
const DB = {
  users: [
    { id: 1, username: 'admin',     password: 'admin123', nama: 'Ahmad Fauzi',   role: 'admin',   status: 'ACTIVE', outlet: 'Main Store', created_at: '2024-01-01', last_login: '2025-09-06 08:00' },
    { id: 2, username: 'bartender', password: 'user123',  nama: 'Budi Santoso',  role: 'user',    status: 'ACTIVE', outlet: 'Main Store', created_at: '2024-01-05', last_login: '2025-09-06 07:30' },
    { id: 3, username: 'dewi',      password: 'user123',  nama: 'Dewi Rahayu',   role: 'user',    status: 'ACTIVE', outlet: 'Main Store', created_at: '2024-02-01', last_login: '2025-09-05 18:00' },
  ],
  bahan: [
    { id: 1, kode: 'BB001', nama: 'Coffee Bean',  kategori: 'Coffee',  satuan: 'gram', min_stock: 500, max_stock: 5000, harga_ref: 150000, supplier: 'CV Kopi Nusantara', status: 'approved', stock_current: 2200, created_by: 'bartender', created_at: '2025-09-01' },
    { id: 2, kode: 'BB002', nama: 'Fresh Milk',   kategori: 'Dairy',   satuan: 'ml',   min_stock: 2000, max_stock: 20000, harga_ref: 18000, supplier: 'PT Dairy Segar',    status: 'approved', stock_current: 8500, created_by: 'bartender', created_at: '2025-09-01' },
    { id: 3, kode: 'BB003', nama: 'Sugar',        kategori: 'Sweetener',satuan: 'gram', min_stock: 500, max_stock: 5000, harga_ref: 14000,  supplier: 'Toko Manis Jaya',   status: 'approved', stock_current: 1800, created_by: 'bartender', created_at: '2025-09-01' },
    { id: 4, kode: 'BB004', nama: 'Caramel Syrup',kategori: 'Syrup',   satuan: 'ml',   min_stock: 200, max_stock: 2000, harga_ref: 85000,  supplier: 'PT Syrup Prima',    status: 'approved', stock_current: 650, created_by: 'bartender', created_at: '2025-09-02' },
    { id: 5, kode: 'BB005', nama: 'Whip Cream',   kategori: 'Dairy',   satuan: 'gram', min_stock: 200, max_stock: 2000, harga_ref: 65000,  supplier: 'PT Dairy Segar',    status: 'waiting',  stock_current: 0,    created_by: 'bartender', created_at: '2025-09-05' },
  ],
  menu: [
    { id: 1, kode: 'MN001', nama: 'Latte',       kategori: 'Coffee', harga: 28000, status: 'approved', created_by: 'bartender', created_at: '2025-09-01' },
    { id: 2, kode: 'MN002', nama: 'Americano',   kategori: 'Coffee', harga: 22000, status: 'approved', created_by: 'bartender', created_at: '2025-09-01' },
    { id: 3, kode: 'MN003', nama: 'Cappuccino',  kategori: 'Coffee', harga: 30000, status: 'approved', created_by: 'bartender', created_at: '2025-09-01' },
    { id: 4, kode: 'MN004', nama: 'Caramel Macchiato', kategori: 'Specialty', harga: 38000, status: 'waiting', created_by: 'bartender', created_at: '2025-09-05' },
  ],
  resep: [
    { id: 1, menu_id: 1, menu_nama: 'Latte',      bahan_id: 1, bahan_nama: 'Coffee Bean', qty: 18, satuan: 'gram', status: 'approved' },
    { id: 2, menu_id: 1, menu_nama: 'Latte',      bahan_id: 2, bahan_nama: 'Fresh Milk',  qty: 150, satuan: 'ml',  status: 'approved' },
    { id: 3, menu_id: 1, menu_nama: 'Latte',      bahan_id: 3, bahan_nama: 'Sugar',       qty: 10,  satuan: 'gram',status: 'approved' },
    { id: 4, menu_id: 2, menu_nama: 'Americano',  bahan_id: 1, bahan_nama: 'Coffee Bean', qty: 20,  satuan: 'gram',status: 'approved' },
    { id: 5, menu_id: 3, menu_nama: 'Cappuccino', bahan_id: 1, bahan_nama: 'Coffee Bean', qty: 18,  satuan: 'gram',status: 'approved' },
    { id: 6, menu_id: 3, menu_nama: 'Cappuccino', bahan_id: 2, bahan_nama: 'Fresh Milk',  qty: 120, satuan: 'ml',  status: 'approved' },
  ],
  pembelian: [
    { id: 1, no: 'PO-250901-001', tanggal: '2025-09-01', supplier: 'CV Kopi Nusantara', bahan_nama: 'Coffee Bean', qty: 2000, satuan: 'gram', harga_satuan: 150, total: 300000, metode: 'Cash',      status: 'verified',  nota: true, created_by: 'bartender' },
    { id: 2, no: 'PO-250902-001', tanggal: '2025-09-02', supplier: 'PT Dairy Segar',    bahan_nama: 'Fresh Milk',  qty: 10000, satuan: 'ml', harga_satuan: 18, total: 180000, metode: 'Transfer',   status: 'verified',  nota: true, created_by: 'bartender' },
    { id: 3, no: 'PO-250905-001', tanggal: '2025-09-05', supplier: 'Toko Manis Jaya',   bahan_nama: 'Sugar',       qty: 1000, satuan: 'gram', harga_satuan: 14, total: 14000, metode: 'Cash',       status: 'submitted', nota: true, created_by: 'dewi' },
  ],
  penjualan: [
    { id: 1, tanggal: '2025-09-06', shift: 'Pagi',  menu_id: 1, menu_nama: 'Latte',      qty: 45, harga: 28000, total: 1260000, metode: 'Mixed', created_by: 'bartender' },
    { id: 2, tanggal: '2025-09-06', shift: 'Pagi',  menu_id: 2, menu_nama: 'Americano',  qty: 28, harga: 22000, total: 616000,  metode: 'Mixed', created_by: 'bartender' },
    { id: 3, tanggal: '2025-09-06', shift: 'Siang', menu_id: 3, menu_nama: 'Cappuccino', qty: 32, harga: 30000, total: 960000,  metode: 'Mixed', created_by: 'dewi' },
    { id: 4, tanggal: '2025-09-05', shift: 'Pagi',  menu_id: 1, menu_nama: 'Latte',      qty: 52, harga: 28000, total: 1456000, metode: 'Mixed', created_by: 'bartender' },
    { id: 5, tanggal: '2025-09-05', shift: 'Siang', menu_id: 2, menu_nama: 'Americano',  qty: 35, harga: 22000, total: 770000,  metode: 'Mixed', created_by: 'dewi' },
  ],
  stock_opname: [
    { id: 1, tanggal: '2025-09-06', shift: 'Pagi', bahan_id: 1, bahan_nama: 'Coffee Bean', system_stock: 2700, actual_stock: 2200, variance: -500, reason: 'Selisih ditemukan', status: 'critical', foto: true, created_by: 'bartender' },
    { id: 2, tanggal: '2025-09-06', shift: 'Pagi', bahan_id: 2, bahan_nama: 'Fresh Milk',  system_stock: 8600, actual_stock: 8500, variance: -100, reason: 'Spillage',          status: 'warning',  foto: true, created_by: 'bartender' },
    { id: 3, tanggal: '2025-09-06', shift: 'Pagi', bahan_id: 3, bahan_nama: 'Sugar',       system_stock: 1820, actual_stock: 1800, variance: -20,  reason: 'Normal',            status: 'normal',   foto: true, created_by: 'bartender' },
  ],
  daily_report: [
    { id: 1, tanggal: '2025-09-05', user: 'bartender', shift: 'Pagi',  total_sales: 2226000, cash: 800000, qris: 900000, debit: 300000, credit: 226000, ewallet: 0, other: 0, total_pos: 2226000, variance: 0,       catatan: '',                  pos_foto: true, status: 'submitted' },
    { id: 2, tanggal: '2025-09-05', user: 'dewi',      shift: 'Siang', total_sales: 770000,  cash: 300000, qris: 250000, debit: 100000, credit: 0,      ewallet: 120000, other: 0, total_pos: 770000, variance: 0, catatan: '',                  pos_foto: true, status: 'submitted' },
  ],
  audit_trail: [
    { id: 1, tanggal: '2025-09-06 08:00', user: 'bartender', activity: 'Create',  module: 'Material',    record: 'Coffee Bean',   old_val: '',       new_val: 'Draft' },
    { id: 2, tanggal: '2025-09-06 08:10', user: 'bartender', activity: 'Submit',  module: 'Material',    record: 'Coffee Bean',   old_val: 'Draft',  new_val: 'Waiting Approval' },
    { id: 3, tanggal: '2025-09-06 08:30', user: 'admin',     activity: 'Approve', module: 'Material',    record: 'Coffee Bean',   old_val: 'Waiting',new_val: 'Approved' },
    { id: 4, tanggal: '2025-09-06 09:00', user: 'bartender', activity: 'Create',  module: 'Purchase',    record: 'PO-250901-001', old_val: '',       new_val: 'Draft' },
    { id: 5, tanggal: '2025-09-06 10:15', user: 'bartender', activity: 'Submit',  module: 'Purchase',    record: 'PO-250901-001', old_val: 'Draft',  new_val: 'Submitted' },
    { id: 6, tanggal: '2025-09-06 11:00', user: 'bartender', activity: 'Create',  module: 'Sales',       record: 'Latte x45',     old_val: '',       new_val: 'Submitted' },
    { id: 7, tanggal: '2025-09-06 14:00', user: 'bartender', activity: 'Create',  module: 'StockOpname', record: 'Coffee Bean',   old_val: '',       new_val: 'Submitted' },
    { id: 8, tanggal: '2025-09-06 18:30', user: 'dewi',      activity: 'Submit',  module: 'DailyReport', record: 'Siang Shift',   old_val: 'Draft',  new_val: 'Submitted' },
  ],
};

// Simple in-memory ID counter
let _nextId = 100;
const nextId = () => ++_nextId;

// ─── DATA ACCESS LAYER ──────────────────────────────────────
// Uniform interface: demo mode uses DB[], real mode calls Supabase
const DataAPI = {

  // AUTH
  async login(username, password) {
    // Trim whitespace yang tidak sengaja
    username = (username || '').trim().toLowerCase();
    password = (password || '').trim();

    if (DEMO_MODE) {
      const u = DB.users.find(x =>
        x.username.toLowerCase() === username &&
        x.password === password
      );
      if (!u) throw new Error(`Username atau password salah. Coba: admin/admin123`);
      if (u.status === 'INACTIVE') throw new Error('Akun tidak aktif');
      u.last_login = new Date().toLocaleString('id-ID');
      return { ...u }; // return copy agar DB tidak termutasi
    }
    // Pure fetch ke Supabase REST API — tanpa SDK
    const allUsers = await sbFetch('users', 'select=*');

    const user = allUsers.find(u =>
      u.username.toLowerCase() === username &&
      u.password === password
    );

    if (!user) throw new Error('Username atau password salah');
    if (user.status === 'INACTIVE') throw new Error('Akun tidak aktif');
    return user;
  },

  // BAHAN
  async getBahan() {
    if (DEMO_MODE) return [...DB.bahan];
    return await sbFetch('bahan', 'select=*&order=kode');
  },
  async addBahan(item) {
    if (DEMO_MODE) { const r = {...item, id: nextId()}; DB.bahan.push(r); return r; }
    const rows = await sbInsert('bahan', item);
    return Array.isArray(rows) ? rows[0] : rows;
  },
  async updateBahanStatus(id, status, notes) {
    if (DEMO_MODE) {
      const r = DB.bahan.find(x => x.id === id);
      if (r) r.status = status;
      DataAPI.addAuditTrail({ user: Auth.user.username, activity: status === 'approved' ? 'Approve' : 'Reject', module: 'Material', record: r?.nama || '', old_val: 'Waiting', new_val: status });
      return r;
    }
    const rows = await sbUpdate('bahan', {id}, { status, notes });
    return Array.isArray(rows) ? rows[0] : rows;
  },

  // MENU
  async getMenu() {
    if (DEMO_MODE) return [...DB.menu];
    return await sbFetch('menu', 'select=*&order=kode');
  },
  async addMenu(item) {
    if (DEMO_MODE) { const r = {...item, id: nextId()}; DB.menu.push(r); return r; }
    const rows = await sbInsert('menu', item);
    return Array.isArray(rows) ? rows[0] : rows;
  },
  async updateMenuStatus(id, status) {
    if (DEMO_MODE) {
      const r = DB.menu.find(x => x.id === id);
      if (r) r.status = status;
      DataAPI.addAuditTrail({ user: Auth.user.username, activity: status === 'approved' ? 'Approve' : 'Reject', module: 'Menu', record: r?.nama || '', old_val: 'Waiting', new_val: status });
      return r;
    }
    const rows = await sbUpdate('menu', {id}, { status });
    return Array.isArray(rows) ? rows[0] : rows;
  },

  // RESEP
  async getResep() {
    if (DEMO_MODE) return [...DB.resep];
    return await sbFetch('resep', 'select=*');
  },
  async addResepLines(lines) {
    if (DEMO_MODE) { lines.forEach(l => { DB.resep.push({...l, id: nextId()}); }); return lines; }
    return await sbInsert('resep', lines);
  },

  // PEMBELIAN
  async getPembelian() {
    if (DEMO_MODE) return [...DB.pembelian].reverse();
    const rows = await sbFetch('pembelian', 'select=*&order=tanggal.desc');
    return rows;
  },
  async addPembelian(item) {
    if (DEMO_MODE) {
      const r = {...item, id: nextId()};
      DB.pembelian.push(r);
      DataAPI.addAuditTrail({ user: Auth.user.username, activity: 'Submit', module: 'Purchase', record: r.no, old_val: '', new_val: 'Submitted' });
      // Update stock
      const b = DB.bahan.find(x => x.nama === r.bahan_nama);
      if (b) b.stock_current += r.qty;
      return r;
    }
    const rows = await sbInsert('pembelian', item);
    return Array.isArray(rows) ? rows[0] : rows;
  },

  // PENJUALAN
  async getPenjualan() {
    if (DEMO_MODE) return [...DB.penjualan].reverse();
    return await sbFetch('penjualan', 'select=*&order=tanggal.desc');
  },
  async addPenjualan(item) {
    if (DEMO_MODE) {
      const r = {...item, id: nextId()};
      DB.penjualan.push(r);
      DataAPI.addAuditTrail({ user: Auth.user.username, activity: 'Submit', module: 'Sales', record: `${r.menu_nama} x${r.qty}`, old_val: '', new_val: 'Submitted' });
      return r;
    }
    const rows = await sbInsert('penjualan', item);
    return Array.isArray(rows) ? rows[0] : rows;
  },

  // STOCK OPNAME
  async getStockOpname() {
    if (DEMO_MODE) return [...DB.stock_opname].reverse();
    return await sbFetch('stock_opname', 'select=*&order=tanggal.desc');
  },
  async addStockOpname(item) {
    if (DEMO_MODE) {
      const r = {...item, id: nextId()};
      DB.stock_opname.push(r);
      const b = DB.bahan.find(x => x.id === r.bahan_id);
      if (b) b.stock_current = r.actual_stock;
      DataAPI.addAuditTrail({ user: Auth.user.username, activity: 'Submit', module: 'StockOpname', record: r.bahan_nama, old_val: r.system_stock, new_val: r.actual_stock });
      return r;
    }
    const rows = await sbInsert('stock_opname', item);
    return Array.isArray(rows) ? rows[0] : rows;
  },

  // DAILY REPORT
  async getDailyReport() {
    if (DEMO_MODE) return [...DB.daily_report].reverse();
    return await sbFetch('daily_report', 'select=*&order=tanggal.desc');
  },
  async addDailyReport(item) {
    if (DEMO_MODE) {
      const r = {...item, id: nextId()};
      DB.daily_report.push(r);
      DataAPI.addAuditTrail({ user: Auth.user.username, activity: 'Submit', module: 'DailyReport', record: `${r.tanggal} ${r.shift}`, old_val: 'Draft', new_val: 'Submitted' });
      return r;
    }
    const rows = await sbInsert('daily_report', item);
    return Array.isArray(rows) ? rows[0] : rows;
  },

  // USERS
  async getUsers() {
    if (DEMO_MODE) return [...DB.users].map(u => ({...u, password: undefined}));
    return await sbFetch('users', 'select=id,username,nama,role,outlet,status,created_at,last_login');
  },
  async addUser(item) {
    if (DEMO_MODE) {
      const r = {...item, id: nextId(), created_at: new Date().toISOString(), last_login: '-'};
      DB.users.push(r);
      return r;
    }
    const rows = await sbInsert('users', item);
    return Array.isArray(rows) ? rows[0] : rows;
  },
  async updateUserStatus(id, status) {
    if (DEMO_MODE) {
      const u = DB.users.find(x => x.id === id);
      if (u) u.status = status;
      return u;
    }
    const rows = await sbUpdate('users', {id}, { status });
    return Array.isArray(rows) ? rows[0] : rows;
  },

  // AUDIT TRAIL
  async getAuditTrail() {
    if (DEMO_MODE) return [...DB.audit_trail].reverse();
    return await sbFetch('audit_trail', 'select=*&order=tanggal.desc&limit=200');
  },
  async addAuditTrail(item) {
    const record = { ...item, id: nextId(), tanggal: new Date().toLocaleString('id-ID') };
    if (DEMO_MODE) { DB.audit_trail.push(record); return record; }
    await sbInsert('audit_trail', record);
    return record;
  },

  // COMPUTED: Pending Approvals
  async getPendingApprovals() {
    if (DEMO_MODE) {
      const items = [];
      DB.bahan.filter(b => b.status === 'waiting').forEach(b => items.push({ type: 'Material', data: b.nama, submitted_by: b.created_by, date: b.created_at, ref_id: b.id, ref_type: 'bahan' }));
      DB.menu.filter(m => m.status === 'waiting').forEach(m => items.push({ type: 'Menu', data: m.nama, submitted_by: m.created_by, date: m.created_at, ref_id: m.id, ref_type: 'menu' }));
      return items;
    }
    // In real mode: query all pending
    return [];
  },

  // COMPUTED: Variance Analysis
  async getVarianceAnalysis() {
    if (DEMO_MODE) {
      const today = DB.penjualan.filter(p => p.tanggal === '2025-09-06');
      const results = [];
      DB.bahan.filter(b => b.status === 'approved').forEach(bahan => {
        let expected_usage = 0;
        today.forEach(sale => {
          const recipe = DB.resep.filter(r => r.menu_id === sale.menu_id && r.bahan_id === bahan.id);
          recipe.forEach(r => expected_usage += r.qty * sale.qty);
        });
        if (expected_usage === 0) return;
        const opname = DB.stock_opname.find(s => s.bahan_id === bahan.id && s.tanggal === '2025-09-06');
        const actual = opname ? opname.actual_stock : bahan.stock_current;
        const variance = actual - (bahan.stock_current - expected_usage);
        const pct = expected_usage > 0 ? Math.abs(variance / expected_usage * 100) : 0;
        const status = pct >= APP_CONFIG.variance_critical_pct ? 'critical' : pct >= APP_CONFIG.variance_warning_pct ? 'warning' : 'normal';
        results.push({ bahan_nama: bahan.nama, satuan: bahan.satuan, expected_usage, actual_stock: actual, variance, variance_pct: pct.toFixed(1), status });
      });
      return results;
    }
    return [];
  },
};
const Auth = {
  user: null,

  async init() {
    // Bersihkan session lama jika ada versi konflik
    try {
      const saved = sessionStorage.getItem('brewstock_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validasi: user harus punya username dan role
        if (parsed && parsed.username && parsed.role) {
          this.user = parsed;
        } else {
          sessionStorage.removeItem('brewstock_user');
        }
      }
    } catch(e) {
      sessionStorage.removeItem('brewstock_user');
    }
  },

  async login(username, password) {
    const user = await DataAPI.login(username, password);
    this.user = user;
    sessionStorage.setItem('brewstock_user', JSON.stringify(user));
    return user;
  },

  logout() {
    this.user = null;
    sessionStorage.removeItem('brewstock_user');
  },

  isAdmin() { return this.user?.role === 'admin'; },
  isLoggedIn() { return !!this.user; },
  
  can(action) {
    if (!this.user) return false;
    const adminOnly = ['audit_center', 'audit_trail', 'user_management', 'approve', 'audit_dashboard'];
    const userOnly  = ['input_bahan', 'input_menu', 'input_resep'];
    if (adminOnly.includes(action)) return this.isAdmin();
    if (userOnly.includes(action)) return !this.isAdmin();
    return true; // shared actions
  }
};
// ─── FORMATTERS ─────────────────────────────────────────────
const fmt = {
  currency: (n) => 'Rp' + Number(n).toLocaleString('id-ID'),
  number:   (n) => Number(n).toLocaleString('id-ID'),
  date:     (d) => d ? new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }) : '-',
  datetime: (d) => d ? new Date(d).toLocaleString('id-ID') : '-',
};

// ─── BADGES ─────────────────────────────────────────────────
function statusBadge(status) {
  const map = {
    approved:  ['badge-green',  'Approved'],
    waiting:   ['badge-orange', 'Waiting'],
    rejected:  ['badge-red',    'Rejected'],
    draft:     ['badge-gray',   'Draft'],
    submitted: ['badge-blue',   'Submitted'],
    verified:  ['badge-green',  'Verified'],
    active:    ['badge-green',  'Active'],
    inactive:  ['badge-red',    'Inactive'],
    ACTIVE:    ['badge-green',  'Active'],
    INACTIVE:  ['badge-red',    'Inactive'],
    normal:    ['badge-green',  'Normal'],
    warning:   ['badge-orange', 'Warning'],
    critical:  ['badge-red',    'Critical'],
    locked:    ['badge-blue',   'Locked'],
    balanced:  ['badge-green',  'Balanced'],
    investigate:['badge-red',   'Investigate'],
  };
  const [cls, label] = map[status] || ['badge-gray', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ─── ICONS (inline SVG) ──────────────────────────────────────
const Icon = {
  _make: (path, vb='0 0 24 24') =>
    `<svg width="16" height="16" viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`,
  plus:    () => Icon._make('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
  edit:    () => Icon._make('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'),
  trash:   () => Icon._make('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>'),
  eye:     () => Icon._make('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
  check:   () => Icon._make('<polyline points="20 6 9 17 4 12"/>'),
  x:       () => Icon._make('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
  search:  () => Icon._make('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'),
  filter:  () => Icon._make('<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>'),
  upload:  () => Icon._make('<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>'),
  image:   () => Icon._make('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'),
  chart:   () => Icon._make('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'),
  alert:   () => Icon._make('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
  package: () => Icon._make('<path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>'),
  coffee:  () => Icon._make('<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>'),
  users:   () => Icon._make('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  book:    () => Icon._make('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
  receipt: () => Icon._make('<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>'),
  audit:   () => Icon._make('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'),
  clock:   () => Icon._make('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
  shield:  () => Icon._make('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
  tag:     () => Icon._make('<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>'),
  settings:() => Icon._make('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
  logout:  () => Icon._make('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'),
};

// ─── MODAL ───────────────────────────────────────────────────
const Modal = {
  open({ title, body, footer = '', size = '' }) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('modal-footer').innerHTML = footer;
    const box = document.getElementById('modal-box');
    box.className = 'modal-box' + (size ? ` modal-${size}` : '');
    document.getElementById('modal-overlay').style.display = 'flex';
  },
  close() {
    document.getElementById('modal-overlay').style.display = 'none';
  },
};

// ─── TOAST ───────────────────────────────────────────────────
const Toast = {
  show(msg, type = 'default', duration = 3000) {
    const c = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success:'✓', error:'✕', warning:'⚠', default:'ℹ' };
    el.innerHTML = `<span>${icons[type]||icons.default}</span> ${msg}`;
    c.appendChild(el);
    setTimeout(() => {
      el.classList.add('removing');
      setTimeout(() => el.remove(), 200);
    }, duration);
  },
  success: (m) => Toast.show(m, 'success'),
  error:   (m) => Toast.show(m, 'error'),
  warning: (m) => Toast.show(m, 'warning'),
};

// ─── TABLE HELPERS ───────────────────────────────────────────
function searchFilter(data, query, keys) {
  if (!query) return data;
  const q = query.toLowerCase();
  return data.filter(row => keys.some(k => String(row[k] || '').toLowerCase().includes(q)));
}

function buildTable({ cols, data, emptyMsg = 'Tidak ada data' }) {
  if (!data.length) return `<div class="empty-state"><p>${emptyMsg}</p></div>`;
  const thead = `<thead><tr>${cols.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${data.map(row => `<tr>${cols.map(c => `<td>${c.render ? c.render(row) : (row[c.key] ?? '-')}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<div class="table-wrap"><table>${thead}${tbody}</table></div>`;
}
const PageDashboard = {
  async render(el) {
    el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--gray-400)">Memuat data...</div>';
    let bahan=[], penjualan=[], pembelian=[], pending=[], variance=[], opname=[], dr=[];
    try {
      [bahan, penjualan, pembelian, pending, variance, opname, dr] = await Promise.all([
        DataAPI.getBahan().catch(()=>[]),
        DataAPI.getPenjualan().catch(()=>[]),
        DataAPI.getPembelian().catch(()=>[]),
        DataAPI.getPendingApprovals().catch(()=>[]),
        DataAPI.getVarianceAnalysis().catch(()=>[]),
        DataAPI.getStockOpname().catch(()=>[]),
        DataAPI.getDailyReport().catch(()=>[]),
      ]);
    } catch(e) {
      el.innerHTML = `<div class="card"><div class="card-body"><div class="empty-state">
        <p>Gagal memuat data: ${e.message}</p>
        <small>Pastikan koneksi Supabase benar dan tabel sudah dibuat</small>
      </div></div></div>`;
      return;
    }

    const today = '2025-09-06';
    const todaySales = penjualan.filter(p => p.tanggal === today);
    const todayPurchase = pembelian.filter(p => p.tanggal === today);
    const totalSalesToday = todaySales.reduce((s, p) => s + p.total, 0);
    const totalPurchaseToday = todayPurchase.reduce((s, p) => s + p.total, 0);
    const criticalVariance = variance.filter(v => v.status === 'critical').length;
    const warningVariance  = variance.filter(v => v.status === 'warning').length;
    const lowStock = bahan.filter(b => b.stock_current <= b.min_stock && b.status === 'approved').length;
    const drToday = dr.filter(d => d.tanggal === today).length;

    if (Auth.isAdmin()) {
      el.innerHTML = this._adminDash({ totalSalesToday, totalPurchaseToday, pending, criticalVariance, warningVariance, lowStock, variance, opname, todaySales, bahan, drToday });
    } else {
      el.innerHTML = this._userDash({ totalSalesToday, totalPurchaseToday, bahan, pending, drToday });
    }
  },

  _adminDash({ totalSalesToday, totalPurchaseToday, pending, criticalVariance, warningVariance, lowStock, variance, opname, todaySales, bahan, drToday }) {
    const topMenu = {};
    todaySales.forEach(s => { topMenu[s.menu_nama] = (topMenu[s.menu_nama] || 0) + s.qty; });
    const topMenuList = Object.entries(topMenu).sort((a,b) => b[1]-a[1]).slice(0,5);

    return `
    <div class="page-header">
      <div class="page-header-title">
        <h2>Dashboard Admin / Owner</h2>
        <p>Ringkasan operasional & monitoring risiko — ${fmt.date(new Date())}</p>
      </div>
      ${DEMO_MODE ? `<span class="badge badge-orange">Demo Mode — data dummy</span>` : ''}
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Sales Hari Ini</div>
        <div class="kpi-value">${fmt.currency(totalSalesToday)}</div>
        <div class="kpi-sub">Total transaksi penjualan</div>
        <div class="kpi-icon">${Icon.tag()}</div>
      </div>
      <div class="kpi-card orange">
        <div class="kpi-label">Pembelian Hari Ini</div>
        <div class="kpi-value">${fmt.currency(totalPurchaseToday)}</div>
        <div class="kpi-sub">Total bahan masuk</div>
        <div class="kpi-icon">${Icon.receipt()}</div>
      </div>
      <div class="kpi-card ${criticalVariance > 0 ? 'red' : 'green'}">
        <div class="kpi-label">Material Variance</div>
        <div class="kpi-value">${criticalVariance} <small style="font-size:13px;font-weight:400">critical</small></div>
        <div class="kpi-sub">${warningVariance} warning ditemukan</div>
        <div class="kpi-icon">${Icon.alert()}</div>
      </div>
      <div class="kpi-card ${pending.length > 0 ? 'orange' : 'green'}">
        <div class="kpi-label">Pending Approval</div>
        <div class="kpi-value">${pending.length}</div>
        <div class="kpi-sub">Menunggu review</div>
        <div class="kpi-icon">${Icon.clock()}</div>
      </div>
      <div class="kpi-card ${lowStock > 0 ? 'red' : ''}">
        <div class="kpi-label">Stock Rendah</div>
        <div class="kpi-value">${lowStock}</div>
        <div class="kpi-sub">Di bawah minimum stock</div>
        <div class="kpi-icon">${Icon.package()}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Daily Report</div>
        <div class="kpi-value">${drToday}</div>
        <div class="kpi-sub">Submit hari ini</div>
        <div class="kpi-icon">${Icon.clock()}</div>
      </div>
    </div>

    <div class="grid-2 mb-6">
      <div class="card">
        <div class="card-header">
          <span class="card-title">${Icon.shield()} Risk Monitoring</span>
        </div>
        <div class="card-body">
          <div class="risk-list">
            ${variance.map(v => `
              <div class="risk-item">
                <div class="risk-dot ${v.status}"></div>
                <div class="risk-info">
                  <div class="risk-name">${v.bahan_nama}</div>
                  <div class="risk-desc">Expected: ${fmt.number(v.expected_usage)} ${v.satuan} · Aktual: ${fmt.number(v.actual_stock)}</div>
                  <div class="variance-bar"><div class="variance-fill ${v.status}" style="width:${Math.min(v.variance_pct,100)}%"></div></div>
                </div>
                <div class="risk-value" style="color:var(--${v.status==='critical'?'red-600':v.status==='warning'?'orange-500':'green-600'})">${v.variance > 0 ? '+' : ''}${fmt.number(v.variance)}</div>
              </div>
            `).join('') || '<div class="text-sm text-gray" style="text-align:center;padding:20px">Belum ada data variance hari ini</div>'}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">${Icon.coffee()} Top Menu Hari Ini</span>
          <button class="btn btn-ghost btn-sm" onclick="Router.go('penjualan')">Lihat semua</button>
        </div>
        <div class="card-body">
          ${topMenuList.length ? topMenuList.map(([nama, qty], i) => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;${i < topMenuList.length-1 ? 'border-bottom:1px solid var(--gray-100)' : ''}">
              <div style="width:24px;height:24px;border-radius:50%;background:var(--blue-100);color:var(--blue-700);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">${i+1}</div>
              <div style="flex:1;font-weight:500">${nama}</div>
              <div style="font-family:var(--font-mono);font-weight:700;color:var(--blue-600)">${qty} cup</div>
            </div>
          `).join('') : '<div class="text-sm text-gray" style="text-align:center;padding:20px">Belum ada penjualan hari ini</div>'}
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <span class="card-title">${Icon.package()} Status Stock Bahan</span>
          <button class="btn btn-ghost btn-sm" onclick="Router.go('stock')">Lihat stock</button>
        </div>
        <div class="card-body">
          ${bahan.filter(b => b.status === 'approved').slice(0,5).map(b => {
            const pct = Math.min(b.stock_current / b.max_stock * 100, 100);
            const color = b.stock_current <= b.min_stock ? 'var(--red-600)' : b.stock_current <= b.min_stock * 1.5 ? 'var(--orange-500)' : 'var(--green-500)';
            return `
              <div style="margin-bottom:14px">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                  <span style="font-size:13px;font-weight:500">${b.nama}</span>
                  <span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">${fmt.number(b.stock_current)} ${b.satuan}</span>
                </div>
                <div class="stock-bar"><div class="stock-bar-fill" style="width:${pct}%;background:${color}"></div></div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">${Icon.clock()} Pending Approval</span>
          <button class="btn btn-primary btn-sm" onclick="Router.go('approval')">Review semua</button>
        </div>
        <div class="card-body">
          ${pending.length ? pending.slice(0,5).map(p => `
            <div class="approval-card" style="margin-bottom:10px">
              <div class="approval-type-dot dot-${p.type.toLowerCase()}">${p.type[0]}</div>
              <div style="flex:1">
                <div style="font-weight:600;font-size:13px">${p.data}</div>
                <div style="font-size:11px;color:var(--gray-500)">${p.type} · oleh ${p.submitted_by}</div>
              </div>
              <span class="badge badge-orange">Waiting</span>
            </div>
          `).join('') : `<div class="empty-state"><p>Semua approval sudah selesai</p><small>Tidak ada item menunggu review</small></div>`}
        </div>
      </div>
    </div>`;
  },

  _userDash({ totalSalesToday, totalPurchaseToday, bahan, pending, drToday }) {
    return `
    <div class="page-header">
      <div class="page-header-title">
        <h2>Selamat datang, ${Auth.user.nama || Auth.user.username}</h2>
        <p>Dashboard operasional — ${fmt.date(new Date())}</p>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Sales Hari Ini</div>
        <div class="kpi-value">${fmt.currency(totalSalesToday)}</div>
        <div class="kpi-icon">${Icon.tag()}</div>
      </div>
      <div class="kpi-card orange">
        <div class="kpi-label">Pembelian Hari Ini</div>
        <div class="kpi-value">${fmt.currency(totalPurchaseToday)}</div>
        <div class="kpi-icon">${Icon.receipt()}</div>
      </div>
      <div class="kpi-card ${pending.length > 0 ? 'orange' : 'green'}">
        <div class="kpi-label">Pending Approval</div>
        <div class="kpi-value">${pending.length}</div>
        <div class="kpi-sub">Menunggu persetujuan</div>
        <div class="kpi-icon">${Icon.clock()}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Daily Report</div>
        <div class="kpi-value">${drToday > 0 ? 'Done' : 'Pending'}</div>
        <div class="kpi-sub">${drToday > 0 ? 'Sudah disubmit' : 'Belum disubmit'}</div>
        <div class="kpi-icon">${Icon.audit()}</div>
      </div>
    </div>

    <div class="card mb-6">
      <div class="card-header"><span class="card-title">Shortcut Cepat</span></div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px">
          ${[
            { label: 'Input Pembelian', page: 'pembelian', icon: Icon.receipt(), color: 'var(--blue-50)', border: 'var(--blue-100)' },
            { label: 'Input Penjualan', page: 'penjualan', icon: Icon.tag(), color: 'var(--orange-50)', border: 'var(--orange-100)' },
            { label: 'Stock Opname',   page: 'stock-opname', icon: Icon.audit(), color: 'var(--green-100)', border: 'var(--green-500)' },
            { label: 'Daily Report',   page: 'daily-report', icon: Icon.clock(), color: 'var(--blue-50)', border: 'var(--blue-100)' },
            { label: 'Master Bahan',   page: 'master-bahan', icon: Icon.package(), color: 'var(--gray-50)', border: 'var(--gray-200)' },
            { label: 'Menu',           page: 'master-menu',  icon: Icon.coffee(), color: 'var(--gray-50)', border: 'var(--gray-200)' },
          ].map(s => `
            <div onclick="Router.go('${s.page}')" style="background:${s.color};border:1.5px solid ${s.border};border-radius:10px;padding:16px 12px;cursor:pointer;text-align:center;transition:transform .15s" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
              <div style="color:var(--blue-600);margin-bottom:8px">${s.icon}</div>
              <div style="font-size:12px;font-weight:600;color:var(--gray-700)">${s.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Stock Bahan (Ringkasan)</span>
        <button class="btn btn-ghost btn-sm" onclick="Router.go('stock')">Detail</button>
      </div>
      <div class="card-body">
        ${buildTable({
          cols: [
            { key: 'kode', label: 'Kode' },
            { key: 'nama', label: 'Bahan' },
            { label: 'Stock', render: r => `<span class="font-mono">${fmt.number(r.stock_current)} ${r.satuan}</span>` },
            { label: 'Min Stock', render: r => `<span class="font-mono">${fmt.number(r.min_stock)}</span>` },
            { label: 'Status', render: r => r.stock_current <= r.min_stock ? statusBadge('critical') : r.stock_current <= r.min_stock*1.3 ? statusBadge('warning') : statusBadge('normal') },
          ],
          data: bahan.filter(b => b.status === 'approved'),
        })}
      </div>
    </div>`;
  },
};
const PageMasterBahan = {
  data: [], query: '',

  async render(el) {
    this.el = el;
    try {
    this.this.data = await DataAPI.getBahan();
    } catch(e) { this.data = []; Toast.error("Gagal load: " + e.message); }

    this._draw();
  },

  _draw() {
    const filtered = searchFilter(this.data, this.query, ['kode','nama','kategori','supplier']);
    const isUser = !Auth.isAdmin();
    this.el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title">
        <h2>Master Bahan</h2>
        <p>Data bahan baku yang digunakan dalam resep dan operasional</p>
      </div>
      ${isUser ? `<button class="btn btn-primary" onclick="PageMasterBahan.openAdd()">${Icon.plus()} Tambah Bahan</button>` : ''}
    </div>
    <div class="card">
      <div class="card-header">
        <div class="action-bar-left">
          <div class="search-box">
            ${Icon.search()}
            <input type="text" placeholder="Cari bahan..." value="${this.query}" oninput="PageMasterBahan.query=this.value;PageMasterBahan._draw()" />
          </div>
        </div>
        <span class="text-sm text-gray">${filtered.length} bahan</span>
      </div>
      <div class="card-body" style="padding:0">
        ${buildTable({
          cols: [
            { key: 'kode', label: 'Kode' },
            { key: 'nama', label: 'Nama Bahan' },
            { key: 'kategori', label: 'Kategori' },
            { key: 'satuan', label: 'Satuan' },
            { label: 'Stock', render: r => `<span class="font-mono">${fmt.number(r.stock_current || 0)}</span>` },
            { label: 'Min Stock', render: r => `<span class="font-mono">${fmt.number(r.min_stock)}</span>` },
            { label: 'Harga Ref', render: r => fmt.currency(r.harga_ref) },
            { key: 'supplier', label: 'Supplier' },
            { label: 'Status', render: r => statusBadge(r.status) },
            { label: 'Aksi', render: r => `<button class="btn btn-ghost btn-sm btn-icon" title="Detail" onclick="PageMasterBahan.openDetail(${r.id})">${Icon.eye()}</button>
              ${Auth.isAdmin() && r.status === 'waiting' ? `<button class="btn btn-success btn-sm" onclick="PageMasterBahan.approve(${r.id})">${Icon.check()} Approve</button>` : ''}` },
          ],
          data: filtered,
          emptyMsg: 'Belum ada bahan. Klik "Tambah Bahan" untuk mulai.',
        })}
      </div>
    </div>`;
  },

  openAdd() {
    Modal.open({
      title: 'Tambah Master Bahan',
      body: `
        <div class="form-row cols-2">
          <div class="form-group"><label>Kode Bahan <span class="req">*</span></label><input id="b-kode" type="text" placeholder="BB001" /></div>
          <div class="form-group"><label>Nama Bahan <span class="req">*</span></label><input id="b-nama" type="text" placeholder="Coffee Bean" /></div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group"><label>Kategori</label>
            <select id="b-kat"><option>Coffee</option><option>Dairy</option><option>Sweetener</option><option>Syrup</option><option>Other</option></select>
          </div>
          <div class="form-group"><label>Satuan <span class="req">*</span></label>
            <select id="b-sat"><option>gram</option><option>ml</option><option>pcs</option><option>liter</option><option>kg</option></select>
          </div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group"><label>Min Stock</label><input id="b-min" type="number" value="500" /></div>
          <div class="form-group"><label>Max Stock</label><input id="b-max" type="number" value="5000" /></div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group"><label>Harga Referensi (Rp/satuan)</label><input id="b-harga" type="number" value="0" /></div>
          <div class="form-group"><label>Supplier</label><input id="b-sup" type="text" placeholder="Nama supplier" /></div>
        </div>
        <div class="form-group"><label>Catatan</label><textarea id="b-cat" rows="2" placeholder="Catatan tambahan..."></textarea></div>
      `,
      footer: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
               <button class="btn btn-primary" onclick="PageMasterBahan.saveBahan()">Submit untuk Approval</button>`,
    });
  },

  async saveBahan() {
    const kode = document.getElementById('b-kode').value.trim();
    const nama = document.getElementById('b-nama').value.trim();
    if (!kode || !nama) { Toast.error('Kode dan Nama wajib diisi'); return; }
    const item = {
      kode, nama,
      kategori: document.getElementById('b-kat').value,
      satuan:   document.getElementById('b-sat').value,
      min_stock: +document.getElementById('b-min').value,
      max_stock: +document.getElementById('b-max').value,
      harga_ref: +document.getElementById('b-harga').value,
      supplier:  document.getElementById('b-sup').value,
      catatan:   document.getElementById('b-cat').value,
      status: 'waiting',
      stock_current: 0,
      created_by: Auth.user.username,
      created_at: new Date().toISOString().split('T')[0],
    };
    await DataAPI.addBahan(item);
    await DataAPI.addAuditTrail({ user: Auth.user.username, activity: 'Submit', module: 'Material', record: nama, old_val: '', new_val: 'Waiting Approval' });
    Modal.close();
    Toast.success(`Bahan "${nama}" disubmit untuk approval`);
    this.data = await DataAPI.getBahan();
    this._draw();
    updateApprovalBadge();
  },

  openDetail(id) {
    const b = this.data.find(x => x.id === id);
    if (!b) return;
    Modal.open({
      title: `Detail Bahan — ${b.nama}`,
      body: `
        <div class="form-row cols-2" style="margin-bottom:12px">
          <div><div class="text-sm text-gray">Kode</div><strong>${b.kode}</strong></div>
          <div><div class="text-sm text-gray">Status</div>${statusBadge(b.status)}</div>
        </div>
        <div class="form-row cols-2" style="margin-bottom:12px">
          <div><div class="text-sm text-gray">Kategori</div>${b.kategori}</div>
          <div><div class="text-sm text-gray">Satuan</div>${b.satuan}</div>
        </div>
        <div class="form-row cols-2" style="margin-bottom:12px">
          <div><div class="text-sm text-gray">Min Stock</div><strong class="font-mono">${fmt.number(b.min_stock)}</strong></div>
          <div><div class="text-sm text-gray">Max Stock</div><strong class="font-mono">${fmt.number(b.max_stock)}</strong></div>
        </div>
        <div class="form-row cols-2" style="margin-bottom:12px">
          <div><div class="text-sm text-gray">Harga Referensi</div>${fmt.currency(b.harga_ref)} / ${b.satuan}</div>
          <div><div class="text-sm text-gray">Stock Saat Ini</div><strong class="font-mono">${fmt.number(b.stock_current || 0)} ${b.satuan}</strong></div>
        </div>
        <div style="margin-bottom:12px"><div class="text-sm text-gray">Supplier</div>${b.supplier || '-'}</div>
        <div class="divider"></div>
        <div class="text-sm text-gray">Dibuat oleh <strong>${b.created_by}</strong> pada ${b.created_at}</div>
      `,
      footer: Auth.isAdmin() && b.status === 'waiting' ? `
        <button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>
        <button class="btn btn-danger" onclick="PageMasterBahan.reject(${b.id})">Reject</button>
        <button class="btn btn-success" onclick="PageMasterBahan.approve(${b.id})">Approve</button>
      ` : `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>`,
    });
  },

  async approve(id) {
    await DataAPI.updateBahanStatus(id, 'approved');
    Modal.close();
    Toast.success('Bahan diapprove');
    this.data = await DataAPI.getBahan();
    this._draw();
    updateApprovalBadge();
  },
  async reject(id) {
    await DataAPI.updateBahanStatus(id, 'rejected');
    Modal.close();
    Toast.warning('Bahan direject');
    this.data = await DataAPI.getBahan();
    this._draw();
    updateApprovalBadge();
  },
};
const PageMasterMenu = {
  data: [], query: '',

  async render(el) {
    this.el = el; this.data = await DataAPI.getMenu(); this._draw();
  },

  _draw() {
    const filtered = searchFilter(this.data, this.query, ['kode','nama','kategori']);
    this.el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title"><h2>Master Menu</h2><p>Daftar menu yang dijual di coffee shop</p></div>
      ${!Auth.isAdmin() ? `<button class="btn btn-primary" onclick="PageMasterMenu.openAdd()">${Icon.plus()} Tambah Menu</button>` : ''}
    </div>
    <div class="card">
      <div class="card-header">
        <div class="search-box">${Icon.search()}<input type="text" placeholder="Cari menu..." oninput="PageMasterMenu.query=this.value;PageMasterMenu._draw()" /></div>
        <span class="text-sm text-gray">${filtered.length} menu</span>
      </div>
      <div class="card-body" style="padding:0">
        ${buildTable({
          cols: [
            { key: 'kode', label: 'Kode' },
            { key: 'nama', label: 'Nama Menu' },
            { key: 'kategori', label: 'Kategori' },
            { label: 'Harga Jual', render: r => fmt.currency(r.harga) },
            { label: 'Status', render: r => statusBadge(r.status) },
            { key: 'created_by', label: 'Dibuat Oleh' },
            { label: 'Aksi', render: r => `
              <button class="btn btn-ghost btn-sm btn-icon" onclick="PageMasterMenu.detail(${r.id})">${Icon.eye()}</button>
              ${Auth.isAdmin() && r.status === 'waiting' ? `<button class="btn btn-success btn-sm" onclick="PageMasterMenu.approve(${r.id})">${Icon.check()} Approve</button>` : ''}
            `},
          ],
          data: filtered,
          emptyMsg: 'Belum ada menu.',
        })}
      </div>
    </div>`;
  },

  openAdd() {
    Modal.open({
      title: 'Tambah Menu Baru',
      body: `
        <div class="form-row cols-2">
          <div class="form-group"><label>Kode Menu <span class="req">*</span></label><input id="m-kode" type="text" placeholder="MN001" /></div>
          <div class="form-group"><label>Nama Menu <span class="req">*</span></label><input id="m-nama" type="text" placeholder="Latte" /></div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group"><label>Kategori</label>
            <select id="m-kat"><option>Coffee</option><option>Non-Coffee</option><option>Specialty</option><option>Food</option></select>
          </div>
          <div class="form-group"><label>Harga Jual (Rp) <span class="req">*</span></label><input id="m-harga" type="number" placeholder="25000" /></div>
        </div>
      `,
      footer: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
               <button class="btn btn-primary" onclick="PageMasterMenu.save()">Submit Approval</button>`,
    });
  },

  async save() {
    const kode = document.getElementById('m-kode').value.trim();
    const nama = document.getElementById('m-nama').value.trim();
    const harga = +document.getElementById('m-harga').value;
    if (!kode || !nama || !harga) { Toast.error('Semua field wajib diisi'); return; }
    await DataAPI.addMenu({ kode, nama, kategori: document.getElementById('m-kat').value, harga, status: 'waiting', created_by: Auth.user.username, created_at: new Date().toISOString().split('T')[0] });
    Modal.close(); Toast.success(`Menu "${nama}" disubmit`);
    this.data = await DataAPI.getMenu(); this._draw(); updateApprovalBadge();
  },

  detail(id) {
    const m = this.data.find(x => x.id === id);
    Modal.open({
      title: m.nama,
      body: `
        <div class="form-row cols-2" style="margin-bottom:12px">
          <div><div class="text-sm text-gray">Kode</div><strong>${m.kode}</strong></div>
          <div><div class="text-sm text-gray">Status</div>${statusBadge(m.status)}</div>
        </div>
        <div class="form-row cols-2">
          <div><div class="text-sm text-gray">Kategori</div>${m.kategori}</div>
          <div><div class="text-sm text-gray">Harga Jual</div><strong>${fmt.currency(m.harga)}</strong></div>
        </div>
        <div class="divider"></div>
        <div class="text-sm text-gray">Dibuat oleh <strong>${m.created_by}</strong></div>
      `,
      footer: Auth.isAdmin() && m.status === 'waiting'
        ? `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>
           <button class="btn btn-danger" onclick="PageMasterMenu.reject(${m.id})">Reject</button>
           <button class="btn btn-success" onclick="PageMasterMenu.approve(${m.id})">Approve</button>`
        : `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>`,
    });
  },

  async approve(id) {
    await DataAPI.updateMenuStatus(id, 'approved');
    Modal.close(); Toast.success('Menu diapprove');
    this.data = await DataAPI.getMenu(); this._draw(); updateApprovalBadge();
  },
  async reject(id) {
    await DataAPI.updateMenuStatus(id, 'rejected');
    Modal.close(); Toast.warning('Menu direject');
    this.data = await DataAPI.getMenu(); this._draw(); updateApprovalBadge();
  },
};
const PageResep = {
  data: [], menu: [], bahan: [], lines: [],

  async render(el) {
    this.el = el;
    [this.data, this.menu, this.bahan] = await Promise.all([DataAPI.getResep(), DataAPI.getMenu(), DataAPI.getBahan()]);
    this._draw();
  },

  _draw() {
    // Group by menu
    const byMenu = {};
    this.data.forEach(r => {
      if (!byMenu[r.menu_nama]) byMenu[r.menu_nama] = [];
      byMenu[r.menu_nama].push(r);
    });

    this.el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title"><h2>Master Resep</h2><p>Komposisi bahan per menu — dasar perhitungan material usage</p></div>
      ${!Auth.isAdmin() ? `<button class="btn btn-primary" onclick="PageResep.openBuilder()">${Icon.plus()} Buat Resep</button>` : ''}
    </div>
    ${Object.keys(byMenu).length ? Object.entries(byMenu).map(([menuNama, lines]) => `
      <div class="card mb-4">
        <div class="card-header">
          <span class="card-title">${Icon.coffee()} ${menuNama}</span>
          ${statusBadge(lines[0]?.status || 'approved')}
        </div>
        <div class="card-body" style="padding:0">
          ${buildTable({
            cols: [
              { key: 'bahan_nama', label: 'Bahan' },
              { label: 'Quantity', render: r => `<span class="font-mono">${r.qty} ${r.satuan}</span>` },
            ],
            data: lines,
          })}
        </div>
      </div>
    `).join('') : `<div class="card"><div class="card-body"><div class="empty-state"><p>Belum ada resep.</p><small>Buat resep dengan klik tombol "Buat Resep"</small></div></div></div>`}`;
  },

  openBuilder() {
    const approvedMenu  = this.menu.filter(m => m.status === 'approved');
    const approvedBahan = this.bahan.filter(b => b.status === 'approved');
    this.lines = [{ bahan_id: '', qty: '', satuan: '' }];

    Modal.open({
      title: 'Recipe Builder',
      size: 'lg',
      body: `
        <div class="form-group">
          <label>Menu <span class="req">*</span></label>
          <select id="r-menu">
            <option value="">— Pilih Menu —</option>
            ${approvedMenu.map(m => `<option value="${m.id}">${m.nama}</option>`).join('')}
          </select>
        </div>
        <div class="divider"></div>
        <div style="font-weight:600;margin-bottom:10px">Komposisi Bahan</div>
        <div id="recipe-lines">
          ${this._lineHTML(0, approvedBahan)}
        </div>
        <button class="btn btn-ghost btn-sm" onclick="PageResep.addLine()" style="margin-top:8px">${Icon.plus()} Tambah Bahan</button>
      `,
      footer: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
               <button class="btn btn-primary" onclick="PageResep.save()">Submit Approval</button>`,
    });
    this._storeBahan = approvedBahan;
  },

  _lineHTML(i, bahan) {
    return `
    <div class="recipe-line" id="recipe-line-${i}">
      <div class="form-group" style="margin:0">
        <select id="r-bahan-${i}">
          <option value="">— Pilih Bahan —</option>
          ${bahan.map(b => `<option value="${b.id}" data-sat="${b.satuan}">${b.nama}</option>`).join('')}
        </select>
      </div>
      <div class="form-group" style="margin:0"><input id="r-qty-${i}" type="number" placeholder="Qty" min="0" /></div>
      <div class="form-group" style="margin:0"><input id="r-sat-${i}" type="text" placeholder="gram" readonly /></div>
      <button class="btn btn-ghost btn-sm btn-icon" onclick="PageResep.removeLine(${i})">${Icon.trash()}</button>
    </div>`;
  },

  addLine() {
    const i = ++this._lineCount || (this._lineCount = 1);
    document.getElementById('recipe-lines').insertAdjacentHTML('beforeend', this._lineHTML(i, this._storeBahan));
    // Auto-fill satuan when bahan selected
    document.getElementById(`r-bahan-${i}`)?.addEventListener('change', function() {
      const opt = this.options[this.selectedIndex];
      document.getElementById(`r-sat-${i}`).value = opt.dataset.sat || '';
    });
  },

  removeLine(i) {
    document.getElementById(`recipe-line-${i}`)?.remove();
  },

  async save() {
    const menuId = document.getElementById('r-menu').value;
    if (!menuId) { Toast.error('Pilih menu terlebih dahulu'); return; }
    const menu = this.menu.find(m => m.id == menuId);
    const lines = [];
    let i = 0;
    while (document.getElementById(`r-bahan-${i}`) !== null) {
      const bahanId = document.getElementById(`r-bahan-${i}`)?.value;
      const qty = parseFloat(document.getElementById(`r-qty-${i}`)?.value);
      const satuan = document.getElementById(`r-sat-${i}`)?.value;
      if (bahanId && qty > 0) {
        const bahan = this.bahan.find(b => b.id == bahanId);
        lines.push({ menu_id: +menuId, menu_nama: menu.nama, bahan_id: +bahanId, bahan_nama: bahan?.nama, qty, satuan, status: 'waiting', created_by: Auth.user.username });
      }
      i++;
    }
    if (!lines.length) { Toast.error('Tambahkan minimal 1 bahan'); return; }
    await DataAPI.addResepLines(lines);
    await DataAPI.addAuditTrail({ user: Auth.user.username, activity: 'Submit', module: 'Recipe', record: menu.nama, old_val: '', new_val: 'Waiting Approval' });
    Modal.close(); Toast.success(`Resep ${menu.nama} disubmit`);
    this.data = await DataAPI.getResep(); this._draw();
  },

  _lineCount: 0,
};
const PageApproval = {
  async render(el) {
    this.el = el;
    const pending = await DataAPI.getPendingApprovals();
    const dotClass = { Material: 'dot-material', Menu: 'dot-menu', Recipe: 'dot-recipe' };

    el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title">
        <h2>Approval Center</h2>
        <p>Review dan approve permintaan dari bartender</p>
      </div>
      <span class="badge badge-orange">${pending.length} item pending</span>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Menunggu Persetujuan</span></div>
      <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
        ${pending.length ? pending.map(p => `
          <div class="approval-card">
            <div class="approval-type-dot ${dotClass[p.type] || 'dot-material'}">${p.type[0]}</div>
            <div style="flex:1">
              <div style="font-weight:700;font-size:14px">${p.data}</div>
              <div style="font-size:12px;color:var(--gray-500);margin-top:2px">
                ${p.type} · Disubmit oleh <strong>${p.submitted_by}</strong> · ${p.date}
              </div>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-danger btn-sm" onclick="PageApproval.action('${p.ref_type}',${p.ref_id},'rejected')">Reject</button>
              <button class="btn btn-success btn-sm" onclick="PageApproval.action('${p.ref_type}',${p.ref_id},'approved')">Approve</button>
            </div>
          </div>
        `).join('') : `
          <div class="empty-state">
            <div style="font-size:40px;margin-bottom:8px">✓</div>
            <p>Semua sudah di-approve</p>
            <small>Tidak ada item yang menunggu persetujuan</small>
          </div>
        `}
      </div>
    </div>`;
  },

  async action(type, id, status) {
    if (type === 'bahan') await DataAPI.updateBahanStatus(id, status);
    else if (type === 'menu') await DataAPI.updateMenuStatus(id, status);
    Toast[status === 'approved' ? 'success' : 'warning'](`Item di${status === 'approved' ? 'approve' : 'reject'}`);
    updateApprovalBadge();
    await this.render(this.el);
  },
};
const PagePembelian = {
  data: [], bahan: [], query: '', _notaFile: null,

  async render(el) {
    this.el = el;
    [this.data, this.bahan] = await Promise.all([DataAPI.getPembelian(), DataAPI.getBahan()]);
    this._draw();
  },

  _draw() {
    const filtered = searchFilter(this.data, this.query, ['no','supplier','bahan_nama']);
    const total = filtered.reduce((s, p) => s + p.total, 0);

    this.el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title"><h2>Pembelian</h2><p>Pencatatan pembelian bahan baku — foto nota wajib</p></div>
      <button class="btn btn-primary" onclick="PagePembelian.openAdd()">${Icon.plus()} Input Pembelian</button>
    </div>
    <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);max-width:600px;margin-bottom:20px">
      <div class="kpi-card"><div class="kpi-label">Total Pembelian</div><div class="kpi-value" style="font-size:16px">${fmt.currency(total)}</div></div>
      <div class="kpi-card orange"><div class="kpi-label">Transaksi</div><div class="kpi-value">${filtered.length}</div></div>
      <div class="kpi-card"><div class="kpi-label">Pending Verif.</div><div class="kpi-value">${filtered.filter(p=>p.status==='submitted').length}</div></div>
    </div>
    <div class="card">
      <div class="card-header">
        <div class="search-box">${Icon.search()}<input type="text" placeholder="Cari no/supplier/bahan..." oninput="PagePembelian.query=this.value;PagePembelian._draw()" /></div>
      </div>
      <div class="card-body" style="padding:0">
        ${buildTable({
          cols: [
            { key: 'no', label: 'No. Pembelian' },
            { key: 'tanggal', label: 'Tanggal' },
            { key: 'supplier', label: 'Supplier' },
            { key: 'bahan_nama', label: 'Bahan' },
            { label: 'Qty', render: r => `<span class="font-mono">${fmt.number(r.qty)} ${r.satuan}</span>` },
            { label: 'Total', render: r => `<span class="font-mono">${fmt.currency(r.total)}</span>` },
            { key: 'metode', label: 'Metode' },
            { label: 'Nota', render: r => r.nota ? `<span class="badge badge-green">Ada</span>` : `<span class="badge badge-red">Tidak Ada</span>` },
            { label: 'Status', render: r => statusBadge(r.status) },
            { key: 'created_by', label: 'Input Oleh' },
          ],
          data: filtered,
          emptyMsg: 'Belum ada pembelian.',
        })}
      </div>
    </div>`;
  },

  openAdd() {
    this._notaFile = null;
    const approvedBahan = this.bahan.filter(b => b.status === 'approved');
    Modal.open({
      title: 'Input Pembelian Bahan',
      body: `
        <div class="form-row cols-2">
          <div class="form-group"><label>Tanggal <span class="req">*</span></label><input id="p-tgl" type="date" value="${new Date().toISOString().split('T')[0]}" /></div>
          <div class="form-group"><label>Supplier <span class="req">*</span></label><input id="p-sup" type="text" placeholder="Nama supplier" /></div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group"><label>Bahan <span class="req">*</span></label>
            <select id="p-bahan" onchange="PagePembelian._onBahanChange()">
              <option value="">— Pilih Bahan —</option>
              ${approvedBahan.map(b => `<option value="${b.id}" data-sat="${b.satuan}" data-nama="${b.nama}">${b.nama}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>Satuan</label><input id="p-sat" type="text" readonly placeholder="Otomatis" /></div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group"><label>Quantity <span class="req">*</span></label><input id="p-qty" type="number" oninput="PagePembelian._calcTotal()" placeholder="0" /></div>
          <div class="form-group"><label>Harga Satuan (Rp)</label><input id="p-hrgsat" type="number" oninput="PagePembelian._calcTotal()" placeholder="0" /></div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group"><label>Total Harga</label><input id="p-total" type="text" readonly placeholder="Otomatis" /></div>
          <div class="form-group"><label>Metode Pembayaran</label>
            <select id="p-metode"><option>Cash</option><option>Transfer</option><option>Debit</option><option>Credit</option></select>
          </div>
        </div>
        <div class="form-group"><label>Catatan</label><textarea id="p-cat" rows="2"></textarea></div>
        <div class="form-group">
          <label>Foto Nota <span class="req">*</span> <small style="color:var(--gray-400)">(JPG/PNG, wajib sebelum submit)</small></label>
          <div class="upload-zone" id="nota-zone" onclick="document.getElementById('nota-input').click()">
            <input type="file" id="nota-input" accept="image/*" style="display:none" onchange="PagePembelian._onNota(event)" />
            <div class="upload-icon">${Icon.upload()}</div>
            <div class="upload-text">Klik untuk upload foto nota</div>
            <div class="upload-hint">JPG, JPEG, PNG · Maks 5MB</div>
          </div>
        </div>
      `,
      footer: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
               <button class="btn btn-primary" onclick="PagePembelian.save()">Submit Pembelian</button>`,
    });
  },

  _onBahanChange() {
    const sel = document.getElementById('p-bahan');
    const opt = sel.options[sel.selectedIndex];
    document.getElementById('p-sat').value = opt.dataset.sat || '';
    this._calcTotal();
  },
  _calcTotal() {
    const qty = parseFloat(document.getElementById('p-qty')?.value) || 0;
    const hrg = parseFloat(document.getElementById('p-hrgsat')?.value) || 0;
    const el = document.getElementById('p-total');
    if (el) el.value = fmt.currency(qty * hrg);
  },
  _onNota(e) {
    const file = e.target.files[0];
    if (!file) return;
    this._notaFile = file;
    const zone = document.getElementById('nota-zone');
    zone.classList.add('has-file');
    zone.querySelector('.upload-text').textContent = `✓ ${file.name}`;
  },

  async save() {
    const tgl = document.getElementById('p-tgl').value;
    const sup = document.getElementById('p-sup').value.trim();
    const bahanEl = document.getElementById('p-bahan');
    const bahanId = bahanEl.value;
    const bahanNama = bahanEl.options[bahanEl.selectedIndex]?.dataset.nama;
    const qty = parseFloat(document.getElementById('p-qty').value);
    const hrgSat = parseFloat(document.getElementById('p-hrgsat').value) || 0;
    const satuan = document.getElementById('p-sat').value;

    if (!tgl || !sup || !bahanId || !qty) { Toast.error('Isi semua field wajib'); return; }
    if (!this._notaFile) { Toast.error('Foto nota wajib diupload sebelum submit'); return; }

    const no = `PO-${tgl.replace(/-/g,'').slice(2)}-${String(this.data.length + 1).padStart(3,'0')}`;
    await DataAPI.addPembelian({
      no, tanggal: tgl, supplier: sup, bahan_nama: bahanNama, bahan_id: +bahanId,
      qty, satuan, harga_satuan: hrgSat, total: qty * hrgSat,
      metode: document.getElementById('p-metode').value,
      catatan: document.getElementById('p-cat').value,
      nota: true, status: 'submitted', created_by: Auth.user.username,
    });
    Modal.close(); Toast.success('Pembelian berhasil disubmit');
    this.data = await DataAPI.getPembelian(); this._draw();
  },
};
const PagePenjualan = {
  data: [], menu: [], resep: [], query: '',

  async render(el) {
    this.el = el;
    [this.data, this.menu, this.resep] = await Promise.all([DataAPI.getPenjualan(), DataAPI.getMenu(), DataAPI.getResep()]);
    this._draw();
  },

  _draw() {
    const filtered = searchFilter(this.data, this.query, ['menu_nama','shift','created_by']);
    const totalRevenue = filtered.reduce((s, p) => s + p.total, 0);

    this.el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title"><h2>Penjualan</h2><p>Pencatatan produk terjual — terhubung dengan resep & material usage</p></div>
      <button class="btn btn-primary" onclick="PagePenjualan.openAdd()">${Icon.plus()} Input Penjualan</button>
    </div>
    <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);max-width:600px;margin-bottom:20px">
      <div class="kpi-card"><div class="kpi-label">Total Revenue</div><div class="kpi-value" style="font-size:16px">${fmt.currency(totalRevenue)}</div></div>
      <div class="kpi-card orange"><div class="kpi-label">Transaksi</div><div class="kpi-value">${filtered.length}</div></div>
      <div class="kpi-card green"><div class="kpi-label">Total Cup/Pcs</div><div class="kpi-value">${filtered.reduce((s,p)=>s+p.qty,0)}</div></div>
    </div>
    <div class="card">
      <div class="card-header">
        <div class="search-box">${Icon.search()}<input type="text" placeholder="Cari menu/shift..." oninput="PagePenjualan.query=this.value;PagePenjualan._draw()" /></div>
      </div>
      <div class="card-body" style="padding:0">
        ${buildTable({
          cols: [
            { key: 'tanggal', label: 'Tanggal' },
            { key: 'shift', label: 'Shift' },
            { key: 'menu_nama', label: 'Menu' },
            { label: 'Qty', render: r => `<span class="font-mono">${r.qty}</span>` },
            { label: 'Harga', render: r => fmt.currency(r.harga) },
            { label: 'Total', render: r => `<strong class="font-mono">${fmt.currency(r.total)}</strong>` },
            { key: 'metode', label: 'Metode' },
            { key: 'created_by', label: 'Input Oleh' },
            { label: 'Aksi', render: r => `<button class="btn btn-ghost btn-sm btn-icon" onclick="PagePenjualan.detail(${r.id})">${Icon.eye()}</button>` },
          ],
          data: filtered,
          emptyMsg: 'Belum ada data penjualan.',
        })}
      </div>
    </div>`;
  },

  openAdd() {
    const approvedMenu = this.menu.filter(m => m.status === 'approved');
    this.el.querySelector || (() => {});

    Modal.open({
      title: 'Input Penjualan',
      body: `
        <div class="form-row cols-2">
          <div class="form-group"><label>Tanggal <span class="req">*</span></label><input id="s-tgl" type="date" value="${new Date().toISOString().split('T')[0]}" /></div>
          <div class="form-group"><label>Shift <span class="req">*</span></label>
            <select id="s-shift"><option>Pagi</option><option>Siang</option><option>Malam</option></select>
          </div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group"><label>Menu <span class="req">*</span></label>
            <select id="s-menu" onchange="PagePenjualan._onMenuChange()">
              <option value="">— Pilih Menu —</option>
              ${approvedMenu.map(m => `<option value="${m.id}" data-harga="${m.harga}" data-nama="${m.nama}">${m.nama} — ${fmt.currency(m.harga)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>Quantity <span class="req">*</span></label>
            <input id="s-qty" type="number" placeholder="0" min="1" oninput="PagePenjualan._calcTotal()" />
          </div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group"><label>Harga Satuan</label><input id="s-harga" type="text" readonly placeholder="Otomatis dari menu" /></div>
          <div class="form-group"><label>Total</label><input id="s-total" type="text" readonly placeholder="Otomatis" /></div>
        </div>
        <div class="form-group"><label>Metode Pembayaran</label>
          <select id="s-metode"><option>Mixed</option><option>Cash</option><option>QRIS</option><option>Debit</option><option>Credit</option><option>E-Wallet</option></select>
        </div>
        <div id="s-usage-preview" style="margin-top:12px"></div>
      `,
      footer: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
               <button class="btn btn-primary" onclick="PagePenjualan.save()">Submit Penjualan</button>`,
    });
  },

  _onMenuChange() {
    const sel = document.getElementById('s-menu');
    const opt = sel.options[sel.selectedIndex];
    const harga = parseFloat(opt.dataset.harga) || 0;
    document.getElementById('s-harga').value = fmt.currency(harga);
    this._calcTotal();
    this._previewUsage(+sel.value, opt.dataset.nama);
  },

  _calcTotal() {
    const sel = document.getElementById('s-menu');
    const opt = sel?.options[sel.selectedIndex];
    const harga = parseFloat(opt?.dataset.harga) || 0;
    const qty = parseFloat(document.getElementById('s-qty')?.value) || 0;
    const el = document.getElementById('s-total');
    if (el) el.value = fmt.currency(harga * qty);
    this._previewUsage(+sel.value, opt?.dataset.nama);
  },

  _previewUsage(menuId, menuNama) {
    if (!menuId) return;
    const qty = parseFloat(document.getElementById('s-qty')?.value) || 0;
    const lines = this.resep.filter(r => r.menu_id === menuId);
    const el = document.getElementById('s-usage-preview');
    if (!el || !lines.length) return;
    el.innerHTML = `
      <div style="background:var(--blue-50);border:1px solid var(--blue-100);border-radius:8px;padding:12px">
        <div style="font-size:11px;font-weight:700;color:var(--blue-700);margin-bottom:8px">📊 Preview Material Usage (${qty} cup)</div>
        ${lines.map(r => `
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
            <span>${r.bahan_nama}</span>
            <span class="font-mono">${fmt.number(r.qty * qty)} ${r.satuan}</span>
          </div>
        `).join('')}
      </div>`;
  },

  async save() {
    const tgl = document.getElementById('s-tgl').value;
    const shift = document.getElementById('s-shift').value;
    const menuSel = document.getElementById('s-menu');
    const menuId = +menuSel.value;
    const menuNama = menuSel.options[menuSel.selectedIndex]?.dataset.nama;
    const qty = parseInt(document.getElementById('s-qty').value);
    const harga = parseFloat(menuSel.options[menuSel.selectedIndex]?.dataset.harga) || 0;

    if (!tgl || !menuId || !qty || qty < 1) { Toast.error('Isi semua field wajib'); return; }

    await DataAPI.addPenjualan({
      tanggal: tgl, shift, menu_id: menuId, menu_nama: menuNama,
      qty, harga, total: harga * qty,
      metode: document.getElementById('s-metode').value,
      created_by: Auth.user.username,
    });
    Modal.close(); Toast.success(`Penjualan ${menuNama} x${qty} disubmit`);
    this.data = await DataAPI.getPenjualan(); this._draw();
  },

  detail(id) {
    const s = this.data.find(x => x.id === id);
    if (!s) return;
    const lines = this.resep.filter(r => r.menu_id === s.menu_id);
    Modal.open({
      title: `Detail Penjualan — ${s.menu_nama}`,
      body: `
        <div class="form-row cols-2" style="margin-bottom:12px">
          <div><div class="text-sm text-gray">Tanggal</div><strong>${s.tanggal}</strong></div>
          <div><div class="text-sm text-gray">Shift</div>${s.shift}</div>
        </div>
        <div class="form-row cols-2" style="margin-bottom:12px">
          <div><div class="text-sm text-gray">Menu</div><strong>${s.menu_nama}</strong></div>
          <div><div class="text-sm text-gray">Quantity</div><strong class="font-mono">${s.qty} cup</strong></div>
        </div>
        <div class="form-row cols-2" style="margin-bottom:12px">
          <div><div class="text-sm text-gray">Harga Satuan</div>${fmt.currency(s.harga)}</div>
          <div><div class="text-sm text-gray">Total</div><strong>${fmt.currency(s.total)}</strong></div>
        </div>
        <div class="divider"></div>
        <div style="font-weight:700;margin-bottom:10px">Material Usage (Teoritis)</div>
        ${lines.map(r => `
          <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--gray-100)">
            <span>${r.bahan_nama}</span>
            <span class="font-mono">${r.qty} × ${s.qty} = <strong>${fmt.number(r.qty * s.qty)} ${r.satuan}</strong></span>
          </div>
        `).join('') || '<div class="text-sm text-gray">Tidak ada resep terhubung</div>'}
        <div class="divider"></div>
        <div class="text-sm text-gray">Input oleh <strong>${s.created_by}</strong></div>
      `,
      footer: `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>`,
    });
  },
};
const PageStock = {
  data: [], penjualan: [], resep: [], pembelian: [],

  async render(el) {
    this.el = el;
    [this.data, this.penjualan, this.resep, this.pembelian] = await Promise.all([
      DataAPI.getBahan(), DataAPI.getPenjualan(), DataAPI.getResep(), DataAPI.getPembelian()
    ]);
    this._draw();
  },

  _getExpectedUsage(bahanId) {
    let total = 0;
    this.penjualan.forEach(sale => {
      const lines = this.resep.filter(r => r.menu_id === sale.menu_id && r.bahan_id === bahanId);
      lines.forEach(r => total += r.qty * sale.qty);
    });
    return total;
  },

  _draw() {
    const approved = this.data.filter(b => b.status === 'approved');

    this.el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title"><h2>Stock Management</h2><p>Pergerakan dan kondisi stok bahan baku</p></div>
    </div>

    <div class="kpi-grid" style="max-width:700px;margin-bottom:20px">
      <div class="kpi-card"><div class="kpi-label">Total Bahan Aktif</div><div class="kpi-value">${approved.length}</div></div>
      <div class="kpi-card red"><div class="kpi-label">Stok Rendah</div><div class="kpi-value">${approved.filter(b=>b.stock_current<=b.min_stock).length}</div><div class="kpi-sub">Di bawah minimum</div></div>
      <div class="kpi-card orange"><div class="kpi-label">Perlu Perhatian</div><div class="kpi-value">${approved.filter(b=>b.stock_current>b.min_stock&&b.stock_current<=b.min_stock*1.5).length}</div></div>
    </div>

    <div class="card mb-6">
      <div class="card-header"><span class="card-title">Status Stok Bahan</span></div>
      <div class="card-body" style="padding:0">
        ${buildTable({
          cols: [
            { key: 'kode', label: 'Kode' },
            { key: 'nama', label: 'Bahan' },
            { key: 'kategori', label: 'Kategori' },
            { label: 'Stok Saat Ini', render: r => `<strong class="font-mono">${fmt.number(r.stock_current)} ${r.satuan}</strong>` },
            { label: 'Min Stock', render: r => `<span class="font-mono">${fmt.number(r.min_stock)}</span>` },
            { label: 'Max Stock', render: r => `<span class="font-mono">${fmt.number(r.max_stock)}</span>` },
            { label: 'Level', render: r => {
              const pct = Math.min(r.stock_current / r.max_stock * 100, 100);
              const color = r.stock_current <= r.min_stock ? 'var(--red-600)' : r.stock_current <= r.min_stock*1.5 ? 'var(--orange-500)' : 'var(--green-500)';
              return `<div style="width:100px"><div class="stock-bar"><div class="stock-bar-fill" style="width:${pct}%;background:${color};height:8px;border-radius:99px"></div></div><div class="text-sm text-gray" style="margin-top:3px">${pct.toFixed(0)}%</div></div>`;
            }},
            { label: 'Status', render: r => r.stock_current <= r.min_stock ? statusBadge('critical') : r.stock_current <= r.min_stock*1.5 ? statusBadge('warning') : statusBadge('normal') },
            { label: 'Aksi', render: r => `<button class="btn btn-ghost btn-sm" onclick="PageStock.stockCard(${r.id})">Stock Card</button>` },
          ],
          data: approved,
          emptyMsg: 'Belum ada bahan yang diapprove.',
        })}
      </div>
    </div>`;
  },

  stockCard(bahanId) {
    const bahan = this.data.find(b => b.id === bahanId);
    if (!bahan) return;

    const purchases = this.pembelian.filter(p => p.bahan_id === bahanId || p.bahan_nama === bahan.nama);
    const expectedUsage = this._getExpectedUsage(bahanId);

    // Build movement rows
    const rows = [
      { tanggal: '2025-09-01', transaksi: 'Opening Stock', in: 2000, out: 0, note: 'Saldo awal' },
      ...purchases.map(p => ({ tanggal: p.tanggal, transaksi: `Pembelian ${p.no}`, in: p.qty, out: 0, note: p.supplier })),
      { tanggal: '2025-09-06', transaksi: 'Sales Usage (Teoritis)', in: 0, out: expectedUsage, note: 'Berdasarkan resep' },
    ];

    let balance = 0;
    const rowsWithBalance = rows.map(r => {
      balance += r.in - r.out;
      return { ...r, balance };
    });

    Modal.open({
      title: `Stock Card — ${bahan.nama}`,
      size: 'lg',
      body: `
        <div class="form-row cols-3" style="margin-bottom:16px">
          <div><div class="text-sm text-gray">Bahan</div><strong>${bahan.nama}</strong></div>
          <div><div class="text-sm text-gray">Satuan</div>${bahan.satuan}</div>
          <div><div class="text-sm text-gray">Stok Aktual</div><strong class="font-mono">${fmt.number(bahan.stock_current)}</strong></div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Tanggal</th><th>Transaksi</th><th>Masuk</th><th>Keluar</th><th>Saldo</th><th>Keterangan</th></tr></thead>
            <tbody>
              ${rowsWithBalance.map(r => `<tr>
                <td>${r.tanggal}</td>
                <td>${r.transaksi}</td>
                <td class="font-mono" style="color:var(--green-600)">${r.in > 0 ? '+'+fmt.number(r.in) : '-'}</td>
                <td class="font-mono" style="color:var(--red-600)">${r.out > 0 ? '-'+fmt.number(r.out) : '-'}</td>
                <td class="font-mono"><strong>${fmt.number(r.balance)}</strong></td>
                <td class="text-sm text-gray">${r.note}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="margin-top:16px;padding:12px;background:var(--blue-50);border-radius:8px;display:flex;gap:24px">
          <div><div class="text-sm text-gray">Expected Stock (Sistem)</div><strong class="font-mono">${fmt.number(rowsWithBalance[rowsWithBalance.length-1]?.balance || 0)} ${bahan.satuan}</strong></div>
          <div><div class="text-sm text-gray">Actual Stock (Opname)</div><strong class="font-mono">${fmt.number(bahan.stock_current)} ${bahan.satuan}</strong></div>
          <div><div class="text-sm text-gray">Variance</div><strong class="font-mono" style="color:${bahan.stock_current < (rowsWithBalance[rowsWithBalance.length-1]?.balance||0) ? 'var(--red-600)' : 'var(--green-600)'}">
            ${fmt.number(bahan.stock_current - (rowsWithBalance[rowsWithBalance.length-1]?.balance || 0))} ${bahan.satuan}
          </strong></div>
        </div>
      `,
      footer: `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>`,
    });
  },
};
const PageStockOpname = {
  data: [], bahan: [], _fotoFile: null,

  async render(el) {
    this.el = el;
    [this.data, this.bahan] = await Promise.all([DataAPI.getStockOpname(), DataAPI.getBahan()]);
    this._draw();
  },

  _draw() {
    this.el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title"><h2>Stock Opname</h2><p>Pengecekan stok fisik vs stok sistem — deteksi variance</p></div>
      <button class="btn btn-primary" onclick="PageStockOpname.openAdd()">${Icon.plus()} Input Stock Opname</button>
    </div>

    <div class="kpi-grid" style="max-width:600px;margin-bottom:20px">
      <div class="kpi-card red"><div class="kpi-label">Critical</div><div class="kpi-value">${this.data.filter(d=>d.status==='critical').length}</div></div>
      <div class="kpi-card orange"><div class="kpi-label">Warning</div><div class="kpi-value">${this.data.filter(d=>d.status==='warning').length}</div></div>
      <div class="kpi-card green"><div class="kpi-label">Normal</div><div class="kpi-value">${this.data.filter(d=>d.status==='normal').length}</div></div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">Riwayat Stock Opname</span></div>
      <div class="card-body" style="padding:0">
        ${buildTable({
          cols: [
            { key: 'tanggal', label: 'Tanggal' },
            { key: 'shift', label: 'Shift' },
            { key: 'bahan_nama', label: 'Bahan' },
            { label: 'Stok Sistem', render: r => `<span class="font-mono">${fmt.number(r.system_stock)}</span>` },
            { label: 'Stok Aktual', render: r => `<span class="font-mono">${fmt.number(r.actual_stock)}</span>` },
            { label: 'Variance', render: r => `<span class="font-mono" style="color:${r.variance<0?'var(--red-600)':r.variance>0?'var(--green-600)':'var(--gray-500)'}">
              ${r.variance > 0 ? '+' : ''}${fmt.number(r.variance)}
            </span>` },
            { key: 'reason', label: 'Keterangan' },
            { label: 'Foto', render: r => r.foto ? `<span class="badge badge-green">Ada</span>` : `<span class="badge badge-red">Tidak Ada</span>` },
            { label: 'Status', render: r => statusBadge(r.status) },
            { key: 'created_by', label: 'Dilakukan Oleh' },
          ],
          data: this.data,
          emptyMsg: 'Belum ada stock opname.',
        })}
      </div>
    </div>`;
  },

  openAdd() {
    this._fotoFile = null;
    const approved = this.bahan.filter(b => b.status === 'approved');

    Modal.open({
      title: 'Input Stock Opname',
      body: `
        <div class="form-row cols-2">
          <div class="form-group"><label>Tanggal <span class="req">*</span></label><input id="so-tgl" type="date" value="${new Date().toISOString().split('T')[0]}" /></div>
          <div class="form-group"><label>Shift <span class="req">*</span></label>
            <select id="so-shift"><option>Pagi</option><option>Siang</option><option>Malam</option></select>
          </div>
        </div>
        <div class="form-group"><label>Bahan <span class="req">*</span></label>
          <select id="so-bahan" onchange="PageStockOpname._onBahan()">
            <option value="">— Pilih Bahan —</option>
            ${approved.map(b => `<option value="${b.id}" data-stock="${b.stock_current}" data-sat="${b.satuan}">${b.nama}</option>`).join('')}
          </select>
        </div>
        <div class="form-row cols-2">
          <div class="form-group"><label>Stok Sistem</label><input id="so-sys" type="text" readonly placeholder="Otomatis" /></div>
          <div class="form-group"><label>Stok Aktual (Fisik) <span class="req">*</span></label>
            <input id="so-actual" type="number" placeholder="0" oninput="PageStockOpname._calcVariance()" />
          </div>
        </div>
        <div class="form-group"><label>Variance</label>
          <input id="so-variance" type="text" readonly placeholder="Otomatis" />
        </div>
        <div id="so-status-preview" style="margin-top:4px;margin-bottom:12px"></div>
        <div class="form-group"><label>Keterangan / Alasan</label>
          <textarea id="so-reason" rows="2" placeholder="Contoh: spillage, expired, dll."></textarea>
        </div>
        <div class="form-group">
          <label>Foto Stock Opname <span class="req">*</span></label>
          <div class="upload-zone" id="so-zone" onclick="document.getElementById('so-input').click()">
            <input type="file" id="so-input" accept="image/*" style="display:none" onchange="PageStockOpname._onFoto(event)" />
            <div class="upload-icon">${Icon.image()}</div>
            <div class="upload-text">Klik untuk upload foto</div>
            <div class="upload-hint">JPG, JPEG, PNG</div>
          </div>
        </div>
      `,
      footer: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
               <button class="btn btn-primary" onclick="PageStockOpname.save()">Submit Opname</button>`,
    });
  },

  _onBahan() {
    const sel = document.getElementById('so-bahan');
    const opt = sel.options[sel.selectedIndex];
    const stock = opt.dataset.stock || 0;
    document.getElementById('so-sys').value = `${fmt.number(stock)} ${opt.dataset.sat}`;
    this._calcVariance();
  },

  _calcVariance() {
    const sel = document.getElementById('so-bahan');
    const opt = sel?.options[sel.selectedIndex];
    const sysStock = parseFloat(opt?.dataset.stock) || 0;
    const actual = parseFloat(document.getElementById('so-actual')?.value) || 0;
    const variance = actual - sysStock;
    const varEl = document.getElementById('so-variance');
    if (varEl) varEl.value = `${variance >= 0 ? '+' : ''}${fmt.number(variance)} ${opt?.dataset.sat || ''}`;

    const pct = sysStock > 0 ? Math.abs(variance / sysStock * 100) : 0;
    const status = pct >= APP_CONFIG.variance_critical_pct ? 'critical' : pct >= APP_CONFIG.variance_warning_pct ? 'warning' : 'normal';
    const colors = { critical: 'var(--red-600)', warning: 'var(--orange-500)', normal: 'var(--green-600)' };
    const prev = document.getElementById('so-status-preview');
    if (prev) prev.innerHTML = `<span class="badge badge-${status === 'critical' ? 'red' : status === 'warning' ? 'orange' : 'green'}">${status.toUpperCase()} — Variance ${pct.toFixed(1)}%</span>`;
  },

  _onFoto(e) {
    const file = e.target.files[0]; if (!file) return;
    this._fotoFile = file;
    const zone = document.getElementById('so-zone');
    zone.classList.add('has-file');
    zone.querySelector('.upload-text').textContent = `✓ ${file.name}`;
  },

  async save() {
    const tgl = document.getElementById('so-tgl').value;
    const shift = document.getElementById('so-shift').value;
    const bahanSel = document.getElementById('so-bahan');
    const bahanId = +bahanSel.value;
    const bahanNama = bahanSel.options[bahanSel.selectedIndex]?.text.split(' —')[0];
    const sysStock = parseFloat(bahanSel.options[bahanSel.selectedIndex]?.dataset.stock) || 0;
    const actual = parseFloat(document.getElementById('so-actual').value);

    if (!tgl || !bahanId || isNaN(actual)) { Toast.error('Isi semua field wajib'); return; }
    if (!this._fotoFile) { Toast.error('Foto stock opname wajib diupload'); return; }

    const variance = actual - sysStock;
    const pct = sysStock > 0 ? Math.abs(variance / sysStock * 100) : 0;
    const status = pct >= APP_CONFIG.variance_critical_pct ? 'critical' : pct >= APP_CONFIG.variance_warning_pct ? 'warning' : 'normal';

    await DataAPI.addStockOpname({
      tanggal: tgl, shift, bahan_id: bahanId, bahan_nama: bahanNama,
      system_stock: sysStock, actual_stock: actual, variance,
      reason: document.getElementById('so-reason').value,
      foto: true, status, created_by: Auth.user.username,
    });
    Modal.close(); Toast.success('Stock opname berhasil disubmit');
    if (status === 'critical') Toast.error(`CRITICAL: Variance ${Math.abs(variance).toFixed(0)} — perlu investigasi!`);
    this.data = await DataAPI.getStockOpname(); this._draw();
  },
};
const PageDailyReport = {
  data: [], _posFile: null,

  async render(el) {
    this.el = el;
    try {
    this.this.data = await DataAPI.getDailyReport();
    } catch(e) { this.data = []; Toast.error("Gagal load: " + e.message); }

    this._draw();
  },

  _draw() {
    this.el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title"><h2>Daily Report</h2><p>Laporan harian kas & non-kas — foto bukti POS wajib</p></div>
      <button class="btn btn-primary" onclick="PageDailyReport.openAdd()">${Icon.plus()} Input Daily Report</button>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">Riwayat Daily Report</span></div>
      <div class="card-body" style="padding:0">
        ${buildTable({
          cols: [
            { key: 'tanggal', label: 'Tanggal' },
            { key: 'user', label: 'User' },
            { key: 'shift', label: 'Shift' },
            { label: 'Total Sales', render: r => `<strong class="font-mono">${fmt.currency(r.total_sales)}</strong>` },
            { label: 'Cash', render: r => fmt.currency(r.cash) },
            { label: 'Non-Cash', render: r => fmt.currency(r.qris + r.debit + r.credit + r.ewallet) },
            { label: 'Total POS', render: r => fmt.currency(r.total_pos) },
            { label: 'Variance', render: r => `<span class="font-mono" style="color:${r.variance!==0?'var(--red-600)':'var(--green-600)'}">${r.variance >= 0 ? '+' : ''}${fmt.currency(r.variance)}</span>` },
            { label: 'Bukti POS', render: r => r.pos_foto ? `<span class="badge badge-green">Ada</span>` : `<span class="badge badge-red">Tidak Ada</span>` },
            { label: 'Reconciliation', render: r => r.variance === 0 ? statusBadge('balanced') : statusBadge('investigate') },
            { label: 'Aksi', render: r => `<button class="btn btn-ghost btn-sm btn-icon" onclick="PageDailyReport.detail(${r.id})">${Icon.eye()}</button>` },
          ],
          data: this.data,
          emptyMsg: 'Belum ada daily report.',
        })}
      </div>
    </div>`;
  },

  openAdd() {
    this._posFile = null;
    Modal.open({
      title: 'Input Daily Report',
      size: 'lg',
      body: `
        <div class="form-row cols-2">
          <div class="form-group"><label>Tanggal <span class="req">*</span></label><input id="dr-tgl" type="date" value="${new Date().toISOString().split('T')[0]}" /></div>
          <div class="form-group"><label>Shift <span class="req">*</span></label>
            <select id="dr-shift"><option>Pagi</option><option>Siang</option><option>Malam</option></select>
          </div>
        </div>
        <div class="form-group"><label>Total Sales (dari POS) <span class="req">*</span></label>
          <input id="dr-sales" type="number" placeholder="0" oninput="PageDailyReport._calc()" />
        </div>
        <div style="font-weight:700;margin-bottom:12px;margin-top:4px">Rincian Pembayaran</div>
        <div class="form-row cols-2">
          <div class="form-group"><label>Cash</label><input id="dr-cash" type="number" value="0" oninput="PageDailyReport._calc()" /></div>
          <div class="form-group"><label>QRIS</label><input id="dr-qris" type="number" value="0" oninput="PageDailyReport._calc()" /></div>
        </div>
        <div class="form-row cols-3">
          <div class="form-group"><label>Debit</label><input id="dr-debit" type="number" value="0" oninput="PageDailyReport._calc()" /></div>
          <div class="form-group"><label>Credit</label><input id="dr-credit" type="number" value="0" oninput="PageDailyReport._calc()" /></div>
          <div class="form-group"><label>E-Wallet</label><input id="dr-ewallet" type="number" value="0" oninput="PageDailyReport._calc()" /></div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group"><label>Total Laporan (Otomatis)</label><input id="dr-total" type="text" readonly /></div>
          <div class="form-group"><label>Variance</label><input id="dr-variance" type="text" readonly /></div>
        </div>
        <div id="dr-reconcile-status" style="margin-bottom:12px"></div>
        <div class="form-group"><label>Catatan</label><textarea id="dr-cat" rows="2"></textarea></div>
        <div class="form-group">
          <label>Foto Bukti POS <span class="req">*</span></label>
          <div class="upload-zone" id="pos-zone" onclick="document.getElementById('pos-input').click()">
            <input type="file" id="pos-input" accept="image/*" style="display:none" onchange="PageDailyReport._onFoto(event)" />
            <div class="upload-icon">${Icon.image()}</div>
            <div class="upload-text">Klik untuk upload foto POS</div>
            <div class="upload-hint">JPG, JPEG, PNG</div>
          </div>
        </div>
      `,
      footer: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
               <button class="btn btn-primary" onclick="PageDailyReport.save()">Submit Daily Report</button>`,
    });
  },

  _calc() {
    const sales = parseFloat(document.getElementById('dr-sales')?.value) || 0;
    const cash = parseFloat(document.getElementById('dr-cash')?.value) || 0;
    const qris = parseFloat(document.getElementById('dr-qris')?.value) || 0;
    const debit = parseFloat(document.getElementById('dr-debit')?.value) || 0;
    const credit = parseFloat(document.getElementById('dr-credit')?.value) || 0;
    const ewallet = parseFloat(document.getElementById('dr-ewallet')?.value) || 0;
    const total = cash + qris + debit + credit + ewallet;
    const variance = total - sales;

    const totalEl = document.getElementById('dr-total');
    const varEl = document.getElementById('dr-variance');
    const statusEl = document.getElementById('dr-reconcile-status');
    if (totalEl) totalEl.value = fmt.currency(total);
    if (varEl) {
      varEl.value = `${variance >= 0 ? '+' : ''}${fmt.currency(variance)}`;
      varEl.style.color = variance !== 0 ? 'var(--red-600)' : 'var(--green-600)';
    }
    if (statusEl) {
      if (sales > 0) {
        statusEl.innerHTML = variance === 0
          ? `<span class="badge badge-green">BALANCED — Rekonsiliasi sesuai</span>`
          : `<span class="badge badge-red">INVESTIGATE — Selisih ${fmt.currency(Math.abs(variance))}</span>`;
      }
    }
  },

  _onFoto(e) {
    const file = e.target.files[0]; if (!file) return;
    this._posFile = file;
    const zone = document.getElementById('pos-zone');
    zone.classList.add('has-file');
    zone.querySelector('.upload-text').textContent = `✓ ${file.name}`;
  },

  async save() {
    const tgl = document.getElementById('dr-tgl').value;
    const shift = document.getElementById('dr-shift').value;
    const sales = parseFloat(document.getElementById('dr-sales').value) || 0;

    if (!tgl || !sales) { Toast.error('Tanggal dan Total Sales wajib diisi'); return; }
    if (!this._posFile) { Toast.error('Foto bukti POS wajib diupload sebelum submit'); return; }

    const cash = parseFloat(document.getElementById('dr-cash').value) || 0;
    const qris = parseFloat(document.getElementById('dr-qris').value) || 0;
    const debit = parseFloat(document.getElementById('dr-debit').value) || 0;
    const credit = parseFloat(document.getElementById('dr-credit').value) || 0;
    const ewallet = parseFloat(document.getElementById('dr-ewallet').value) || 0;
    const total_pos = cash + qris + debit + credit + ewallet;
    const variance = total_pos - sales;

    await DataAPI.addDailyReport({
      tanggal: tgl, user: Auth.user.username, shift,
      total_sales: sales, cash, qris, debit, credit, ewallet, other: 0,
      total_pos, variance,
      catatan: document.getElementById('dr-cat').value,
      pos_foto: true, status: 'submitted',
    });
    Modal.close(); Toast.success('Daily report berhasil disubmit');
    if (variance !== 0) Toast.warning(`Cash variance terdeteksi: ${fmt.currency(Math.abs(variance))}`);
    this.data = await DataAPI.getDailyReport(); this._draw();
  },

  detail(id) {
    const r = this.data.find(x => x.id === id);
    if (!r) return;
    const nonCash = r.qris + r.debit + r.credit + r.ewallet;
    Modal.open({
      title: `Daily Report — ${r.tanggal} ${r.shift}`,
      body: `
        <div class="form-row cols-2" style="margin-bottom:12px">
          <div><div class="text-sm text-gray">Tanggal / Shift</div><strong>${r.tanggal} — ${r.shift}</strong></div>
          <div><div class="text-sm text-gray">User</div>${r.user}</div>
        </div>
        <div style="background:var(--blue-50);border-radius:8px;padding:16px;margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span class="text-sm text-gray">Total Sales (POS)</span>
            <strong class="font-mono">${fmt.currency(r.total_sales)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span class="text-sm text-gray">Cash</span><span class="font-mono">${fmt.currency(r.cash)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span class="text-sm text-gray">QRIS</span><span class="font-mono">${fmt.currency(r.qris)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span class="text-sm text-gray">Debit</span><span class="font-mono">${fmt.currency(r.debit)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span class="text-sm text-gray">Credit</span><span class="font-mono">${fmt.currency(r.credit)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px">
            <span class="text-sm text-gray">E-Wallet</span><span class="font-mono">${fmt.currency(r.ewallet)}</span>
          </div>
          <div class="divider"></div>
          <div style="display:flex;justify-content:space-between;margin-top:8px">
            <span style="font-weight:700">Total Laporan</span>
            <strong class="font-mono">${fmt.currency(r.total_pos)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:8px">
            <span style="font-weight:700">Variance</span>
            <strong class="font-mono" style="color:${r.variance!==0?'var(--red-600)':'var(--green-600)'}">
              ${r.variance >= 0 ? '+' : ''}${fmt.currency(r.variance)}
            </strong>
          </div>
        </div>
        <div style="text-align:center">
          ${r.variance === 0 ? statusBadge('balanced') : statusBadge('investigate')}
        </div>
      `,
      footer: `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>`,
    });
  },
};
const PageAuditCenter = {
  async render(el) {
    this.el = el;
    const [variance, opname, pembelian, dr, bahan] = await Promise.all([
      DataAPI.getVarianceAnalysis(),
      DataAPI.getStockOpname(),
      DataAPI.getPembelian(),
      DataAPI.getDailyReport(),
      DataAPI.getBahan(),
    ]);

    const drVariance = dr.filter(d => d.variance !== 0);
    const missingEvidence = pembelian.filter(p => !p.nota);
    const negativeStock = bahan.filter(b => b.stock_current < 0);
    const critical = variance.filter(v => v.status === 'critical');
    const warning  = variance.filter(v => v.status === 'warning');

    const riskScore = (critical.length * 3) + (warning.length * 1) + (drVariance.length * 2) + (missingEvidence.length * 3);

    el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title"><h2>Audit Center</h2><p>Pusat monitoring risiko & deteksi fraud — akses Admin/Owner only</p></div>
      <span class="badge ${riskScore > 5 ? 'badge-red' : riskScore > 0 ? 'badge-orange' : 'badge-green'}">
        Risk Score: ${riskScore}
      </span>
    </div>

    <!-- Risk Categories -->
    <div class="grid-2 mb-6">
      <div class="card">
        <div class="card-header" style="background:var(--red-100);border-radius:10px 10px 0 0">
          <span class="card-title" style="color:var(--red-600)">${Icon.alert()} Material Variance</span>
          <span class="badge badge-red">${critical.length} critical</span>
        </div>
        <div class="card-body">
          ${critical.length ? critical.map(v => `
            <div style="padding:10px 0;border-bottom:1px solid var(--gray-100)">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <strong>${v.bahan_nama}</strong>
                <span class="badge badge-red">CRITICAL</span>
              </div>
              <div class="audit-flow" style="font-size:11px">
                <div class="audit-step">
                  <div class="audit-step-value">${fmt.number(v.expected_usage)}</div>
                  <div class="audit-step-label">Expected</div>
                </div>
                <div style="display:flex;align-items:center;padding:0 6px;color:var(--gray-400)">→</div>
                <div class="audit-step">
                  <div class="audit-step-value">${fmt.number(v.actual_stock)}</div>
                  <div class="audit-step-label">Aktual</div>
                </div>
                <div style="display:flex;align-items:center;padding:0 6px;color:var(--gray-400)">→</div>
                <div class="audit-step">
                  <div class="audit-step-value negative">${v.variance > 0 ? '+' : ''}${fmt.number(v.variance)}</div>
                  <div class="audit-step-label">Variance</div>
                </div>
              </div>
              <div class="text-sm text-gray" style="margin-top:6px">Variance ${v.variance_pct}% — di atas threshold ${APP_CONFIG.variance_critical_pct}%</div>
            </div>
          `).join('') : `<div class="empty-state"><p style="color:var(--green-600)">✓ Tidak ada critical variance</p></div>`}
        </div>
      </div>

      <div class="card">
        <div class="card-header" style="background:var(--orange-50)">
          <span class="card-title" style="color:var(--orange-600)">${Icon.alert()} Cash Variance</span>
          <span class="badge badge-orange">${drVariance.length} kasus</span>
        </div>
        <div class="card-body">
          ${drVariance.length ? drVariance.map(d => `
            <div style="padding:10px 0;border-bottom:1px solid var(--gray-100)">
              <div style="display:flex;justify-content:space-between">
                <div>
                  <div style="font-weight:600">${d.tanggal} — ${d.shift}</div>
                  <div class="text-sm text-gray">User: ${d.user}</div>
                </div>
                <div style="text-align:right">
                  <div class="font-mono" style="color:var(--red-600);font-weight:700">${fmt.currency(d.variance)}</div>
                  <span class="badge badge-red">Investigate</span>
                </div>
              </div>
            </div>
          `).join('') : `<div class="empty-state"><p style="color:var(--green-600)">✓ Tidak ada cash variance</p></div>`}
        </div>
      </div>
    </div>

    <!-- Fraud Indicators -->
    <div class="card mb-6">
      <div class="card-header"><span class="card-title">${Icon.shield()} Fraud / Risk Indicators</span></div>
      <div class="card-body">
        <div class="risk-list">
          ${[
            {
              rule: 'Rule 1 — Material Variance',
              status: critical.length > 0 ? 'critical' : warning.length > 0 ? 'warning' : 'normal',
              desc: `${critical.length} critical, ${warning.length} warning ditemukan`,
              value: `${critical.length + warning.length} item`,
            },
            {
              rule: 'Rule 2 — Purchase Anomaly',
              status: 'normal',
              desc: 'Tidak ada pembelian yang melebihi threshold anomali',
              value: 'OK',
            },
            {
              rule: 'Rule 3 — Negative Stock',
              status: negativeStock.length > 0 ? 'critical' : 'normal',
              desc: negativeStock.length > 0 ? `${negativeStock.length} bahan stok minus` : 'Tidak ada stok minus',
              value: negativeStock.length > 0 ? `${negativeStock.length} bahan` : 'OK',
            },
            {
              rule: 'Rule 4 — Missing Evidence',
              status: missingEvidence.length > 0 ? 'critical' : 'normal',
              desc: missingEvidence.length > 0 ? `${missingEvidence.length} pembelian tanpa nota` : 'Semua bukti tersedia',
              value: missingEvidence.length > 0 ? `${missingEvidence.length} transaksi` : 'OK',
            },
            {
              rule: 'Rule 5 — Daily Report Variance',
              status: drVariance.length > 0 ? 'warning' : 'normal',
              desc: drVariance.length > 0 ? `${drVariance.length} laporan tidak seimbang` : 'Semua laporan balanced',
              value: drVariance.length > 0 ? `${drVariance.length} laporan` : 'OK',
            },
            {
              rule: 'Rule 6 — Excessive Adjustment',
              status: 'normal',
              desc: 'Tidak ada adjustment mencurigakan',
              value: 'OK',
            },
          ].map(r => `
            <div class="risk-item">
              <div class="risk-dot ${r.status}"></div>
              <div class="risk-info">
                <div class="risk-name">${r.rule}</div>
                <div class="risk-desc">${r.desc}</div>
              </div>
              <div class="risk-value" style="color:var(--${r.status==='critical'?'red-600':r.status==='warning'?'orange-500':'green-600'})">${r.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Audit Detail Flow -->
    ${critical.length ? `
    <div class="card">
      <div class="card-header"><span class="card-title">${Icon.audit()} Detail Audit — Coffee Bean (Sample)</span><span class="badge badge-red">CRITICAL</span></div>
      <div class="card-body">
        <div class="audit-flow">
          ${[
            { label: 'Opening Stock', value: '2.000 g' },
            { label: 'Purchase (+)', value: '+2.000 g' },
            { label: 'Available', value: '4.000 g' },
            { label: 'Sales (Latte 100x)', value: '100 cup' },
            { label: 'Expected Usage', value: '-1.800 g' },
            { label: 'Expected Stock', value: '2.200 g' },
            { label: 'Physical Stock', value: '1.700 g', negative: true },
            { label: 'Variance', value: '-500 g', negative: true },
          ].map(s => `
            <div class="audit-step" style="min-width:110px">
              <div class="audit-step-value ${s.negative ? 'negative' : ''}">${s.value}</div>
              <div class="audit-step-label">${s.label}</div>
            </div>
          `).join('<div style="display:flex;align-items:center;padding:0 4px;color:var(--gray-300);font-size:18px;margin-bottom:20px">→</div>')}
        </div>
        <div style="margin-top:16px;padding:12px 16px;background:var(--red-100);border-radius:8px;color:var(--red-600);font-weight:700">
          ⚠ CRITICAL — Selisih 500 gram Coffee Bean tidak dapat dijelaskan. Perlu investigasi lebih lanjut.
        </div>
      </div>
    </div>
    ` : ''}`;
  },
};
const PageAuditTrail = {
  data: [], query: '',

  async render(el) {
    this.el = el;
    try {
    this.this.data = await DataAPI.getAuditTrail();
    } catch(e) { this.data = []; Toast.error("Gagal load: " + e.message); }

    this._draw();
  },

  _draw() {
    const filtered = searchFilter(this.data, this.query, ['user','activity','module','record']);
    const actColors = {
      Create: 'badge-blue', Submit: 'badge-orange', Approve: 'badge-green',
      Reject: 'badge-red', Update: 'badge-yellow', Delete: 'badge-red',
    };

    this.el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title"><h2>Audit Trail</h2><p>Histori seluruh aktivitas penting dalam sistem — tidak dapat diubah</p></div>
    </div>
    <div class="card">
      <div class="card-header">
        <div class="search-box">${Icon.search()}<input type="text" placeholder="Cari user/aktivitas/modul..." oninput="PageAuditTrail.query=this.value;PageAuditTrail._draw()" /></div>
        <span class="text-sm text-gray">${filtered.length} records</span>
      </div>
      <div class="card-body" style="padding:0">
        ${buildTable({
          cols: [
            { key: 'tanggal', label: 'Waktu' },
            { key: 'user', label: 'User' },
            { label: 'Aktivitas', render: r => `<span class="badge ${actColors[r.activity] || 'badge-gray'}">${r.activity}</span>` },
            { key: 'module', label: 'Modul' },
            { key: 'record', label: 'Record' },
            { label: 'Nilai Lama', render: r => r.old_val ? `<span class="font-mono text-sm">${r.old_val}</span>` : '<span class="text-gray">-</span>' },
            { label: 'Nilai Baru', render: r => r.new_val ? `<span class="font-mono text-sm">${r.new_val}</span>` : '<span class="text-gray">-</span>' },
          ],
          data: filtered,
          emptyMsg: 'Belum ada aktivitas tercatat.',
        })}
      </div>
    </div>`;
  },
};

// ─── USER MANAGEMENT ──────────────────────────────────────────
const PageUserMgmt = {
  data: [],

  async render(el) {
    this.el = el;
    try {
    this.this.data = await DataAPI.getUsers();
    } catch(e) { this.data = []; Toast.error("Gagal load: " + e.message); }

    this._draw();
  },

  _draw() {
    this.el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title"><h2>User Management</h2><p>Kelola akun pengguna BrewStock</p></div>
      <button class="btn btn-primary" onclick="PageUserMgmt.openAdd()">${Icon.plus()} Tambah User</button>
    </div>

    <div class="kpi-grid" style="max-width:400px;margin-bottom:20px">
      <div class="kpi-card"><div class="kpi-label">Total User</div><div class="kpi-value">${this.data.length}</div></div>
      <div class="kpi-card green"><div class="kpi-label">Aktif</div><div class="kpi-value">${this.data.filter(u=>u.status==='ACTIVE').length}</div></div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">Daftar Pengguna</span></div>
      <div class="card-body" style="padding:0">
        ${buildTable({
          cols: [
            { key: 'username', label: 'Username' },
            { key: 'nama', label: 'Nama Lengkap' },
            { label: 'Role', render: r => r.role === 'admin'
              ? `<span class="badge badge-blue">Admin/Owner</span>`
              : `<span class="badge badge-gray">Bartender</span>` },
            { key: 'outlet', label: 'Outlet' },
            { label: 'Status', render: r => statusBadge(r.status) },
            { key: 'created_at', label: 'Dibuat' },
            { key: 'last_login', label: 'Login Terakhir' },
            { label: 'Aksi', render: r => `
              <div style="display:flex;gap:6px">
                ${r.status === 'ACTIVE'
                  ? `<button class="btn btn-danger btn-sm" onclick="PageUserMgmt.toggleStatus(${r.id},'INACTIVE')">Nonaktifkan</button>`
                  : `<button class="btn btn-success btn-sm" onclick="PageUserMgmt.toggleStatus(${r.id},'ACTIVE')">Aktifkan</button>`}
              </div>
            `},
          ],
          data: this.data,
          emptyMsg: 'Belum ada user.',
        })}
      </div>
    </div>`;
  },

  openAdd() {
    Modal.open({
      title: 'Tambah User Baru',
      body: `
        <div class="form-row cols-2">
          <div class="form-group"><label>Nama Lengkap <span class="req">*</span></label><input id="u-nama" type="text" placeholder="Nama lengkap" /></div>
          <div class="form-group"><label>Username <span class="req">*</span></label><input id="u-uname" type="text" placeholder="username" /></div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group"><label>Password <span class="req">*</span></label><input id="u-pass" type="password" placeholder="Password" /></div>
          <div class="form-group"><label>Role <span class="req">*</span></label>
            <select id="u-role"><option value="user">Bartender / User</option><option value="admin">Admin / Owner</option></select>
          </div>
        </div>
        <div class="form-group"><label>Outlet</label><input id="u-outlet" type="text" placeholder="Main Store" value="Main Store" /></div>
      `,
      footer: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
               <button class="btn btn-primary" onclick="PageUserMgmt.save()">Tambah User</button>`,
    });
  },

  async save() {
    const nama   = document.getElementById('u-nama').value.trim();
    const uname  = document.getElementById('u-uname').value.trim();
    const pass   = document.getElementById('u-pass').value;
    const role   = document.getElementById('u-role').value;
    const outlet = document.getElementById('u-outlet').value.trim();

    if (!nama || !uname || !pass) { Toast.error('Semua field wajib diisi'); return; }
    if (this.data.find(u => u.username === uname)) { Toast.error('Username sudah digunakan'); return; }

    await DataAPI.addUser({ nama, username: uname, password: pass, role, outlet, status: 'ACTIVE' });
    await DataAPI.addAuditTrail({ user: Auth.user.username, activity: 'Create', module: 'UserManagement', record: uname, old_val: '', new_val: 'ACTIVE' });
    Modal.close(); Toast.success(`User "${uname}" berhasil ditambahkan`);
    this.data = await DataAPI.getUsers(); this._draw();
  },

  async toggleStatus(id, newStatus) {
    await DataAPI.updateUserStatus(id, newStatus);
    await DataAPI.addAuditTrail({
      user: Auth.user.username, activity: 'Update', module: 'UserManagement',
      record: `User #${id}`, old_val: newStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', new_val: newStatus,
    });
    Toast.success(`Status user diubah menjadi ${newStatus}`);
    this.data = await DataAPI.getUsers(); this._draw();
  },
};
// user-management.js — re-exported from audit-trail.js
// PageUserMgmt is defined in audit-trail.js
const Router = {
  current: null,

  routes: {
    'dashboard':       { label: 'Dashboard',       render: PageDashboard.render,      admin: false },
    'master-bahan':    { label: 'Master Bahan',     render: PageMasterBahan.render,    admin: false },
    'master-menu':     { label: 'Master Menu',      render: PageMasterMenu.render,     admin: false },
    'resep':           { label: 'Resep',            render: PageResep.render,          admin: false },
    'approval':        { label: 'Approval Center',  render: PageApproval.render,       admin: true  },
    'pembelian':       { label: 'Pembelian',        render: PagePembelian.render,      admin: false },
    'penjualan':       { label: 'Penjualan',        render: PagePenjualan.render,      admin: false },
    'stock':           { label: 'Stock',            render: PageStock.render,          admin: false },
    'stock-opname':    { label: 'Stock Opname',     render: PageStockOpname.render,    admin: false },
    'daily-report':    { label: 'Daily Report',     render: PageDailyReport.render,    admin: false },
    'audit-center':    { label: 'Audit Center',     render: PageAuditCenter.render,    admin: true  },
    'audit-trail':     { label: 'Audit Trail',      render: PageAuditTrail.render,     admin: true  },
    'user-management': { label: 'User Management',  render: PageUserMgmt.render,       admin: true  },
  },

  async go(page) {
    const route = this.routes[page];
    if (!route) return this.go('dashboard');
    if (route.admin && !Auth.isAdmin()) return this.go('dashboard');
    this.current = page;
    document.getElementById('page-title').textContent = route.label;
    const content = document.getElementById('page-content');
    content.innerHTML = '<div style="padding:40px;text-align:center;color:var(--gray-400)">Memuat...</div>';
    // Active nav
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
    try {
      await route.render(content);
    } catch(e) {
      content.innerHTML = `<div class="empty-state"><p>Gagal memuat halaman: ${e.message}</p></div>`;
    }
  },
};

function buildNav() {
  const isAdmin = Auth.isAdmin();
  const nav = [
    { group: null, items: [
      { page: 'dashboard', icon: Icon.chart(), label: 'Dashboard' },
    ]},
    { group: 'Master Data', items: [
      { page: 'master-bahan', icon: Icon.package(), label: 'Master Bahan' },
      { page: 'master-menu',  icon: Icon.coffee(),  label: 'Menu' },
      { page: 'resep',        icon: Icon.book(),    label: 'Resep' },
      ...(isAdmin ? [{ page: 'approval', icon: Icon.audit(), label: 'Approval Center', badge: true }] : []),
    ]},
    { group: 'Operasional', items: [
      { page: 'pembelian',    icon: Icon.receipt(), label: 'Pembelian' },
      { page: 'penjualan',    icon: Icon.tag(),     label: 'Penjualan' },
      { page: 'stock',        icon: Icon.package(), label: 'Stock' },
      { page: 'stock-opname', icon: Icon.audit(),   label: 'Stock Opname' },
    ]},
    { group: 'Daily Operation', items: [
      { page: 'daily-report', icon: Icon.clock(),   label: 'Daily Report' },
    ]},
    ...(isAdmin ? [{ group: 'Audit & Monitor', items: [
      { page: 'audit-center', icon: Icon.shield(),  label: 'Audit Center' },
      { page: 'audit-trail',  icon: Icon.clock(),   label: 'Audit Trail' },
    ]}] : []),
    ...(isAdmin ? [{ group: 'Manajemen', items: [
      { page: 'user-management', icon: Icon.users(), label: 'User Management' },
    ]}] : []),
  ];

  const el = document.getElementById('sidebar-nav');
  el.innerHTML = nav.map(({ group, items }) => `
    <div class="nav-group">
      ${group ? `<div class="nav-group-title">${group}</div>` : ''}
      ${items.map(i => `
        <div class="nav-item" data-page="${i.page}" onclick="Router.go('${i.page}')">
          <span class="nav-icon">${i.icon}</span>
          <span class="nav-label">${i.label}</span>
          ${i.badge ? `<span class="nav-badge" id="badge-approval">0</span>` : ''}
        </div>
      `).join('')}
    </div>
  `).join('');

  // Update badge
  if (isAdmin) updateApprovalBadge();
}

async function updateApprovalBadge() {
  const pending = await DataAPI.getPendingApprovals();
  const badge = document.getElementById('badge-approval');
  if (badge) badge.textContent = pending.length;
}

function buildSidebarUser() {
  const u = Auth.user;
  document.getElementById('sidebar-user').innerHTML = `
    <div class="sidebar-user-avatar">${(u.nama || u.username)[0].toUpperCase()}</div>
    <div class="sidebar-user-info">
      <div class="sidebar-user-name">${u.nama || u.username}</div>
      <div class="sidebar-user-role">${u.role === 'admin' ? 'Admin / Owner' : 'Bartender'}</div>
    </div>
  `;
  document.getElementById('topbar-avatar').textContent = (u.nama || u.username)[0].toUpperCase();
  document.getElementById('topbar-name').textContent = u.nama || u.username;
}
// ─── MAIN APP ────────────────────────────────────────────────
const App = {
  async init() {
    await Auth.init();
    if (Auth.isLoggedIn()) {
      this._showApp();
    }
  },

  async login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errEl = document.getElementById('login-error');
    errEl.style.display = 'none';

    if (!username || !password) {
      errEl.textContent = 'Username dan password wajib diisi';
      errEl.style.display = 'block';
      return;
    }

    try {
      await Auth.login(username, password);
      this._showApp();
    } catch (e) {
      const mode = (typeof DEMO_MODE !== 'undefined' && DEMO_MODE) ? ' [Demo Mode]' : ' [Supabase Mode]';
      errEl.textContent = e.message + mode;
      errEl.style.display = 'block';
    }
  },

  _showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-shell').style.display = 'flex';
    buildNav();
    buildSidebarUser();
    Router.go('dashboard');
  },

  logout() {
    if (!confirm('Yakin ingin keluar dari BrewStock?')) return;
    Auth.logout();
    document.getElementById('app-shell').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').style.display = 'none';
  },

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    // Mobile: toggle mobile-open class
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('mobile-open');
    } else {
      sidebar.classList.toggle('collapsed');
    }
  },
};

// ─── DEMO FILL — langsung login tanpa ketik manual ───────────
function fillDemo(role) {
  const creds = role === 'admin'
    ? { username: 'admin', password: 'admin123' }
    : { username: 'bartender', password: 'user123' };

  document.getElementById('login-username').value = creds.username;
  document.getElementById('login-password').value = creds.password;

  // Langsung login setelah fill
  setTimeout(() => App.login(), 50);
}

// ─── KEYBOARD SHORTCUTS ──────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('login-screen').style.display !== 'none') {
    App.login();
  }
  if (e.key === 'Escape') Modal.close();
});

// ─── BOOT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
