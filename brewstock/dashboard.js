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
