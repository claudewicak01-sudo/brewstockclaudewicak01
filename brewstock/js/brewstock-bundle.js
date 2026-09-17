/**
 * BrewStock v2 — Bundle
 * SUPABASE_URL, SUPABASE_KEY, dan APP_CONFIG sekarang datang dari js/config.js
 * (dimuat SEBELUM file ini di index.html). Jangan hardcode key di sini lagi —
 * ini yang tadinya bikin key lama "nyangkut" walau config.js sudah diupdate.
 */
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
  pembelian: [],
  daily_report: [],
  audit_trail: [],
  _nextId: 100,
};

function _nid() { return ++_DB._nextId; }
// Generate kode berikutnya otomatis, mis. BB004 -> BB005. Dipakai supaya
// user tidak perlu (dan tidak bisa) ketik kode manual saat tambah data baru.
function _nextKode(list, prefix) {
  const nums = (list||[]).map(x=>parseInt(String(x.kode||'').replace(prefix,''),10)).filter(n=>!isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return prefix + String(max+1).padStart(3,'0');
}

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
  async updateBahanStatus(id, status, reason) {
    const fields = status==='rejected' ? {status, reject_reason:reason||''} : {status, reject_reason:null};
    if (DEMO_MODE) { const b=_DB.bahan.find(x=>x.id===id); if(b) Object.assign(b,fields); return b; }
    const rows = await sbUpdate('bahan',{id},fields);
    return Array.isArray(rows)?rows[0]:rows;
  },
  async updateBahan(id, fields) {
    if (DEMO_MODE) { const b=_DB.bahan.find(x=>x.id===id); if(b) Object.assign(b,fields); return b; }
    const rows = await sbUpdate('bahan',{id},fields);
    return Array.isArray(rows)?rows[0]:rows;
  },
  async deleteBahan(id) {
    if (DEMO_MODE) { _DB.bahan = _DB.bahan.filter(x=>x.id!==id); return; }
    await fetch(`${SUPABASE_URL}/rest/v1/bahan?id=eq.${id}`,{method:'DELETE',headers:H()});
  },
  async requestDeleteBahan(id, reason) {
    const fields = { delete_status:'pending', delete_reason: reason||'' };
    if (DEMO_MODE) { const b=_DB.bahan.find(x=>x.id===id); if(b) Object.assign(b,fields); }
    else await sbUpdate('bahan',{id},fields);
    await DataAPI.addAudit('Bahan', `#${id}`, 'Ajukan Delete');
  },
  async approveDeleteBahan(id) {
    await DataAPI.deleteBahan(id);
    await DataAPI.addAudit('Bahan', `#${id}`, 'Delete Disetujui');
  },
  async rejectDeleteBahan(id, reason) {
    const fields = { delete_status:null, delete_reject_reason: reason||'' };
    if (DEMO_MODE) { const b=_DB.bahan.find(x=>x.id===id); if(b) Object.assign(b,fields); }
    else await sbUpdate('bahan',{id},fields);
    await DataAPI.addAudit('Bahan', `#${id}`, 'Delete Ditolak');
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
  async updateMenuStatus(id, status, reason) {
    const fields = status==='rejected' ? {status, reject_reason:reason||''} : {status, reject_reason:null};
    if (DEMO_MODE) { const m=_DB.menu.find(x=>x.id===id); if(m) Object.assign(m,fields); return m; }
    const rows = await sbUpdate('menu',{id},fields);
    return Array.isArray(rows)?rows[0]:rows;
  },
  async updateMenu(id, fields) {
    if (DEMO_MODE) { const m=_DB.menu.find(x=>x.id===id); if(m) Object.assign(m,fields); return m; }
    const rows = await sbUpdate('menu',{id},fields);
    return Array.isArray(rows)?rows[0]:rows;
  },
  async deleteMenu(id) {
    if (DEMO_MODE) { _DB.menu = _DB.menu.filter(x=>x.id!==id); return; }
    await fetch(`${SUPABASE_URL}/rest/v1/menu?id=eq.${id}`,{method:'DELETE',headers:H()});
  },
  async requestDeleteMenu(id, reason) {
    const fields = { delete_status:'pending', delete_reason: reason||'' };
    if (DEMO_MODE) { const m=_DB.menu.find(x=>x.id===id); if(m) Object.assign(m,fields); }
    else await sbUpdate('menu',{id},fields);
    await DataAPI.addAudit('Menu', `#${id}`, 'Ajukan Delete');
  },
  async approveDeleteMenu(id) {
    await DataAPI.deleteMenu(id);
    await DataAPI.addAudit('Menu', `#${id}`, 'Delete Disetujui');
  },
  async rejectDeleteMenu(id, reason) {
    const fields = { delete_status:null, delete_reject_reason: reason||'' };
    if (DEMO_MODE) { const m=_DB.menu.find(x=>x.id===id); if(m) Object.assign(m,fields); }
    else await sbUpdate('menu',{id},fields);
    await DataAPI.addAudit('Menu', `#${id}`, 'Delete Ditolak');
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
  async updateResepStatus(menuId, status, reason) {
    const fields = status==='rejected' ? {status, reject_reason:reason||''} : {status, reject_reason:null};
    if (DEMO_MODE) { _DB.resep.filter(r=>r.menu_id===menuId).forEach(r=>Object.assign(r,fields)); return; }
    const url = `${SUPABASE_URL}/rest/v1/resep?menu_id=eq.${menuId}`;
    const res = await fetch(url,{method:'PATCH',headers:{...H(),'Prefer':'return=representation'},body:JSON.stringify(fields)});
    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.message || res.statusText); }
    return res.json();
  },
  async updateResepAktif(menuId, aktif) {
    if (DEMO_MODE) { _DB.resep.filter(r=>r.menu_id===menuId).forEach(r=>r.aktif=aktif); return; }
    const url = `${SUPABASE_URL}/rest/v1/resep?menu_id=eq.${menuId}`;
    const res = await fetch(url,{method:'PATCH',headers:{...H(),'Prefer':'return=representation'},body:JSON.stringify({aktif})});
    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.message || res.statusText); }
    return res.json();
  },
  async requestDeleteResep(menuId, reason) {
    const fields = { delete_status:'pending', delete_reason: reason||'' };
    if (DEMO_MODE) { _DB.resep.filter(r=>r.menu_id===menuId).forEach(r=>Object.assign(r,fields)); return; }
    const url = `${SUPABASE_URL}/rest/v1/resep?menu_id=eq.${menuId}`;
    await fetch(url,{method:'PATCH',headers:{...H(),'Prefer':'return=representation'},body:JSON.stringify(fields)});
    await DataAPI.addAudit('Resep', `menu #${menuId}`, 'Ajukan Delete');
  },
  async approveDeleteResep(menuId) {
    await DataAPI.deleteResepByMenu(menuId);
    await DataAPI.addAudit('Resep', `menu #${menuId}`, 'Delete Disetujui');
  },
  async rejectDeleteResep(menuId, reason) {
    const fields = { delete_status:null, delete_reject_reason: reason||'' };
    if (DEMO_MODE) { _DB.resep.filter(r=>r.menu_id===menuId).forEach(r=>Object.assign(r,fields)); return; }
    const url = `${SUPABASE_URL}/rest/v1/resep?menu_id=eq.${menuId}`;
    await fetch(url,{method:'PATCH',headers:{...H(),'Prefer':'return=representation'},body:JSON.stringify(fields)});
    await DataAPI.addAudit('Resep', `menu #${menuId}`, 'Delete Ditolak');
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
    const lines = resep.filter(r=>r.menu_id===item.menu_id && (r.status||'approved')==='approved');
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
  async updatePenjualan(id, fields) {
    if (DEMO_MODE) { const p=_DB.penjualan.find(x=>x.id===id); if(p) Object.assign(p,fields); return p; }
    const rows = await sbUpdate('penjualan',{id},fields);
    return Array.isArray(rows)?rows[0]:rows;
  },
  // Dipakai saat Edit Penjualan: kembalikan stok dari komposisi lama, lalu
  // kurangi lagi sesuai komposisi baru.
  async reapplyPenjualanStock(oldMenuId, oldQty, newMenuId, newQty) {
    const resep = await DataAPI.getResep();
    let bahan = await DataAPI.getBahan();
    const oldLines = resep.filter(r=>r.menu_id===oldMenuId && (r.status||'approved')==='approved');
    for (const line of oldLines) {
      const b = bahan.find(x=>x.id===line.bahan_id);
      if (b) await DataAPI.updateBahanStock(b.id, (b.stock_current||0) + line.qty*oldQty);
    }
    bahan = await DataAPI.getBahan();
    const newLines = resep.filter(r=>r.menu_id===newMenuId && (r.status||'approved')==='approved');
    for (const line of newLines) {
      const b = bahan.find(x=>x.id===line.bahan_id);
      if (b) await DataAPI.updateBahanStock(b.id, Math.max(0,(b.stock_current||0) - line.qty*newQty));
    }
  },

  async updatePenjualanStatus(id, status, reason) {
    const fields = status==='rejected' ? {status, reject_reason:reason||''} : {status, reject_reason:null};
    if (DEMO_MODE) { const p=_DB.penjualan.find(x=>x.id===id); if(p) Object.assign(p,fields); return p; }
    const rows = await sbUpdate('penjualan',{id},fields);
    return Array.isArray(rows)?rows[0]:rows;
  },

  // VOID PENJUALAN — staff ajukan, admin approve/reject. Stok dikembalikan
  // otomatis kalau void disetujui.
  async requestVoidPenjualan(id, reason) {
    const fields = { void_status:'pending', void_reason: reason||'' };
    if (DEMO_MODE) { const p=_DB.penjualan.find(x=>x.id===id); if(p) Object.assign(p,fields); }
    else await sbUpdate('penjualan',{id},fields);
    await DataAPI.addAudit('Penjualan', `#${id}`, 'Ajukan Void');
  },
  async approveVoidPenjualan(id) {
    const all = await DataAPI.getPenjualan();
    const item = all.find(p=>p.id===id);
    if (item) {
      // kembalikan stok yang tadinya dikurangi saat penjualan diinput
      const [resep, bahan] = await Promise.all([DataAPI.getResep(), DataAPI.getBahan()]);
      const lines = resep.filter(r=>r.menu_id===item.menu_id && (r.status||'approved')==='approved');
      for (const line of lines) {
        const b = bahan.find(x=>x.id===line.bahan_id);
        if (b) await DataAPI.updateBahanStock(b.id, (b.stock_current||0) + line.qty*item.qty);
      }
    }
    if (DEMO_MODE) { _DB.penjualan = _DB.penjualan.filter(p=>p.id!==id); }
    else await fetch(`${SUPABASE_URL}/rest/v1/penjualan?id=eq.${id}`,{method:'DELETE',headers:H()});
    await DataAPI.addAudit('Penjualan', `#${id}`, 'Delete Disetujui — stok dikembalikan');
  },
  async rejectVoidPenjualan(id, reason) {
    const fields = { void_status:null, void_reject_reason: reason||'' };
    if (DEMO_MODE) { const p=_DB.penjualan.find(x=>x.id===id); if(p) Object.assign(p,fields); }
    else await sbUpdate('penjualan',{id},fields);
    await DataAPI.addAudit('Penjualan', `#${id}`, 'Void Ditolak');
  },

  // PEMBELIAN — restock bahan, daftar bahan diambil dari Master Bahan
  async getPembelian() {
    if (DEMO_MODE) return [..._DB.pembelian].reverse();
    return sbFetch('pembelian','select=*&order=tanggal.desc,id.desc');
  },
  async savePembelian(item) {
    let saved;
    if (DEMO_MODE) { saved={...item,id:_nid()}; _DB.pembelian.push(saved); }
    else { const rows=await sbInsert('pembelian',item); saved=Array.isArray(rows)?rows[0]:rows; }
    const bahan = await DataAPI.getBahan();
    const b = bahan.find(x=>x.id===item.bahan_id);
    if (b) await DataAPI.updateBahanStock(b.id, (b.stock_current||0) + item.qty);
    await DataAPI.addAudit('Pembelian', `${item.bahan_nama} x${item.qty}`, 'Input');
    return saved;
  },
  async updatePembelian(id, fields) {
    if (DEMO_MODE) { const p=_DB.pembelian.find(x=>x.id===id); if(p) Object.assign(p,fields); return p; }
    const rows = await sbUpdate('pembelian',{id},fields);
    return Array.isArray(rows)?rows[0]:rows;
  },
  async updatePembelianStatus(id, status, reason) {
    const fields = status==='rejected' ? {status, reject_reason:reason||''} : {status, reject_reason:null};
    if (DEMO_MODE) { const p=_DB.pembelian.find(x=>x.id===id); if(p) Object.assign(p,fields); return p; }
    const rows = await sbUpdate('pembelian',{id},fields);
    return Array.isArray(rows)?rows[0]:rows;
  },
  // Dipakai saat Edit Pembelian: kembalikan stok lama, terapkan stok baru.
  async reapplyPembelianStock(oldBahanId, oldQty, newBahanId, newQty) {
    let bahan = await DataAPI.getBahan();
    const ob = bahan.find(x=>x.id===oldBahanId);
    if (ob) await DataAPI.updateBahanStock(ob.id, Math.max(0,(ob.stock_current||0) - oldQty));
    bahan = await DataAPI.getBahan();
    const nb = bahan.find(x=>x.id===newBahanId);
    if (nb) await DataAPI.updateBahanStock(nb.id, (nb.stock_current||0) + newQty);
  },
  async requestVoidPembelian(id, reason) {
    const fields = { void_status:'pending', void_reason: reason||'' };
    if (DEMO_MODE) { const p=_DB.pembelian.find(x=>x.id===id); if(p) Object.assign(p,fields); }
    else await sbUpdate('pembelian',{id},fields);
    await DataAPI.addAudit('Pembelian', `#${id}`, 'Ajukan Void');
  },
  async approveVoidPembelian(id) {
    const all = await DataAPI.getPembelian();
    const item = all.find(p=>p.id===id);
    if (item) {
      // kembalikan stok yang tadinya ditambahkan saat pembelian diinput
      const bahan = await DataAPI.getBahan();
      const b = bahan.find(x=>x.id===item.bahan_id);
      if (b) await DataAPI.updateBahanStock(b.id, Math.max(0, (b.stock_current||0) - item.qty));
    }
    if (DEMO_MODE) { _DB.pembelian = _DB.pembelian.filter(p=>p.id!==id); }
    else await fetch(`${SUPABASE_URL}/rest/v1/pembelian?id=eq.${id}`,{method:'DELETE',headers:H()});
    await DataAPI.addAudit('Pembelian', `#${id}`, 'Delete Disetujui — stok dikurangi kembali');
  },
  async rejectVoidPembelian(id, reason) {
    const fields = { void_status:null, void_reject_reason: reason||'' };
    if (DEMO_MODE) { const p=_DB.pembelian.find(x=>x.id===id); if(p) Object.assign(p,fields); }
    else await sbUpdate('pembelian',{id},fields);
    await DataAPI.addAudit('Pembelian', `#${id}`, 'Void Ditolak');
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
  async updateDailyReport(id, fields) {
    if (DEMO_MODE) { const d=_DB.daily_report.find(x=>x.id===id); if(d) Object.assign(d,fields); return d; }
    const rows = await sbUpdate('daily_report',{id},fields);
    return Array.isArray(rows)?rows[0]:rows;
  },
  async updateDailyReportStatus(id, status, reason) {
    const fields = status==='rejected' ? {status, reject_reason:reason||''} : {status, reject_reason:null};
    if (DEMO_MODE) { const d=_DB.daily_report.find(x=>x.id===id); if(d) Object.assign(d,fields); return d; }
    const rows = await sbUpdate('daily_report',{id},fields);
    return Array.isArray(rows)?rows[0]:rows;
  },
  async deleteDailyReport(id) {
    if (DEMO_MODE) { _DB.daily_report = _DB.daily_report.filter(x=>x.id!==id); return; }
    await fetch(`${SUPABASE_URL}/rest/v1/daily_report?id=eq.${id}`,{method:'DELETE',headers:H()});
  },
  async requestDeleteDR(id, reason) {
    const fields = { delete_status:'pending', delete_reason: reason||'' };
    if (DEMO_MODE) { const d=_DB.daily_report.find(x=>x.id===id); if(d) Object.assign(d,fields); }
    else await sbUpdate('daily_report',{id},fields);
    await DataAPI.addAudit('DailyReport', `#${id}`, 'Ajukan Delete');
  },
  async approveDeleteDR(id) {
    await DataAPI.deleteDailyReport(id);
    await DataAPI.addAudit('DailyReport', `#${id}`, 'Delete Disetujui');
  },
  async rejectDeleteDR(id, reason) {
    const fields = { delete_status:null, delete_reject_reason: reason||'' };
    if (DEMO_MODE) { const d=_DB.daily_report.find(x=>x.id===id); if(d) Object.assign(d,fields); }
    else await sbUpdate('daily_report',{id},fields);
    await DataAPI.addAudit('DailyReport', `#${id}`, 'Delete Ditolak');
  },
  async requestVoidDR(id, reason) {
    const fields = { void_status:'pending', void_reason: reason||'' };
    if (DEMO_MODE) { const d=_DB.daily_report.find(x=>x.id===id); if(d) Object.assign(d,fields); }
    else await sbUpdate('daily_report',{id},fields);
    await DataAPI.addAudit('DailyReport', `#${id}`, 'Ajukan Void');
  },
  async approveVoidDR(id) {
    if (DEMO_MODE) { const d=_DB.daily_report.find(x=>x.id===id); if(d) d.void_status='voided'; }
    else await sbUpdate('daily_report',{id},{void_status:'voided'});
    await DataAPI.addAudit('DailyReport', `#${id}`, 'Void Disetujui');
  },
  async rejectVoidDR(id, reason) {
    const fields = { void_status:null, void_reject_reason: reason||'' };
    if (DEMO_MODE) { const d=_DB.daily_report.find(x=>x.id===id); if(d) Object.assign(d,fields); }
    else await sbUpdate('daily_report',{id},fields);
    await DataAPI.addAudit('DailyReport', `#${id}`, 'Void Ditolak');
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
    const user = Auth?.user?.username||'system';
    const tanggal = new Date().toLocaleString('id-ID');
    if (DEMO_MODE) { const entry={id:_nid(),module,record,activity,user,tanggal}; _DB.audit_trail.push(entry); return entry; }
    // id sengaja TIDAK dikirim — biar Postgres yang generate otomatis.
    // Sebelumnya id dihitung dari counter lokal (_nid()) yang reset tiap reload
    // halaman, jadi gampang bentrok dengan id yang sudah ada di tabel ->
    // "duplicate key value violates unique constraint audit_trail_pkey".
    const rows = await sbInsert('audit_trail', {module,record,activity,user,tanggal});
    return Array.isArray(rows)?rows[0]:rows;
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
const Auth = {
  user: null,
  init() {
    try {
      const s = sessionStorage.getItem('bs_user');
      if (s) { const p=JSON.parse(s); if(p?.username&&p?.role) this.user=p; }
    } catch(e) { sessionStorage.removeItem('bs_user'); }
  },
  async login(u,p) { this.user=await DataAPI.login(u,p); sessionStorage.setItem('bs_user',JSON.stringify(this.user)); return this.user; },
  logout() { this.user=null; sessionStorage.removeItem('bs_user'); },
  isAdmin() { return this.user?.role==='admin'; },
};
// ─── FORMATTERS ─────────────────────────────────────────────
const fmt = {
  currency: n => 'Rp' + Number(n||0).toLocaleString('id-ID'),
  number:   n => Number(n||0).toLocaleString('id-ID'),
  date:     d => d ? new Date(d).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) : '-',
};

// ─── BADGE ───────────────────────────────────────────────────
function badge(status) {
  const m = {
    approved:['bg-green','Approved'], waiting:['bg-orange','Waiting'], rejected:['bg-red','Rejected'],
    active:['bg-green','Active'], ACTIVE:['bg-green','Active'], INACTIVE:['bg-red','Inactive'],
    normal:['bg-green','Normal'], warning:['bg-orange','Warning'], critical:['bg-red','Critical'],
    submitted:['bg-blue','Submitted'], verified:['bg-green','Verified'],
    pending:['bg-orange','Void Diajukan'], voided:['bg-red','Voided'],
  };
  const [cls,label] = m[status]||['bg-gray',status];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ─── ICONS ───────────────────────────────────────────────────
const IC = {
  svg:(p,vb='0 0 24 24',sz=18)=>`<svg width="${sz}" height="${sz}" viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`,
  dashboard: ()=>IC.svg('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>'),
  bahan:  ()=>IC.svg('<path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>'),
  menu:   ()=>IC.svg('<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>'),
  resep:  ()=>IC.svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
  sale:   ()=>IC.svg('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'),
  stock:  ()=>IC.svg('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'),
  opname: ()=>IC.svg('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'),
  report: ()=>IC.svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'),
  users:  ()=>IC.svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  audit:  ()=>IC.svg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
  plus:   ()=>IC.svg('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
  eye:    ()=>IC.svg('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
  trash:  ()=>IC.svg('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>'),
  search: ()=>IC.svg('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'),
  alert:  ()=>IC.svg('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
  check:  ()=>IC.svg('<polyline points="20 6 9 17 4 12"/>'),
  x:      ()=>IC.svg('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
  img:    ()=>IC.svg('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'),
  trend:  ()=>IC.svg('<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>'),
  beli:   ()=>IC.svg('<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>'),
  download: ()=>IC.svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
};

// ─── TOAST ───────────────────────────────────────────────────
const Toast = {
  show(msg, type='info') {
    const c = document.getElementById('toast-wrap');
    if (!c) return;
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    const icons = {success:'✓',error:'✕',warning:'⚠',info:'ℹ'};
    el.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ'}</span><span>${msg}</span>`;
    c.appendChild(el);
    setTimeout(()=>{ el.classList.add('out'); setTimeout(()=>el.remove(),300); }, 3200);
  },
  success: m=>Toast.show(m,'success'),
  error:   m=>Toast.show(m,'error'),
  warning: m=>Toast.show(m,'warning'),
  info:    m=>Toast.show(m,'info'),
};

// ─── MODAL ───────────────────────────────────────────────────
const Modal = {
  open({title,body,footer='',size=''}) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('modal-footer').innerHTML = footer;
    document.getElementById('modal-box').className = `modal-box${size?' modal-'+size:''}`;
    document.getElementById('modal-overlay').classList.add('open');
  },
  close() { document.getElementById('modal-overlay').classList.remove('open'); },
};

// ─── APPROVAL INFO MODAL (dipakai semua alur approval admin) ──
// Menampilkan detail perubahan (sebelum → sesudah) atau info pengajuan,
// lalu tombol Approve/Reject. Reject wajib isi alasan supaya user tahu
// kenapa ditolak.
let _aprCallbacks = null;
function _approvalModal({title, subtitle, changes, note, simple=false, onApprove, onReject}) {
  _aprCallbacks = {onApprove, onReject};
  let bodyMain;
  if (simple) {
    // Mode VOID: bukan perubahan data, jadi tidak ada Sebelum/Sesudah — cuma info detail.
    bodyMain = `<div class="table-wrap"><table><tbody>
      ${(changes||[]).map(c=>`<tr><td style="font-weight:600;padding:7px 8px;font-size:12px;width:40%">${c.label}</td><td style="padding:7px 8px;font-size:12px">${c.after}</td></tr>`).join('')}
    </tbody></table></div>`;
  } else {
    const rowsHtml = (changes||[]).map(c=>{
      const hasBefore = c.before!==undefined && c.before!==null && c.before!=='';
      const changed = hasBefore && String(c.before)!==String(c.after);
      return changed
        ? `<tr><td style="font-weight:600;padding:7px 8px;font-size:12px">${c.label}</td><td style="padding:7px 8px;font-size:12px;color:var(--red-600);text-decoration:line-through">${c.before}</td><td style="padding:7px 8px;font-size:12px;color:var(--green-600);font-weight:600">${c.after}</td></tr>`
        : `<tr><td style="font-weight:600;padding:7px 8px;font-size:12px">${c.label}</td><td colspan="2" style="padding:7px 8px;font-size:12px">${c.after}</td></tr>`;
    }).join('');
    bodyMain = `<div class="table-wrap"><table>
      <thead><tr><th>Field</th><th>Sebelum</th><th>Sesudah</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table></div>`;
  }
  Modal.open({
    title, size:'lg',
    body:`
      ${subtitle?`<p class="text-sm text-gray" style="margin-bottom:10px">${subtitle}</p>`:''}
      ${bodyMain}
      ${note?`<div style="margin-top:12px;padding:10px;background:var(--blue-50);border:1px solid var(--blue-100);border-radius:8px" class="text-sm"><b>Alasan/catatan dari user:</b> ${note}</div>`:''}
      <div class="form-group" style="margin-top:14px"><label>Alasan Reject <span class="text-sm text-gray">(wajib diisi kalau reject)</span></label><textarea id="apr-reason" rows="2" placeholder="Contoh: harga tidak sesuai, data kurang lengkap, dll"></textarea></div>`,
    footer:`
      <button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>
      <button class="btn btn-danger" onclick="_aprConfirm(false)">Reject</button>
      <button class="btn btn-success" onclick="_aprConfirm(true)">Approve</button>`,
  });
}
async function _aprConfirm(approve){
  if (!_aprCallbacks) return;
  if (approve) { Modal.close(); await _aprCallbacks.onApprove(); }
  else {
    const reason = document.getElementById('apr-reason')?.value?.trim();
    if (!reason) { Toast.error('Isi alasan penolakan dulu'); return; }
    Modal.close(); await _aprCallbacks.onReject(reason);
  }
  _aprCallbacks = null;
  App._refreshNavBadges();
}

// Modal View — read-only, cuma buat lihat detail lengkap (gak ada approve/reject).
function _viewModal({title, subtitle, fields}){
  const rows = (fields||[]).map(f=>`<tr><td style="font-weight:600;padding:7px 8px;font-size:12px;width:40%">${f.label}</td><td style="padding:7px 8px;font-size:12px">${f.value}</td></tr>`).join('');
  Modal.open({
    title, size:'lg',
    body:`
      ${subtitle?`<p class="text-sm text-gray" style="margin-bottom:10px">${subtitle}</p>`:''}
      <div class="table-wrap"><table><tbody>${rows}</tbody></table></div>`,
    footer:`<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>`,
  });
}

// Konfirmasi + alasan buat aksi Delete: kalau admin, hapus langsung (cuma
// perlu confirm). Kalau bukan admin, wajib isi alasan (jadi permintaan yang
// menunggu approval admin).
function _deletePrompt({adminMsg, userMsg, onAdmin, onUser}){
  if (Auth.isAdmin()) {
    if (confirm(adminMsg||'Yakin mau hapus data ini?')) onAdmin();
    return;
  }
  const reason = prompt(userMsg||'Alasan hapus data ini?');
  if (reason===null) return;
  onUser(reason);
}

// ─── TABLE BUILDER ───────────────────────────────────────────
function buildTable({cols, data, empty='Tidak ada data', rowId, rowClass, rowAttrs}) {
  if (!data?.length) return `<div class="empty-state">${IC.bahan()} <p>${empty}</p></div>`;
  const head = cols.map(c=>`<th>${c.label}</th>`).join('');
  const rows = data.map(row=>{
    const id = rowId ? ` id="${rowId(row)}"` : '';
    const cls = rowClass ? ` class="${rowClass(row)}"` : '';
    const attrs = rowAttrs ? ` ${rowAttrs(row)}` : '';
    return `<tr${id}${cls}${attrs}>${cols.map(c=>`<td>${c.render?c.render(row):(row[c.key]??'-')}</td>`).join('')}</tr>`;
  }).join('');
  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

function searchFilter(data, q, keys) {
  if (!q) return data;
  const lq = q.toLowerCase();
  return data.filter(r=>keys.some(k=>String(r[k]||'').toLowerCase().includes(lq)));
}

// ─── NOTIFIKASI: tandai-sudah-dilihat & sorot baris ────────────
// Disimpan di localStorage (per browser/device) karena tidak ada sistem
// read/unread di backend. "marker" = teks alasan reject saat ini — kalau
// admin reject ulang dengan alasan BEDA, notifikasi akan muncul lagi.
function _seenKey(module,id){ return `bs_seen_${module}_${id}`; }
function _isDismissed(module,id,marker){
  try { return localStorage.getItem(_seenKey(module,id)) === String(marker||''); } catch(e){ return false; }
}
function _dismiss(module,id,marker){
  try { localStorage.setItem(_seenKey(module,id), String(marker||'')); } catch(e){}
  App._refreshNavBadges();
}
// Apakah baris ini notifikasi (reject) milik user yang lagi login, dan belum di-dismiss?
function _isMyNotified(r, module){
  return !Auth.isAdmin() && r.created_by===Auth.user?.username && r.reject_reason && !_isDismissed(module, r.id, r.reject_reason);
}
function _isMyVoidNotified(r, module){
  return !Auth.isAdmin() && r.created_by===Auth.user?.username && r.void_reject_reason && !_isDismissed(module, r.id, 'void:'+r.void_reject_reason);
}
function _isMyDRNotified(r){
  return !Auth.isAdmin() && r.user===Auth.user?.username && r.reject_reason && !_isDismissed('daily-report', r.id, r.reject_reason);
}
function _isMyDeleteNotified(r, module){
  return !Auth.isAdmin() && r.created_by===Auth.user?.username && r.delete_reject_reason && !_isDismissed(module+'-del', r.id, r.delete_reject_reason);
}
function _isMyDRDeleteNotified(r){
  return !Auth.isAdmin() && r.user===Auth.user?.username && r.delete_reject_reason && !_isDismissed('daily-report-del', r.id, r.delete_reject_reason);
}
// Setelah render halaman, scroll otomatis ke baris pertama yang lagi disorot
// notifikasi (kalau ada) supaya user langsung ketemu transaksi yang dimaksud.
function _scrollToNotified(){
  setTimeout(()=>{
    const el = document.querySelector('tr.row-notify, .card-notify');
    if (el) el.scrollIntoView({behavior:'smooth', block:'center'});
  }, 60);
}

// ─── EXPORT EXCEL (CSV) ────────────────────────────────────────
// Pakai format CSV ber-delimiter ";" (default separator Excel versi Indonesia)
// + BOM UTF-8, biar bisa langsung dibuka Excel tanpa perlu import wizard.
function _exportCSV(filename, headers, rows){
  const esc = v => {
    const s = String(v ?? '');
    return /[";\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s;
  };
  const lines = [headers.map(esc).join(';'), ...rows.map(r=>r.map(esc).join(';'))];
  const csv = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  Toast.success('File Excel (CSV) diunduh');
}

// ─── MINI CHARTS (SVG) ───────────────────────────────────────
function lineChart(points, w=300, h=80, color='#1B4FD8') {
  if (!points?.length) return '<div class="chart-empty">Tidak ada data</div>';
  const max = Math.max(...points.map(p=>p.y), 1);
  const min = Math.min(...points.map(p=>p.y), 0);
  const range = max - min || 1;
  const xs = points.map((_,i)=> (i/(points.length-1||1))*(w-20)+10);
  const ys = points.map(p=> h-10 - ((p.y-min)/range)*(h-20));
  const path = xs.map((x,i)=>`${i===0?'M':'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const area = `${path} L${xs[xs.length-1]},${h} L${xs[0]},${h} Z`;
  const labels = points.map((p,i)=>`<text x="${xs[i].toFixed(1)}" y="${h}" font-size="9" fill="#9ca3af" text-anchor="middle">${p.label||''}</text>`).join('');
  return `<svg viewBox="0 0 ${w} ${h+12}" style="width:100%;overflow:visible">
    <defs><linearGradient id="lg${color.replace('#','')}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="${area}" fill="url(#lg${color.replace('#','')})" />
    <path d="${path}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
    ${xs.map((x,i)=>`<circle cx="${x.toFixed(1)}" cy="${ys[i].toFixed(1)}" r="3" fill="${color}"/>`).join('')}
    ${labels}
  </svg>`;
}

function barChart(items, w=300, h=120, color='#1B4FD8') {
  if (!items?.length) return '<div class="chart-empty">Tidak ada data</div>';
  const max = Math.max(...items.map(d=>d.value), 1);
  const bw = Math.floor((w-20)/items.length) - 4;
  const bars = items.map((d,i)=>{
    const bh = Math.max(4, ((d.value/max)*(h-30)));
    const x = 10 + i*((w-20)/items.length);
    const y = h-20-bh;
    const clr = d.color || color;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw}" height="${bh.toFixed(1)}" fill="${clr}" rx="3"/>
      <text x="${(x+bw/2).toFixed(1)}" y="${h-4}" font-size="9" fill="#6b7280" text-anchor="middle">${d.label}</text>
      <text x="${(x+bw/2).toFixed(1)}" y="${(y-3).toFixed(1)}" font-size="8" fill="${clr}" text-anchor="middle">${d.value}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;overflow:visible">${bars}</svg>`;
}

function stackedBar(items, w=300, h=32) {
  // items: [{label, used, stock, satuan}]
  return items.map(it=>{
    const total = (it.used||0) + (it.stock||0);
    const pctUsed = total>0 ? (it.used/total*100) : 0;
    const pctStock = 100 - pctUsed;
    return `<div class="sbar-row">
      <div class="sbar-label">${it.label}</div>
      <div class="sbar-track">
        <div class="sbar-fill used" style="width:${pctUsed.toFixed(1)}%" title="Terpakai: ${fmt.number(it.used)} ${it.satuan}"></div>
        <div class="sbar-fill stock" style="width:${pctStock.toFixed(1)}%" title="Sisa: ${fmt.number(it.stock)} ${it.satuan}"></div>
      </div>
      <div class="sbar-info">
        <span class="used-dot">▪</span>${fmt.number(it.used)}
        <span class="stock-dot" style="margin-left:8px">▪</span>${fmt.number(it.stock)} ${it.satuan}
      </div>
    </div>`;
  }).join('');
}
// ─── PAGE: DASHBOARD ────────────────────────────────────────
// ─── PAGE: HOME (grid ikon ala home screen HP) ─────────────────
function pageHome(el){
  const isAdmin = Auth.isAdmin();
  const groups = NAV_ADMIN.map(({group, items}) => ({
    group: group || 'Utama',
    items: items.filter(k => { const r = ROUTES[k]; return r && (!r.admin || isAdmin); }),
  })).filter(g => g.items.length);

  el.innerHTML = `
  <div class="home-wrap">
    <div class="home-greeting">
      <h1>Halo, ${(Auth.user?.nama || Auth.user?.username || '').split(' ')[0]}</h1>
      <p>${isAdmin ? 'Admin / Owner' : 'Barista'} — pilih menu di bawah</p>
    </div>
    ${groups.map(g => `
      <div class="home-group-label">${g.group}</div>
      <div class="icon-grid">
        ${g.items.map(k => {
          const r = ROUTES[k];
          return `<div class="app-icon" onclick="App.go('${k}')">
            <div class="app-icon-glyph">${r.icon()}<span class="app-icon-badge" id="homebadge-${k}" style="display:none"></span></div>
            <span class="app-icon-label">${r.label}</span>
          </div>`;
        }).join('')}
      </div>`).join('')}
  </div>`;
  App._refreshNavBadges();
}

async function pageDashboard(el) {
  el.innerHTML = `<div class="empty-state">${IC.trend()} <p>Memuat dashboard...</p></div>`;
  const today = new Date().toISOString().split('T')[0];

  const [bahan, penjualan, resep, opname] = await Promise.all([
    DataAPI.getBahan().catch(()=>[]),
    DataAPI.getPenjualan().catch(()=>[]),
    DataAPI.getResep().catch(()=>[]),
    DataAPI.getStockOpname().catch(()=>[]),
  ]);

  // Sale yang statusnya 'voided' dikeluarkan dari semua perhitungan
  const activeSales = penjualan.filter(p=>p.void_status!=='voided');
  const todaySales = activeSales.filter(p=>p.tanggal===today);
  const totalRev   = todaySales.reduce((s,p)=>s+p.total,0);
  const totalQty   = todaySales.reduce((s,p)=>s+p.qty,0);
  const cashRev    = todaySales.filter(p=>p.metode==='Cash').reduce((s,p)=>s+p.total,0);
  const nonCash    = totalRev - cashRev;
  const lowStock   = bahan.filter(b=>b.stock_current<=b.min_stock&&b.status==='approved').length;

  // Daily trend 7 hari
  const dailyMap = DataAPI.computeDailySales(activeSales);
  const trendPts  = dailyMap.map(d=>({y:d.total/1000, label:d.tanggal.slice(5)}));

  // Top menu (bar chart)
  const topMenu  = DataAPI.computeTopMenu(activeSales).slice(0,5);
  const barItems  = topMenu.map((m,i)=>({label:m.nama.split(' ')[0], value:m.qty,
    color:['#1B4FD8','#3b82f6','#60a5fa','#93c5fd','#bfdbfe'][i]}));

  // Material usage vs stock (stacked bar)
  const usageData = DataAPI.computeUsage(activeSales, resep, today);
  const stackItems = bahan.filter(b=>b.status==='approved').map(b=>{
    const u = usageData.find(x=>x.bahan_id===b.id);
    return { label:b.nama, used:u?.total_used||0, stock:b.stock_current||0, satuan:b.satuan };
  });

  el.innerHTML = `
  <div class="page-head">
    <div><h2>Dashboard Admin</h2><p>Monitoring operasional harian — ${new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p></div>
    ${DEMO_MODE?`<span class="badge bg-orange">Demo Mode</span>`:''}
  </div>

  <div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-label">Revenue Hari Ini</div><div class="kpi-val">${fmt.currency(totalRev)}</div><div class="kpi-sub">${totalQty} cup terjual</div></div>
    <div class="kpi-card orange"><div class="kpi-label">Cash</div><div class="kpi-val">${fmt.currency(cashRev)}</div><div class="kpi-sub">Tunai</div></div>
    <div class="kpi-card blue" style="--c:var(--blue-100)"><div class="kpi-label">Non-Cash</div><div class="kpi-val">${fmt.currency(nonCash)}</div><div class="kpi-sub">QRIS/Transfer/Debit</div></div>
    <div class="kpi-card ${lowStock>0?'red':'green'}"><div class="kpi-label">Stok Rendah</div><div class="kpi-val">${lowStock}</div><div class="kpi-sub">Di bawah minimum</div></div>
  </div>

  <div class="charts-grid mb-6">
    <div class="chart-box">
      <div class="chart-ttl">${IC.trend()} Trend Penjualan 7 Hari (Rp Ribu)</div>
      ${lineChart(trendPts, 340, 90)}
    </div>
    <div class="chart-box">
      <div class="chart-ttl">${IC.menu()} Top Produk Terjual (cup)</div>
      ${barChart(barItems, 340, 120)}
    </div>
  </div>

  <div class="grid-2 mb-6">
    <div class="card">
      <div class="card-head"><span class="card-title">${IC.stock()} Stok Bahan — Terpakai vs Tersisa</span></div>
      <div class="card-body">
        <div style="display:flex;gap:16px;margin-bottom:10px;font-size:11px">
          <span><span class="used-dot">▪</span> Terpakai hari ini</span>
          <span><span class="stock-dot">▪</span> Sisa stok</span>
        </div>
        ${stackedBar(stackItems)||'<div class="empty-state"><p>Tidak ada data</p></div>'}
      </div>
    </div>

    <div class="card">
      <div class="card-head"><span class="card-title">${IC.sale()} Penjualan Hari Ini</span></div>
      <div class="card-body card-body-p0">
        ${buildTable({
          cols:[
            {key:'shift',label:'Shift'},
            {key:'menu_nama',label:'Menu'},
            {label:'Qty',render:r=>`<span class="font-mono">${r.qty}</span>`},
            {label:'Total',render:r=>`<span class="font-mono">${fmt.currency(r.total)}</span>`},
            {key:'metode',label:'Metode'},
          ],
          data: todaySales,
          empty:'Belum ada penjualan hari ini',
        })}
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-head">
      <span class="card-title">${IC.bahan()} Status Stok Bahan</span>
      <button class="btn btn-ghost btn-sm" onclick="App.go('pembelian')">+ Pembelian</button>
    </div>
    <div class="card-body card-body-p0">
      ${buildTable({
        cols:[
          {key:'kode',label:'Kode'},
          {key:'nama',label:'Bahan'},
          {key:'satuan',label:'Satuan'},
          {label:'Stok Sistem',render:r=>`<span class="font-mono font-bold">${fmt.number(r.stock_current)}</span>`},
          {label:'Min Stock',render:r=>`<span class="font-mono">${fmt.number(r.min_stock)}</span>`},
          {label:'Level',render:r=>{
            const pct=Math.min(r.stock_current/Math.max(r.max_stock,1)*100,100);
            const c=r.stock_current<=r.min_stock?'var(--red-600)':r.stock_current<=r.min_stock*1.5?'var(--orange-500)':'var(--green-500)';
            return `<div class="stock-mini"><div style="font-size:10px;color:${c};font-weight:700">${pct.toFixed(0)}%</div><div class="stock-bar"><div class="stock-fill" style="width:${pct}%;background:${c}"></div></div></div>`;
          }},
          {label:'Status',render:r=>r.stock_current<=r.min_stock?badge('critical'):r.stock_current<=r.min_stock*1.5?badge('warning'):badge('normal')},
        ],
        data: bahan.filter(b=>b.status==='approved'),
        empty:'Belum ada bahan aktif',
      })}
    </div>
  </div>`;
}
// ─── PAGE: PENJUALAN ────────────────────────────────────────
let _pjData=[], _pjMenu=[], _pjResep=[], _pjQ='', _pjPage=1;
const PJ_PAGE_SIZE = 20;
let _pjFil = { dari:'', sampai:'', shift:'', metode:'', menu_id:'' };

async function pagePenjualan(el) {
  el.innerHTML=`<div class="empty-state"><p>Memuat...</p></div>`;
  [_pjData,_pjMenu,_pjResep] = await Promise.all([DataAPI.getPenjualan().catch(()=>[]),DataAPI.getMenu().catch(()=>[]),DataAPI.getResep().catch(()=>[])]);
  _pjPage=1;
  _renderPenjualan(el,_pjQ);
}
function _pjFiltered() {
  let data = searchFilter(_pjData,_pjQ,['menu_nama','shift','created_by']);
  if (_pjFil.dari)    data = data.filter(p=>p.tanggal>=_pjFil.dari);
  if (_pjFil.sampai)  data = data.filter(p=>p.tanggal<=_pjFil.sampai);
  if (_pjFil.shift)   data = data.filter(p=>p.shift===_pjFil.shift);
  if (_pjFil.metode)  data = data.filter(p=>p.metode===_pjFil.metode);
  if (_pjFil.menu_id) data = data.filter(p=>String(p.menu_id)===_pjFil.menu_id);
  return data;
}
function _pjSetFil(key,val){ _pjFil[key]=val; _pjPage=1; _renderPenjualan(document.getElementById('page-content'),_pjQ); }
function _pjDateLabel(){
  if (_pjFil.dari && _pjFil.sampai) return `${_pjFil.dari} — ${_pjFil.sampai}`;
  if (_pjFil.dari) return `Dari ${_pjFil.dari}`;
  if (_pjFil.sampai) return `s/d ${_pjFil.sampai}`;
  return 'Semua Tanggal';
}
function _pjToggleDatePanel(){
  const p = document.getElementById('pj-date-panel');
  if (p) p.style.display = (p.style.display==='none'||!p.style.display) ? 'flex' : 'none';
}
function _pjDateApply(){
  _pjFil.dari = document.getElementById('pj-date-dari')?.value || '';
  _pjFil.sampai = document.getElementById('pj-date-sampai')?.value || '';
  _pjPage = 1;
  _renderPenjualan(document.getElementById('page-content'), _pjQ);
}
function _pjDateReset(){
  _pjFil.dari=''; _pjFil.sampai='';
  _pjPage = 1;
  _renderPenjualan(document.getElementById('page-content'), _pjQ);
}
function _renderPenjualan(el,q) {
  _pjQ = q||'';
  const filtered = _pjFiltered();
  const today = new Date().toISOString().split('T')[0];
  const todayTotal = _pjData.filter(p=>p.tanggal===today && p.void_status!=='voided').reduce((s,p)=>s+p.total,0);

  const totalPages = Math.max(1, Math.ceil(filtered.length/PJ_PAGE_SIZE));
  if (_pjPage>totalPages) _pjPage=totalPages;
  const pageData = filtered.slice((_pjPage-1)*PJ_PAGE_SIZE, _pjPage*PJ_PAGE_SIZE);

  const menuOptions = _pjMenu.map(m=>`<option value="${m.id}" ${String(m.id)===_pjFil.menu_id?'selected':''}>${m.nama}</option>`).join('');

  el.innerHTML=`
  <div class="page-head">
    <div><h2>Input Penjualan</h2><p>Stok bahan otomatis berkurang sesuai resep saat penjualan diinput</p></div>
    <div class="page-head-actions">
      <button class="btn btn-ghost" onclick="_exportPenjualan()">${IC.download()} Export Excel</button>
      <button class="btn btn-primary" onclick="_openPenjualan()">${IC.plus()} Input Penjualan</button>
    </div>
  </div>
  <div class="kpi-grid" style="max-width:500px;margin-bottom:16px">
    <div class="kpi-card"><div class="kpi-label">Revenue Hari Ini</div><div class="kpi-val">${fmt.currency(todayTotal)}</div></div>
    <div class="kpi-card orange"><div class="kpi-label">Transaksi</div><div class="kpi-val">${filtered.length}</div></div>
  </div>
  <div class="card">
    <div class="card-head" style="flex-wrap:wrap;gap:8px">
      <div class="search-box">${IC.search()}<input type="text" placeholder="Cari..." value="${_pjQ}" oninput="_renderPenjualan(document.getElementById('page-content'),this.value)" /></div>
      <div class="filter-bar">
        <div class="filter-field">
          <span class="filter-label">Tanggal</span>
          <button type="button" class="btn btn-ghost filter-date-btn" onclick="_pjToggleDatePanel()">📅 ${_pjDateLabel()}</button>
          <div id="pj-date-panel" class="date-range-panel" style="display:none">
            <div><label>Dari</label><input type="date" id="pj-date-dari" value="${_pjFil.dari}"/></div>
            <div><label>Sampai</label><input type="date" id="pj-date-sampai" value="${_pjFil.sampai}"/></div>
            <div style="display:flex;gap:8px;margin-top:4px">
              <button type="button" class="btn btn-ghost btn-sm" style="flex:1" onclick="_pjDateReset()">Reset</button>
              <button type="button" class="btn btn-primary btn-sm" style="flex:1" onclick="_pjDateApply()">Terapkan</button>
            </div>
          </div>
        </div>
        <div class="filter-field"><span class="filter-label">Shift</span>
        <select onchange="_pjSetFil('shift',this.value)">
          <option value="">Semua Shift</option>
          ${['Pagi','Siang','Malam','Long Shift'].map(s=>`<option ${s===_pjFil.shift?'selected':''}>${s}</option>`).join('')}
        </select></div>
        <div class="filter-field"><span class="filter-label">Metode</span>
        <select onchange="_pjSetFil('metode',this.value)">
          <option value="">Semua Metode</option>
          ${['Mixed','Cash','QRIS','Debit','Transfer'].map(s=>`<option ${s===_pjFil.metode?'selected':''}>${s}</option>`).join('')}
        </select></div>
        <div class="filter-field"><span class="filter-label">Menu</span>
        <select onchange="_pjSetFil('menu_id',this.value)">
          <option value="">Semua Menu</option>${menuOptions}
        </select></div>
      </div>
    </div>
    <div class="card-body-p0">
      ${buildTable({cols:[
        {key:'tanggal',label:'Tanggal'},{key:'shift',label:'Shift'},{key:'menu_nama',label:'Menu'},
        {label:'Qty',render:r=>`<b>${r.qty}</b>`},
        {label:'Total',render:r=>`<span class="font-mono">${fmt.currency(r.total)}</span>`},
        {key:'metode',label:'Metode'},{key:'created_by',label:'Oleh'},
        {label:'Status',render:r=>{
          if (r.void_status==='pending') {
            return Auth.isAdmin()
              ? `<button class="btn btn-ghost btn-sm" onclick="_pjVoidShowApproval(${r.id})" style="padding:0">${badge('pending')} <span class="text-sm">🗑️ Lihat Detail</span></button>`
              : `${badge('pending')} <span class="text-sm text-gray">Menunggu approval hapus</span>`;
          }
          if (r.status==='waiting') return `<button class="btn btn-ghost btn-sm" onclick="_pjShowApproval(${r.id})" style="padding:0">${badge('waiting')} ${Auth.isAdmin()?'<span class=\"text-sm\">ℹ️ Lihat Detail</span>':''}</button>`;
          const b = badge('approved');
          if (r.reject_reason) return `${b}<div class="text-sm" style="color:var(--red-600)">Alasan: ${r.reject_reason}</div>`;
          if (r.void_reject_reason) return `${b}<div class="text-sm" style="color:var(--red-600)">Hapus ditolak: ${r.void_reject_reason}</div>`;
          return b;
        }},
        {label:'',render:r=>r.void_status==='pending'?'':`<div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" onclick="_pjView(${r.id})">View</button>
          <button class="btn btn-ghost btn-sm" onclick="_pjOpenEdit(${r.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="_pjDeleteRequest(${r.id})">Delete</button>
        </div>`},
      ],data:pageData,empty:'Belum ada penjualan',
        rowId:r=>`row-penjualan-${r.id}`,
        rowClass:r=>(_isMyVoidNotified(r,'penjualan')||_isMyNotified(r,'penjualan'))?'row-notify':'',
        rowAttrs:r=>{
          if (_isMyVoidNotified(r,'penjualan')) return `onclick="_dismiss('penjualan',${r.id},'void:${(r.void_reject_reason||'').replace(/'/g,"\\'")}');this.classList.remove('row-notify')"`;
          if (_isMyNotified(r,'penjualan')) return `onclick="_dismiss('penjualan',${r.id},'${(r.reject_reason||'').replace(/'/g,"\\'")}');this.classList.remove('row-notify')"`;
          return '';
        },
      })}
    </div>
    ${filtered.length ? `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-top:1px solid var(--gray-100)">
      <span class="text-sm text-gray">Halaman ${_pjPage} dari ${totalPages} — ${filtered.length} transaksi</span>
      <div style="display:flex;gap:6px">
        <button class="btn btn-ghost btn-sm" ${_pjPage<=1?'disabled':''} onclick="_pjGoPage(${_pjPage-1})">‹ Sebelumnya</button>
        <button class="btn btn-ghost btn-sm" ${_pjPage>=totalPages?'disabled':''} onclick="_pjGoPage(${_pjPage+1})">Selanjutnya ›</button>
      </div>
    </div>` : ''}
  </div>`;
  _scrollToNotified();
  }
function _pjGoPage(p){ _pjPage=p; _renderPenjualan(document.getElementById('page-content'),_pjQ); }
function _exportPenjualan(){
  const data = _pjFiltered();
  _exportCSV('penjualan.csv',
    ['Tanggal','Shift','Menu','Qty','Total','Metode','Oleh','Status'],
    data.map(r=>[r.tanggal,r.shift,r.menu_nama,r.qty,r.total,r.metode,r.created_by,r.void_status||'Aktif'])
  );
}

function _pjDeleteRequest(id){
  const r = _pjData.find(x=>x.id===id); if (!r) return;
  _deletePrompt({
    adminMsg:`Yakin mau hapus transaksi "${r.menu_nama}" x${r.qty}? Stok akan dikembalikan.`,
    userMsg:'Alasan hapus transaksi ini?',
    onAdmin: async ()=>{
      try{
        await DataAPI.approveVoidPenjualan(id);
        Toast.success('Transaksi dihapus — stok dikembalikan');
        _pjData=await DataAPI.getPenjualan().catch(()=>[]);
        _renderPenjualan(document.getElementById('page-content'),_pjQ);
      }catch(e){Toast.error(e.message);}
    },
    onUser: async (reason)=>{
      try{
        await DataAPI.requestVoidPenjualan(id, reason);
        Toast.success('Permintaan hapus diajukan — menunggu approval admin');
        _pjData=await DataAPI.getPenjualan().catch(()=>[]);
        _renderPenjualan(document.getElementById('page-content'),_pjQ);
      }catch(e){Toast.error(e.message);}
    },
  });
}
function _pjVoidShowApproval(id){
  const r = _pjData.find(x=>x.id===id); if (!r) return;
  _approvalModal({
    title: `Hapus Penjualan — ${r.menu_nama}`,
    subtitle: `Diajukan oleh ${r.created_by||'-'} · ${r.tanggal} (${r.shift})`,
    simple: true,
    changes: [
      {label:'Menu', after:r.menu_nama},
      {label:'Qty', after:r.qty},
      {label:'Total', after:fmt.currency(r.total)},
      {label:'Metode', after:r.metode},
    ],
    note: r.void_reason || '(tidak ada alasan)',
    onApprove: ()=>_pjVoidApprove(id),
    onReject: (reason)=>_pjVoidReject(id,reason),
  });
}
async function _pjVoidApprove(id){
  try{
    await DataAPI.approveVoidPenjualan(id);
    Toast.success('Transaksi dihapus — stok dikembalikan');
    _pjData=await DataAPI.getPenjualan().catch(()=>[]);
    _renderPenjualan(document.getElementById('page-content'),_pjQ);
  }catch(e){Toast.error(e.message);}
}
async function _pjVoidReject(id,reason){
  try{
    await DataAPI.rejectVoidPenjualan(id,reason);
    Toast.warning('Pengajuan hapus ditolak');
    _pjData=await DataAPI.getPenjualan().catch(()=>[]);
    _renderPenjualan(document.getElementById('page-content'),_pjQ);
  }catch(e){Toast.error(e.message);}
}
function _pjView(id){
  const r = _pjData.find(x=>x.id===id); if (!r) return;
  _viewModal({title:`Detail Penjualan — ${r.menu_nama}`, subtitle:`${r.tanggal} · Shift ${r.shift}`, fields:[
    {label:'Menu', value:r.menu_nama},
    {label:'Qty', value:r.qty},
    {label:'Harga', value:fmt.currency(r.harga)},
    {label:'Total', value:fmt.currency(r.total)},
    {label:'Metode', value:r.metode},
    {label:'Oleh', value:r.created_by||'-'},
  ]});
}
function _pjOpenEdit(id){
  const r = _pjData.find(x=>x.id===id); if (!r) return;
  const approvedMenu = _pjMenu.filter(m=>m.status==='approved'&&m.aktif!==false);
  Modal.open({title:Auth.isAdmin()?'Edit Penjualan':'Edit Penjualan — perlu approval admin', body:`
    <div class="form-row cols-2">
      <div class="form-group"><label>Tanggal</label><input id="pj-e-tgl" type="date" value="${r.tanggal}"/></div>
      <div class="form-group"><label>Shift</label><select id="pj-e-shift">${['Pagi','Siang','Malam','Long Shift'].map(s=>`<option ${s===r.shift?'selected':''}>${s}</option>`).join('')}</select></div>
    </div>
    <div class="form-group"><label>Menu</label><select id="pj-e-menu">${approvedMenu.map(m=>`<option value="${m.id}" data-h="${m.harga}" data-n="${m.nama}" ${m.id===r.menu_id?'selected':''}>${m.nama}</option>`).join('')}</select></div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Qty</label><input id="pj-e-qty" type="number" min="1" value="${r.qty}"/></div>
      <div class="form-group"><label>Metode</label><select id="pj-e-metode">${['Mixed','Cash','QRIS','Debit','Transfer'].map(s=>`<option ${s===r.metode?'selected':''}>${s}</option>`).join('')}</select></div>
    </div>
    ${Auth.isAdmin()?'':'<p class="text-sm text-gray">Perubahan akan berstatus <b>menunggu approval admin</b>. Stok baru disesuaikan setelah disetujui.</p>'}`,
    footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" onclick="_pjSaveEdit(${id})">${Auth.isAdmin()?'Simpan':'Submit Perubahan'}</button>`,
  });
}
async function _pjSaveEdit(id){
  const r = _pjData.find(x=>x.id===id); if (!r) return;
  const tgl=document.getElementById('pj-e-tgl').value;
  const shift=document.getElementById('pj-e-shift').value;
  const sel=document.getElementById('pj-e-menu'); const o=sel.options[sel.selectedIndex];
  const menuId=+sel.value, menuNama=o.dataset.n, harga=+o.dataset.h;
  const qty=+document.getElementById('pj-e-qty').value;
  const metode=document.getElementById('pj-e-metode').value;
  if(!tgl||!qty){Toast.error('Isi semua field wajib');return;}
  const total = harga*qty;
  try{
    if (Auth.isAdmin()) {
      await DataAPI.reapplyPenjualanStock(r.menu_id, r.qty, menuId, qty);
      await DataAPI.updatePenjualan(id,{tanggal:tgl,shift,menu_id:menuId,menu_nama:menuNama,harga,qty,total,metode,status:'approved',reject_reason:null,pending_before:null});
      await DataAPI.addAudit('Penjualan', menuNama, 'Edit (langsung, oleh admin)');
      Modal.close(); Toast.success('Perubahan disimpan');
    } else {
      const before = {tanggal:r.tanggal,shift:r.shift,menu_id:r.menu_id,menu_nama:r.menu_nama,harga:r.harga,qty:r.qty,total:r.total,metode:r.metode};
      await DataAPI.updatePenjualan(id,{tanggal:tgl,shift,menu_id:menuId,menu_nama:menuNama,harga,qty,total,metode,status:'waiting',pending_before:JSON.stringify(before)});
      await DataAPI.addAudit('Penjualan', menuNama, 'Edit (menunggu approval)');
      Modal.close(); Toast.success('Perubahan disubmit untuk approval');
    }
    _pjData=await DataAPI.getPenjualan().catch(()=>[]);
    _renderPenjualan(document.getElementById('page-content'),_pjQ);
  }catch(e){Toast.error(e.message);}
}
function _pjShowApproval(id){
  const r = _pjData.find(x=>x.id===id); if (!r) return;
  const before = r.pending_before ? (typeof r.pending_before==='string'?JSON.parse(r.pending_before):r.pending_before) : null;
  const changes = [
    {label:'Tanggal', before:before?.tanggal, after:r.tanggal},
    {label:'Shift', before:before?.shift, after:r.shift},
    {label:'Menu', before:before?.menu_nama, after:r.menu_nama},
    {label:'Qty', before:before?.qty, after:r.qty},
    {label:'Total', before:before?.total!=null?fmt.currency(before.total):undefined, after:fmt.currency(r.total)},
    {label:'Metode', before:before?.metode, after:r.metode},
  ];
  _approvalModal({
    title: `Edit Penjualan — ${r.menu_nama}`,
    subtitle: `Diajukan oleh ${r.created_by||'-'}`,
    changes,
    onApprove: ()=>_pjApprove(id),
    onReject: (reason)=>_pjReject(id,reason),
  });
}
async function _pjApprove(id){
  const r = _pjData.find(x=>x.id===id); if (!r) return;
  const before = r.pending_before ? (typeof r.pending_before==='string'?JSON.parse(r.pending_before):r.pending_before) : null;
  try{
    if (before) await DataAPI.reapplyPenjualanStock(before.menu_id, before.qty, r.menu_id, r.qty);
    await DataAPI.updatePenjualanStatus(id,'approved');
    await DataAPI.updatePenjualan(id,{pending_before:null});
    Toast.success('Perubahan penjualan diapprove — stok disesuaikan');
    _pjData=await DataAPI.getPenjualan().catch(()=>[]);
    _renderPenjualan(document.getElementById('page-content'),_pjQ);
  }catch(e){Toast.error(e.message);}
}
async function _pjReject(id,reason){
  const r = _pjData.find(x=>x.id===id); if (!r) return;
  const before = r.pending_before ? (typeof r.pending_before==='string'?JSON.parse(r.pending_before):r.pending_before) : null;
  try{
    if (before) {
      await DataAPI.updatePenjualan(id,{...before,status:'approved',reject_reason:reason,pending_before:null});
    } else {
      await DataAPI.updatePenjualanStatus(id,'rejected',reason);
    }
    Toast.warning('Perubahan penjualan direject');
    _pjData=await DataAPI.getPenjualan().catch(()=>[]);
    _renderPenjualan(document.getElementById('page-content'),_pjQ);
  }catch(e){Toast.error(e.message);}
}

let _pjApprovedMenu=[], _pjRowSeq=0;
function _openPenjualan() {
  _pjApprovedMenu = _pjMenu.filter(m=>m.status==='approved'&&m.aktif!==false);
  _pjRowSeq = 0;
  Modal.open({
    title:'Input Penjualan',
    size:'lg',
    body:`
    <div class="form-row cols-2">
      <div class="form-group"><label>Tanggal<span class="req">*</span></label><input id="pj-tgl" type="date" value="${new Date().toISOString().split('T')[0]}"/></div>
      <div class="form-group"><label>Shift<span class="req">*</span></label><select id="pj-shift"><option>Pagi</option><option>Siang</option><option>Malam</option><option>Long Shift</option></select></div>
    </div>
    <p class="text-sm text-gray" style="margin:4px 0 10px">Tambahkan sebanyak mungkin baris menu — misalnya Latte (Cash) x10, Latte (QRIS) x5, Americano (Cash) x5 — lalu submit sekaligus.</p>
    <div class="cart-row-head"><span>Menu</span><span>Qty</span><span>Metode</span><span>Subtotal</span><span></span></div>
    <div id="pj-cart-rows"></div>
    <button class="btn btn-ghost btn-sm" onclick="_pjAddRow()">${IC.plus()} Tambah Menu</button>
    <div class="divider" style="margin:14px 0"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:15px">
      <span>Total Keseluruhan</span><span id="pj-cart-total" class="font-mono">Rp0</span>
    </div>
    <div id="pj-cart-preview" style="margin-top:10px"></div>`,
    footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
            <button class="btn btn-primary" onclick="_savePenjualanCart()">Submit Semua & Kurangi Stok</button>`,
  });
  _pjAddRow();
}
function _pjAddRow(){
  const id = ++_pjRowSeq;
  const wrap = document.getElementById('pj-cart-rows');
  if (!wrap) return;
  const div = document.createElement('div');
  div.className='cart-row'; div.id=`pj-row-${id}`;
  div.innerHTML = `
    <select class="pj-row-menu" onchange="_pjRowCalc(${id})">
      <option value="">— Pilih Menu —</option>
      ${_pjApprovedMenu.map(m=>`<option value="${m.id}" data-h="${m.harga}" data-n="${m.nama}">${m.nama}</option>`).join('')}
    </select>
    <input class="pj-row-qty" type="number" min="1" placeholder="Qty" oninput="_pjRowCalc(${id})"/>
    <select class="pj-row-metode"><option>Mixed</option><option>Cash</option><option>QRIS</option><option>Debit</option><option>Transfer</option></select>
    <input class="pj-row-sub" readonly placeholder="Rp0"/>
    <button class="btn btn-ghost btn-icon btn-sm" onclick="_pjRemoveRow(${id})">${IC.trash()}</button>`;
  wrap.appendChild(div);
}
function _pjRemoveRow(id){
  const row = document.getElementById(`pj-row-${id}`);
  if (row) row.remove();
  _pjCartCalc();
}
function _pjRowCalc(id){
  const row = document.getElementById(`pj-row-${id}`);
  if (!row) return;
  const sel = row.querySelector('.pj-row-menu'); const o = sel.options[sel.selectedIndex];
  const qty = +row.querySelector('.pj-row-qty').value || 0;
  const harga = +o?.dataset.h || 0;
  row.querySelector('.pj-row-sub').value = fmt.currency(harga*qty);
  _pjCartCalc();
}
function _pjCartCalc(){
  let total = 0;
  document.querySelectorAll('#pj-cart-rows .cart-row').forEach(row=>{
    const sel = row.querySelector('.pj-row-menu'); const o = sel.options[sel.selectedIndex];
    const qty = +row.querySelector('.pj-row-qty').value || 0;
    total += (+o?.dataset.h || 0) * qty;
  });
  const el=document.getElementById('pj-cart-total'); if(el) el.textContent = fmt.currency(total);
  _pjCartPreview();
}
function _pjCartPreview(){
  const need = {};
  document.querySelectorAll('#pj-cart-rows .cart-row').forEach(row=>{
    const sel = row.querySelector('.pj-row-menu'); const menuId=+sel.value; if(!menuId) return;
    const qty = +row.querySelector('.pj-row-qty').value || 0; if(!qty) return;
    _pjResep.filter(r=>r.menu_id===menuId && (r.status||'approved')==='approved').forEach(l=>{
      if (!need[l.bahan_id]) need[l.bahan_id] = { nama:l.bahan_nama, satuan:l.satuan, qty:0 };
      need[l.bahan_id].qty += l.qty*qty;
    });
  });
  const prev = document.getElementById('pj-cart-preview'); if (!prev) return;
  const items = Object.values(need);
  prev.innerHTML = !items.length ? '' : `<div style="background:var(--blue-50);border:1px solid var(--blue-100);border-radius:8px;padding:12px">
    <div style="font-size:11px;font-weight:700;color:var(--blue-700);margin-bottom:6px">📦 Total bahan yang akan dikurangi:</div>
    ${items.map(it=>`<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
      <span>${it.nama}</span><span class="font-mono">${fmt.number(it.qty)} ${it.satuan}</span>
    </div>`).join('')}
  </div>`;
}
async function _savePenjualanCart(){
  const tgl=document.getElementById('pj-tgl').value;
  const shift=document.getElementById('pj-shift').value;
  if(!tgl){Toast.error('Tanggal wajib diisi');return;}
  const rows = [...document.querySelectorAll('#pj-cart-rows .cart-row')].map(row=>{
    const sel = row.querySelector('.pj-row-menu'); const o = sel.options[sel.selectedIndex];
    const qty = +row.querySelector('.pj-row-qty').value || 0;
    const metode = row.querySelector('.pj-row-metode').value;
    if (!sel.value || !qty) return null;
    const harga = +o.dataset.h;
    return { menu_id:+sel.value, menu_nama:o.dataset.n, harga, qty, metode, total:harga*qty };
  }).filter(Boolean);
  if (!rows.length){ Toast.error('Tambahkan minimal 1 menu dengan qty valid'); return; }
  try{
    for (const r of rows) {
      await DataAPI.savePenjualan({tanggal:tgl,shift,menu_id:r.menu_id,menu_nama:r.menu_nama,qty:r.qty,harga:r.harga,total:r.total,metode:r.metode,created_by:Auth.user.username});
    }
    Modal.close(); Toast.success(`${rows.length} baris penjualan disimpan — stok dikurangi otomatis`);
    _pjData=await DataAPI.getPenjualan().catch(()=>[]);
    const cont=document.getElementById('page-content'); if(cont) _renderPenjualan(cont,_pjQ);
  } catch(e){Toast.error(e.message);}
}

// ─── PAGE: STOCK ─────────────────────────────────────────────
async function pageStock(el) {
  const [bahan,penjualanAll,resep]=await Promise.all([DataAPI.getBahan().catch(()=>[]),DataAPI.getPenjualan().catch(()=>[]),DataAPI.getResep().catch(()=>[])]);
  const penjualan=penjualanAll.filter(p=>p.void_status!=='voided');
  const today=new Date().toISOString().split('T')[0];
  const usage=DataAPI.computeUsage(penjualan,resep,today);

  el.innerHTML=`
  <div class="page-head">
    <div><h2>Stok Bahan</h2><p>Saldo stok sistem berdasarkan pembelian dikurangi penjualan</p></div>
    <button class="btn btn-ghost" onclick="_exportStock()">${IC.download()} Export Excel</button>
  </div>
  <div class="card">
    <div class="card-head"><span class="card-title">${IC.bahan()} Saldo Stok Saat Ini</span></div>
    <div class="card-body-p0">
      ${buildTable({cols:[
        {key:'kode',label:'Kode'},{key:'nama',label:'Bahan'},{key:'satuan',label:'Satuan'},
        {label:'Stok Sistem',render:r=>`<strong class="font-mono">${fmt.number(r.stock_current)}</strong>`},
        {label:'Min',render:r=>`<span class="font-mono">${fmt.number(r.min_stock)}</span>`},
        {label:'Terpakai Hari Ini',render:r=>{const u=usage.find(x=>x.bahan_id===r.id); return `<span class="font-mono" style="color:var(--orange-500)">${fmt.number(u?.total_used||0)} ${r.satuan}</span>`;}},
        {label:'Status',render:r=>r.stock_current<=r.min_stock?badge('critical'):r.stock_current<=r.min_stock*1.5?badge('warning'):badge('normal')},
        {label:'Level',render:r=>{
          const pct=Math.min(r.stock_current/Math.max(r.max_stock,1)*100,100);
          const c=r.stock_current<=r.min_stock?'var(--red-600)':r.stock_current<=r.min_stock*1.5?'var(--orange-500)':'var(--green-500)';
          return `<div class="stock-mini"><div class="stock-bar"><div class="stock-fill" style="width:${pct}%;background:${c}"></div></div><div style="font-size:10px;color:${c}">${pct.toFixed(0)}%</div></div>`;
        }},
      ],data:bahan.filter(b=>b.status==='approved'),empty:'Tidak ada bahan aktif'})}
    </div>
  </div>`;
  window._stockExportData = { bahan: bahan.filter(b=>b.status==='approved'), usage };
}
function _exportStock(){
  const { bahan, usage } = window._stockExportData || { bahan:[], usage:[] };
  _exportCSV('stok-bahan.csv',
    ['Kode','Bahan','Satuan','Stok Sistem','Min Stock','Max Stock','Terpakai Hari Ini','Status'],
    bahan.map(r=>{
      const u=usage.find(x=>x.bahan_id===r.id);
      const status = r.stock_current<=r.min_stock?'Critical':r.stock_current<=r.min_stock*1.5?'Warning':'Normal';
      return [r.kode,r.nama,r.satuan,r.stock_current,r.min_stock,r.max_stock,u?.total_used||0,status];
    })
  );
}

// ─── PAGE: PEMBELIAN ──────────────────────────────────────────
let _pbData=[], _pbBahan=[], _pbFil={dari:'',sampai:''};
async function pagePembelian(el) {
  [_pbData,_pbBahan] = await Promise.all([DataAPI.getPembelian().catch(()=>[]),DataAPI.getBahan().catch(()=>[])]);
  _renderPembelian(el);
}
function _pbFiltered(){
  let data = _pbData;
  if (_pbFil.dari)   data = data.filter(p=>p.tanggal>=_pbFil.dari);
  if (_pbFil.sampai) data = data.filter(p=>p.tanggal<=_pbFil.sampai);
  return data;
}
function _pbDateLabel(){
  if (_pbFil.dari && _pbFil.sampai) return `${_pbFil.dari} — ${_pbFil.sampai}`;
  if (_pbFil.dari) return `Dari ${_pbFil.dari}`;
  if (_pbFil.sampai) return `s/d ${_pbFil.sampai}`;
  return 'Semua Tanggal';
}
function _pbToggleDatePanel(){
  const p = document.getElementById('pb-date-panel');
  if (p) p.style.display = (p.style.display==='none'||!p.style.display) ? 'flex' : 'none';
}
function _pbDateApply(){
  _pbFil.dari = document.getElementById('pb-date-dari')?.value || '';
  _pbFil.sampai = document.getElementById('pb-date-sampai')?.value || '';
  _renderPembelian(document.getElementById('page-content'));
}
function _pbDateReset(){
  _pbFil.dari=''; _pbFil.sampai='';
  _renderPembelian(document.getElementById('page-content'));
}
function _renderPembelian(el){
  const data = _pbFiltered();
  el.innerHTML=`
  <div class="page-head">
    <div><h2>Pembelian</h2><p>Input pembelian bahan baku — stok otomatis bertambah</p></div>
    <div class="page-head-actions">
      <button class="btn btn-ghost" onclick="_exportPembelian()">${IC.download()} Export Excel</button>
      <button class="btn btn-primary" onclick="_openPembelian()">${IC.plus()} Input Pembelian</button>
    </div>
  </div>
  <div class="card">
    <div class="card-head">
      <div class="filter-field">
        <span class="filter-label">Tanggal</span>
        <button type="button" class="btn btn-ghost filter-date-btn" onclick="_pbToggleDatePanel()">📅 ${_pbDateLabel()}</button>
        <div id="pb-date-panel" class="date-range-panel" style="display:none">
          <div><label>Dari</label><input type="date" id="pb-date-dari" value="${_pbFil.dari}"/></div>
          <div><label>Sampai</label><input type="date" id="pb-date-sampai" value="${_pbFil.sampai}"/></div>
          <div style="display:flex;gap:8px;margin-top:4px">
            <button type="button" class="btn btn-ghost btn-sm" style="flex:1" onclick="_pbDateReset()">Reset</button>
            <button type="button" class="btn btn-primary btn-sm" style="flex:1" onclick="_pbDateApply()">Terapkan</button>
          </div>
        </div>
      </div>
      <span class="text-sm text-gray">${data.length} pembelian</span>
    </div>
    <div class="card-body-p0">
    ${buildTable({cols:[
      {key:'tanggal',label:'Tanggal'},{key:'bahan_nama',label:'Bahan'},
      {label:'Qty',render:r=>`<b>${fmt.number(r.qty)}</b> ${r.satuan||''}`},
      {label:'Harga/sat',render:r=>fmt.currency(r.harga_satuan)},
      {label:'Total',render:r=>`<span class="font-mono">${fmt.currency(r.total)}</span>`},
      {key:'supplier',label:'Supplier'},{key:'created_by',label:'Oleh'},
      {label:'Status',render:r=>{
        if (r.void_status==='pending') {
          return Auth.isAdmin()
            ? `<button class="btn btn-ghost btn-sm" onclick="_pbVoidShowApproval(${r.id})" style="padding:0">${badge('pending')} <span class="text-sm">🗑️ Lihat Detail</span></button>`
            : `${badge('pending')} <span class="text-sm text-gray">Menunggu approval hapus</span>`;
        }
        if (r.status==='waiting') return `<button class="btn btn-ghost btn-sm" onclick="_pbShowApproval(${r.id})" style="padding:0">${badge('waiting')} ${Auth.isAdmin()?'<span class=\"text-sm\">ℹ️ Lihat Detail</span>':''}</button>`;
        const b = badge('approved');
        if (r.reject_reason) return `${b}<div class="text-sm" style="color:var(--red-600)">Alasan: ${r.reject_reason}</div>`;
        if (r.void_reject_reason) return `${b}<div class="text-sm" style="color:var(--red-600)">Hapus ditolak: ${r.void_reject_reason}</div>`;
        return b;
      }},
      {label:'',render:r=>r.void_status==='pending'?'':`<div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="_pbView(${r.id})">View</button>
        <button class="btn btn-ghost btn-sm" onclick="_pbOpenEdit(${r.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="_pbDeleteRequest(${r.id})">Delete</button>
      </div>`},
    ],data,empty:'Belum ada pembelian',
      rowId:r=>`row-pembelian-${r.id}`,
      rowClass:r=>(_isMyVoidNotified(r,'pembelian')||_isMyNotified(r,'pembelian'))?'row-notify':'',
      rowAttrs:r=>{
        if (_isMyVoidNotified(r,'pembelian')) return `onclick="_dismiss('pembelian',${r.id},'void:${(r.void_reject_reason||'').replace(/'/g,"\\'")}');this.classList.remove('row-notify')"`;
        if (_isMyNotified(r,'pembelian')) return `onclick="_dismiss('pembelian',${r.id},'${(r.reject_reason||'').replace(/'/g,"\\'")}');this.classList.remove('row-notify')"`;
        return '';
      },
    })}
  </div></div>`;
  _scrollToNotified();
}
function _exportPembelian(){
  _exportCSV('pembelian.csv',
    ['Tanggal','Bahan','Qty','Satuan','Harga/Satuan','Total','Supplier','Oleh','Status'],
    _pbFiltered().map(r=>[r.tanggal,r.bahan_nama,r.qty,r.satuan,r.harga_satuan,r.total,r.supplier,r.created_by,r.void_status||'Aktif'])
  );
}
function _pbDeleteRequest(id){
  const r = _pbData.find(x=>x.id===id); if (!r) return;
  _deletePrompt({
    adminMsg:`Yakin mau hapus pembelian "${r.bahan_nama}"? Stok akan dikurangi kembali.`,
    userMsg:'Alasan hapus pembelian ini?',
    onAdmin: async ()=>{
      try{
        await DataAPI.approveVoidPembelian(id);
        Toast.success('Pembelian dihapus — stok dikurangi kembali');
        _pbData=await DataAPI.getPembelian().catch(()=>[]);
        _renderPembelian(document.getElementById('page-content'));
      }catch(e){Toast.error(e.message);}
    },
    onUser: async (reason)=>{
      try{
        await DataAPI.requestVoidPembelian(id, reason);
        Toast.success('Permintaan hapus diajukan — menunggu approval admin');
        _pbData=await DataAPI.getPembelian().catch(()=>[]);
        _renderPembelian(document.getElementById('page-content'));
      }catch(e){Toast.error(e.message);}
    },
  });
}
function _pbVoidShowApproval(id){
  const r=_pbData.find(x=>x.id===id); if(!r) return;
  _approvalModal({
    title: `Hapus Pembelian — ${r.bahan_nama}`,
    subtitle: `Diajukan oleh ${r.created_by||'-'} · ${r.tanggal}`,
    simple: true,
    changes: [
      {label:'Bahan', after:r.bahan_nama},
      {label:'Qty', after:`${fmt.number(r.qty)} ${r.satuan||''}`},
      {label:'Total', after:fmt.currency(r.total)},
      {label:'Supplier', after:r.supplier||'-'},
    ],
    note: r.void_reason || '(tidak ada alasan)',
    onApprove: ()=>_pbVoidApprove(id),
    onReject: (reason)=>_pbVoidReject(id,reason),
  });
}
async function _pbVoidApprove(id){
  try{
    await DataAPI.approveVoidPembelian(id);
    Toast.success('Pembelian dihapus — stok dikurangi kembali');
    _pbData=await DataAPI.getPembelian().catch(()=>[]);
    _renderPembelian(document.getElementById('page-content'));
  }catch(e){Toast.error(e.message);}
}
async function _pbVoidReject(id,reason){
  try{
    await DataAPI.rejectVoidPembelian(id,reason);
    Toast.warning('Pengajuan hapus ditolak');
    _pbData=await DataAPI.getPembelian().catch(()=>[]);
    _renderPembelian(document.getElementById('page-content'));
  }catch(e){Toast.error(e.message);}
}
function _pbView(id){
  const r=_pbData.find(x=>x.id===id); if(!r) return;
  _viewModal({title:`Detail Pembelian — ${r.bahan_nama}`, subtitle:r.tanggal, fields:[
    {label:'Bahan', value:r.bahan_nama},
    {label:'Qty', value:`${fmt.number(r.qty)} ${r.satuan||''}`},
    {label:'Harga/satuan', value:fmt.currency(r.harga_satuan)},
    {label:'Total', value:fmt.currency(r.total)},
    {label:'Supplier', value:r.supplier||'-'},
    {label:'Oleh', value:r.created_by||'-'},
  ]});
}
function _pbOpenEdit(id){
  const r=_pbData.find(x=>x.id===id); if(!r) return;
  const approvedBahan = _pbBahan.filter(b=>b.status==='approved'&&b.aktif!==false);
  Modal.open({title:Auth.isAdmin()?'Edit Pembelian':'Edit Pembelian — perlu approval admin', body:`
    <div class="form-row cols-2">
      <div class="form-group"><label>Tanggal</label><input id="pb-e-tgl" type="date" value="${r.tanggal}"/></div>
      <div class="form-group"><label>Bahan</label><select id="pb-e-bahan">${approvedBahan.map(b=>`<option value="${b.id}" data-n="${b.nama}" data-s="${b.satuan}" ${b.id===r.bahan_id?'selected':''}>${b.nama} (${b.satuan})</option>`).join('')}</select></div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Qty (satuan dasar)</label><input id="pb-e-qty" type="number" min="0" step="any" value="${r.qty}"/></div>
      <div class="form-group"><label>Harga Total (Rp)</label><input id="pb-e-hrg" type="number" value="${r.total}"/></div>
    </div>
    <div class="form-group"><label>Supplier</label><input id="pb-e-sup" value="${(r.supplier||'').replace(/"/g,'&quot;')}"/></div>
    ${Auth.isAdmin()?'':'<p class="text-sm text-gray">Perubahan akan berstatus <b>menunggu approval admin</b>. Stok baru disesuaikan setelah disetujui.</p>'}`,
    footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" onclick="_pbSaveEdit(${id})">${Auth.isAdmin()?'Simpan':'Submit Perubahan'}</button>`,
  });
}
async function _pbSaveEdit(id){
  const r=_pbData.find(x=>x.id===id); if(!r) return;
  const tgl=document.getElementById('pb-e-tgl').value;
  const sel=document.getElementById('pb-e-bahan'); const o=sel.options[sel.selectedIndex];
  const bahanId=+sel.value, bahanNama=o.dataset.n, satuan=o.dataset.s;
  const qty=+document.getElementById('pb-e-qty').value;
  const total=+document.getElementById('pb-e-hrg').value;
  const supplier=document.getElementById('pb-e-sup').value;
  if(!tgl||!qty||!total){Toast.error('Isi semua field wajib');return;}
  const hargaSatuan = qty?Math.round(total/qty):0;
  try{
    if (Auth.isAdmin()) {
      await DataAPI.reapplyPembelianStock(r.bahan_id, r.qty, bahanId, qty);
      await DataAPI.updatePembelian(id,{tanggal:tgl,bahan_id:bahanId,bahan_nama:bahanNama,satuan,qty,harga_satuan:hargaSatuan,total,supplier,status:'approved',reject_reason:null,pending_before:null});
      await DataAPI.addAudit('Pembelian', bahanNama, 'Edit (langsung, oleh admin)');
      Modal.close(); Toast.success('Perubahan disimpan');
    } else {
      const before = {tanggal:r.tanggal,bahan_id:r.bahan_id,bahan_nama:r.bahan_nama,satuan:r.satuan,qty:r.qty,harga_satuan:r.harga_satuan,total:r.total,supplier:r.supplier};
      await DataAPI.updatePembelian(id,{tanggal:tgl,bahan_id:bahanId,bahan_nama:bahanNama,satuan,qty,harga_satuan:hargaSatuan,total,supplier,status:'waiting',pending_before:JSON.stringify(before)});
      await DataAPI.addAudit('Pembelian', bahanNama, 'Edit (menunggu approval)');
      Modal.close(); Toast.success('Perubahan disubmit untuk approval');
    }
    _pbData=await DataAPI.getPembelian().catch(()=>[]);
    _renderPembelian(document.getElementById('page-content'));
  }catch(e){Toast.error(e.message);}
}
function _pbShowApproval(id){
  const r=_pbData.find(x=>x.id===id); if(!r) return;
  const before = r.pending_before ? (typeof r.pending_before==='string'?JSON.parse(r.pending_before):r.pending_before) : null;
  const changes = [
    {label:'Tanggal', before:before?.tanggal, after:r.tanggal},
    {label:'Bahan', before:before?.bahan_nama, after:r.bahan_nama},
    {label:'Qty', before:before?.qty, after:r.qty},
    {label:'Total', before:before?.total!=null?fmt.currency(before.total):undefined, after:fmt.currency(r.total)},
    {label:'Supplier', before:before?.supplier, after:r.supplier||'-'},
  ];
  _approvalModal({
    title: `Edit Pembelian — ${r.bahan_nama}`,
    subtitle: `Diajukan oleh ${r.created_by||'-'}`,
    changes,
    onApprove: ()=>_pbApprove(id),
    onReject: (reason)=>_pbReject(id,reason),
  });
}
async function _pbApprove(id){
  const r=_pbData.find(x=>x.id===id); if(!r) return;
  const before = r.pending_before ? (typeof r.pending_before==='string'?JSON.parse(r.pending_before):r.pending_before) : null;
  try{
    if (before) await DataAPI.reapplyPembelianStock(before.bahan_id, before.qty, r.bahan_id, r.qty);
    await DataAPI.updatePembelianStatus(id,'approved');
    await DataAPI.updatePembelian(id,{pending_before:null});
    Toast.success('Perubahan pembelian diapprove — stok disesuaikan');
    _pbData=await DataAPI.getPembelian().catch(()=>[]);
    _renderPembelian(document.getElementById('page-content'));
  }catch(e){Toast.error(e.message);}
}
async function _pbReject(id,reason){
  const r=_pbData.find(x=>x.id===id); if(!r) return;
  const before = r.pending_before ? (typeof r.pending_before==='string'?JSON.parse(r.pending_before):r.pending_before) : null;
  try{
    if (before) {
      await DataAPI.updatePembelian(id,{...before,status:'approved',reject_reason:reason,pending_before:null});
    } else {
      await DataAPI.updatePembelianStatus(id,'rejected',reason);
    }
    Toast.warning('Perubahan pembelian direject');
    _pbData=await DataAPI.getPembelian().catch(()=>[]);
    _renderPembelian(document.getElementById('page-content'));
  }catch(e){Toast.error(e.message);}
}
// Konversi satuan beli -> satuan stok dasar. Misal beli 1 kg kopi -> stok
// nambah 1000 gram (base satuan bahan tetap 'gram').
const PB_UNIT_CONVERT = {
  gram: [{v:'gram', f:1,    l:'gram'}, {v:'kg',    f:1000, l:'kg'}],
  ml:   [{v:'ml',   f:1,    l:'ml'},   {v:'liter', f:1000, l:'liter'}],
};
function _pbUnitOptions(baseSatuan){
  return PB_UNIT_CONVERT[baseSatuan] || [{v:baseSatuan, f:1, l:baseSatuan}];
}
let _pbApprovedBahan=[], _pbRowSeq=0, _pbFoto=null;
function _openPembelian(){
  _pbApprovedBahan = _pbBahan.filter(b=>b.status==='approved'&&b.aktif!==false);
  _pbRowSeq = 0;
  _pbFoto = null;
  Modal.open({title:'Input Pembelian', size:'lg', body:`
    <div class="form-row cols-2">
      <div class="form-group"><label>Tanggal<span class="req">*</span></label><input id="pb-tgl" type="date" value="${new Date().toISOString().split('T')[0]}"/></div>
      <div class="form-group"><label>Supplier</label><input id="pb-sup" placeholder="Nama supplier"/></div>
    </div>
    <p class="text-sm text-gray" style="margin:4px 0 10px">Tambahkan beberapa bahan sekaligus dalam satu nota pembelian.</p>
    <div class="pb-cart-row-head"><span>Bahan</span><span>Jumlah</span><span>Satuan</span><span>Harga (Rp)</span><span></span></div>
    <div id="pb-cart-rows"></div>
    <button class="btn btn-ghost btn-sm" onclick="_pbAddRow()">${IC.plus()} Tambah Bahan</button>
    <div class="divider" style="margin:14px 0"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:15px">
      <span>Total Nota</span><span id="pb-cart-total" class="font-mono">Rp0</span>
    </div>
    <div class="form-group" style="margin-top:14px"><label>Foto Nota<span class="req">*</span></label>
      <div class="upload-zone" id="pb-zone" onclick="document.getElementById('pb-file').click()">
        <input type="file" id="pb-file" accept="image/*" style="display:none" onchange="_pbFotoFn(event)"/>
        ${IC.img()} <p>Klik upload foto nota/struk</p><small>JPG/PNG</small>
      </div>
    </div>`,
    footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" onclick="_savePembelianCart()">Submit Semua & Tambah Stok</button>`,
  });
  _pbAddRow();
}
function _pbAddRow(){
  const id = ++_pbRowSeq;
  const wrap = document.getElementById('pb-cart-rows'); if (!wrap) return;
  const div = document.createElement('div');
  div.className='pb-cart-row'; div.id=`pb-row-${id}`;
  div.innerHTML = `
    <select class="pb-row-bahan" onchange="_pbRowBahanChange(${id})">
      <option value="">— Pilih Bahan —</option>
      ${_pbApprovedBahan.map(b=>`<option value="${b.id}" data-n="${b.nama}" data-s="${b.satuan}">${b.nama} (${b.satuan})</option>`).join('')}
    </select>
    <input class="pb-row-qty" type="number" min="0" step="any" placeholder="0" oninput="_pbRowCalc(${id})"/>
    <select class="pb-row-unit" disabled onchange="_pbRowCalc(${id})"><option>—</option></select>
    <input class="pb-row-hrg" type="number" placeholder="Total Rp" oninput="_pbRowCalc(${id})"/>
    <button class="btn btn-ghost btn-icon btn-sm" onclick="_pbRemoveRow(${id})">${IC.trash()}</button>
    <div class="pb-row-info text-sm text-gray" style="grid-column:1/-1;margin-top:-4px"></div>`;
  wrap.appendChild(div);
}
function _pbRemoveRow(id){ const row=document.getElementById(`pb-row-${id}`); if(row) row.remove(); _pbCartCalc(); }
function _pbRowBahanChange(id){
  const row = document.getElementById(`pb-row-${id}`); if (!row) return;
  const sel = row.querySelector('.pb-row-bahan'); const o = sel.options[sel.selectedIndex];
  const baseSatuan = o?.dataset.s || '';
  const unitSel = row.querySelector('.pb-row-unit');
  const opts = _pbUnitOptions(baseSatuan);
  unitSel.disabled = !baseSatuan;
  unitSel.innerHTML = opts.map(u=>`<option value="${u.v}" data-f="${u.f}">${u.l}</option>`).join('');
  _pbRowCalc(id);
}
function _pbRowCalc(id){
  const row = document.getElementById(`pb-row-${id}`); if (!row) return;
  const sel = row.querySelector('.pb-row-bahan'); const baseSatuan = sel.options[sel.selectedIndex]?.dataset.s||'';
  const qty = +row.querySelector('.pb-row-qty').value || 0;
  const unitSel = row.querySelector('.pb-row-unit');
  const factor = +unitSel.options[unitSel.selectedIndex]?.dataset.f || 1;
  const qtyBase = qty*factor;
  const info = row.querySelector('.pb-row-info');
  if (info) info.textContent = baseSatuan ? `= ${fmt.number(qtyBase)} ${baseSatuan} masuk stok` : '';
  _pbCartCalc();
}
function _pbCartCalc(){
  let total = 0;
  document.querySelectorAll('#pb-cart-rows .pb-cart-row').forEach(row=>{ total += +row.querySelector('.pb-row-hrg').value || 0; });
  const el = document.getElementById('pb-cart-total'); if (el) el.textContent = fmt.currency(total);
}
function _pbFotoFn(e){_pbFoto=e.target.files[0]; if(!_pbFoto)return; const z=document.getElementById('pb-zone'); z.classList.add('done'); z.querySelector('p').textContent='✓ '+_pbFoto.name;}
async function _savePembelianCart(){
  const tgl=document.getElementById('pb-tgl').value;
  const supplier=document.getElementById('pb-sup').value;
  if (!tgl){ Toast.error('Tanggal wajib diisi'); return; }
  if (!_pbFoto){ Toast.error('Foto nota wajib diupload'); return; }
  const rows = [...document.querySelectorAll('#pb-cart-rows .pb-cart-row')].map(row=>{
    const sel = row.querySelector('.pb-row-bahan'); const o = sel.options[sel.selectedIndex];
    const qty = +row.querySelector('.pb-row-qty').value || 0;
    const hrgTotal = +row.querySelector('.pb-row-hrg').value || 0;
    const unitSel = row.querySelector('.pb-row-unit'); const unitOpt = unitSel.options[unitSel.selectedIndex];
    const factor = +unitOpt?.dataset.f || 1;
    const baseSatuan = o?.dataset.s || '';
    if (!sel.value || !qty || !hrgTotal) return null;
    const qtyBase = qty*factor;
    return { bahan_id:+sel.value, bahan_nama:o.dataset.n, satuan:baseSatuan, qty:qtyBase, harga_satuan: qtyBase?Math.round(hrgTotal/qtyBase):0, total:hrgTotal };
  }).filter(Boolean);
  if (!rows.length){ Toast.error('Tambahkan minimal 1 bahan dengan jumlah & harga valid'); return; }
  try{
    for (const r of rows) {
      await DataAPI.savePembelian({tanggal:tgl,bahan_id:r.bahan_id,bahan_nama:r.bahan_nama,satuan:r.satuan,qty:r.qty,harga_satuan:r.harga_satuan,total:r.total,supplier,foto_nota:true,created_by:Auth.user.username});
    }
    Modal.close(); Toast.success(`${rows.length} bahan dibeli — stok bertambah otomatis`);
    _pbData=await DataAPI.getPembelian().catch(()=>[]);
    const cont=document.getElementById('page-content'); if(cont) _renderPembelian(cont);
  }catch(e){Toast.error(e.message);}
}

// ─── PAGE: REPORT ANALYSIS ────────────────────────────────────
// Catatan: sengaja DICABUT dari ROUTES/NAV (bukan dihapus) — disiapkan
// sebagai fitur tambahan berbayar. Untuk mengaktifkan lagi nanti, tinggal
// tambahkan baris berikut ke ROUTES dan NAV_ADMIN:
//   'report': { label:'Report Analysis', fn: pageReport, icon: IC.trend, admin: false },
//   ...dan masukkan 'report' ke salah satu items array di NAV_ADMIN.
const REP_ROW_DIMS = [
  {key:'menu_nama', label:'Menu'},
  {key:'shift',     label:'Shift'},
  {key:'metode',    label:'Metode Pembayaran'},
];
const REP_PERIODS = [{v:'bulan',l:'Tahun-Bulan'},{v:'tahun',l:'Tahun'},{v:'kuartal',l:'Kuartal'}];
const REP_VALUES  = [{v:'total',l:'Total Penjualan (Rp)'},{v:'qty',l:'Qty Terjual'}];
const REP_AGGS    = [{v:'sum',l:'Sum (Jumlah)'},{v:'avg',l:'Average (Rata-rata)'},{v:'count',l:'Count (Jumlah Baris)'}];

let _repData=[], _repRowDims=['menu_nama'], _repPeriod='bulan', _repValue='total', _repAgg='sum';
let _repDari='', _repSampai='', _repResult=null;

async function pageReport(el) {
  _repData = (await DataAPI.getPenjualan().catch(()=>[])).filter(p=>p.void_status!=='voided');
  _repResult = null;
  _renderReportBuilder(el);
}
function _renderReportBuilder(el) {
  el.innerHTML = `
  <div class="page-head"><div><h2>Report Analysis</h2><p>Buat laporan custom seperti pivot table — pilih dimensi baris, periode kolom, dan nilai.</p></div></div>
  <div class="card" style="margin-bottom:16px"><div class="card-body">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px">
      <div>
        <div class="text-sm" style="font-weight:600;margin-bottom:8px">BARIS (Row Dimensions)</div>
        ${REP_ROW_DIMS.map(d=>`
          <label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;cursor:pointer">
            <input type="checkbox" value="${d.key}" ${_repRowDims.includes(d.key)?'checked':''} onchange="_repToggleDim('${d.key}',this.checked)" style="width:16px;height:16px;flex:none"/> ${d.label}
          </label>`).join('')}
      </div>
      <div>
        <div class="text-sm" style="font-weight:600;margin-bottom:8px">KOLOM (Periode)</div>
        ${REP_PERIODS.map(p=>`
          <label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;cursor:pointer">
            <input type="radio" name="rep-period" value="${p.v}" ${_repPeriod===p.v?'checked':''} onchange="_repPeriod='${p.v}'" style="width:16px;height:16px;flex:none"/> ${p.l}
          </label>`).join('')}
        <div class="text-sm" style="font-weight:600;margin:14px 0 8px">NILAI</div>
        ${REP_VALUES.map(p=>`
          <label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;cursor:pointer">
            <input type="radio" name="rep-value" value="${p.v}" ${_repValue===p.v?'checked':''} onchange="_repValue='${p.v}'" style="width:16px;height:16px;flex:none"/> ${p.l}
          </label>`).join('')}
      </div>
      <div>
        <div class="text-sm" style="font-weight:600;margin-bottom:8px">AGREGASI</div>
        ${REP_AGGS.map(p=>`
          <label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;cursor:pointer">
            <input type="radio" name="rep-agg" value="${p.v}" ${_repAgg===p.v?'checked':''} onchange="_repAgg='${p.v}'" style="width:16px;height:16px;flex:none"/> ${p.l}
          </label>`).join('')}
        <div class="text-sm" style="font-weight:600;margin:14px 0 8px">FILTER TANGGAL</div>
        <div style="display:flex;gap:8px">
          <input type="date" id="rep-dari" value="${_repDari}" style="flex:1"/>
          <input type="date" id="rep-sampai" value="${_repSampai}" style="flex:1"/>
        </div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:12px;margin-top:18px">
      <button class="btn btn-primary" onclick="_repGenerate()">${IC.trend()} Generate Report</button>
      <button class="btn btn-ghost" onclick="_repReset()">Reset</button>
      <span class="text-sm text-gray">${_repData.length} baris data terbentuk</span>
    </div>
  </div></div>
  <div id="rep-result"></div>`;
  if (_repResult) _renderReportResult(document.getElementById('rep-result'));
}
function _repToggleDim(key,checked){
  if (checked) { if(!_repRowDims.includes(key)) _repRowDims.push(key); }
  else _repRowDims = _repRowDims.filter(k=>k!==key);
}
function _repReset(){
  _repRowDims=['menu_nama']; _repPeriod='bulan'; _repValue='total'; _repAgg='sum';
  _repDari=''; _repSampai=''; _repResult=null;
  _renderReportBuilder(document.getElementById('page-content'));
}
function _repPeriodKey(tanggal, mode){
  const d = new Date(tanggal); const y=d.getFullYear(); const m=d.getMonth()+1;
  if (mode==='tahun') return String(y);
  if (mode==='kuartal') return `${y}-Q${Math.ceil(m/3)}`;
  return `${y}-${String(m).padStart(2,'0')}`;
}
function _repGenerate(){
  _repDari = document.getElementById('rep-dari')?.value||'';
  _repSampai = document.getElementById('rep-sampai')?.value||'';
  if (!_repRowDims.length){ Toast.error('Pilih minimal 1 dimensi baris'); return; }

  let data = _repData;
  if (_repDari)   data = data.filter(p=>p.tanggal>=_repDari);
  if (_repSampai) data = data.filter(p=>p.tanggal<=_repSampai);

  const periodsSet = new Set();
  const groups = {}; // rowKey -> { label, periods: { period: [values] } }
  data.forEach(r=>{
    const rowKey = _repRowDims.map(k=>r[k]||'-').join(' / ');
    const period = _repPeriodKey(r.tanggal, _repPeriod);
    periodsSet.add(period);
    if (!groups[rowKey]) groups[rowKey] = { label: rowKey, periods: {} };
    if (!groups[rowKey].periods[period]) groups[rowKey].periods[period] = [];
    groups[rowKey].periods[period].push(_repValue==='qty' ? (r.qty||0) : (r.total||0));
  });
  const periods = [...periodsSet].sort();
  const rows = Object.values(groups).map(g=>{
    const cells = {};
    periods.forEach(p=>{
      const vals = g.periods[p];
      if (!vals) { cells[p]=null; return; }
      if (_repAgg==='sum') cells[p] = vals.reduce((a,b)=>a+b,0);
      else if (_repAgg==='avg') cells[p] = vals.reduce((a,b)=>a+b,0)/vals.length;
      else cells[p] = vals.length;
    });
    return { label:g.label, cells };
  }).sort((a,b)=>a.label.localeCompare(b.label));

  const chartItems = periods.map(p=>{
    const total = rows.reduce((s,r)=>s+(r.cells[p]||0),0);
    return { label:p.length>7?p.slice(2):p, value: _repValue==='total' ? Math.round(total/1000) : Math.round(total), color:'#1B4FD8' };
  });

  _repResult = { periods, rows, chartItems, totalRows:data.length };
  _renderReportResult(document.getElementById('rep-result'));
}
function _repFmtVal(v){
  if (v==null) return '-';
  if (_repValue==='total') return fmt.currency(v);
  return fmt.number(Math.round(v*10)/10);
}
function _renderReportResult(el){
  if (!el) return;
  if (!_repResult) { el.innerHTML=''; return; }
  const {periods,rows,chartItems,totalRows} = _repResult;
  const dimLabels = _repRowDims.map(k=>REP_ROW_DIMS.find(d=>d.key===k)?.label||k).join(' / ');
  el.innerHTML = !rows.length ? `<div class="card"><div class="card-body"><div class="empty-state"><p>Tidak ada data untuk filter ini</p></div></div></div>` : `
  <div class="card" style="margin-bottom:16px">
    <div class="card-head"><span class="card-title">${IC.trend()} Total ${_repValue==='total'?'Penjualan (Rp, ribuan)':'Qty'} per Periode</span></div>
    <div class="card-body">${barChart(chartItems,760,150)}</div>
  </div>
  <div class="card">
    <div class="card-head"><span class="card-title">Pivot Table</span><span class="text-sm text-gray">${rows.length} baris — ${periods.length} periode — ${totalRows} data mentah</span></div>
    <div class="card-body-p0" style="overflow-x:auto">
      <table><thead><tr><th>${dimLabels}</th>${periods.map(p=>`<th>${p}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r=>`<tr><td>${r.label}</td>${periods.map(p=>`<td class="font-mono">${_repFmtVal(r.cells[p])}</td>`).join('')}</tr>`).join('')}</tbody></table>
    </div>
  </div>`;
}

// ─── PAGE: STOCK OPNAME (ADMIN ONLY) ────────────────────────
let _soData=[],_soBahan=[];
async function pageStockOpname(el) {
  el.innerHTML=`<div class="empty-state"><p>Memuat...</p></div>`;
  [_soData,_soBahan]=await Promise.all([DataAPI.getStockOpname().catch(()=>[]),DataAPI.getBahan().catch(()=>[])]);
  _renderOpname(el);
}
function _renderOpname(el) {
  el.innerHTML=`
  <div class="page-head">
    <div><h2>Stock Opname</h2><p>Pengecekan stok fisik vs sistem — stok sistem diupdate sesuai hasil fisik</p></div>
    <button class="btn btn-primary" onclick="_openOpname()">${IC.plus()} Input Opname</button>
  </div>
  <div class="kpi-grid" style="max-width:450px;margin-bottom:16px">
    <div class="kpi-card red"><div class="kpi-label">Critical</div><div class="kpi-val">${_soData.filter(d=>d.status==='critical').length}</div></div>
    <div class="kpi-card orange"><div class="kpi-label">Warning</div><div class="kpi-val">${_soData.filter(d=>d.status==='warning').length}</div></div>
    <div class="kpi-card green"><div class="kpi-label">Normal</div><div class="kpi-val">${_soData.filter(d=>d.status==='normal').length}</div></div>
  </div>
  <div class="card">
    <div class="card-body-p0">
      ${buildTable({cols:[
        {key:'tanggal',label:'Tanggal'},{key:'shift',label:'Shift'},{key:'bahan_nama',label:'Bahan'},
        {label:'Stok Sistem',render:r=>`<span class="font-mono">${fmt.number(r.system_stock)}</span>`},
        {label:'Stok Fisik',render:r=>`<span class="font-mono font-bold">${fmt.number(r.actual_stock)}</span>`},
        {label:'Variance',render:r=>`<span class="font-mono" style="color:${r.variance<0?'var(--red-600)':r.variance>0?'var(--orange-500)':'var(--green-600)'}">${r.variance>0?'+':''}${fmt.number(r.variance)}</span>`},
        {key:'reason',label:'Keterangan'},
        {label:'Status',render:r=>badge(r.status)},
        {key:'created_by',label:'Oleh'},
      ],data:_soData,empty:'Belum ada stock opname'})}
    </div>
  </div>`;
  }

let _soFoto=null;
function _openOpname() {
  _soFoto=null;
  const approved=_soBahan.filter(b=>b.status==='approved');
  Modal.open({title:'Input Stock Opname',body:`
    <div class="form-row cols-2">
      <div class="form-group"><label>Tanggal<span class="req">*</span></label><input id="so-tgl" type="date" value="${new Date().toISOString().split('T')[0]}"/></div>
      <div class="form-group"><label>Shift<span class="req">*</span></label><select id="so-shift"><option>Pagi</option><option>Siang</option><option>Malam</option></select></div>
    </div>
    <div class="form-group"><label>Bahan<span class="req">*</span></label>
      <select id="so-bahan" onchange="_onSoBahan()"><option value="">— Pilih Bahan —</option>
        ${approved.map(b=>`<option value="${b.id}" data-stock="${b.stock_current}" data-sat="${b.satuan}">${b.nama} (sistem: ${fmt.number(b.stock_current)} ${b.satuan})</option>`).join('')}
      </select></div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Stok Sistem</label><input id="so-sys" readonly/></div>
      <div class="form-group"><label>Stok Fisik (Hitung Manual)<span class="req">*</span></label><input id="so-actual" type="number" placeholder="0" oninput="_onSoCalc()"/></div>
    </div>
    <div class="form-group"><label>Variance</label><input id="so-var" readonly/></div>
    <div id="so-status" style="margin:8px 0"></div>
    <div class="form-group"><label>Keterangan</label><textarea id="so-reason" rows="2" placeholder="Contoh: spillage, expired..."></textarea></div>
    <div class="form-group">
      <label>Foto Stok Fisik<span class="req">*</span></label>
      <div class="upload-zone" id="so-zone" onclick="document.getElementById('so-file').click()">
        <input type="file" id="so-file" accept="image/*" style="display:none" onchange="_onSoFoto(event)"/>
        ${IC.img()} <p>Klik untuk upload foto</p><small>JPG/PNG</small>
      </div>
    </div>`,
    footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
            <button class="btn btn-primary" onclick="_saveOpname()">Simpan & Update Stok</button>`,
  });
}
function _onSoBahan(){
  const s=document.getElementById('so-bahan'); const o=s.options[s.selectedIndex];
  const el=document.getElementById('so-sys'); if(el) el.value=`${fmt.number(o.dataset.stock||0)} ${o.dataset.sat||''}`;
  _onSoCalc();
}
function _onSoCalc(){
  const s=document.getElementById('so-bahan'); const o=s?.options[s?.selectedIndex];
  const sys=parseFloat(o?.dataset.stock)||0;
  const actual=parseFloat(document.getElementById('so-actual')?.value)||0;
  const variance=actual-sys;
  const pct=sys>0?Math.abs(variance/sys*100):0;
  const status=pct>=APP_CONFIG.variance_critical_pct?'critical':pct>=APP_CONFIG.variance_warning_pct?'warning':'normal';
  const el=document.getElementById('so-var'); if(el){el.value=`${variance>=0?'+':''}${fmt.number(variance)} ${o?.dataset.sat||''}`; el.style.color=variance<0?'var(--red-600)':variance>0?'var(--orange-500)':'var(--green-600)';}
  const sel=document.getElementById('so-status'); if(sel) sel.innerHTML=badge(status)+` <span class="text-sm text-gray" style="margin-left:6px">Variance ${pct.toFixed(1)}%</span>`;
}
function _onSoFoto(e){_soFoto=e.target.files[0]; if(!_soFoto)return; const z=document.getElementById('so-zone'); z.classList.add('done'); z.querySelector('p').textContent='✓ '+_soFoto.name;}
async function _saveOpname(){
  const s=document.getElementById('so-bahan'); const o=s.options[s.selectedIndex];
  const tgl=document.getElementById('so-tgl').value;
  const bahanId=+s.value; const bahanNama=o.text.split(' (')[0];
  const sys=parseFloat(o.dataset.stock)||0;
  const actual=parseFloat(document.getElementById('so-actual').value);
  if(!tgl||!bahanId||isNaN(actual)){Toast.error('Isi semua field');return;}
  if(!_soFoto){Toast.error('Foto stok fisik wajib diupload');return;}
  const variance=actual-sys;
  const pct=sys>0?Math.abs(variance/sys*100):0;
  const status=pct>=APP_CONFIG.variance_critical_pct?'critical':pct>=APP_CONFIG.variance_warning_pct?'warning':'normal';
  try{
    await DataAPI.saveStockOpname({tanggal:tgl,shift:document.getElementById('so-shift').value,bahan_id:bahanId,bahan_nama:bahanNama,system_stock:sys,actual_stock:actual,variance,reason:document.getElementById('so-reason').value,foto:true,status,created_by:Auth.user.username});
    Modal.close(); Toast.success('Opname disimpan — stok sistem diupdate ke '+fmt.number(actual));
    if(status==='critical') Toast.warning('⚠ CRITICAL: Selisih besar ditemukan! Perlu investigasi.');
    [_soData,_soBahan]=await Promise.all([DataAPI.getStockOpname().catch(()=>[]),DataAPI.getBahan().catch(()=>[])]);
    const el=document.getElementById('page-content'); if(el) _renderOpname(el);
  }catch(e){Toast.error(e.message);}
}

