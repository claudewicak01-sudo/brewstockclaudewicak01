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
