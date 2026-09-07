const PageDailyReport = {
  data: [], _posFile: null,

  async render(el) {
    this.el = el;
    try {
    this.this.data = await DataAPI.getDailyReport();
    } catch(e) { this.data = []; Toast.error("Gagal load: " + e.message); }

    this._draw();
  },

  _draw() {
    this.el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title"><h2>Daily Report</h2><p>Laporan harian kas & non-kas — foto bukti POS wajib</p></div>
      <button class="btn btn-primary" onclick="PageDailyReport.openAdd()">${Icon.plus()} Input Daily Report</button>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">Riwayat Daily Report</span></div>
      <div class="card-body" style="padding:0">
        ${buildTable({
          cols: [
            { key: 'tanggal', label: 'Tanggal' },
            { key: 'user', label: 'User' },
            { key: 'shift', label: 'Shift' },
            { label: 'Total Sales', render: r => `<strong class="font-mono">${fmt.currency(r.total_sales)}</strong>` },
            { label: 'Cash', render: r => fmt.currency(r.cash) },
            { label: 'Non-Cash', render: r => fmt.currency(r.qris + r.debit + r.credit + r.ewallet) },
            { label: 'Total POS', render: r => fmt.currency(r.total_pos) },
            { label: 'Variance', render: r => `<span class="font-mono" style="color:${r.variance!==0?'var(--red-600)':'var(--green-600)'}">${r.variance >= 0 ? '+' : ''}${fmt.currency(r.variance)}</span>` },
            { label: 'Bukti POS', render: r => r.pos_foto ? `<span class="badge badge-green">Ada</span>` : `<span class="badge badge-red">Tidak Ada</span>` },
            { label: 'Reconciliation', render: r => r.variance === 0 ? statusBadge('balanced') : statusBadge('investigate') },
            { label: 'Aksi', render: r => `<button class="btn btn-ghost btn-sm btn-icon" onclick="PageDailyReport.detail(${r.id})">${Icon.eye()}</button>` },
          ],
          data: this.data,
          emptyMsg: 'Belum ada daily report.',
        })}
      </div>
    </div>`;
  },

  openAdd() {
    this._posFile = null;
    Modal.open({
      title: 'Input Daily Report',
      size: 'lg',
      body: `
        <div class="form-row cols-2">
          <div class="form-group"><label>Tanggal <span class="req">*</span></label><input id="dr-tgl" type="date" value="${new Date().toISOString().split('T')[0]}" /></div>
          <div class="form-group"><label>Shift <span class="req">*</span></label>
            <select id="dr-shift"><option>Pagi</option><option>Siang</option><option>Malam</option></select>
          </div>
        </div>
        <div class="form-group"><label>Total Sales (dari POS) <span class="req">*</span></label>
          <input id="dr-sales" type="number" placeholder="0" oninput="PageDailyReport._calc()" />
        </div>
        <div style="font-weight:700;margin-bottom:12px;margin-top:4px">Rincian Pembayaran</div>
        <div class="form-row cols-2">
          <div class="form-group"><label>Cash</label><input id="dr-cash" type="number" value="0" oninput="PageDailyReport._calc()" /></div>
          <div class="form-group"><label>QRIS</label><input id="dr-qris" type="number" value="0" oninput="PageDailyReport._calc()" /></div>
        </div>
        <div class="form-row cols-3">
          <div class="form-group"><label>Debit</label><input id="dr-debit" type="number" value="0" oninput="PageDailyReport._calc()" /></div>
          <div class="form-group"><label>Credit</label><input id="dr-credit" type="number" value="0" oninput="PageDailyReport._calc()" /></div>
          <div class="form-group"><label>E-Wallet</label><input id="dr-ewallet" type="number" value="0" oninput="PageDailyReport._calc()" /></div>
        </div>
        <div class="form-row cols-2">
          <div class="form-group"><label>Total Laporan (Otomatis)</label><input id="dr-total" type="text" readonly /></div>
          <div class="form-group"><label>Variance</label><input id="dr-variance" type="text" readonly /></div>
        </div>
        <div id="dr-reconcile-status" style="margin-bottom:12px"></div>
        <div class="form-group"><label>Catatan</label><textarea id="dr-cat" rows="2"></textarea></div>
        <div class="form-group">
          <label>Foto Bukti POS <span class="req">*</span></label>
          <div class="upload-zone" id="pos-zone" onclick="document.getElementById('pos-input').click()">
            <input type="file" id="pos-input" accept="image/*" style="display:none" onchange="PageDailyReport._onFoto(event)" />
            <div class="upload-icon">${Icon.image()}</div>
            <div class="upload-text">Klik untuk upload foto POS</div>
            <div class="upload-hint">JPG, JPEG, PNG</div>
          </div>
        </div>
      `,
      footer: `<button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
               <button class="btn btn-primary" onclick="PageDailyReport.save()">Submit Daily Report</button>`,
    });
  },

  _calc() {
    const sales = parseFloat(document.getElementById('dr-sales')?.value) || 0;
    const cash = parseFloat(document.getElementById('dr-cash')?.value) || 0;
    const qris = parseFloat(document.getElementById('dr-qris')?.value) || 0;
    const debit = parseFloat(document.getElementById('dr-debit')?.value) || 0;
    const credit = parseFloat(document.getElementById('dr-credit')?.value) || 0;
    const ewallet = parseFloat(document.getElementById('dr-ewallet')?.value) || 0;
    const total = cash + qris + debit + credit + ewallet;
    const variance = total - sales;

    const totalEl = document.getElementById('dr-total');
    const varEl = document.getElementById('dr-variance');
    const statusEl = document.getElementById('dr-reconcile-status');
    if (totalEl) totalEl.value = fmt.currency(total);
    if (varEl) {
      varEl.value = `${variance >= 0 ? '+' : ''}${fmt.currency(variance)}`;
      varEl.style.color = variance !== 0 ? 'var(--red-600)' : 'var(--green-600)';
    }
    if (statusEl) {
      if (sales > 0) {
        statusEl.innerHTML = variance === 0
          ? `<span class="badge badge-green">BALANCED — Rekonsiliasi sesuai</span>`
          : `<span class="badge badge-red">INVESTIGATE — Selisih ${fmt.currency(Math.abs(variance))}</span>`;
      }
    }
  },

  _onFoto(e) {
    const file = e.target.files[0]; if (!file) return;
    this._posFile = file;
    const zone = document.getElementById('pos-zone');
    zone.classList.add('has-file');
    zone.querySelector('.upload-text').textContent = `✓ ${file.name}`;
  },

  async save() {
    const tgl = document.getElementById('dr-tgl').value;
    const shift = document.getElementById('dr-shift').value;
    const sales = parseFloat(document.getElementById('dr-sales').value) || 0;

    if (!tgl || !sales) { Toast.error('Tanggal dan Total Sales wajib diisi'); return; }
    if (!this._posFile) { Toast.error('Foto bukti POS wajib diupload sebelum submit'); return; }

    const cash = parseFloat(document.getElementById('dr-cash').value) || 0;
    const qris = parseFloat(document.getElementById('dr-qris').value) || 0;
    const debit = parseFloat(document.getElementById('dr-debit').value) || 0;
    const credit = parseFloat(document.getElementById('dr-credit').value) || 0;
    const ewallet = parseFloat(document.getElementById('dr-ewallet').value) || 0;
    const total_pos = cash + qris + debit + credit + ewallet;
    const variance = total_pos - sales;

    await DataAPI.addDailyReport({
      tanggal: tgl, user: Auth.user.username, shift,
      total_sales: sales, cash, qris, debit, credit, ewallet, other: 0,
      total_pos, variance,
      catatan: document.getElementById('dr-cat').value,
      pos_foto: true, status: 'submitted',
    });
    Modal.close(); Toast.success('Daily report berhasil disubmit');
    if (variance !== 0) Toast.warning(`Cash variance terdeteksi: ${fmt.currency(Math.abs(variance))}`);
    this.data = await DataAPI.getDailyReport(); this._draw();
  },

  detail(id) {
    const r = this.data.find(x => x.id === id);
    if (!r) return;
    const nonCash = r.qris + r.debit + r.credit + r.ewallet;
    Modal.open({
      title: `Daily Report — ${r.tanggal} ${r.shift}`,
      body: `
        <div class="form-row cols-2" style="margin-bottom:12px">
          <div><div class="text-sm text-gray">Tanggal / Shift</div><strong>${r.tanggal} — ${r.shift}</strong></div>
          <div><div class="text-sm text-gray">User</div>${r.user}</div>
        </div>
        <div style="background:var(--blue-50);border-radius:8px;padding:16px;margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span class="text-sm text-gray">Total Sales (POS)</span>
            <strong class="font-mono">${fmt.currency(r.total_sales)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span class="text-sm text-gray">Cash</span><span class="font-mono">${fmt.currency(r.cash)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span class="text-sm text-gray">QRIS</span><span class="font-mono">${fmt.currency(r.qris)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span class="text-sm text-gray">Debit</span><span class="font-mono">${fmt.currency(r.debit)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span class="text-sm text-gray">Credit</span><span class="font-mono">${fmt.currency(r.credit)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px">
            <span class="text-sm text-gray">E-Wallet</span><span class="font-mono">${fmt.currency(r.ewallet)}</span>
          </div>
          <div class="divider"></div>
          <div style="display:flex;justify-content:space-between;margin-top:8px">
            <span style="font-weight:700">Total Laporan</span>
            <strong class="font-mono">${fmt.currency(r.total_pos)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:8px">
            <span style="font-weight:700">Variance</span>
            <strong class="font-mono" style="color:${r.variance!==0?'var(--red-600)':'var(--green-600)'}">
              ${r.variance >= 0 ? '+' : ''}${fmt.currency(r.variance)}
            </strong>
          </div>
        </div>
        <div style="text-align:center">
          ${r.variance === 0 ? statusBadge('balanced') : statusBadge('investigate')}
        </div>
      `,
      footer: `<button class="btn btn-ghost" onclick="Modal.close()">Tutup</button>`,
    });
  },
};