// ─── PAGE: DAILY REPORT ─────────────────────────────────────
let _drData=[], _drFoto=null, _drPenjualan=[], _drFil={dari:'',sampai:''};
async function pageDailyReport(el) {
  [_drData,_drPenjualan] = await Promise.all([
    DataAPI.getDailyReport().catch(()=>[]),
    DataAPI.getPenjualan().catch(()=>[]).then(d=>d.filter(p=>p.void_status!=='voided')),
  ]);
  _renderDR(el);
}
function _drFiltered(){
  let data = _drData;
  if (_drFil.dari)   data = data.filter(p=>p.tanggal>=_drFil.dari);
  if (_drFil.sampai) data = data.filter(p=>p.tanggal<=_drFil.sampai);
  return data;
}
function _drDateLabel(){
  if (_drFil.dari && _drFil.sampai) return `${_drFil.dari} — ${_drFil.sampai}`;
  if (_drFil.dari) return `Dari ${_drFil.dari}`;
  if (_drFil.sampai) return `s/d ${_drFil.sampai}`;
  return 'Semua Tanggal';
}
function _drToggleDatePanel(){
  const p = document.getElementById('dr-date-panel');
  if (p) p.style.display = (p.style.display==='none'||!p.style.display) ? 'flex' : 'none';
}
function _drDateApply(){
  _drFil.dari = document.getElementById('dr-date-dari')?.value || '';
  _drFil.sampai = document.getElementById('dr-date-sampai')?.value || '';
  _renderDR(document.getElementById('page-content'));
}
function _drDateReset(){
  _drFil.dari=''; _drFil.sampai='';
  _renderDR(document.getElementById('page-content'));
}
function _renderDR(el){
  const data = _drFiltered();
  el.innerHTML=`
  <div class="page-head">
    <div><h2>Daily Report</h2><p>Laporan kas harian — rekonsiliasi total sistem (Penjualan) vs total aktual</p></div>
    <div class="page-head-actions">
      <button class="btn btn-ghost" onclick="_exportDR()">${IC.download()} Export Excel</button>
      <button class="btn btn-primary" onclick="_openDR()">${IC.plus()} Input Report</button>
    </div>
  </div>
  <div class="card">
    <div class="card-head">
      <div class="filter-field">
        <span class="filter-label">Tanggal</span>
        <button type="button" class="btn btn-ghost filter-date-btn" onclick="_drToggleDatePanel()">📅 ${_drDateLabel()}</button>
        <div id="dr-date-panel" class="date-range-panel" style="display:none">
          <div><label>Dari</label><input type="date" id="dr-date-dari" value="${_drFil.dari}"/></div>
          <div><label>Sampai</label><input type="date" id="dr-date-sampai" value="${_drFil.sampai}"/></div>
          <div style="display:flex;gap:8px;margin-top:4px">
            <button type="button" class="btn btn-ghost btn-sm" style="flex:1" onclick="_drDateReset()">Reset</button>
            <button type="button" class="btn btn-primary btn-sm" style="flex:1" onclick="_drDateApply()">Terapkan</button>
          </div>
        </div>
      </div>
      <span class="text-sm text-gray">${data.length} laporan</span>
    </div>
    <div class="card-body-p0">
      ${buildTable({cols:[
        {key:'tanggal',label:'Tanggal'},{key:'user',label:'User'},{key:'shift',label:'Shift'},
        {label:'Total Sistem',render:r=>`<strong class="font-mono">${fmt.currency(r.total_pos ?? ((r.mixed||0)+(r.cash||0)+(r.qris||0)+(r.debit||0)+(r.transfer||0)))}</strong>`},
        {label:'Total Aktual',render:r=>fmt.currency(r.total_sales)},
        {label:'Variance',render:r=>`<span class="font-mono" style="color:${r.variance!==0?'var(--red-600)':'var(--green-600)'}">${r.variance>=0?'+':''}${fmt.currency(r.variance)}</span>`},
        {label:'Status',render:r=>{
          if (r.delete_status==='pending') {
            return Auth.isAdmin()
              ? `<button class="btn btn-ghost btn-sm" onclick="_drDeleteShowApproval(${r.id})" style="padding:0">${badge('pending')} <span class="text-sm">🗑️ Lihat Detail</span></button>`
              : `${badge('pending')} <span class="text-sm text-gray">Menunggu approval hapus</span>`;
          }
          if (r.status==='waiting') return `<button class="btn btn-ghost btn-sm" onclick="_drShowApproval(${r.id})" style="padding:0">${badge('waiting')} ${Auth.isAdmin()?'<span class=\"text-sm\">ℹ️ Lihat Detail</span>':''}</button>`;
          const b = r.variance===0?badge('approved'):badge('warning');
          if (r.reject_reason) return `${b}<div class="text-sm" style="color:var(--red-600)">Alasan: ${r.reject_reason}</div>`;
          if (r.delete_reject_reason) return `${b}<div class="text-sm" style="color:var(--red-600)">Hapus ditolak: ${r.delete_reject_reason}</div>`;
          return b;
        }},
        {label:'',render:r=>{
          if (r.status==='waiting'||r.delete_status==='pending') return '';
          return `<div style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn btn-ghost btn-sm" onclick="_drView(${r.id})">View</button>
            <button class="btn btn-ghost btn-sm" onclick="_openDREdit(${r.id})">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="_drDeleteRequest(${r.id})">Delete</button>
          </div>`;
        }},
      ],data,empty:'Belum ada daily report',
        rowId:r=>`row-dr-${r.id}`,
        rowClass:r=>(_isMyDRNotified(r)||_isMyDRDeleteNotified(r))?'row-notify':'',
        rowAttrs:r=>{
          if (_isMyDRDeleteNotified(r)) return `onclick="_dismiss('daily-report-del',${r.id},'${(r.delete_reject_reason||'').replace(/'/g,"\\'")}');this.classList.remove('row-notify')"`;
          if (_isMyDRNotified(r)) return `onclick="_dismiss('daily-report',${r.id},'${(r.reject_reason||'').replace(/'/g,"\\'")}');this.classList.remove('row-notify')"`;
          return '';
        },
      })}
    </div>
  </div>`;
  _scrollToNotified();
  }
function _exportDR(){
  _exportCSV('daily-report.csv',
    ['Tanggal','User','Shift','Total Sistem','Total Aktual','Variance','Status'],
    _drFiltered().map(r=>[r.tanggal,r.user,r.shift,r.total_pos ?? ((r.mixed||0)+(r.cash||0)+(r.qris||0)+(r.debit||0)+(r.transfer||0)),r.total_sales,r.variance,r.status])
  );
}
function _drShowApproval(id){
  const r=_drData.find(x=>x.id===id); if(!r) return;
  const before = r.pending_before ? (typeof r.pending_before==='string'?JSON.parse(r.pending_before):r.pending_before) : null;
  const changes = [
    {label:'Total Aktual', before:before?.total_sales!=null?fmt.currency(before.total_sales):undefined, after:fmt.currency(r.total_sales)},
    {label:'Catatan', before:before?.catatan, after:r.catatan||'-'},
  ];
  _approvalModal({
    title: `Edit Daily Report — ${r.tanggal}`,
    subtitle: `Diajukan oleh ${r.user||'-'} · Shift ${r.shift}`,
    changes,
    onApprove: ()=>_drApprove(id),
    onReject: (reason)=>_drReject(id,reason),
  });
}
async function _drApprove(id){await DataAPI.updateDailyReportStatus(id,'submitted'); Toast.success('Perubahan daily report diapprove'); _drData=await DataAPI.getDailyReport().catch(()=>[]); _renderDR(document.getElementById('page-content'));}
async function _drReject(id,reason){
  const r = _drData.find(x=>x.id===id);
  const before = r?.pending_before ? (typeof r.pending_before==='string'?JSON.parse(r.pending_before):r.pending_before) : null;
  if (before) {
    const tot = r.total_pos ?? ((r.mixed||0)+(r.cash||0)+(r.qris||0)+(r.debit||0)+(r.transfer||0));
    await DataAPI.updateDailyReport(id, {total_sales:before.total_sales, catatan:before.catatan, variance:tot-before.total_sales, status:'submitted', reject_reason:reason, pending_before:null});
  } else {
    await DataAPI.updateDailyReportStatus(id,'rejected',reason);
  }
  Toast.warning('Perubahan daily report direject'); _drData=await DataAPI.getDailyReport().catch(()=>[]); _renderDR(document.getElementById('page-content'));
}
function _openDR(){
  _drFoto=null;
  Modal.open({title:'Input Daily Report',size:'lg',body:`
    <div class="form-row cols-2">
      <div class="form-group"><label>Tanggal<span class="req">*</span></label><input id="dr-tgl" type="date" value="${new Date().toISOString().split('T')[0]}" onchange="_drAutoFill()"/></div>
      <div class="form-group"><label>Shift<span class="req">*</span></label><select id="dr-shift" onchange="_drAutoFill()"><option>Pagi</option><option>Siang</option><option>Malam</option><option>Long Shift</option></select></div>
    </div>
    <div class="form-group"><label>Total Sales Aktual (hitung fisik/POS)<span class="req">*</span></label><input id="dr-sales" type="number" placeholder="0" oninput="_drCalc()"/></div>
    <p class="text-sm text-gray" style="margin:-4px 0 10px">Breakdown per metode di bawah <b>otomatis dihitung</b> dari data Penjualan pada tanggal & shift yang dipilih — tidak bisa diedit manual.</p>
    <div class="form-row cols-2">
      <div class="form-group"><label>Mixed</label><input id="dr-mixed" type="number" value="0" readonly/></div>
      <div class="form-group"><label>Cash</label><input id="dr-cash" type="number" value="0" readonly/></div>
    </div>
    <div class="form-row cols-3">
      <div class="form-group"><label>QRIS</label><input id="dr-qris" type="number" value="0" readonly/></div>
      <div class="form-group"><label>Debit</label><input id="dr-debit" type="number" value="0" readonly/></div>
      <div class="form-group"><label>Transfer</label><input id="dr-transfer" type="number" value="0" readonly/></div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Total Sistem (dari Penjualan)</label><input id="dr-total" readonly/></div>
      <div class="form-group"><label>Variance</label><input id="dr-var" readonly/></div>
    </div>
    <div id="dr-rec" style="margin:8px 0"></div>
    <div class="form-group"><label>Catatan</label><textarea id="dr-cat" rows="2"></textarea></div>
    <div class="form-group"><label>Foto Bukti POS<span class="req">*</span></label>
      <div class="upload-zone" id="dr-zone" onclick="document.getElementById('dr-file').click()">
        <input type="file" id="dr-file" accept="image/*" style="display:none" onchange="_drFotoFn(event)"/>
        ${IC.img()} <p>Klik upload foto POS</p><small>JPG/PNG</small>
      </div>
    </div>`,
    footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
            <button class="btn btn-primary" onclick="_saveDR()">Submit Daily Report</button>`,
  });
  setTimeout(_drAutoFill, 0);
}
function _drAutoFill(){
  const tgl = document.getElementById('dr-tgl')?.value;
  const shift = document.getElementById('dr-shift')?.value;
  const sums = { Mixed:0, Cash:0, QRIS:0, Debit:0, Transfer:0 };
  if (tgl && shift) {
    _drPenjualan.filter(p=>p.tanggal===tgl && p.shift===shift).forEach(p=>{
      if (sums[p.metode]!==undefined) sums[p.metode]+=p.total;
      else sums.Mixed+=p.total;
    });
  }
  const setVal=(id,v)=>{const el=document.getElementById(id); if(el) el.value=v;};
  setVal('dr-mixed', sums.Mixed);
  setVal('dr-cash', sums.Cash);
  setVal('dr-qris', sums.QRIS);
  setVal('dr-debit', sums.Debit);
  setVal('dr-transfer', sums.Transfer);
  _drCalc();
}
function _drCalc(){
  const sales=+document.getElementById('dr-sales')?.value||0;
  const mixed=+document.getElementById('dr-mixed')?.value||0;
  const cash=+document.getElementById('dr-cash')?.value||0;
  const qris=+document.getElementById('dr-qris')?.value||0;
  const debit=+document.getElementById('dr-debit')?.value||0;
  const transfer=+document.getElementById('dr-transfer')?.value||0;
  const tot=mixed+cash+qris+debit+transfer; const variance=tot-sales;
  const te=document.getElementById('dr-total'); if(te) te.value=fmt.currency(tot);
  const ve=document.getElementById('dr-var'); if(ve){ve.value=`${variance>=0?'+':''}${fmt.currency(variance)}`;ve.style.color=variance!==0?'var(--red-600)':'var(--green-600)';}
  const re=document.getElementById('dr-rec'); if(re&&sales>0) re.innerHTML=variance===0?`<span class="badge bg-green">BALANCED — Rekonsiliasi sesuai</span>`:`<span class="badge bg-red">INVESTIGATE — Selisih ${fmt.currency(Math.abs(variance))}</span>`;
}
function _drFotoFn(e){_drFoto=e.target.files[0]; if(!_drFoto)return; const z=document.getElementById('dr-zone'); z.classList.add('done'); z.querySelector('p').textContent='✓ '+_drFoto.name;}
async function _saveDR(){
  const tgl=document.getElementById('dr-tgl').value;
  const shift=document.getElementById('dr-shift').value;
  const sales=+document.getElementById('dr-sales').value;
  if(!tgl||!sales){Toast.error('Tanggal dan Total Sales wajib');return;}
  if(!_drFoto){Toast.error('Foto bukti POS wajib');return;}
  const mixed=+document.getElementById('dr-mixed').value;
  const cash=+document.getElementById('dr-cash').value;
  const qris=+document.getElementById('dr-qris').value;
  const debit=+document.getElementById('dr-debit').value;
  const transfer=+document.getElementById('dr-transfer').value;
  const tot=mixed+cash+qris+debit+transfer; const variance=tot-sales;
  try{
    await DataAPI.saveDailyReport({tanggal:tgl,user:Auth.user.username,shift,total_sales:sales,mixed,cash,qris,debit,transfer,total_pos:tot,variance,catatan:document.getElementById('dr-cat').value,pos_foto:true,status:'submitted',pending_before:null});
    Modal.close(); Toast.success('Daily report disubmit');
    if(variance!==0) Toast.warning('Variance terdeteksi: '+fmt.currency(Math.abs(variance)));
    _drData=await DataAPI.getDailyReport().catch(()=>[]);
    const el=document.getElementById('page-content'); if(el) _renderDR(el);
  }catch(e){Toast.error(e.message);}
}
function _openDREdit(id){
  const r=_drData.find(x=>x.id===id); if(!r) return;
  Modal.open({title:Auth.isAdmin()?`Edit Daily Report — ${r.tanggal}`:`Edit Daily Report — ${r.tanggal} (perlu approval admin)`,size:'lg',body:`
    <div class="form-row cols-2">
      <div class="form-group"><label>Tanggal</label><input value="${r.tanggal}" readonly/></div>
      <div class="form-group"><label>Shift</label><input value="${r.shift}" readonly/></div>
    </div>
    <div class="form-group"><label>Total Sistem (dari Penjualan)</label><input value="${fmt.currency(r.total_pos ?? ((r.mixed||0)+(r.cash||0)+(r.qris||0)+(r.debit||0)+(r.transfer||0)))}" readonly/></div>
    <div class="form-group"><label>Total Sales Aktual (hitung fisik/POS)<span class="req">*</span></label><input id="dr-e-sales" type="number" value="${r.total_sales}"/></div>
    <div class="form-group"><label>Catatan</label><textarea id="dr-e-cat" rows="2">${r.catatan||''}</textarea></div>
    ${Auth.isAdmin()?'':'<p class="text-sm text-gray">Perubahan akan berstatus <b>menunggu approval admin</b> sebelum dianggap final.</p>'}`,
    footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" onclick="_saveDREdit(${id})">${Auth.isAdmin()?'Simpan':'Submit Perubahan'}</button>`,
  });
}
async function _saveDREdit(id){
  const r=_drData.find(x=>x.id===id); if(!r) return;
  const sales=+document.getElementById('dr-e-sales').value;
  const catatan=document.getElementById('dr-e-cat').value;
  if(!sales){Toast.error('Total Sales wajib diisi');return;}
  const tot = r.total_pos ?? ((r.mixed||0)+(r.cash||0)+(r.qris||0)+(r.debit||0)+(r.transfer||0));
  try{
    if (Auth.isAdmin()) {
      await DataAPI.updateDailyReport(id,{total_sales:sales,catatan,variance:tot-sales,status:'submitted',reject_reason:null,pending_before:null});
      await DataAPI.addAudit('DailyReport',r.tanggal,'Edit (langsung, oleh admin)');
      Modal.close(); Toast.success('Perubahan disimpan');
    } else {
      const before = { total_sales:r.total_sales, catatan:r.catatan||'' };
      await DataAPI.updateDailyReport(id,{total_sales:sales,catatan,variance:tot-sales,status:'waiting',pending_before:JSON.stringify(before)});
      await DataAPI.addAudit('DailyReport',r.tanggal,'Edit (menunggu approval)');
      Modal.close(); Toast.success('Perubahan disubmit untuk approval');
    }
    _drData=await DataAPI.getDailyReport().catch(()=>[]); _renderDR(document.getElementById('page-content'));
  }catch(e){Toast.error(e.message);}
}
function _drView(id){
  const r=_drData.find(x=>x.id===id); if(!r) return;
  _viewModal({title:`Detail Daily Report — ${r.tanggal}`, subtitle:`Shift ${r.shift}`, fields:[
    {label:'User', value:r.user||'-'},
    {label:'Total Sistem', value:fmt.currency(r.total_pos ?? ((r.mixed||0)+(r.cash||0)+(r.qris||0)+(r.debit||0)+(r.transfer||0)))},
    {label:'Total Aktual', value:fmt.currency(r.total_sales)},
    {label:'Variance', value:fmt.currency(r.variance)},
    {label:'Catatan', value:r.catatan||'-'},
    {label:'Status', value:badge(r.status)},
  ]});
}
function _drDeleteRequest(id){
  const r=_drData.find(x=>x.id===id); if(!r) return;
  _deletePrompt({
    adminMsg:`Yakin mau hapus daily report tanggal ${r.tanggal}? Tindakan ini tidak bisa dibatalkan.`,
    userMsg:'Alasan hapus daily report ini?',
    onAdmin: async ()=>{
      try{ await DataAPI.approveDeleteDR(id); Toast.success('Daily report dihapus');
        _drData=await DataAPI.getDailyReport().catch(()=>[]); _renderDR(document.getElementById('page-content'));
      }catch(e){Toast.error(e.message);}
    },
    onUser: async (reason)=>{
      try{ await DataAPI.requestDeleteDR(id,reason); Toast.success('Permintaan hapus diajukan — menunggu approval admin');
        _drData=await DataAPI.getDailyReport().catch(()=>[]); _renderDR(document.getElementById('page-content'));
      }catch(e){Toast.error(e.message);}
    },
  });
}
function _drDeleteShowApproval(id){
  const r=_drData.find(x=>x.id===id); if(!r) return;
  _approvalModal({
    title:`Hapus Daily Report — ${r.tanggal}`,
    subtitle:`Diajukan oleh ${r.user||'-'} · Shift ${r.shift}`,
    simple:true,
    changes:[
      {label:'Total Sistem', after:fmt.currency(r.total_pos ?? ((r.mixed||0)+(r.cash||0)+(r.qris||0)+(r.debit||0)+(r.transfer||0)))},
      {label:'Total Aktual', after:fmt.currency(r.total_sales)},
    ],
    note: r.delete_reason || '(tidak ada alasan)',
    onApprove: async ()=>{ await DataAPI.approveDeleteDR(id); Toast.success('Daily report dihapus'); _drData=await DataAPI.getDailyReport().catch(()=>[]); _renderDR(document.getElementById('page-content')); },
    onReject: async (reason)=>{ await DataAPI.rejectDeleteDR(id,reason); Toast.warning('Permintaan hapus ditolak'); _drData=await DataAPI.getDailyReport().catch(()=>[]); _renderDR(document.getElementById('page-content')); },
  });
}

