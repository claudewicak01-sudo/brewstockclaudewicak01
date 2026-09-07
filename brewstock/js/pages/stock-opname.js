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
