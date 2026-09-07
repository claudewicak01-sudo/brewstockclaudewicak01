/**
 * BrewStock — Supabase Client & Demo Data
 * Jika SUPABASE_URL masih placeholder, app berjalan dalam DEMO MODE
 * menggunakan data dummy in-memory.
 */

const DEMO_MODE = SUPABASE_URL.includes('YOUR_PROJECT');

// ─── SUPABASE CLIENT ────────────────────────────────────────
let _sb = null;
async function getSupabase() {
  if (_sb) return _sb;
  if (DEMO_MODE) return null;
  // Load Supabase CDN dynamically
  if (!window.supabase) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  return _sb;
}

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
    if (DEMO_MODE) {
      const u = DB.users.find(x => x.username === username && x.password === password);
      if (!u) throw new Error('Username atau password salah');
      if (u.status === 'INACTIVE') throw new Error('Akun tidak aktif');
      u.last_login = new Date().toLocaleString('id-ID');
      return u;
    }
    const sb = await getSupabase();
    const { data, error } = await sb.from('users').select('*').eq('username', username).eq('password', password).single();
    if (error || !data) throw new Error('Username atau password salah');
    return data;
  },

  // BAHAN
  async getBahan() {
    if (DEMO_MODE) return [...DB.bahan];
    const sb = await getSupabase();
    const { data } = await sb.from('bahan').select('*').order('kode');
    return data || [];
  },
  async addBahan(item) {
    if (DEMO_MODE) { const r = {...item, id: nextId()}; DB.bahan.push(r); return r; }
    const sb = await getSupabase();
    const { data } = await sb.from('bahan').insert(item).select().single();
    return data;
  },
  async updateBahanStatus(id, status, notes) {
    if (DEMO_MODE) {
      const r = DB.bahan.find(x => x.id === id);
      if (r) r.status = status;
      DataAPI.addAuditTrail({ user: Auth.user.username, activity: status === 'approved' ? 'Approve' : 'Reject', module: 'Material', record: r?.nama || '', old_val: 'Waiting', new_val: status });
      return r;
    }
    const sb = await getSupabase();
    const { data } = await sb.from('bahan').update({ status, notes }).eq('id', id).select().single();
    return data;
  },

  // MENU
  async getMenu() {
    if (DEMO_MODE) return [...DB.menu];
    const sb = await getSupabase();
    const { data } = await sb.from('menu').select('*').order('kode');
    return data || [];
  },
  async addMenu(item) {
    if (DEMO_MODE) { const r = {...item, id: nextId()}; DB.menu.push(r); return r; }
    const sb = await getSupabase();
    const { data } = await sb.from('menu').insert(item).select().single();
    return data;
  },
  async updateMenuStatus(id, status) {
    if (DEMO_MODE) {
      const r = DB.menu.find(x => x.id === id);
      if (r) r.status = status;
      DataAPI.addAuditTrail({ user: Auth.user.username, activity: status === 'approved' ? 'Approve' : 'Reject', module: 'Menu', record: r?.nama || '', old_val: 'Waiting', new_val: status });
      return r;
    }
    const sb = await getSupabase();
    const { data } = await sb.from('menu').update({ status }).eq('id', id).select().single();
    return data;
  },

  // RESEP
  async getResep() {
    if (DEMO_MODE) return [...DB.resep];
    const sb = await getSupabase();
    const { data } = await sb.from('resep').select('*');
    return data || [];
  },
  async addResepLines(lines) {
    if (DEMO_MODE) { lines.forEach(l => { DB.resep.push({...l, id: nextId()}); }); return lines; }
    const sb = await getSupabase();
    const { data } = await sb.from('resep').insert(lines).select();
    return data;
  },

  // PEMBELIAN
  async getPembelian() {
    if (DEMO_MODE) return [...DB.pembelian].reverse();
    const sb = await getSupabase();
    const { data } = await sb.from('pembelian').select('*').order('tanggal', { ascending: false });
    return data || [];
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
    const sb = await getSupabase();
    const { data } = await sb.from('pembelian').insert(item).select().single();
    return data;
  },

  // PENJUALAN
  async getPenjualan() {
    if (DEMO_MODE) return [...DB.penjualan].reverse();
    const sb = await getSupabase();
    const { data } = await sb.from('penjualan').select('*').order('tanggal', { ascending: false });
    return data || [];
  },
  async addPenjualan(item) {
    if (DEMO_MODE) {
      const r = {...item, id: nextId()};
      DB.penjualan.push(r);
      DataAPI.addAuditTrail({ user: Auth.user.username, activity: 'Submit', module: 'Sales', record: `${r.menu_nama} x${r.qty}`, old_val: '', new_val: 'Submitted' });
      return r;
    }
    const sb = await getSupabase();
    const { data } = await sb.from('penjualan').insert(item).select().single();
    return data;
  },

  // STOCK OPNAME
  async getStockOpname() {
    if (DEMO_MODE) return [...DB.stock_opname].reverse();
    const sb = await getSupabase();
    const { data } = await sb.from('stock_opname').select('*').order('tanggal', { ascending: false });
    return data || [];
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
    const sb = await getSupabase();
    const { data } = await sb.from('stock_opname').insert(item).select().single();
    return data;
  },

  // DAILY REPORT
  async getDailyReport() {
    if (DEMO_MODE) return [...DB.daily_report].reverse();
    const sb = await getSupabase();
    const { data } = await sb.from('daily_report').select('*').order('tanggal', { ascending: false });
    return data || [];
  },
  async addDailyReport(item) {
    if (DEMO_MODE) {
      const r = {...item, id: nextId()};
      DB.daily_report.push(r);
      DataAPI.addAuditTrail({ user: Auth.user.username, activity: 'Submit', module: 'DailyReport', record: `${r.tanggal} ${r.shift}`, old_val: 'Draft', new_val: 'Submitted' });
      return r;
    }
    const sb = await getSupabase();
    const { data } = await sb.from('daily_report').insert(item).select().single();
    return data;
  },

  // USERS
  async getUsers() {
    if (DEMO_MODE) return [...DB.users].map(u => ({...u, password: undefined}));
    const sb = await getSupabase();
    const { data } = await sb.from('users').select('id,username,nama,role,outlet,status,created_at,last_login');
    return data || [];
  },
  async addUser(item) {
    if (DEMO_MODE) {
      const r = {...item, id: nextId(), created_at: new Date().toISOString(), last_login: '-'};
      DB.users.push(r);
      return r;
    }
    const sb = await getSupabase();
    const { data } = await sb.from('users').insert(item).select().single();
    return data;
  },
  async updateUserStatus(id, status) {
    if (DEMO_MODE) {
      const u = DB.users.find(x => x.id === id);
      if (u) u.status = status;
      return u;
    }
    const sb = await getSupabase();
    const { data } = await sb.from('users').update({ status }).eq('id', id).select().single();
    return data;
  },

  // AUDIT TRAIL
  async getAuditTrail() {
    if (DEMO_MODE) return [...DB.audit_trail].reverse();
    const sb = await getSupabase();
    const { data } = await sb.from('audit_trail').select('*').order('tanggal', { ascending: false }).limit(200);
    return data || [];
  },
  async addAuditTrail(item) {
    const record = { ...item, id: nextId(), tanggal: new Date().toLocaleString('id-ID') };
    if (DEMO_MODE) { DB.audit_trail.push(record); return record; }
    const sb = await getSupabase();
    await sb.from('audit_trail').insert(record);
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
