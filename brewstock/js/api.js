// ─── DEMO MODE ───────────────────────────────────────────────
const DEMO_MODE = (
  typeof SUPABASE_URL === 'undefined' ||
  !SUPABASE_URL || SUPABASE_URL.includes('YOUR_PROJECT') ||
  !SUPABASE_URL.startsWith('https://')
);

// ─── PURE FETCH HELPERS ──────────────────────────────────────
const H = () => ({
  'apikey': SUPABASE_KEY,
  'Authorization': 'Bearer ' + SUPABASE_KEY,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

async function sbFetch(table, params = '') {
  if (DEMO_MODE) return [];
  const url = `${SUPABASE_URL}/rest/v1/${table}${params ? '?' + params : ''}`;
  const res = await fetch(url, { headers: H() });
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.message || res.statusText); }
  return res.json();
}

async function sbInsert(table, body) {
  if (DEMO_MODE) return Array.isArray(body) ? body : [body];
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const res = await fetch(url, { method:'POST', headers:{...H(),'Prefer':'return=representation'}, body: JSON.stringify(body) });
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.message || res.statusText); }
  return res.json();
}

async function sbUpdate(table, match, body) {
  if (DEMO_MODE) return [body];
  const qs = Object.entries(match).map(([k,v])=>`${k}=eq.${encodeURIComponent(v)}`).join('&');
  const url = `${SUPABASE_URL}/rest/v1/${table}?${qs}`;
  const res = await fetch(url, { method:'PATCH', headers:{...H(),'Prefer':'return=representation'}, body: JSON.stringify(body) });
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.message || res.statusText); }
  return res.json();
}

