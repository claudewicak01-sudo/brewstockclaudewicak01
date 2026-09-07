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