// ─── PAGE: MASTER BAHAN ──────────────────────────────────────
let _mbData=[], _mbQ='';
async function pageMasterBahan(el){
    _mbData=await DataAPI.getBahan().catch(()=>[]);
  _renderMB(el);
}
function _renderMB(el){
  const data=searchFilter(_mbData,_mbQ,['kode','nama','satuan','supplier']);
  el.innerHTML=`
  <div class="page-head">
    <div><h2>Master Bahan</h2><p>Data bahan baku — perubahan perlu approval admin (kecuali dilakukan admin)</p></div>
    <button class="btn btn-primary" onclick="_openMB()">${IC.plus()} Tambah Bahan</button>
  </div>
  <div class="card">
    <div class="card-head">
      <div class="search-box">${IC.search()}<input type="text" placeholder="Cari..." value="${_mbQ}" oninput="_mbQ=this.value;_renderMB(document.getElementById('page-content'))"/></div>
      <span class="text-sm text-gray">${data.length} bahan</span>
    </div>
    <div class="card-body-p0">
      ${buildTable({cols:[
        {key:'kode',label:'Kode'},{key:'nama',label:'Nama'},{key:'satuan',label:'Satuan'},
        {label:'Stok',render:r=>`<span class="font-mono">${fmt.number(r.stock_current||0)}</span>`},
        {label:'Min',render:r=>`<span class="font-mono">${fmt.number(r.min_stock)}</span>`},
        {key:'supplier',label:'Supplier'},
        {label:'Status',render:r=>{
          if (r.delete_status==='pending') {
            return Auth.isAdmin()
              ? `<button class="btn btn-ghost btn-sm" onclick="_mbDeleteShowApproval(${r.id})" style="padding:0">${badge('pending')} <span class="text-sm">🗑️ Lihat Detail</span></button>`
              : `${badge('pending')} <span class="text-sm text-gray">Menunggu approval hapus</span>`;
          }
          const b = badge(r.status);
          if (r.status==='waiting') return `<button class="btn btn-ghost btn-sm" onclick="_mbShowApproval(${r.id})" style="padding:0">${b} ${Auth.isAdmin()?'<span class=\"text-sm\">ℹ️ Lihat Detail</span>':''}</button>`;
          if (r.reject_reason) return `${b}<div class="text-sm" style="color:var(--red-600)">Alasan: ${r.reject_reason}</div>`;
          if (r.delete_reject_reason) return `${b}<div class="text-sm" style="color:var(--red-600)">Hapus ditolak: ${r.delete_reject_reason}</div>`;
          return b;
        }},
        {label:'Aktif',render:r=>`<input type="checkbox" ${r.aktif!==false?'checked':''} ${Auth.isAdmin()?`onchange="_mbToggleAktif(${r.id},this.checked)"`:'disabled'} style="width:18px;height:18px"/>`},
        {label:'',render:r=>`<div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" onclick="_mbView(${r.id})">View</button>
          <button class="btn btn-ghost btn-sm" onclick="_openMBEdit(${r.id})">Edit</button>
          ${r.delete_status==='pending'?'':`<button class="btn btn-danger btn-sm" onclick="_mbDeleteRequest(${r.id})">Delete</button>`}
        </div>`},
      ],data,empty:'Belum ada bahan',
        rowId:r=>`row-bahan-${r.id}`,
        rowClass:r=>(_isMyNotified(r,'bahan')||_isMyDeleteNotified(r,'bahan'))?'row-notify':'',
        rowAttrs:r=>{
          if (_isMyDeleteNotified(r,'bahan')) return `onclick="_dismiss('bahan-del',${r.id},'${(r.delete_reject_reason||'').replace(/'/g,"\\'")}');this.classList.remove('row-notify')"`;
          if (_isMyNotified(r,'bahan')) return `onclick="_dismiss('bahan',${r.id},'${(r.reject_reason||'').replace(/'/g,"\\'")}');this.classList.remove('row-notify')"`;
          return '';
        },
      })}
    </div>
  </div>`;
  _scrollToNotified();
}
async function _mbToggleAktif(id,aktif){
  try{ await DataAPI.updateBahan(id,{aktif}); Toast.success(aktif?'Bahan diaktifkan':'Bahan dinonaktifkan');
    _mbData=await DataAPI.getBahan().catch(()=>[]); _renderMB(document.getElementById('page-content'));
  }catch(e){Toast.error(e.message);}
}
function _mbShowApproval(id){
  const b=_mbData.find(x=>x.id===id); if(!b) return;
  const before = b.pending_before ? (typeof b.pending_before==='string'?JSON.parse(b.pending_before):b.pending_before) : null;
  const changes = [
    {label:'Nama', before:before?.nama, after:b.nama},
    {label:'Satuan', before:before?.satuan, after:b.satuan},
    {label:'Min Stock', before:before?.min_stock, after:b.min_stock},
    {label:'Max Stock', before:before?.max_stock, after:b.max_stock},
    {label:'Supplier', before:before?.supplier, after:b.supplier||'-'},
  ];
  _approvalModal({
    title: before ? `Edit Bahan — ${b.nama}` : `Bahan Baru — ${b.nama}`,
    subtitle: before ? `Diajukan oleh ${b.created_by||'-'} · perubahan data bahan ${b.kode}` : `Diajukan oleh ${b.created_by||'-'} · bahan baru ${b.kode}`,
    changes,
    onApprove: ()=>_mbApprove(id),
    onReject: (reason)=>_mbReject(id,reason),
  });
}
function _openMB(){
  const kode=_nextKode(_mbData,'BB');
  Modal.open({title:'Tambah Bahan Baku',body:`
  <div class="form-row cols-2">
    <div class="form-group"><label>Kode (otomatis)</label><input id="mb-kode" value="${kode}" readonly/></div>
    <div class="form-group"><label>Nama<span class="req">*</span></label><input id="mb-nama" placeholder="Coffee Bean"/></div>
  </div>
  <div class="form-row cols-2">
    <div class="form-group"><label>Satuan<span class="req">*</span></label><select id="mb-sat"><option>gram</option><option>ml</option><option>pcs</option><option>kg</option><option>liter</option></select></div>
    <div class="form-group"><label>Min Stock</label><input id="mb-min" type="number" value="500"/></div>
  </div>
  <div class="form-row cols-2">
    <div class="form-group"><label>Max Stock</label><input id="mb-max" type="number" value="5000"/></div>
    <div class="form-group"><label>Supplier</label><input id="mb-sup" placeholder="Nama supplier"/></div>
  </div>`,
  footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" onclick="_saveMB()">Submit untuk Approval</button>`,
});}
async function _saveMB(){
  const kode=document.getElementById('mb-kode').value.trim();
  const nama=document.getElementById('mb-nama').value.trim();
  if(!kode||!nama){Toast.error('Kode dan nama wajib');return;}
  const isAdmin = Auth.isAdmin();
  try{
    await DataAPI.saveBahan({kode,nama,satuan:document.getElementById('mb-sat').value,min_stock:+document.getElementById('mb-min').value,max_stock:+document.getElementById('mb-max').value,supplier:document.getElementById('mb-sup').value,status:isAdmin?'approved':'waiting',aktif:true,pending_before:null,stock_current:0,created_by:Auth.user.username});
    Modal.close(); Toast.success(isAdmin?'Bahan ditambahkan':'Bahan disubmit untuk approval');
    _mbData=await DataAPI.getBahan().catch(()=>[]); _renderMB(document.getElementById('page-content'));
  }catch(e){Toast.error(e.message);}
}
async function _mbApprove(id){await DataAPI.updateBahanStatus(id,'approved'); Toast.success('Bahan diapprove'); _mbData=await DataAPI.getBahan().catch(()=>[]); _renderMB(document.getElementById('page-content'));}
async function _mbReject(id,reason){
  const b = _mbData.find(x=>x.id===id);
  const before = b?.pending_before ? (typeof b.pending_before==='string'?JSON.parse(b.pending_before):b.pending_before) : null;
  if (before) {
    // Reject untuk EDIT -> kembalikan field ke nilai sebelumnya
    await DataAPI.updateBahan(id, {...before, status:'approved', reject_reason:reason, pending_before:null});
  } else {
    // Reject untuk bahan BARU -> tetap rejected, tidak ada yang direstore
    await DataAPI.updateBahanStatus(id,'rejected',reason);
  }
  Toast.warning('Bahan direject'); _mbData=await DataAPI.getBahan().catch(()=>[]); _renderMB(document.getElementById('page-content'));
}

