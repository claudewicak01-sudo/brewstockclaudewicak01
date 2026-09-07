const PageMasterBahan = {
  data: [], query: '',

  async render(el) {
    this.el = el;
    this.data = await DataAPI.getBahan();
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
