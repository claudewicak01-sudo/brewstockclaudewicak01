const PageMasterMenu = {
  data: [], query: '',

  async render(el) {
    this.el = el; this.data = await DataAPI.getMenu(); this._draw();
  },

  _draw() {
    const filtered = searchFilter(this.data, this.query, ['kode','nama','kategori']);
    this.el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title"><h2>Master Menu</h2><p>Daftar menu yang dijual di coffee shop</p></div>
      ${!Auth.isAdmin() ? `<button class="btn btn-primary" onclick="PageMasterMenu.openAdd()">${Icon.plus()} Tambah Menu</button>` : ''}
    </div>
    <div class="card">
      <div class="card-header">
        <div class="search-box">${Icon.search()}<input type="text" placeholder="Cari menu..." oninput="PageMasterMenu.query=this.value;PageMasterMenu._draw()" /></div>
        <span class="text-sm text-gray">${filtered.length} menu</span>
      </div>
      <div class="card-body" style="padding:0">
        ${buildTable({
          cols: [
            { key: 'kode', label: 'Kode' },
            { key: 'nama', label: 'Nama Menu' },
            { key: 'kategori', label: 'Kategori' },
            { label: 'Harga Jual', render: r => fmt.currency(r.harga) },
            { label: 'Status', render: r => statusBadge(r.status) },
            { key: 'created_by', label: 'Dibuat Oleh' },
            { label: 'Aksi', render: r => `
              <button class="btn btn-ghost btn-sm btn-icon" onclick="PageMasterMenu.detail(${r.id})">${Icon.eye()}</button>
              ${Auth.isAdmin() && r.status === 'waiting' ? `<button class="btn btn-success btn-sm" onclick="PageMasterMenu.approve(${r.id})">${Icon.check()} Approve</button>` : ''}
            `},
          ],
          data: filtered,
          emptyMsg: 'Belum ada menu.',
        })}
      </div>
    </div>`;
  },

  openAdd() {
    Modal.open({
      title: 'Tambah Menu Baru',
      body: `
        <div class="form-row cols-2">
          <div class="form-group"><label>Kode Menu <span class="req">*</span></label><input id="m-kode" type="text" placeholder="MN001" /></div>
          <div class="form-group"><label>Nama Menu <span class="req">*</span></label><input id="m-nama" type="text" placeholder="Latte" /></div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group"><label>Kategori</label>
            <select id="m-kat"><option>Coffee</option><option>Non-Coffee</option><option>Specialty</option><option>Food</option></select>
          </div>
          <div class="form-group"><label>Harga Jual (Rp) <span class="req">*</span></label><input id="m-harga" type="number" placeholder="25000" /></div>
        </div>
      `,
      footer: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
               <button class="btn btn-primary" onclick="PageMasterMenu.save()">Submit Approval</button>`,
    });
  },

  async save() {
    const kode = document.getElementById('m-kode').value.trim();
    const nama = document.getElementById('m-nama').value.trim();
    const harga = +document.getElementById('m-harga').value;
    if (!kode || !nama || !harga) { Toast.error('Semua field wajib diisi'); return; }
    await DataAPI.addMenu({ kode, nama, kategori: document.getElementById('m-kat').value, harga, status: 'waiting', created_by: Auth.user.username, created_at: new Date().toISOString().split('T')[0] });
    Modal.close(); Toast.success(`Menu "${nama}" disubmit`);
    this.data = await DataAPI.getMenu(); this._draw(); updateApprovalBadge();
  },

  detail(id) {
    const m = this.data.find(x => x.id === id);
    Modal.open({
      title: m.nama,
      body: `
        <div class="form-row cols-2" style="margin-bottom:12px">
          <div><div class="text-sm text-gray">Kode</div><strong>${m.kode}</strong></div>
          <div><div class="text-sm text-gray">Status</div>${statusBadge(m.status)}</div>
        </div>
        <div class="form-row cols-2">
          <div><div class="text-sm text-gray">Kategori</div>${m.kategori}</div>
          <div><div class="text-sm text-gray">Harga Jual</div><strong>${fmt.currency(m.harga)}</strong></div>
        </div>
        <div class="divider"></div>
        <div class="text-sm text-gray">Dibuat oleh <strong>${m.created_by}</strong></div>
      `,
      footer: Auth.isAdmin() && m.status === 'waiting'
        ? `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>
           <button class="btn btn-danger" onclick="PageMasterMenu.reject(${m.id})">Reject</button>
           <button class="btn btn-success" onclick="PageMasterMenu.approve(${m.id})">Approve</button>`
        : `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>`,
    });
  },

  async approve(id) {
    await DataAPI.updateMenuStatus(id, 'approved');
    Modal.close(); Toast.success('Menu diapprove');
    this.data = await DataAPI.getMenu(); this._draw(); updateApprovalBadge();
  },
  async reject(id) {
    await DataAPI.updateMenuStatus(id, 'rejected');
    Modal.close(); Toast.warning('Menu direject');
    this.data = await DataAPI.getMenu(); this._draw(); updateApprovalBadge();
  },
};
