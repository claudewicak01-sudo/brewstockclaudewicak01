// ─── MAIN APP ────────────────────────────────────────────────
const App = {
  async init() {
    await Auth.init();
    if (Auth.isLoggedIn()) {
      this._showApp();
    }
  },

  async login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errEl = document.getElementById('login-error');
    errEl.style.display = 'none';

    if (!username || !password) {
      errEl.textContent = 'Username dan password wajib diisi';
      errEl.style.display = 'block';
      return;
    }

    try {
      await Auth.login(username, password);
      this._showApp();
    } catch (e) {
      const mode = (typeof DEMO_MODE !== 'undefined' && DEMO_MODE) ? ' [Demo Mode]' : ' [Supabase Mode]';
      errEl.textContent = e.message + mode;
      errEl.style.display = 'block';
    }
  },

  _showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-shell').style.display = 'flex';
    buildNav();
    buildSidebarUser();
    Router.go('dashboard');
  },

  logout() {
    if (!confirm('Yakin ingin keluar dari BrewStock?')) return;
    Auth.logout();
    document.getElementById('app-shell').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').style.display = 'none';
  },

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    // Mobile: toggle mobile-open class
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('mobile-open');
    } else {
      sidebar.classList.toggle('collapsed');
    }
  },
};

// ─── DEMO FILL — langsung login tanpa ketik manual ───────────
function fillDemo(role) {
  const creds = role === 'admin'
    ? { username: 'admin', password: 'admin123' }
    : { username: 'bartender', password: 'user123' };

  document.getElementById('login-username').value = creds.username;
  document.getElementById('login-password').value = creds.password;

  // Langsung login setelah fill
  setTimeout(() => App.login(), 50);
}

// ─── KEYBOARD SHORTCUTS ──────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('login-screen').style.display !== 'none') {
    App.login();
  }
  if (e.key === 'Escape') Modal.close();
});

// ─── BOOT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
