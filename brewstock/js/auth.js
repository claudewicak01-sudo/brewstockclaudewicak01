const Auth = {
  user: null,
  init() {
    try {
      const s = sessionStorage.getItem('bs_user');
      if (s) { const p=JSON.parse(s); if(p?.username&&p?.role) this.user=p; }
    } catch(e) { sessionStorage.removeItem('bs_user'); }
  },
  async login(u,p) { this.user=await DataAPI.login(u,p); sessionStorage.setItem('bs_user',JSON.stringify(this.user)); return this.user; },
  logout() { this.user=null; sessionStorage.removeItem('bs_user'); },
  isAdmin() { return this.user?.role==='admin'; },
};