function _openMBEdit(id){
  const b=_mbData.find(x=>x.id===id); if(!b) return;
  Modal.open({title:'Edit Bahan — perlu approval admin',body:`
  <div class="form-row cols-2">
    <div class="form-group"><label>Kode</label><input id="mb-e-kode" value="${b.kode}" readonly/></div>
    <div class="form-group"><label>Nama<span class="req">*</span></label><input id="mb-e-nama" value="${(b.nama||'').replace(/"/g,'&quot;')}"/></div>
  </div>
  <div class="form-row cols-2">
    <div class="form-group"><label>Satuan<span class="req">*</span></label><select id="mb-e-sat">${['gram','ml','pcs','kg','liter'].map(s=>`<option ${s===b.satuan?'selected':''}>${s}</option>`).join('')}</select></div>
    <div class="form-group"><label>Min Stock</label><input id="mb-e-min" type="number" value="${b.min_stock}"/></div>
  </div>
  <div class="form-row cols-2">
    <div class="form-group"><label>Max Stock</label><input id="mb-e-max" type="number" value="${b.max_stock}"/></div>
    <div class="form-group"><label>Supplier</label><input id="mb-e-sup" value="${(b.supplier||'').replace(/"/g,'&quot;')}"/></div>
  </div>
  <p class="text-sm text-gray">Perubahan akan berstatus <b>menunggu approval admin</b>. Selama menunggu, bahan ini tidak akan muncul di pilihan resep/pembelian.</p>`,
  footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" onclick="_saveMBEdit(${id})">Submit Perubahan</button>`,
  });
}
async function _saveMBEdit(id){
  const b=_mbData.find(x=>x.id===id); if(!b) return;
  const nama=document.getElementById('mb-e-nama').value.trim();
  if(!nama){Toast.error('Nama wajib');return;}
  const fields = {nama,satuan:document.getElementById('mb-e-sat').value,min_stock:+document.getElementById('mb-e-min').value,max_stock:+document.getElementById('mb-e-max').value,supplier:document.getElementById('mb-e-sup').value};
  try{
    if (Auth.isAdmin()) {
      // Admin: langsung diterapkan, tidak perlu approval diri sendiri.
      await DataAPI.updateBahan(id,{...fields,status:'approved',reject_reason:null,pending_before:null});
      await DataAPI.addAudit('Bahan',nama,'Edit (langsung, oleh admin)');
      Modal.close(); Toast.success('Perubahan disimpan');
    } else {
      const before = { nama:b.nama, satuan:b.satuan, min_stock:b.min_stock, max_stock:b.max_stock, supplier:b.supplier||'' };
      await DataAPI.updateBahan(id,{...fields,status:'waiting',pending_before:JSON.stringify(before)});
      await DataAPI.addAudit('Bahan',nama,'Edit (menunggu approval)');
      Modal.close(); Toast.success('Perubahan disubmit untuk approval');
    }
    _mbData=await DataAPI.getBahan().catch(()=>[]); _renderMB(document.getElementById('page-content'));
  }catch(e){Toast.error(e.message);}
}
function _mbView(id){
  const b=_mbData.find(x=>x.id===id); if(!b) return;
  _viewModal({title:`Detail Bahan — ${b.nama}`, subtitle:`Kode ${b.kode}`, fields:[
    {label:'Nama', value:b.nama},
    {label:'Satuan', value:b.satuan},
    {label:'Stok Saat Ini', value:`${fmt.number(b.stock_current||0)} ${b.satuan}`},
    {label:'Min Stock', value:fmt.number(b.min_stock)},
    {label:'Max Stock', value:fmt.number(b.max_stock)},
    {label:'Supplier', value:b.supplier||'-'},
    {label:'Status', value:badge(b.status)},
    {label:'Aktif', value:b.aktif!==false?'Ya':'Tidak'},
    {label:'Dibuat oleh', value:b.created_by||'-'},
  ]});
}
function _mbDeleteRequest(id){
  const b=_mbData.find(x=>x.id===id); if(!b) return;
  _deletePrompt({
    adminMsg:`Yakin mau hapus bahan "${b.nama}"? Tindakan ini tidak bisa dibatalkan.`,
    userMsg:'Alasan hapus bahan ini?',
    onAdmin: async ()=>{
      try{ await DataAPI.approveDeleteBahan(id); Toast.success('Bahan dihapus');
        _mbData=await DataAPI.getBahan().catch(()=>[]); _renderMB(document.getElementById('page-content'));
      }catch(e){Toast.error(e.message);}
    },
    onUser: async (reason)=>{
      try{ await DataAPI.requestDeleteBahan(id,reason); Toast.success('Permintaan hapus diajukan — menunggu approval admin');
        _mbData=await DataAPI.getBahan().catch(()=>[]); _renderMB(document.getElementById('page-content'));
      }catch(e){Toast.error(e.message);}
    },
  });
}
function _mbDeleteShowApproval(id){
  const b=_mbData.find(x=>x.id===id); if(!b) return;
  _approvalModal({
    title:`Hapus Bahan — ${b.nama}`,
    subtitle:`Diajukan oleh ${b.created_by||'-'} · kode ${b.kode}`,
    simple:true,
    changes:[
      {label:'Nama', after:b.nama},
      {label:'Satuan', after:b.satuan},
      {label:'Stok', after:`${fmt.number(b.stock_current||0)} ${b.satuan}`},
    ],
    note: b.delete_reason || '(tidak ada alasan)',
    onApprove: async ()=>{ await DataAPI.approveDeleteBahan(id); Toast.success('Bahan dihapus'); _mbData=await DataAPI.getBahan().catch(()=>[]); _renderMB(document.getElementById('page-content')); },
    onReject: async (reason)=>{ await DataAPI.rejectDeleteBahan(id,reason); Toast.warning('Permintaan hapus ditolak'); _mbData=await DataAPI.getBahan().catch(()=>[]); _renderMB(document.getElementById('page-content')); },
  });
}

