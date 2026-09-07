// ─── FORMATTERS ─────────────────────────────────────────────
const fmt = {
  currency: (n) => 'Rp' + Number(n).toLocaleString('id-ID'),
  number:   (n) => Number(n).toLocaleString('id-ID'),
  date:     (d) => d ? new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }) : '-',
  datetime: (d) => d ? new Date(d).toLocaleString('id-ID') : '-',
};

// ─── BADGES ─────────────────────────────────────────────────
function statusBadge(status) {
  const map = {
    approved:  ['badge-green',  'Approved'],
    waiting:   ['badge-orange', 'Waiting'],
    rejected:  ['badge-red',    'Rejected'],
    draft:     ['badge-gray',   'Draft'],
    submitted: ['badge-blue',   'Submitted'],
    verified:  ['badge-green',  'Verified'],
    active:    ['badge-green',  'Active'],
    inactive:  ['badge-red',    'Inactive'],
    ACTIVE:    ['badge-green',  'Active'],
    INACTIVE:  ['badge-red',    'Inactive'],
    normal:    ['badge-green',  'Normal'],
    warning:   ['badge-orange', 'Warning'],
    critical:  ['badge-red',    'Critical'],
    locked:    ['badge-blue',   'Locked'],
    balanced:  ['badge-green',  'Balanced'],
    investigate:['badge-red',   'Investigate'],
  };
  const [cls, label] = map[status] || ['badge-gray', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ─── ICONS (inline SVG) ──────────────────────────────────────
const Icon = {
  _make: (path, vb='0 0 24 24') =>
    `<svg width="16" height="16" viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`,
  plus:    () => Icon._make('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
  edit:    () => Icon._make('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'),
  trash:   () => Icon._make('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>'),
  eye:     () => Icon._make('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
  check:   () => Icon._make('<polyline points="20 6 9 17 4 12"/>'),
  x:       () => Icon._make('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
  search:  () => Icon._make('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'),
  filter:  () => Icon._make('<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>'),
  upload:  () => Icon._make('<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>'),
  image:   () => Icon._make('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'),
  chart:   () => Icon._make('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'),
  alert:   () => Icon._make('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
  package: () => Icon._make('<path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>'),
  coffee:  () => Icon._make('<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>'),
  users:   () => Icon._make('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  book:    () => Icon._make('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
  receipt: () => Icon._make('<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>'),
  audit:   () => Icon._make('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'),
  clock:   () => Icon._make('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
  shield:  () => Icon._make('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
  tag:     () => Icon._make('<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>'),
  settings:() => Icon._make('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
  logout:  () => Icon._make('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'),
};

// ─── MODAL ───────────────────────────────────────────────────
const Modal = {
  open({ title, body, footer = '', size = '' }) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('modal-footer').innerHTML = footer;
    const box = document.getElementById('modal-box');
    box.className = 'modal-box' + (size ? ` modal-${size}` : '');
    document.getElementById('modal-overlay').style.display = 'flex';
  },
  close() {
    document.getElementById('modal-overlay').style.display = 'none';
  },
};

// ─── TOAST ───────────────────────────────────────────────────
const Toast = {
  show(msg, type = 'default', duration = 3000) {
    const c = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success:'✓', error:'✕', warning:'⚠', default:'ℹ' };
    el.innerHTML = `<span>${icons[type]||icons.default}</span> ${msg}`;
    c.appendChild(el);
    setTimeout(() => {
      el.classList.add('removing');
      setTimeout(() => el.remove(), 200);
    }, duration);
  },
  success: (m) => Toast.show(m, 'success'),
  error:   (m) => Toast.show(m, 'error'),
  warning: (m) => Toast.show(m, 'warning'),
};

// ─── TABLE HELPERS ───────────────────────────────────────────
function searchFilter(data, query, keys) {
  if (!query) return data;
  const q = query.toLowerCase();
  return data.filter(row => keys.some(k => String(row[k] || '').toLowerCase().includes(q)));
}

function buildTable({ cols, data, emptyMsg = 'Tidak ada data' }) {
  if (!data.length) return `<div class="empty-state"><p>${emptyMsg}</p></div>`;
  const thead = `<thead><tr>${cols.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${data.map(row => `<tr>${cols.map(c => `<td>${c.render ? c.render(row) : (row[c.key] ?? '-')}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<div class="table-wrap"><table>${thead}${tbody}</table></div>`;
}
