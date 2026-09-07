const PageResep = {
  data: [], menu: [], bahan: [], lines: [],

  async render(el) {
    this.el = el;
    [this.data, this.menu, this.bahan] = await Promise.all([DataAPI.getResep(), DataAPI.getMenu(), DataAPI.getBahan()]);
    this._draw();
  },

  _draw() {
    // Group by menu
    const byMenu = {};
    this.data.forEach(r => {
      if (!byMenu[r.menu_nama]) byMenu[r.menu_nama] = [];
      byMenu[r.menu_nama].push(r);
    });

    this.el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title"><h2>Master Resep</h2><p>Komposisi bahan per menu — dasar perhitungan material usage</p></div>
      ${!Auth.isAdmin() ? `<button class="btn btn-primary" onclick="PageResep.openBuilder()">${Icon.plus()} Buat Resep</button>` : ''}
    </div>
    ${Object.keys(byMenu).length ? Object.entries(byMenu).map(([menuNama, lines]) => `
      <div class="card mb-4">
        <div class="card-header">
          <span class="card-title">${Icon.coffee()} ${menuNama}</span>
          ${statusBadge(lines[0]?.status || 'approved')}
        </div>
        <div class="card-body" style="padding:0">
          ${buildTable({
            cols: [
              { key: 'bahan_nama', label: 'Bahan' },
              { label: 'Quantity', render: r => `<span class="font-mono">${r.qty} ${r.satuan}</span>` },
            ],
            data: lines,
          })}
        </div>
      </div>
    `).join('') : `<div class="card"><div class="card-body"><div class="empty-state"><p>Belum ada resep.</p><small>Buat resep dengan klik tombol "Buat Resep"</small></div></div></div>`}`;
  },

  openBuilder() {
    const approvedMenu  = this.menu.filter(m => m.status === 'approved');
    const approvedBahan = this.bahan.filter(b => b.status === 'approved');
    this.lines = [{ bahan_id: '', qty: '', satuan: '' }];

    Modal.open({
      title: 'Recipe Builder',
      size: 'lg',
      body: `
        <div class="form-group">
          <label>Menu <span class="req">*</span></label>
          <select id="r-menu">
            <option value="">— Pilih Menu —</option>
            ${approvedMenu.map(m => `<option value="${m.id}">${m.nama}</option>`).join('')}
          </select>
        </div>
        <div class="divider"></div>
        <div style="font-weight:600;margin-bottom:10px">Komposisi Bahan</div>
        <div id="recipe-lines">
          ${this._lineHTML(0, approvedBahan)}
        </div>
        <button class="btn btn-ghost btn-sm" onclick="PageResep.addLine()" style="margin-top:8px">${Icon.plus()} Tambah Bahan</button>
      `,
      footer: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
               <button class="btn btn-primary" onclick="PageResep.save()">Submit Approval</button>`,
    });
    this._storeBahan = approvedBahan;
  },

  _lineHTML(i, bahan) {
    return `
    <div class="recipe-line" id="recipe-line-${i}">
      <div class="form-group" style="margin:0">
        <select id="r-bahan-${i}">
          <option value="">— Pilih Bahan —</option>
          ${bahan.map(b => `<option value="${b.id}" data-sat="${b.satuan}">${b.nama}</option>`).join('')}
        </select>
      </div>
      <div class="form-group" style="margin:0"><input id="r-qty-${i}" type="number" placeholder="Qty" min="0" /></div>
      <div class="form-group" style="margin:0"><input id="r-sat-${i}" type="text" placeholder="gram" readonly /></div>
      <button class="btn btn-ghost btn-sm btn-icon" onclick="PageResep.removeLine(${i})">${Icon.trash()}</button>
    </div>`;
  },

  addLine() {
    const i = ++this._lineCount || (this._lineCount = 1);
    document.getElementById('recipe-lines').insertAdjacentHTML('beforeend', this._lineHTML(i, this._storeBahan));
    // Auto-fill satuan when bahan selected
    document.getElementById(`r-bahan-${i}`)?.addEventListener('change', function() {
      const opt = this.options[this.selectedIndex];
      document.getElementById(`r-sat-${i}`).value = opt.dataset.sat || '';
    });
  },

  removeLine(i) {
    document.getElementById(`recipe-line-${i}`)?.remove();
  },

  async save() {
    const menuId = document.getElementById('r-menu').value;
    if (!menuId) { Toast.error('Pilih menu terlebih dahulu'); return; }
    const menu = this.menu.find(m => m.id == menuId);
    const lines = [];
    let i = 0;
    while (document.getElementById(`r-bahan-${i}`) !== null) {
      const bahanId = document.getElementById(`r-bahan-${i}`)?.value;
      const qty = parseFloat(document.getElementById(`r-qty-${i}`)?.value);
      const satuan = document.getElementById(`r-sat-${i}`)?.value;
      if (bahanId && qty > 0) {
        const bahan = this.bahan.find(b => b.id == bahanId);
        lines.push({ menu_id: +menuId, menu_nama: menu.nama, bahan_id: +bahanId, bahan_nama: bahan?.nama, qty, satuan, status: 'waiting', created_by: Auth.user.username });
      }
      i++;
    }
    if (!lines.length) { Toast.error('Tambahkan minimal 1 bahan'); return; }
    await DataAPI.addResepLines(lines);
    await DataAPI.addAuditTrail({ user: Auth.user.username, activity: 'Submit', module: 'Recipe', record: menu.nama, old_val: '', new_val: 'Waiting Approval' });
    Modal.close(); Toast.success(`Resep ${menu.nama} disubmit`);
    this.data = await DataAPI.getResep(); this._draw();
  },

  _lineCount: 0,
};