// ─── PAGE: MASTER MENU ───────────────────────────────────────
let _mmData=[];
async function pageMasterMenu(el){
  _mmData=await DataAPI.getMenu().catch(()=>[]);
  el.innerHTML=`
  <div class="page-head">
    <div><h2>Master Menu</h2><p>Daftar produk yang dijual — perubahan perlu approval admin (kecuali dilakukan admin)</p></div>
    <button class="btn btn-primary" onclick="_openMM()">${IC.plus()} Tambah Menu</button>
  </div>
  <div class="card"><div class="card-body-p0">
    ${buildTable({cols:[
      {key:'kode',label:'Kode'},{key:'nama',label:'Menu'},{key:'kategori',label:'Kategori'},
      {label:'Harga',render:r=>fmt.currency(r.harga)},
      {label:'Status',render:r=>{
        if (r.delete_status==='pending') {
          return Auth.isAdmin()
            ? `<button class="btn btn-ghost btn-sm" onclick="_mmDeleteShowApproval(${r.id})" style="padding:0">${badge('pending')} <span class="text-sm">🗑️ Lihat Detail</span></button>`
            : `${badge('pending')} <span class="text-sm text-gray">Menunggu approval hapus</span>`;
        }
        const b = badge(r.status);
        if (r.status==='waiting') return `<button class="btn btn-ghost btn-sm" onclick="_mmShowApproval(${r.id})" style="padding:0">${b} ${Auth.isAdmin()?'<span class=\"text-sm\">ℹ️ Lihat Detail</span>':''}</button>`;
        if (r.reject_reason) return `${b}<div class="text-sm" style="color:var(--red-600)">Alasan: ${r.reject_reason}</div>`;
        if (r.delete_reject_reason) return `${b}<div class="text-sm" style="color:var(--red-600)">Hapus ditolak: ${r.delete_reject_reason}</div>`;
        return b;
      }},
      {label:'Aktif',render:r=>`<input type="checkbox" ${r.aktif!==false?'checked':''} ${Auth.isAdmin()?`onchange="_mmToggleAktif(${r.id},this.checked)"`:'disabled'} style="width:18px;height:18px"/>`},
      {label:'',render:r=>`<div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="_mmView(${r.id})">View</button>
        <button class="btn btn-ghost btn-sm" onclick="_openMMEdit(${r.id})">Edit</button>
        ${r.delete_status==='pending'?'':`<button class="btn btn-danger btn-sm" onclick="_mmDeleteRequest(${r.id})">Delete</button>`}
      </div>`},
    ],data:_mmData,empty:'Belum ada menu',
      rowId:r=>`row-menu-${r.id}`,
      rowClass:r=>(_isMyNotified(r,'menu')||_isMyDeleteNotified(r,'menu'))?'row-notify':'',
      rowAttrs:r=>{
        if (_isMyDeleteNotified(r,'menu')) return `onclick="_dismiss('menu-del',${r.id},'${(r.delete_reject_reason||'').replace(/'/g,"\\'")}');this.classList.remove('row-notify')"`;
        if (_isMyNotified(r,'menu')) return `onclick="_dismiss('menu',${r.id},'${(r.reject_reason||'').replace(/'/g,"\\'")}');this.classList.remove('row-notify')"`;
        return '';
      },
    })}
  </div></div>`;
  _scrollToNotified();
}
async function _mmToggleAktif(id,aktif){
  try{ await DataAPI.updateMenu(id,{aktif}); Toast.success(aktif?'Menu diaktifkan':'Menu dinonaktifkan');
    _mmData=await DataAPI.getMenu().catch(()=>[]); pageMasterMenu(document.getElementById('page-content'));
  }catch(e){Toast.error(e.message);}
}
function _mmShowApproval(id){
  const m=_mmData.find(x=>x.id===id); if(!m) return;
  const before = m.pending_before ? (typeof m.pending_before==='string'?JSON.parse(m.pending_before):m.pending_before) : null;
  const changes = [
    {label:'Nama', before:before?.nama, after:m.nama},
    {label:'Kategori', before:before?.kategori, after:m.kategori},
    {label:'Harga', before:before?.harga!=null?fmt.currency(before.harga):undefined, after:fmt.currency(m.harga)},
  ];
  _approvalModal({
    title: before ? `Edit Menu — ${m.nama}` : `Menu Baru — ${m.nama}`,
    subtitle: before ? `Diajukan oleh ${m.created_by||'-'} · perubahan data menu ${m.kode}` : `Diajukan oleh ${m.created_by||'-'} · menu baru ${m.kode}`,
    changes,
    onApprove: ()=>_mmApprove(id),
    onReject: (reason)=>_mmReject(id,reason),
  });
}
function _mmView(id){
  const m=_mmData.find(x=>x.id===id); if(!m) return;
  _viewModal({title:`Detail Menu — ${m.nama}`, subtitle:`Kode ${m.kode}`, fields:[
    {label:'Nama', value:m.nama},
    {label:'Kategori', value:m.kategori},
    {label:'Harga Jual', value:fmt.currency(m.harga)},
    {label:'Status', value:badge(m.status)},
    {label:'Aktif', value:m.aktif!==false?'Ya':'Tidak'},
    {label:'Dibuat oleh', value:m.created_by||'-'},
  ]});
}
function _mmDeleteRequest(id){
  const m=_mmData.find(x=>x.id===id); if(!m) return;
  _deletePrompt({
    adminMsg:`Yakin mau hapus menu "${m.nama}"? Tindakan ini tidak bisa dibatalkan.`,
    userMsg:'Alasan hapus menu ini?',
    onAdmin: async ()=>{
      try{ await DataAPI.approveDeleteMenu(id); Toast.success('Menu dihapus');
        _mmData=await DataAPI.getMenu().catch(()=>[]); pageMasterMenu(document.getElementById('page-content'));
      }catch(e){Toast.error(e.message);}
    },
    onUser: async (reason)=>{
      try{ await DataAPI.requestDeleteMenu(id,reason); Toast.success('Permintaan hapus diajukan — menunggu approval admin');
        _mmData=await DataAPI.getMenu().catch(()=>[]); pageMasterMenu(document.getElementById('page-content'));
      }catch(e){Toast.error(e.message);}
    },
  });
}
function _mmDeleteShowApproval(id){
  const m=_mmData.find(x=>x.id===id); if(!m) return;
  _approvalModal({
    title:`Hapus Menu — ${m.nama}`,
    subtitle:`Diajukan oleh ${m.created_by||'-'} · kode ${m.kode}`,
    simple:true,
    changes:[
      {label:'Nama', after:m.nama},
      {label:'Kategori', after:m.kategori},
      {label:'Harga', after:fmt.currency(m.harga)},
    ],
    note: m.delete_reason || '(tidak ada alasan)',
    onApprove: async ()=>{ await DataAPI.approveDeleteMenu(id); Toast.success('Menu dihapus'); _mmData=await DataAPI.getMenu().catch(()=>[]); pageMasterMenu(document.getElementById('page-content')); },
    onReject: async (reason)=>{ await DataAPI.rejectDeleteMenu(id,reason); Toast.warning('Permintaan hapus ditolak'); _mmData=await DataAPI.getMenu().catch(()=>[]); pageMasterMenu(document.getElementById('page-content')); },
  });
}
function _openMM(){
  const kode=_nextKode(_mmData,'MN');
  Modal.open({title:'Tambah Menu',body:`
  <div class="form-row cols-2">
    <div class="form-group"><label>Kode (otomatis)</label><input id="mm-kode" value="${kode}" readonly/></div>
    <div class="form-group"><label>Nama Menu<span class="req">*</span></label><input id="mm-nama" placeholder="Latte"/></div>
  </div>
  <div class="form-row cols-2">
    <div class="form-group"><label>Kategori</label><select id="mm-kat"><option>Coffee</option><option>Non-Coffee</option><option>Specialty</option><option>Food</option></select></div>
    <div class="form-group"><label>Harga Jual<span class="req">*</span></label><input id="mm-hrg" type="number" placeholder="25000"/></div>
  </div>`,
  footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" onclick="_saveMM()">Submit</button>`,
});}
async function _saveMM(){
  const kode=document.getElementById('mm-kode').value.trim(); const nama=document.getElementById('mm-nama').value.trim(); const harga=+document.getElementById('mm-hrg').value;
  if(!kode||!nama||!harga){Toast.error('Semua field wajib');return;}
  const isAdmin = Auth.isAdmin();
  try{await DataAPI.saveMenu({kode,nama,kategori:document.getElementById('mm-kat').value,harga,status:isAdmin?'approved':'waiting',aktif:true,pending_before:null,created_by:Auth.user.username}); Modal.close(); Toast.success(isAdmin?'Menu ditambahkan':'Menu disubmit'); _mmData=await DataAPI.getMenu().catch(()=>[]); pageMasterMenu(document.getElementById('page-content'));}
  catch(e){Toast.error(e.message);}
}
async function _mmApprove(id){await DataAPI.updateMenuStatus(id,'approved'); Toast.success('Menu diapprove'); _mmData=await DataAPI.getMenu().catch(()=>[]); pageMasterMenu(document.getElementById('page-content'));}
async function _mmReject(id,reason){
  const m = _mmData.find(x=>x.id===id);
  const before = m?.pending_before ? (typeof m.pending_before==='string'?JSON.parse(m.pending_before):m.pending_before) : null;
  if (before) {
    await DataAPI.updateMenu(id, {...before, status:'approved', reject_reason:reason, pending_before:null});
  } else {
    await DataAPI.updateMenuStatus(id,'rejected',reason);
  }
  Toast.warning('Menu direject'); _mmData=await DataAPI.getMenu().catch(()=>[]); pageMasterMenu(document.getElementById('page-content'));
}

