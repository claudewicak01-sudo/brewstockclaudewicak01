const Auth = {
  user: null,

  async init() {
    const saved = sessionStorage.getItem('brewstock_user');
    if (saved) {
      try { this.user = JSON.parse(saved); } catch(e) {}
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