// ─── DEMO DATA ───────────────────────────────────────────────
const _DB = {
  users: [
    { id:1, username:'admin',     password:'admin123', nama:'Ahmad Fauzi',  role:'admin', status:'ACTIVE', outlet:'Main Store' },
    { id:2, username:'bartender', password:'user123',  nama:'Budi Santoso', role:'user',  status:'ACTIVE', outlet:'Main Store' },
  ],
  bahan: [
    { id:1, kode:'BB001', nama:'Coffee Bean',   satuan:'gram', min_stock:500,  max_stock:5000,  harga_ref:150, stock_current:2200, status:'approved', supplier:'CV Kopi Nusantara' },
    { id:2, kode:'BB002', nama:'Fresh Milk',    satuan:'ml',   min_stock:2000, max_stock:20000, harga_ref:18,  stock_current:8500, status:'approved', supplier:'PT Dairy Segar' },
    { id:3, kode:'BB003', nama:'Sugar',         satuan:'gram', min_stock:500,  max_stock:5000,  harga_ref:14,  stock_current:1800, status:'approved', supplier:'Toko Manis Jaya' },
    { id:4, kode:'BB004', nama:'Caramel Syrup', satuan:'ml',   min_stock:200,  max_stock:2000,  harga_ref:85,  stock_current:650,  status:'approved', supplier:'PT Syrup Prima' },
  ],
  menu: [
    { id:1, kode:'MN001', nama:'Latte',      kategori:'Coffee',    harga:28000, status:'approved' },
    { id:2, kode:'MN002', nama:'Americano',  kategori:'Coffee',    harga:22000, status:'approved' },
    { id:3, kode:'MN003', nama:'Cappuccino', kategori:'Coffee',    harga:30000, status:'approved' },
    { id:4, kode:'MN004', nama:'Caramel Latte', kategori:'Specialty', harga:35000, status:'approved' },
  ],
  resep: [
    { id:1, menu_id:1, menu_nama:'Latte',         bahan_id:1, bahan_nama:'Coffee Bean',   qty:18,  satuan:'gram' },
    { id:2, menu_id:1, menu_nama:'Latte',         bahan_id:2, bahan_nama:'Fresh Milk',    qty:150, satuan:'ml' },
    { id:3, menu_id:1, menu_nama:'Latte',         bahan_id:3, bahan_nama:'Sugar',         qty:10,  satuan:'gram' },
    { id:4, menu_id:2, menu_nama:'Americano',     bahan_id:1, bahan_nama:'Coffee Bean',   qty:20,  satuan:'gram' },
    { id:5, menu_id:3, menu_nama:'Cappuccino',    bahan_id:1, bahan_nama:'Coffee Bean',   qty:18,  satuan:'gram' },
    { id:6, menu_id:3, menu_nama:'Cappuccino',    bahan_id:2, bahan_nama:'Fresh Milk',    qty:120, satuan:'ml' },
    { id:7, menu_id:4, menu_nama:'Caramel Latte', bahan_id:1, bahan_nama:'Coffee Bean',   qty:18,  satuan:'gram' },
    { id:8, menu_id:4, menu_nama:'Caramel Latte', bahan_id:2, bahan_nama:'Fresh Milk',    qty:150, satuan:'ml' },
    { id:9, menu_id:4, menu_nama:'Caramel Latte', bahan_id:4, bahan_nama:'Caramel Syrup', qty:30,  satuan:'ml' },
  ],
  penjualan: [
    { id:1, tanggal:'2025-09-06', shift:'Pagi',  menu_id:1, menu_nama:'Latte',         qty:45, harga:28000, total:1260000, metode:'Mixed', created_by:'bartender' },
    { id:2, tanggal:'2025-09-06', shift:'Pagi',  menu_id:2, menu_nama:'Americano',     qty:28, harga:22000, total:616000,  metode:'Cash',  created_by:'bartender' },
    { id:3, tanggal:'2025-09-06', shift:'Siang', menu_id:3, menu_nama:'Cappuccino',    qty:32, harga:30000, total:960000,  metode:'QRIS',  created_by:'bartender' },
    { id:4, tanggal:'2025-09-05', shift:'Pagi',  menu_id:1, menu_nama:'Latte',         qty:52, harga:28000, total:1456000, metode:'Mixed', created_by:'bartender' },
    { id:5, tanggal:'2025-09-05', shift:'Siang', menu_id:4, menu_nama:'Caramel Latte', qty:20, harga:35000, total:700000,  metode:'QRIS',  created_by:'bartender' },
    { id:6, tanggal:'2025-09-04', shift:'Pagi',  menu_id:1, menu_nama:'Latte',         qty:38, harga:28000, total:1064000, metode:'Mixed', created_by:'bartender' },
    { id:7, tanggal:'2025-09-04', shift:'Siang', menu_id:2, menu_nama:'Americano',     qty:25, harga:22000, total:550000,  metode:'Cash',  created_by:'bartender' },
    { id:8, tanggal:'2025-09-03', shift:'Pagi',  menu_id:3, menu_nama:'Cappuccino',    qty:40, harga:30000, total:1200000, metode:'Mixed', created_by:'bartender' },
    { id:9, tanggal:'2025-09-03', shift:'Siang', menu_id:1, menu_nama:'Latte',         qty:30, harga:28000, total:840000,  metode:'QRIS',  created_by:'bartender' },
    { id:10,tanggal:'2025-09-02', shift:'Pagi',  menu_id:4, menu_nama:'Caramel Latte', qty:15, harga:35000, total:525000,  metode:'Mixed', created_by:'bartender' },
  ],
  stock_opname: [],
  daily_report: [],
  audit_trail: [],
  _nextId: 100,
};

function _nid() { return ++_DB._nextId; }