function _openMMEdit(id){
  const m=_mmData.find(x=>x.id===id); if(!m) return;
  Modal.open({title:Auth.isAdmin()?'Edit Menu':'Edit Menu — perlu approval admin',body:`
  <div class="form-row cols-2">
    <div class="form-group"><label>Kode</label><input id="mm-e-kode" value="${m.kode}" readonly/></div>
    <div class="form-group"><label>Nama Menu<span class="req">*</span></label><input id="mm-e-nama" value="${(m.nama||'').replace(/"/g,'&quot;')}"/></div>
  </div>
  <div class="form-row cols-2">
    <div class="form-group"><label>Kategori</label><select id="mm-e-kat">${['Coffee','Non-Coffee','Specialty','Food'].map(k=>`<option ${k===m.kategori?'selected':''}>${k}</option>`).join('')}</select></div>
    <div class="form-group"><label>Harga Jual<span class="req">*</span></label><input id="mm-e-hrg" type="number" value="${m.harga}"/></div>
  </div>
  ${Auth.isAdmin()?'':'<p class="text-sm text-gray">Perubahan akan berstatus <b>menunggu approval admin</b>. Selama menunggu, menu ini tidak muncul di pilihan input penjualan.</p>'}`,
  footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" onclick="_saveMMEdit(${id})">${Auth.isAdmin()?'Simpan':'Submit Perubahan'}</button>`,
  });
}
async function _saveMMEdit(id){
  const m=_mmData.find(x=>x.id===id); if(!m) return;
  const nama=document.getElementById('mm-e-nama').value.trim(); const harga=+document.getElementById('mm-e-hrg').value;
  if(!nama||!harga){Toast.error('Nama dan harga wajib');return;}
  const fields = {nama,kategori:document.getElementById('mm-e-kat').value,harga};
  try{
    if (Auth.isAdmin()) {
      await DataAPI.updateMenu(id,{...fields,status:'approved',reject_reason:null,pending_before:null});
      await DataAPI.addAudit('Menu',nama,'Edit (langsung, oleh admin)');
      Modal.close(); Toast.success('Perubahan disimpan');
    } else {
      const before = { nama:m.nama, kategori:m.kategori, harga:m.harga };
      await DataAPI.updateMenu(id,{...fields,status:'waiting',pending_before:JSON.stringify(before)});
      await DataAPI.addAudit('Menu',nama,'Edit (menunggu approval)');
      Modal.close(); Toast.success('Perubahan disubmit untuk approval');
    }
    _mmData=await DataAPI.getMenu().catch(()=>[]); pageMasterMenu(document.getElementById('page-content'));
  }catch(e){Toast.error(e.message);}
}

