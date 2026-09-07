const Auth = {
  user: null,

  async init() {
    // Bersihkan session lama jika ada versi konflik
    try {
      const saved = sessionStorage.getItem('brewstock_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validasi: user harus punya username dan role
        if (parsed && parsed.username && parsed.role) {
          this.user = parsed;
        } else {
          sessionStorage.removeItem('brewstock_user');
        }
      }
    } catch(e) {
      sessionStorage.removeItem('brewstock_user');
    }
  },

  async login(username, password) {
    const user = await DataAPI.login(username, password);
    this.user = user;
    sessionStorage.setItem('brewstock_user', JSON.stringify(user));
    return user;
  },

  logout() {
    this.user = null;
    sessionStorage.removeItem('brewstock_user');
  },

  isAdmin() { return this.user?.role === 'admin'; },
  isLoggedIn() { return !!this.user; },
  
  can(action) {
    if (!this.user) return false;
    const adminOnly = ['audit_center', 'audit_trail', 'user_management', 'approve', 'audit_dashboard'];
    const userOnly  = ['input_bahan', 'input_menu', 'input_resep'];
    if (adminOnly.includes(action)) return this.isAdmin();
    if (userOnly.includes(action)) return !this.isAdmin();
    return true; // shared actions
  }
};
