// ─── ROUTER ──────────────────────────────────────────────────
const ROUTES = {
  // Admin routes
  'dashboard':    { label:'Dashboard',      fn: pageDashboard,    icon: IC.dashboard, admin: false },
  'penjualan':    { label:'Penjualan',      fn: pagePenjualan,    icon: IC.sale,      admin: false },
  'stock':        { label:'Stok Bahan',     fn: pageStock,        icon: IC.stock,     admin: false },
  'stock-opname': { label:'Stock Opname',   fn: pageStockOpname,  icon: IC.opname,    admin: true  },
  'daily-report': { label:'Daily Report',   fn: pageDailyReport,  icon: IC.report,    admin: false },
  'master-bahan': { label:'Master Bahan',   fn: pageMasterBahan,  icon: IC.bahan,     admin: false },
  'master-menu':  { label:'Master Menu',    fn: pageMasterMenu,   icon: IC.menu,      admin: false },
  'resep':        { label:'Resep',          fn: pageResep,        icon: IC.resep,     admin: false },
  'audit-trail':  { label:'Audit Trail',    fn: pageAuditTrail,   icon: IC.audit,     admin: true  },
  'users':        { label:'User Management',fn: pageUsers,        icon: IC.users,     admin: true  },
};

// Nav groups
const NAV_ADMIN = [
  { group: null, items: ['dashboard'] },
  { group: 'Operasional', items: ['penjualan','stock','stock-opname','daily-report'] },
  { group: 'Master Data', items: ['master-bahan','master-menu','resep'] },
  { group: 'Manajemen', items: ['audit-trail','users'] },
];

// For bartender mobile — only these pages
const NAV_USER_MOBILE = ['penjualan','stock','daily-report','master-bahan'];

const App = {
  current: null,

  async init() {
    Auth.init();
    if (Auth.user) {
      this._showApp();
    }
  },

  async login() {
    const u = document.getElementById('l-user').value.trim();
    const p = document.getElementById('l-pass').value;
    const errEl = document.getElementById('l-err');
    errEl.style.display = 'none';
    if (!u || !p) { errEl.textContent = 'Username dan password wajib'; errEl.style.display = 'block'; return; }
    try {
      await Auth.login(u, p);
      this._showApp();
    } catch(e) {
      errEl.textContent = e.message;
      errEl.style.display = 'block';
    }
  },

  logout() {
    if (!confirm('Keluar dari BrewStock?')) return;
    Auth.logout();
    location.reload();
  },

  _showApp() {
    document.getElementById('login-wrap').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    this._buildNav();
    this._buildUser();
    this._buildMobileNav();
    this.go('dashboard');
  },

  async go(page) {
    const route = ROUTES[page];
    if (!route) return this.go('dashboard');
    if (route.admin && !Auth.isAdmin()) return this.go('dashboard');

    this.current = page;
    document.getElementById('page-ttl').textContent = route.label;

    // Active nav highlight
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
    document.querySelectorAll('.mobile-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });

    // Close sidebar on mobile
    if (window.innerWidth <= 768) this.closeSidebar();

    const content = document.getElementById('page-content');
    content.innerHTML = `<div class="empty-state" style="padding:60px">${IC.trend()} <p>Memuat...</p></div>`;
    try {
      await route.fn(content);
    } catch(e) {
      content.innerHTML = `<div class="card"><div class="card-body"><div class="empty-state">
        <p style="color:var(--red-600)">Error: ${e.message}</p>
        <small>Cek koneksi Supabase atau reload halaman</small>
      </div></div></div>`;
      console.error('[BrewStock] Page error:', e);
    }
  },

  _buildNav() {
    const isAdmin = Auth.isAdmin();
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = NAV_ADMIN.map(({ group, items }) => {
      const visibleItems = items.filter(k => {
        const r = ROUTES[k];
        return r && (!r.admin || isAdmin);
      });
      if (!visibleItems.length) return '';
      return `
        <div class="nav-group">
          ${group ? `<div class="nav-group-label">${group}</div>` : ''}
          ${visibleItems.map(k => {
            const r = ROUTES[k];
            return `<div class="nav-item" data-page="${k}" onclick="App.go('${k}')">
              ${r.icon()} <span class="nav-label">${r.label}</span>
            </div>`;
          }).join('')}
        </div>`;
    }).join('');
  },

  _buildUser() {
    const u = Auth.user;
    const ini = (u.nama || u.username)[0].toUpperCase();
    document.getElementById('sidebar-avatar').textContent = ini;
    document.getElementById('sidebar-uname').textContent = u.nama || u.username;
    document.getElementById('sidebar-urole').textContent = u.role === 'admin' ? 'Admin / Owner' : 'Bartender';
    document.getElementById('topbar-avatar').textContent = ini;
    document.getElementById('topbar-uname').textContent = u.nama || u.username;
  },

  // Mobile nav — hanya halaman utama untuk bartender
  _buildMobileNav() {
    const isAdmin = Auth.isAdmin();
    const mobilePages = isAdmin
      ? ['dashboard','penjualan','stock','stock-opname','daily-report']
      : ['penjualan','stock','daily-report','master-bahan'];

    const labels = { dashboard:'Home', penjualan:'Jual', stock:'Stok', 'stock-opname':'Opname', 'daily-report':'Laporan', 'master-bahan':'Bahan' };
    const mobileNav = document.getElementById('mobile-nav');
    mobileNav.innerHTML = `<div class="mobile-nav-items">
      ${mobilePages.map(k => {
        const r = ROUTES[k];
        return `<div class="mobile-nav-item" data-page="${k}" onclick="App.go('${k}')">
          ${r.icon()} <span>${labels[k]||r.label}</span>
        </div>`;
      }).join('')}
    </div>`;
  },

  toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const bd = document.getElementById('sidebar-bd');
    const isOpen = sb.classList.toggle('open');
    bd.classList.toggle('on', isOpen);
  },

  closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-bd').classList.remove('on');
  },
};

// ─── BOOT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('login-wrap')?.style.display !== 'none') App.login();
  if (e.key === 'Escape') Modal.close();
});

function fillDemo(role) {
  document.getElementById('l-user').value = role === 'admin' ? 'admin' : 'bartender';
  document.getElementById('l-pass').value = role === 'admin' ? 'admin123' : 'user123';
  setTimeout(() => App.login(), 50);
}