// ─── PAGE: RESEP ────────────────────────────────────────────
let _rpMenus=[], _rpBahans=[];
async function pageResep(el){
  const [resep,menu,bahan]=await Promise.all([DataAPI.getResep().catch(()=>[]),DataAPI.getMenu().catch(()=>[]),DataAPI.getBahan().catch(()=>[])]);
  const byMenu={};
  resep.forEach(r=>{if(!byMenu[r.menu_nama])byMenu[r.menu_nama]=[];byMenu[r.menu_nama].push(r);});
  _rpLastResep=resep;
  _rpMenus=menu.filter(m=>m.status==='approved'&&m.aktif!==false);
  _rpBahans=bahan.filter(b=>b.status==='approved'&&b.aktif!==false);

  el.innerHTML=`
  <div class="page-head">
    <div><h2>Resep</h2><p>Komposisi bahan per menu — dasar kalkulasi pengurangan stok otomatis. Perubahan perlu approval admin (kecuali dilakukan admin).</p></div>
    <button class="btn btn-primary" onclick="_openResep()">${IC.plus()} Buat Resep</button>
  </div>
  ${Object.keys(byMenu).length?Object.entries(byMenu).map(([nama,lines])=>{
    const status = lines[0]?.status || 'approved';
    const menuId = lines[0]?.menu_id;
    const aktif = lines[0]?.aktif !== false;
    const rejectReason = lines[0]?.reject_reason;
    const deleteReject = lines[0]?.delete_reject_reason;
    const deletePending = lines[0]?.delete_status==='pending';
    const notified = _isMyNotified({...lines[0], id:menuId}, 'resep') || _isMyDeleteNotified({...lines[0], id:menuId}, 'resep');
    const dismissMarker = _isMyDeleteNotified({...lines[0], id:menuId}, 'resep')
      ? `_dismiss('resep-del',${menuId},'${(deleteReject||'').replace(/'/g,"\\'")}')`
      : `_dismiss('resep',${menuId},'${(rejectReason||'').replace(/'/g,"\\'")}')`;
    return `
    <div class="card mb-4${notified?' card-notify':''}" id="row-resep-${menuId}" ${notified?`onclick="${dismissMarker};this.classList.remove('card-notify')"`:''}>
      <div class="card-head">
        <span class="card-title">${IC.menu()} ${nama} ${deletePending?(Auth.isAdmin()?`<button class="btn btn-ghost btn-sm" onclick="_rpDeleteShowApproval(${menuId})" style="padding:0">${badge('pending')} <span class=\"text-sm\">🗑️ Lihat Detail</span></button>`:`${badge('pending')} <span class="text-sm text-gray">Menunggu approval hapus</span>`):(status==='waiting'?`<button class="btn btn-ghost btn-sm" onclick="_rpShowApproval(${menuId})" style="padding:0">${badge(status)} ${Auth.isAdmin()?'<span class=\"text-sm\">ℹ️ Lihat Detail</span>':''}</button>`:badge(status))}</span>
        <div style="display:flex;gap:12px;align-items:center">
          <label style="display:flex;align-items:center;gap:6px;cursor:${Auth.isAdmin()?'pointer':'default'}" class="text-sm">
            <input type="checkbox" ${aktif?'checked':''} ${Auth.isAdmin()?`onchange="_rpToggleAktif(${menuId},this.checked)"`:'disabled'} style="width:18px;height:18px"/> Aktif
          </label>
          <button class="btn btn-ghost btn-sm" onclick="_rpView(${menuId})">View</button>
          <button class="btn btn-ghost btn-sm" onclick='_openResepEdit(${menuId},"${nama.replace(/"/g,'&quot;')}")'>Edit</button>
          ${deletePending?'':`<button class="btn btn-danger btn-sm" onclick="_rpDeleteRequest(${menuId})">Delete</button>`}
        </div>
      </div>
      ${rejectReason?`<div class="text-sm" style="color:var(--red-600);padding:0 16px 8px">Alasan ditolak: ${rejectReason}</div>`:''}
      ${deleteReject?`<div class="text-sm" style="color:var(--red-600);padding:0 16px 8px">Hapus ditolak: ${deleteReject}</div>`:''}
      <div class="card-body-p0">
        ${buildTable({cols:[{key:'bahan_nama',label:'Bahan'},{label:'Qty',render:r=>`<span class="font-mono">${r.qty} ${r.satuan}</span>`}],data:lines})}
      </div>
    </div>`;
  }).join(''):`<div class="card"><div class="card-body"><div class="empty-state"><p>Belum ada resep</p></div></div></div>`}`;
  _scrollToNotified();
}
function _rpShowApproval(menuId){
  const lines = (_rpLastResep||[]).filter(r=>r.menu_id===menuId);
  if (!lines.length) return;
  const first = lines[0];
  const before = first.pending_before ? (typeof first.pending_before==='string'?JSON.parse(first.pending_before):first.pending_before) : null;
  let changes;
  if (before) {
    const beforeMap={}; before.forEach(l=>beforeMap[l.bahan_nama]=`${l.qty} ${l.satuan}`);
    const afterMap={}; lines.forEach(l=>afterMap[l.bahan_nama]=`${l.qty} ${l.satuan}`);
    const allNames=[...new Set([...Object.keys(beforeMap),...Object.keys(afterMap)])];
    changes = allNames.map(n=>({label:n, before:beforeMap[n]||'(tidak ada)', after:afterMap[n]||'(dihapus)'}));
  } else {
    changes = lines.map(l=>({label:l.bahan_nama, before:undefined, after:`${l.qty} ${l.satuan}`}));
  }
  _approvalModal({
    title: before ? `Edit Resep — ${first.menu_nama}` : `Resep Baru — ${first.menu_nama}`,
    subtitle: `Diajukan oleh ${first.created_by||'-'}`,
    changes,
    onApprove: ()=>_rpApprove(menuId),
    onReject: (reason)=>_rpReject(menuId,reason),
  });
}
async function _rpApprove(menuId){await DataAPI.updateResepStatus(menuId,'approved'); Toast.success('Resep diapprove'); App.go('resep');}
async function _rpReject(menuId,reason){
  const lines = (_rpLastResep||[]).filter(r=>r.menu_id===menuId);
  const first = lines[0];
  const before = first?.pending_before ? (typeof first.pending_before==='string'?JSON.parse(first.pending_before):first.pending_before) : null;
  if (before && before.length) {
    // Reject untuk EDIT resep -> kembalikan ke komposisi sebelumnya
    const restored = before.map(l=>({
      menu_id:menuId, menu_nama:first.menu_nama,
      bahan_id:l.bahan_id, bahan_nama:l.bahan_nama, qty:l.qty, satuan:l.satuan,
      status:'approved', aktif:true, reject_reason:reason, pending_before:null,
      created_by:first.created_by,
    }));
    await DataAPI.deleteResepByMenu(menuId);
    await DataAPI.saveResep(restored);
  } else {
    // Reject untuk resep BARU -> tetap tersimpan sebagai rejected (tidak ada yang direstore)
    await DataAPI.updateResepStatus(menuId,'rejected',reason);
  }
  Toast.warning('Resep direject'); App.go('resep');
}
async function _rpToggleAktif(menuId,aktif){
  try{ await DataAPI.updateResepAktif(menuId,aktif); Toast.success(aktif?'Resep diaktifkan':'Resep dinonaktifkan'); App.go('resep'); }
  catch(e){Toast.error(e.message);}
}