// ─── DATA API ────────────────────────────────────────────────
const DataAPI = {

  // LOGIN
  async login(username, password) {
    username = (username||'').trim().toLowerCase();
    password = (password||'').trim();
    if (DEMO_MODE) {
      const u = _DB.users.find(x => x.username.toLowerCase()===username && x.password===password);
      if (!u) throw new Error('Username atau password salah');
      if (u.status==='INACTIVE') throw new Error('Akun tidak aktif');
      return {...u};
    }
    const all = await sbFetch('users','select=*');
    const u = all.find(x => x.username.toLowerCase()===username && x.password===password);
    if (!u) throw new Error('Username atau password salah');
    if (u.status==='INACTIVE') throw new Error('Akun tidak aktif');
    return u;
  },

  // BAHAN
  async getBahan() {
    if (DEMO_MODE) return [..._DB.bahan];
    return sbFetch('bahan','select=*&order=kode');
  },
  async saveBahan(item) {
    if (DEMO_MODE) { const r={...item,id:_nid()}; _DB.bahan.push(r); return r; }
    const rows = await sbInsert('bahan', item);
    return Array.isArray(rows)?rows[0]:rows;
  },
  async updateBahanStock(id, newStock) {
    if (DEMO_MODE) { const b=_DB.bahan.find(x=>x.id===id); if(b) b.stock_current=newStock; return b; }
    const rows = await sbUpdate('bahan',{id},{stock_current:newStock});
    return Array.isArray(rows)?rows[0]:rows;
  },
  async updateBahanStatus(id, status) {
    if (DEMO_MODE) { const b=_DB.bahan.find(x=>x.id===id); if(b) b.status=status; return b; }
    const rows = await sbUpdate('bahan',{id},{status});
    return Array.isArray(rows)?rows[0]:rows;
  },

  // MENU
  async getMenu() {
    if (DEMO_MODE) return [..._DB.menu];
    return sbFetch('menu','select=*&order=kode');
  },
  async saveMenu(item) {
    if (DEMO_MODE) { const r={...item,id:_nid()}; _DB.menu.push(r); return r; }
    const rows = await sbInsert('menu', item);
    return Array.isArray(rows)?rows[0]:rows;
  },
  async updateMenuStatus(id, status) {
    if (DEMO_MODE) { const m=_DB.menu.find(x=>x.id===id); if(m) m.status=status; return m; }
    const rows = await sbUpdate('menu',{id},{status});
    return Array.isArray(rows)?rows[0]:rows;
  },

  // RESEP
  async getResep() {
    if (DEMO_MODE) return [..._DB.resep];
    return sbFetch('resep','select=*');
  },
  async saveResep(lines) {
    if (DEMO_MODE) { lines.forEach(l=>_DB.resep.push({...l,id:_nid()})); return lines; }
    return sbInsert('resep', lines);
  },
  async deleteResepByMenu(menuId) {
    if (DEMO_MODE) { _DB.resep = _DB.resep.filter(r=>r.menu_id!==menuId); return; }
    const url = `${SUPABASE_URL}/rest/v1/resep?menu_id=eq.${menuId}`;
    await fetch(url,{method:'DELETE',headers:H()});
  },

  // PENJUALAN — saat input penjualan, stok dikurangi otomatis
  async getPenjualan() {
    if (DEMO_MODE) return [..._DB.penjualan].reverse();
    return sbFetch('penjualan','select=*&order=tanggal.desc,id.desc');
  },
  async savePenjualan(item) {
    // 1. Simpan penjualan
    let saved;
    if (DEMO_MODE) { saved={...item,id:_nid()}; _DB.penjualan.push(saved); }
    else { const rows=await sbInsert('penjualan',item); saved=Array.isArray(rows)?rows[0]:rows; }

    // 2. Kurangi stok berdasarkan resep
    const resep = await DataAPI.getResep();
    const bahan = await DataAPI.getBahan();
    const lines = resep.filter(r=>r.menu_id===item.menu_id);
    for (const line of lines) {
      const b = bahan.find(x=>x.id===line.bahan_id);
      if (b) {
        const newStock = Math.max(0, (b.stock_current||0) - (line.qty * item.qty));
        await DataAPI.updateBahanStock(b.id, newStock);
      }
    }
    await DataAPI.addAudit('Penjualan', `${item.menu_nama} x${item.qty}`, 'Input');
    return saved;
  },

  // STOCK OPNAME
  async getStockOpname() {
    if (DEMO_MODE) return [..._DB.stock_opname].reverse();
    return sbFetch('stock_opname','select=*&order=tanggal.desc');
  },
  async saveStockOpname(item) {
    // Simpan opname + update stok aktual
    let saved;
    if (DEMO_MODE) { saved={...item,id:_nid()}; _DB.stock_opname.push(saved); }
    else { const rows=await sbInsert('stock_opname',item); saved=Array.isArray(rows)?rows[0]:rows; }
    // Update stok ke hasil fisik
    await DataAPI.updateBahanStock(item.bahan_id, item.actual_stock);
    await DataAPI.addAudit('StockOpname', item.bahan_nama, `Variance: ${item.variance}`);
    return saved;
  },

  // DAILY REPORT
  async getDailyReport() {
    if (DEMO_MODE) return [..._DB.daily_report].reverse();
    return sbFetch('daily_report','select=*&order=tanggal.desc');
  },
  async saveDailyReport(item) {
    if (DEMO_MODE) { const r={...item,id:_nid()}; _DB.daily_report.push(r); return r; }
    const rows=await sbInsert('daily_report',item);
    return Array.isArray(rows)?rows[0]:rows;
  },

  // USERS
  async getUsers() {
    if (DEMO_MODE) return _DB.users.map(u=>({...u,password:undefined}));
    return sbFetch('users','select=id,username,nama,role,outlet,status,created_at');
  },
  async saveUser(item) {
    if (DEMO_MODE) { const r={...item,id:_nid()}; _DB.users.push(r); return r; }
    const rows=await sbInsert('users',item);
    return Array.isArray(rows)?rows[0]:rows;
  },
  async updateUserStatus(id,status) {
    if (DEMO_MODE) { const u=_DB.users.find(x=>x.id===id); if(u) u.status=status; return u; }
    const rows=await sbUpdate('users',{id},{status});
    return Array.isArray(rows)?rows[0]:rows;
  },

  // AUDIT TRAIL
  async getAuditTrail() {
    if (DEMO_MODE) return [..._DB.audit_trail].reverse();
    return sbFetch('audit_trail','select=*&order=id.desc&limit=300');
  },
  async addAudit(module, record, activity) {
    const entry = { id:_nid(), module, record, activity, user: Auth?.user?.username||'system', tanggal: new Date().toLocaleString('id-ID') };
    if (DEMO_MODE) { _DB.audit_trail.push(entry); return entry; }
    await sbInsert('audit_trail', entry);
    return entry;
  },

  // COMPUTED: material usage dari penjualan hari ini
  computeUsage(penjualan, resep, tanggal) {
    const todaySales = penjualan.filter(p=>p.tanggal===tanggal);
    const usage = {}; // bahan_id -> { bahan_nama, satuan, total_used }
    todaySales.forEach(sale => {
      resep.filter(r=>r.menu_id===sale.menu_id).forEach(r => {
        if (!usage[r.bahan_id]) usage[r.bahan_id] = { bahan_id:r.bahan_id, bahan_nama:r.bahan_nama, satuan:r.satuan, total_used:0 };
        usage[r.bahan_id].total_used += r.qty * sale.qty;
      });
    });
    return Object.values(usage);
  },

  // Sales summary per hari (7 hari terakhir)
  computeDailySales(penjualan) {
    const map = {};
    penjualan.forEach(p => {
      if (!map[p.tanggal]) map[p.tanggal] = { tanggal:p.tanggal, total:0, qty:0 };
      map[p.tanggal].total += p.total;
      map[p.tanggal].qty += p.qty;
    });
    return Object.values(map).sort((a,b)=>a.tanggal.localeCompare(b.tanggal)).slice(-7);
  },

  // Top menu
  computeTopMenu(penjualan) {
    const map = {};
    penjualan.forEach(p => {
      if (!map[p.menu_nama]) map[p.menu_nama] = { nama:p.menu_nama, qty:0, total:0 };
      map[p.menu_nama].qty += p.qty;
      map[p.menu_nama].total += p.total;
    });
    return Object.values(map).sort((a,b)=>b.qty-a.qty);
  },
};
