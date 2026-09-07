const PageApproval = {
  async render(el) {
    this.el = el;
    const pending = await DataAPI.getPendingApprovals();
    const dotClass = { Material: 'dot-material', Menu: 'dot-menu', Recipe: 'dot-recipe' };

    el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title">
        <h2>Approval Center</h2>
        <p>Review dan approve permintaan dari bartender</p>
      </div>
      <span class="badge badge-orange">${pending.length} item pending</span>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Menunggu Persetujuan</span></div>
      <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
        ${pending.length ? pending.map(p => `
          <div class="approval-card">
            <div class="approval-type-dot ${dotClass[p.type] || 'dot-material'}">${p.type[0]}</div>
            <div style="flex:1">
              <div style="font-weight:700;font-size:14px">${p.data}</div>
              <div style="font-size:12px;color:var(--gray-500);margin-top:2px">
                ${p.type} · Disubmit oleh <strong>${p.submitted_by}</strong> · ${p.date}
              </div>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-danger btn-sm" onclick="PageApproval.action('${p.ref_type}',${p.ref_id},'rejected')">Reject</button>
              <button class="btn btn-success btn-sm" onclick="PageApproval.action('${p.ref_type}',${p.ref_id},'approved')">Approve</button>
            </div>
          </div>
        `).join('') : `
          <div class="empty-state">
            <div style="font-size:40px;margin-bottom:8px">✓</div>
            <p>Semua sudah di-approve</p>
            <small>Tidak ada item yang menunggu persetujuan</small>
          </div>
        `}
      </div>
    </div>`;
  },

  async action(type, id, status) {
    if (type === 'bahan') await DataAPI.updateBahanStatus(id, status);
    else if (type === 'menu') await DataAPI.updateMenuStatus(id, status);
    Toast[status === 'approved' ? 'success' : 'warning'](`Item di${status === 'approved' ? 'approve' : 'reject'}`);
    updateApprovalBadge();
    await this.render(this.el);
  },
};