function _openResep(){
  const menus=_rpMenus, bahans=_rpBahans;
  Modal.open({title:'Buat Resep',size:'lg',body:`
    <div class="form-group"><label>Menu<span class="req">*</span></label>
      <select id="rp-menu"><option value="">— Pilih Menu —</option>${menus.map(m=>`<option value="${m.id}">${m.nama}</option>`).join('')}</select></div>
    <div class="divider"></div>
    <div id="rp-lines">
      <div class="line-item-row" id="rp-line-0">
        <select class="rp-bahan" onchange="this.nextElementSibling.nextElementSibling.value=this.options[this.selectedIndex].dataset.sat||''">
          <option value="">— Pilih Bahan —</option>${bahans.map(b=>`<option value="${b.id}" data-sat="${b.satuan}">${b.nama}</option>`).join('')}
        </select>
        <input class="rp-qty" type="number" placeholder="Qty"/>
        <input class="rp-sat" readonly placeholder="sat"/>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="this.closest('[id^=rp-line]').remove()">${IC.trash()}</button>
      </div>
    </div>
    <button class="btn btn-ghost btn-sm" onclick="_addResepLine()">${IC.plus()} Tambah Bahan</button>`,
    footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" onclick="_saveResep()">Simpan Resep</button>`,
  });
}
function _openResepEdit(menuId,menuNama){
  const bahans=_rpBahans;
  const existing=_rpCurrentLinesFor(menuId);
  Modal.open({title:`Edit Resep — ${menuNama} (perlu approval admin)`,size:'lg',body:`
    <input type="hidden" id="rp-e-menuid" value="${menuId}"/>
    <input type="hidden" id="rp-e-menunama" value="${menuNama.replace(/"/g,'&quot;')}"/>
    <div id="rp-lines">
      ${(existing.length?existing:[{bahan_id:'',qty:''}]).map((l,i)=>`
      <div class="line-item-row" id="rp-line-${i}">
        <select class="rp-bahan" onchange="this.nextElementSibling.nextElementSibling.value=this.options[this.selectedIndex].dataset.sat||''">
          <option value="">— Pilih Bahan —</option>${bahans.map(b=>`<option value="${b.id}" data-sat="${b.satuan}" ${b.id===l.bahan_id?'selected':''}>${b.nama}</option>`).join('')}
        </select>
        <input class="rp-qty" type="number" placeholder="Qty" value="${l.qty||''}"/>
        <input class="rp-sat" readonly placeholder="sat" value="${l.satuan||''}"/>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="this.closest('[id^=rp-line]').remove()">${IC.trash()}</button>
      </div>`).join('')}
    </div>
    <button class="btn btn-ghost btn-sm" onclick="_addResepLine()">${IC.plus()} Tambah Bahan</button>
    <p class="text-sm text-gray" style="margin-top:8px">Perubahan akan berstatus <b>menunggu approval admin</b> sebelum dipakai untuk perhitungan stok.</p>`,
    footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" onclick="_saveResepEdit()">Submit Perubahan</button>`,
  });
  _resepLineCount = Math.max(0, (existing.length||1)-1);
}
function _rpCurrentLinesFor(menuId){
  // Diisi ulang tiap render pageResep lewat closure _rpLastResep (lihat pageResep)
  return (_rpLastResep||[]).filter(r=>r.menu_id===menuId);
}
let _rpLastResep=[];
let _resepLineCount=0;
function _addResepLine(){
  const bahans=_rpBahans;
  _resepLineCount++;
  const div=document.createElement('div');
  div.className='line-item-row'; div.id=`rp-line-${_resepLineCount}`;
  div.innerHTML=`<select class="rp-bahan" onchange="this.nextElementSibling.nextElementSibling.value=this.options[this.selectedIndex].dataset.sat||''"><option value="">— Pilih Bahan —</option>${bahans.map(b=>`<option value="${b.id}" data-sat="${b.satuan}">${b.nama}</option>`).join('')}</select><input class="rp-qty" type="number" placeholder="Qty"/><input class="rp-sat" readonly placeholder="sat"/><button class="btn btn-ghost btn-icon btn-sm" onclick="this.closest('[id^=rp-line]').remove()">${IC.trash()}</button>`;
  document.getElementById('rp-lines').appendChild(div);
}
function _collectResepLines(menuId,menuNama,pendingBefore){
  // Catatan: query di-scope ke child langsung dari #rp-lines supaya wrapper
  // #rp-lines sendiri tidak ikut kepilih (namanya juga cocok pola [id^=rp-line]).
  const status = Auth.isAdmin() ? 'approved' : 'waiting';
  return [...document.querySelectorAll('#rp-lines > [id^=rp-line-]')].map(row=>{
    const b=row.querySelector('.rp-bahan'); const q=row.querySelector('.rp-qty'); const s=row.querySelector('.rp-sat');
    if(!b?.value||!q?.value)return null;
    return{menu_id:menuId,menu_nama:menuNama,bahan_id:+b.value,bahan_nama:b.options[b.selectedIndex]?.text,qty:+q.value,satuan:s?.value||'',status,aktif:true,pending_before:Auth.isAdmin()?null:(pendingBefore||null),created_by:Auth.user.username};
  }).filter(Boolean);
}
async function _saveResep(){
  const menuSel=document.getElementById('rp-menu'); const menuId=+menuSel.value; const menuNama=menuSel.options[menuSel.selectedIndex]?.text;
  if(!menuId){Toast.error('Pilih menu');return;}
  const lines=_collectResepLines(menuId,menuNama,null);
  if(!lines.length){Toast.error('Tambahkan minimal 1 bahan');return;}
  try{
    // Hapus resep lama untuk menu ini (kalau ada) supaya tidak dobel
    await DataAPI.deleteResepByMenu(menuId);
    await DataAPI.saveResep(lines);
    await DataAPI.addAudit('Resep',menuNama,Auth.isAdmin()?'Buat/Update (langsung, oleh admin)':'Buat/Update (menunggu approval)');
    Modal.close(); Toast.success(Auth.isAdmin()?'Resep disimpan':'Resep disubmit untuk approval'); App.go('resep');
  }catch(e){Toast.error(e.message);}
}
async function _saveResepEdit(){
  const menuId=+document.getElementById('rp-e-menuid').value;
  const menuNama=document.getElementById('rp-e-menunama').value;
  const before = (_rpLastResep||[]).filter(r=>r.menu_id===menuId).map(l=>({bahan_id:l.bahan_id,bahan_nama:l.bahan_nama,qty:l.qty,satuan:l.satuan}));
  const lines=_collectResepLines(menuId,menuNama,JSON.stringify(before));
  if(!lines.length){Toast.error('Tambahkan minimal 1 bahan');return;}
  try{
    await DataAPI.deleteResepByMenu(menuId);
    await DataAPI.saveResep(lines);
    await DataAPI.addAudit('Resep',menuNama,Auth.isAdmin()?'Edit (langsung, oleh admin)':'Edit (menunggu approval)');
    Modal.close(); Toast.success(Auth.isAdmin()?'Perubahan disimpan':'Perubahan resep disubmit untuk approval'); App.go('resep');
  }catch(e){Toast.error(e.message);}
}
function _rpView(menuId){
  const lines = (_rpLastResep||[]).filter(r=>r.menu_id===menuId);
  if (!lines.length) return;
  const first = lines[0];
  _viewModal({title:`Detail Resep — ${first.menu_nama}`, subtitle:`Dibuat oleh ${first.created_by||'-'}`, fields:[
    ...lines.map(l=>({label:l.bahan_nama, value:`${l.qty} ${l.satuan}`})),
    {label:'Status', value:badge(first.status||'approved')},
    {label:'Aktif', value:first.aktif!==false?'Ya':'Tidak'},
  ]});
}
function _rpDeleteRequest(menuId){
  const lines = (_rpLastResep||[]).filter(r=>r.menu_id===menuId);
  if (!lines.length) return;
  const menuNama = lines[0].menu_nama;
  _deletePrompt({
    adminMsg:`Yakin mau hapus resep "${menuNama}"? Tindakan ini tidak bisa dibatalkan.`,
    userMsg:'Alasan hapus resep ini?',
    onAdmin: async ()=>{
      try{ await DataAPI.approveDeleteResep(menuId); Toast.success('Resep dihapus'); App.go('resep'); }
      catch(e){Toast.error(e.message);}
    },
    onUser: async (reason)=>{
      try{ await DataAPI.requestDeleteResep(menuId,reason); Toast.success('Permintaan hapus diajukan — menunggu approval admin'); App.go('resep'); }
      catch(e){Toast.error(e.message);}
    },
  });
}
function _rpDeleteShowApproval(menuId){
  const lines = (_rpLastResep||[]).filter(r=>r.menu_id===menuId);
  if (!lines.length) return;
  const first = lines[0];
  _approvalModal({
    title:`Hapus Resep — ${first.menu_nama}`,
    subtitle:`Diajukan oleh ${first.created_by||'-'}`,
    simple:true,
    changes: lines.map(l=>({label:l.bahan_nama, after:`${l.qty} ${l.satuan}`})),
    note: first.delete_reason || '(tidak ada alasan)',
    onApprove: async ()=>{ await DataAPI.approveDeleteResep(menuId); Toast.success('Resep dihapus'); App.go('resep'); },
    onReject: async (reason)=>{ await DataAPI.rejectDeleteResep(menuId,reason); Toast.warning('Permintaan hapus ditolak'); App.go('resep'); },
  });
}

// ─── PAGE: AUDIT TRAIL ───────────────────────────────────────
async function pageAuditTrail(el){
  const data=await DataAPI.getAuditTrail().catch(()=>[]);
  el.innerHTML=`
  <div class="page-head"><div><h2>Audit Trail</h2><p>Log seluruh aktivitas sistem</p></div></div>
  <div class="card"><div class="card-body-p0">
    ${buildTable({cols:[
      {key:'tanggal',label:'Waktu'},{key:'user',label:'User'},{key:'activity',label:'Aktivitas'},
      {key:'module',label:'Modul'},{key:'record',label:'Record'},
    ],data,empty:'Belum ada aktivitas'})}
  </div></div>`;
}

// ─── PAGE: USER MANAGEMENT ───────────────────────────────────
let _usrData=[];
async function pageUsers(el){
  _usrData=await DataAPI.getUsers().catch(()=>[]);
  _renderUsers(el);
}
function _renderUsers(el){
  el.innerHTML=`
  <div class="page-head">
    <div><h2>User Management</h2><p>Kelola akun pengguna</p></div>
    <button class="btn btn-primary" onclick="_openUser()">${IC.plus()} Tambah User</button>
  </div>
  <div class="card"><div class="card-body-p0">
    ${buildTable({cols:[
      {key:'username',label:'Username'},{key:'nama',label:'Nama'},
      {label:'Role',render:r=>r.role==='admin'?`<span class="badge bg-blue">Admin</span>`:`<span class="badge bg-gray">Barista</span>`},
      {key:'outlet',label:'Outlet'},{label:'Status',render:r=>badge(r.status)},
      {label:'',render:r=>`<button class="btn btn-sm ${r.status==='ACTIVE'?'btn-danger':'btn-success'}" onclick="_toggleUser(${r.id},'${r.status==='ACTIVE'?'INACTIVE':'ACTIVE'}')">${r.status==='ACTIVE'?'Nonaktifkan':'Aktifkan'}</button>`},
    ],data:_usrData,empty:'Tidak ada user'})}
  </div></div>`;
}
function _openUser(){Modal.open({title:'Tambah User',body:`
  <div class="form-row cols-2">
    <div class="form-group"><label>Nama<span class="req">*</span></label><input id="u-nama"/></div>
    <div class="form-group"><label>Username<span class="req">*</span></label><input id="u-uname"/></div>
  </div>
  <div class="form-row cols-2">
    <div class="form-group"><label>Password<span class="req">*</span></label><input id="u-pass" type="password"/></div>
    <div class="form-group"><label>Role</label><select id="u-role"><option value="user">Barista</option><option value="admin">Admin/Owner</option></select></div>
  </div>
  <div class="form-group"><label>Outlet</label><input id="u-outlet" value="Main Store"/></div>`,
  footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" onclick="_saveUser()">Tambah</button>`,
});}
async function _saveUser(){
  const nama=document.getElementById('u-nama').value.trim(); const uname=document.getElementById('u-uname').value.trim(); const pass=document.getElementById('u-pass').value;
  if(!nama||!uname||!pass){Toast.error('Semua field wajib');return;}
  try{await DataAPI.saveUser({nama,username:uname,password:pass,role:document.getElementById('u-role').value,outlet:document.getElementById('u-outlet').value,status:'ACTIVE'}); Modal.close(); Toast.success('User ditambahkan'); _usrData=await DataAPI.getUsers().catch(()=>[]); _renderUsers(document.getElementById('page-content'));}
  catch(e){Toast.error(e.message);}
}
async function _toggleUser(id,status){
  await DataAPI.updateUserStatus(id,status); Toast.success('Status user diubah');
  _usrData=await DataAPI.getUsers().catch(()=>[]); _renderUsers(document.getElementById('page-content'));
}
// ─── ROUTER ──────────────────────────────────────────────────
const ROUTES = {
  'home':         { label:'BrewStock',      fn: pageHome,         icon: null,         admin: false },
  // Admin routes
  'dashboard':    { label:'Dashboard',      fn: pageDashboard,    icon: IC.dashboard, admin: false },
  'penjualan':    { label:'Penjualan',      fn: pagePenjualan,    icon: IC.sale,      admin: false },
  'stock':        { label:'Stok Bahan',     fn: pageStock,        icon: IC.stock,     admin: false },
  'pembelian':    { label:'Pembelian',      fn: pagePembelian,    icon: IC.beli,      admin: false },
  'daily-report': { label:'Daily Report',   fn: pageDailyReport,  icon: IC.report,    admin: false },
  'master-bahan': { label:'Master Bahan',   fn: pageMasterBahan,  icon: IC.bahan,     admin: false },
  'master-menu':  { label:'Master Menu',    fn: pageMasterMenu,   icon: IC.menu,      admin: false },
  'resep':        { label:'Resep',          fn: pageResep,        icon: IC.resep,     admin: false },
  'audit-trail':  { label:'Audit Trail',    fn: pageAuditTrail,   icon: IC.audit,     admin: true  },
  'users':        { label:'User Management',fn: pageUsers,        icon: IC.users,     admin: true  },
};
// Catatan: menu "Stock Opname" sengaja dihilangkan dari ROUTES/NAV sesuai
// permintaan. Fungsi pageStockOpname dkk masih ada di file tapi sudah tidak
// bisa diakses dari mana pun di UI.

// Nav groups
const NAV_ADMIN = [
  { group: null, items: ['dashboard'] },
  { group: 'Operasional', items: ['penjualan','stock','pembelian','daily-report'] },
  { group: 'Master Data', items: ['master-bahan','master-menu','resep'] },
  { group: 'Manajemen', items: ['audit-trail','users'] },
];

// For barista mobile — only these pages
const NAV_USER_MOBILE = ['penjualan','stock','daily-report','master-bahan'];

const App = {
  current: null,
  _navToken: 0,

  async init() {
    Auth.init();
    if (Auth.user) {
      this._showApp();
    }
  },

  async login() {
    const u = document.getElementById('l-user').value.trim();
    const p = document.getElementById('l-pass').value;
    const errEl = document.getElementById('l-err');
    errEl.style.display = 'none';
    if (!u || !p) { errEl.textContent = 'Username dan password wajib'; errEl.style.display = 'block'; return; }
    try {
      await Auth.login(u, p);
      this._showApp();
    } catch(e) {
      errEl.textContent = e.message;
      errEl.style.display = 'block';
    }
  },

  logout() {
    if (!confirm('Keluar dari BrewStock?')) return;
    Auth.logout();
    location.reload();
  },

  _showApp() {
    document.getElementById('login-wrap').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    this._buildUser();
    // Kalau habis refresh, balik ke halaman terakhir yang dibuka (disimpan di
    // URL hash) alih-alih selalu balik ke home.
    const fromHash = location.hash.replace('#','');
    this.go(fromHash && ROUTES[fromHash] ? fromHash : 'home');
  },
  goHome() { this.go('home'); },

  async go(page) {
    const route = ROUTES[page];
    if (!route) return this.go('home');
    if (route.admin && !Auth.isAdmin()) return this.go('home');

    this.current = page;
    if (location.hash.replace('#','') !== page) location.hash = page;
    document.getElementById('page-ttl').textContent = page==='home' ? 'BrewStock' : route.label;
    const backBtn = document.getElementById('back-btn');
    if (backBtn) backBtn.style.display = page==='home' ? 'none' : 'flex';

    const content = document.getElementById('page-content');
    content.innerHTML = `<div class="empty-state" style="padding:60px">${IC.trend()} <p>Memuat...</p></div>`;

    // Token guard: kalau user pindah menu lagi sebelum fetch halaman ini
    // selesai, tulisan ke DOM dari fetch yang basi ini otomatis diabaikan
    // (tidak menimpa halaman yang sedang aktif sekarang).
    const token = ++this._navToken;
    const guarded = new Proxy(content, {
      set: (target, prop, value) => {
        if (token !== App._navToken) return true; // stale, abaikan
        target[prop] = value;
        return true;
      },
      get: (target, prop) => {
        const value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });

    try {
      await route.fn(guarded);
    } catch(e) {
      if (token !== this._navToken) return; // stale, jangan render error basi
      content.innerHTML = `<div class="card"><div class="card-body"><div class="empty-state">
        <p style="color:var(--red-600)">Error: ${e.message}</p>
        <small>Cek koneksi Supabase atau reload halaman</small>
      </div></div></div>`;
      console.error('[BrewStock] Page error:', e);
    }
    this._refreshNavBadges();
  },

  _buildNav() {
    const isAdmin = Auth.isAdmin();
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = NAV_ADMIN.map(({ group, items }) => {
      const visibleItems = items.filter(k => {
        const r = ROUTES[k];
        return r && (!r.admin || isAdmin);
      });
      if (!visibleItems.length) return '';
      return `
        <div class="nav-group">
          ${group ? `<div class="nav-group-label">${group}</div>` : ''}
          ${visibleItems.map(k => {
            const r = ROUTES[k];
            return `<div class="nav-item" data-page="${k}" onclick="App.go('${k}')">
              ${r.icon()} <span class="nav-label">${r.label}</span>
              <span class="nav-badge" id="navbadge-${k}" style="display:none"></span>
            </div>`;
          }).join('')}
        </div>`;
    }).join('');
    this._refreshNavBadges();
  },

  _buildUser() {
    const u = Auth.user;
    const ini = (u.nama || u.username)[0].toUpperCase();
    document.getElementById('topbar-avatar').textContent = ini;
    document.getElementById('topbar-uname').textContent = u.nama || u.username;
  },

  // Mobile nav — hanya halaman utama untuk bartender
  _buildMobileNav() {
    const isAdmin = Auth.isAdmin();
    const mobilePages = isAdmin
      ? ['dashboard','penjualan','stock','pembelian','daily-report']
      : ['penjualan','stock','daily-report','master-bahan'];

    const labels = { dashboard:'Home', penjualan:'Jual', stock:'Stok', pembelian:'Beli', 'daily-report':'Laporan', 'master-bahan':'Bahan' };
    const mobileNav = document.getElementById('mobile-nav');
    mobileNav.innerHTML = `<div class="mobile-nav-items">
      ${mobilePages.map(k => {
        const r = ROUTES[k];
        return `<div class="mobile-nav-item" data-page="${k}" onclick="App.go('${k}')">
          <span class="mobile-nav-badge" id="mobilenavbadge-${k}" style="display:none"></span>
          ${r.icon()} <span>${labels[k]||r.label}</span>
        </div>`;
      }).join('')}
    </div>`;
    this._refreshNavBadges();
  },

  // Hitung & tampilkan jumlah item yang perlu diperhatikan di tiap menu:
  // - Admin: jumlah item berstatus 'waiting' (perlu di-approve) / void 'pending'.
  // - User biasa: jumlah item MEREKA SENDIRI yang baru saja 'rejected' (perlu
  //   tahu alasan penolakan) atau void yang barusan ditolak.
  async _refreshNavBadges(){
    try{
      const isAdmin = Auth.isAdmin();
      const me = Auth.user?.username;
      const [bahan,menu,resep,penjualan,pembelian,dr] = await Promise.all([
        DataAPI.getBahan().catch(()=>[]),
        DataAPI.getMenu().catch(()=>[]),
        DataAPI.getResep().catch(()=>[]),
        DataAPI.getPenjualan().catch(()=>[]),
        DataAPI.getPembelian().catch(()=>[]),
        DataAPI.getDailyReport().catch(()=>[]),
      ]);
      // Admin: hitung yang masih nunggu approval.
      // User: hitung punya sendiri yang PERNAH ditolak & belum di-dismiss —
      // dicek dari reject_reason (bukan status), karena status data yang
      // ditolak dikembalikan lagi ke normal, tapi reject_reason-nya tetap
      // disimpan sampai user klik/lihat barisnya.
      const statusCount = (list,module) => isAdmin
        ? list.filter(x=>x.status==='waiting').length
        : list.filter(x=>x.created_by===me && x.reject_reason && !_isDismissed(module,x.id,x.reject_reason)).length;
      const voidCount = (list,module) => isAdmin
        ? list.filter(x=>x.void_status==='pending').length
        : list.filter(x=>x.created_by===me && x.void_reject_reason && !_isDismissed(module,x.id,'void:'+x.void_reject_reason)).length;
      const deleteCount = (list,module) => isAdmin
        ? list.filter(x=>x.delete_status==='pending').length
        : list.filter(x=>x.created_by===me && x.delete_reject_reason && !_isDismissed(module+'-del',x.id,x.delete_reject_reason)).length;

      // Resep: kelompokkan per menu_id biar tidak double-count per baris bahan
      const resepGroups = {};
      resep.forEach(r=>{ if(!resepGroups[r.menu_id]) resepGroups[r.menu_id]=r; });
      const resepList = Object.values(resepGroups).map(r=>({...r,id:r.menu_id}));

      const drCount = (isAdmin
        ? dr.filter(x=>x.status==='waiting').length
        : dr.filter(x=>x.user===me && x.reject_reason && !_isDismissed('daily-report',x.id,x.reject_reason)).length)
        + deleteCount(dr.map(x=>({...x,created_by:x.user})),'daily-report');

      const counts = {
        'master-bahan': statusCount(bahan,'bahan') + deleteCount(bahan,'bahan'),
        'master-menu': statusCount(menu,'menu') + deleteCount(menu,'menu'),
        'resep': statusCount(resepList,'resep') + deleteCount(resepList,'resep'),
        'penjualan': voidCount(penjualan,'penjualan') + statusCount(penjualan,'penjualan'),
        'pembelian': voidCount(pembelian,'pembelian') + statusCount(pembelian,'pembelian'),
        'daily-report': drCount,
      };
      Object.entries(counts).forEach(([key,count])=>{
        const label = count>9 ? '9+' : String(count);
        document.querySelectorAll(`#navbadge-${key}, #mobilenavbadge-${key}, #homebadge-${key}`).forEach(el=>{
          el.textContent = count>0 ? label : '';
          el.style.display = count>0 ? '' : 'none';
        });
      });
    }catch(e){ console.error('[BrewStock] gagal hitung notifikasi nav', e); }
  },

  toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const bd = document.getElementById('sidebar-bd');
    const isOpen = sb.classList.toggle('open');
    bd.classList.toggle('on', isOpen);
  },

  closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-bd').classList.remove('on');
  },
};

// ─── BOOT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
window.addEventListener('hashchange', () => {
  const p = location.hash.replace('#','');
  if (Auth.user && p && p !== App.current && ROUTES[p]) App.go(p);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('login-wrap')?.style.display !== 'none') App.login();
  if (e.key === 'Escape') Modal.close();
});

function fillDemo(role) {
  document.getElementById('l-user').value = role === 'admin' ? 'admin' : 'bartender';
  document.getElementById('l-pass').value = role === 'admin' ? 'admin123' : 'user123';
  setTimeout(() => App.login(), 50);
}
