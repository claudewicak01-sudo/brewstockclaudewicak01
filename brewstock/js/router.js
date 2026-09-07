const Router = {
  current: null,

  routes: {
    'dashboard':       { label: 'Dashboard',       render: PageDashboard.render,      admin: false },
    'master-bahan':    { label: 'Master Bahan',     render: PageMasterBahan.render,    admin: false },
    'master-menu':     { label: 'Master Menu',      render: PageMasterMenu.render,     admin: false },
    'resep':           { label: 'Resep',            render: PageResep.render,          admin: false },
    'approval':        { label: 'Approval Center',  render: PageApproval.render,       admin: true  },
    'pembelian':       { label: 'Pembelian',        render: PagePembelian.render,      admin: false },
    'penjualan':       { label: 'Penjualan',        render: PagePenjualan.render,      admin: false },
    'stock':           { label: 'Stock',            render: PageStock.render,          admin: false },
    'stock-opname':    { label: 'Stock Opname',     render: PageStockOpname.render,    admin: false },
    'daily-report':    { label: 'Daily Report',     render: PageDailyReport.render,    admin: false },
    'audit-center':    { label: 'Audit Center',     render: PageAuditCenter.render,    admin: true  },
    'audit-trail':     { label: 'Audit Trail',      render: PageAuditTrail.render,     admin: true  },
    'user-management': { label: 'User Management',  render: PageUserMgmt.render,       admin: true  },
  },

  async go(page) {
    const route = this.routes[page];
    if (!route) return this.go('dashboard');
    if (route.admin && !Auth.isAdmin()) return this.go('dashboard');
    this.current = page;
    document.getElementById('page-title').textContent = route.label;
    const content = document.getElementById('page-content');
    content.innerHTML = '<div style="padding:40px;text-align:center;color:var(--gray-400)">Memuat...</div>';
    // Active nav
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
    try {
      await route.render(content);
    } catch(e) {
      content.innerHTML = `<div class="empty-state"><p>Gagal memuat halaman: ${e.message}</p></div>`;
    }
  },
};

function buildNav() {
  const isAdmin = Auth.isAdmin();
  const nav = [
    { group: null, items: [
      { page: 'dashboard', icon: Icon.chart(), label: 'Dashboard' },
    ]},
    { group: 'Master Data', items: [
      { page: 'master-bahan', icon: Icon.package(), label: 'Master Bahan' },
      { page: 'master-menu',  icon: Icon.coffee(),  label: 'Menu' },
      { page: 'resep',        icon: Icon.book(),    label: 'Resep' },
      ...(isAdmin ? [{ page: 'approval', icon: Icon.audit(), label: 'Approval Center', badge: true }] : []),
    ]},
    { group: 'Operasional', items: [
      { page: 'pembelian',    icon: Icon.receipt(), label: 'Pembelian' },
      { page: 'penjualan',    icon: Icon.tag(),     label: 'Penjualan' },
      { page: 'stock',        icon: Icon.package(), label: 'Stock' },
      { page: 'stock-opname', icon: Icon.audit(),   label: 'Stock Opname' },
    ]},
    { group: 'Daily Operation', items: [
      { page: 'daily-report', icon: Icon.clock(),   label: 'Daily Report' },
    ]},
    ...(isAdmin ? [{ group: 'Audit & Monitor', items: [
      { page: 'audit-center', icon: Icon.shield(),  label: 'Audit Center' },
      { page: 'audit-trail',  icon: Icon.clock(),   label: 'Audit Trail' },
    ]}] : []),
    ...(isAdmin ? [{ group: 'Manajemen', items: [
      { page: 'user-management', icon: Icon.users(), label: 'User Management' },
    ]}] : []),
  ];

  const el = document.getElementById('sidebar-nav');
  el.innerHTML = nav.map(({ group, items }) => `
    <div class="nav-group">
      ${group ? `<div class="nav-group-title">${group}</div>` : ''}
      ${items.map(i => `
        <div class="nav-item" data-page="${i.page}" onclick="Router.go('${i.page}')">
          <span class="nav-icon">${i.icon}</span>
          <span class="nav-label">${i.label}</span>
          ${i.badge ? `<span class="nav-badge" id="badge-approval">0</span>` : ''}
        </div>
      `).join('')}
    </div>
  `).join('');

  // Update badge
  if (isAdmin) updateApprovalBadge();
}

async function updateApprovalBadge() {
  const pending = await DataAPI.getPendingApprovals();
  const badge = document.getElementById('badge-approval');
  if (badge) badge.textContent = pending.length;
}

function buildSidebarUser() {
  const u = Auth.user;
  document.getElementById('sidebar-user').innerHTML = `
    <div class="sidebar-user-avatar">${(u.nama || u.username)[0].toUpperCase()}</div>
    <div class="sidebar-user-info">
      <div class="sidebar-user-name">${u.nama || u.username}</div>
      <div class="sidebar-user-role">${u.role === 'admin' ? 'Admin / Owner' : 'Bartender'}</div>
    </div>
  `;
  document.getElementById('topbar-avatar').textContent = (u.nama || u.username)[0].toUpperCase();
  document.getElementById('topbar-name').textContent = u.nama || u.username;
}
