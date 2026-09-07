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
