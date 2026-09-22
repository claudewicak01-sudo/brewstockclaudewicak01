// ─── PAGE: DASHBOARD ────────────────────────────────────────
async function pageDashboard(el) {
  el.innerHTML = `<div class="empty-state">${IC.trend()} <p>Memuat dashboard...</p></div>`;
  const today = new Date().toISOString().split('T')[0];

  const [bahan, penjualan, resep, opname] = await Promise.all([
    DataAPI.getBahan().catch(()=>[]),
    DataAPI.getPenjualan().catch(()=>[]),
    DataAPI.getResep().catch(()=>[]),
    DataAPI.getStockOpname().catch(()=>[]),
  ]);

  const todaySales = penjualan.filter(p=>p.tanggal===today);
  const totalRev   = todaySales.reduce((s,p)=>s+p.total,0);
  const totalQty   = todaySales.reduce((s,p)=>s+p.qty,0);
  const cashRev    = penjualan.filter(p=>p.tanggal===today&&p.metode==='Cash').reduce((s,p)=>s+p.total,0);
  const nonCash    = totalRev - cashRev;
  const lowStock   = bahan.filter(b=>b.stock_current<=b.min_stock&&b.status==='approved').length;

  // Daily trend 7 hari
  const dailyMap = DataAPI.computeDailySales(penjualan);
  const trendPts  = dailyMap.map(d=>({y:d.total/1000, label:d.tanggal.slice(5)}));

  // Top menu (bar chart)
  const topMenu  = DataAPI.computeTopMenu(penjualan).slice(0,5);
  const barItems  = topMenu.map((m,i)=>({label:m.nama.split(' ')[0], value:m.qty,
    color:['#1B4FD8','#3b82f6','#60a5fa','#93c5fd','#bfdbfe'][i]}));

  // Material usage vs stock (stacked bar)
  const usageData = DataAPI.computeUsage(penjualan, resep, today);
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
      <button class="btn btn-ghost btn-sm" onclick="App.go('stock-opname')">+ Stock Opname</button>
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
