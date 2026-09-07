const PageAuditTrail = {
  data: [], query: '',

  async render(el) {
    this.el = el;
    try {
    this.this.data = await DataAPI.getAuditTrail();
    } catch(e) { this.data = []; Toast.error("Gagal load: " + e.message); }

    this._draw();
  },

  _draw() {
    const filtered = searchFilter(this.data, this.query, ['user','activity','module','record']);
    const actColors = {
      Create: 'badge-blue', Submit: 'badge-orange', Approve: 'badge-green',
      Reject: 'badge-red', Update: 'badge-yellow', Delete: 'badge-red',
    };

    this.el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title"><h2>Audit Trail</h2><p>Histori seluruh aktivitas penting dalam sistem — tidak dapat diubah</p></div>
    </div>
    <div class="card">
      <div class="card-header">
        <div class="search-box">${Icon.search()}<input type="text" placeholder="Cari user/aktivitas/modul..." oninput="PageAuditTrail.query=this.value;PageAuditTrail._draw()" /></div>
        <span class="text-sm text-gray">${filtered.length} records</span>
      </div>
      <div class="card-body" style="padding:0">
        ${buildTable({
          cols: [
            { key: 'tanggal', label: 'Waktu' },
            { key: 'user', label: 'User' },
            { label: 'Aktivitas', render: r => `<span class="badge ${actColors[r.activity] || 'badge-gray'}">${r.activity}</span>` },
            { key: 'module', label: 'Modul' },
            { key: 'record', label: 'Record' },
            { label: 'Nilai Lama', render: r => r.old_val ? `<span class="font-mono text-sm">${r.old_val}</span>` : '<span class="text-gray">-</span>' },
            { label: 'Nilai Baru', render: r => r.new_val ? `<span class="font-mono text-sm">${r.new_val}</span>` : '<span class="text-gray">-</span>' },
          ],
          data: filtered,
          emptyMsg: 'Belum ada aktivitas tercatat.',
        })}
      </div>
    </div>`;
  },
};

// ─── USER MANAGEMENT ──────────────────────────────────────────
const PageUserMgmt = {
  data: [],

  async render(el) {
    this.el = el;
    try {
    this.this.data = await DataAPI.getUsers();
    } catch(e) { this.data = []; Toast.error("Gagal load: " + e.message); }

    this._draw();
  },

  _draw() {
    this.el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title"><h2>User Management</h2><p>Kelola akun pengguna BrewStock</p></div>
      <button class="btn btn-primary" onclick="PageUserMgmt.openAdd()">${Icon.plus()} Tambah User</button>
    </div>

    <div class="kpi-grid" style="max-width:400px;margin-bottom:20px">
      <div class="kpi-card"><div class="kpi-label">Total User</div><div class="kpi-value">${this.data.length}</div></div>
      <div class="kpi-card green"><div class="kpi-label">Aktif</div><div class="kpi-value">${this.data.filter(u=>u.status==='ACTIVE').length}</div></div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">Daftar Pengguna</span></div>
      <div class="card-body" style="padding:0">
        ${buildTable({
          cols: [
            { key: 'username', label: 'Username' },
            { key: 'nama', label: 'Nama Lengkap' },
            { label: 'Role', render: r => r.role === 'admin'
              ? `<span class="badge badge-blue">Admin/Owner</span>`
              : `<span class="badge badge-gray">Bartender</span>` },
            { key: 'outlet', label: 'Outlet' },
            { label: 'Status', render: r => statusBadge(r.status) },
            { key: 'created_at', label: 'Dibuat' },
            { key: 'last_login', label: 'Login Terakhir' },
            { label: 'Aksi', render: r => `
              <div style="display:flex;gap:6px">
                ${r.status === 'ACTIVE'
                  ? `<button class="btn btn-danger btn-sm" onclick="PageUserMgmt.toggleStatus(${r.id},'INACTIVE')">Nonaktifkan</button>`
                  : `<button class="btn btn-success btn-sm" onclick="PageUserMgmt.toggleStatus(${r.id},'ACTIVE')">Aktifkan</button>`}
              </div>
            `},
          ],
          data: this.data,
          emptyMsg: 'Belum ada user.',
        })}
      </div>
    </div>`;
  },

  openAdd() {
    Modal.open({
      title: 'Tambah User Baru',
      body: `
        <div class="form-row cols-2">
          <div class="form-group"><label>Nama Lengkap <span class="req">*</span></label><input id="u-nama" type="text" placeholder="Nama lengkap" /></div>
          <div class="form-group"><label>Username <span class="req">*</span></label><input id="u-uname" type="text" placeholder="username" /></div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group"><label>Password <span class="req">*</span></label><input id="u-pass" type="password" placeholder="Password" /></div>
          <div class="form-group"><label>Role <span class="req">*</span></label>
            <select id="u-role"><option value="user">Bartender / User</option><option value="admin">Admin / Owner</option></select>
          </div>
        </div>
        <div class="form-group"><label>Outlet</label><input id="u-outlet" type="text" placeholder="Main Store" value="Main Store" /></div>
      `,
      footer: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
               <button class="btn btn-primary" onclick="PageUserMgmt.save()">Tambah User</button>`,
    });
  },

  async save() {
    const nama   = document.getElementById('u-nama').value.trim();
    const uname  = document.getElementById('u-uname').value.trim();
    const pass   = document.getElementById('u-pass').value;
    const role   = document.getElementById('u-role').value;
    const outlet = document.getElementById('u-outlet').value.trim();

    if (!nama || !uname || !pass) { Toast.error('Semua field wajib diisi'); return; }
    if (this.data.find(u => u.username === uname)) { Toast.error('Username sudah digunakan'); return; }

    await DataAPI.addUser({ nama, username: uname, password: pass, role, outlet, status: 'ACTIVE' });
    await DataAPI.addAuditTrail({ user: Auth.user.username, activity: 'Create', module: 'UserManagement', record: uname, old_val: '', new_val: 'ACTIVE' });
    Modal.close(); Toast.success(`User "${uname}" berhasil ditambahkan`);
    this.data = await DataAPI.getUsers(); this._draw();
  },

  async toggleStatus(id, newStatus) {
    await DataAPI.updateUserStatus(id, newStatus);
    await DataAPI.addAuditTrail({
      user: Auth.user.username, activity: 'Update', module: 'UserManagement',
      record: `User #${id}`, old_val: newStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', new_val: newStatus,
    });
    Toast.success(`Status user diubah menjadi ${newStatus}`);
    this.data = await DataAPI.getUsers(); this._draw();
  },
};
