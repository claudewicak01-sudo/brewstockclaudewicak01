// ─── FORMATTERS ─────────────────────────────────────────────
const fmt = {
  currency: n => 'Rp' + Number(n||0).toLocaleString('id-ID'),
  number:   n => Number(n||0).toLocaleString('id-ID'),
  date:     d => d ? new Date(d).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) : '-',
};

// ─── BADGE ───────────────────────────────────────────────────
function badge(status) {
  const m = {
    approved:['bg-green','Approved'], waiting:['bg-orange','Waiting'], rejected:['bg-red','Rejected'],
    active:['bg-green','Active'], ACTIVE:['bg-green','Active'], INACTIVE:['bg-red','Inactive'],
    normal:['bg-green','Normal'], warning:['bg-orange','Warning'], critical:['bg-red','Critical'],
    submitted:['bg-blue','Submitted'], verified:['bg-green','Verified'],
  };
  const [cls,label] = m[status]||['bg-gray',status];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ─── ICONS ───────────────────────────────────────────────────
const IC = {
  svg:(p,vb='0 0 24 24',sz=18)=>`<svg width="${sz}" height="${sz}" viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`,
  dashboard: ()=>IC.svg('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>'),
  bahan:  ()=>IC.svg('<path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>'),
  menu:   ()=>IC.svg('<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>'),
  resep:  ()=>IC.svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
  sale:   ()=>IC.svg('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'),
  stock:  ()=>IC.svg('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'),
  opname: ()=>IC.svg('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'),
  report: ()=>IC.svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'),
  users:  ()=>IC.svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  audit:  ()=>IC.svg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
  plus:   ()=>IC.svg('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
  eye:    ()=>IC.svg('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
  trash:  ()=>IC.svg('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>'),
  search: ()=>IC.svg('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'),
  alert:  ()=>IC.svg('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
  check:  ()=>IC.svg('<polyline points="20 6 9 17 4 12"/>'),
  x:      ()=>IC.svg('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
  img:    ()=>IC.svg('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'),
  trend:  ()=>IC.svg('<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>'),
};

// ─── TOAST ───────────────────────────────────────────────────
const Toast = {
  show(msg, type='info') {
    const c = document.getElementById('toast-wrap');
    if (!c) return;
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    const icons = {success:'✓',error:'✕',warning:'⚠',info:'ℹ'};
    el.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ'}</span><span>${msg}</span>`;
    c.appendChild(el);
    setTimeout(()=>{ el.classList.add('out'); setTimeout(()=>el.remove(),300); }, 3200);
  },
  success: m=>Toast.show(m,'success'),
  error:   m=>Toast.show(m,'error'),
  warning: m=>Toast.show(m,'warning'),
  info:    m=>Toast.show(m,'info'),
};

// ─── MODAL ───────────────────────────────────────────────────
const Modal = {
  open({title,body,footer='',size=''}) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('modal-footer').innerHTML = footer;
    document.getElementById('modal-box').className = `modal-box${size?' modal-'+size:''}`;
    document.getElementById('modal-overlay').classList.add('open');
  },
  close() { document.getElementById('modal-overlay').classList.remove('open'); },
};

// ─── TABLE BUILDER ───────────────────────────────────────────
function buildTable({cols, data, empty='Tidak ada data'}) {
  if (!data?.length) return `<div class="empty-state">${IC.bahan()} <p>${empty}</p></div>`;
  const head = cols.map(c=>`<th>${c.label}</th>`).join('');
  const rows = data.map(row=>`<tr>${cols.map(c=>`<td>${c.render?c.render(row):(row[c.key]??'-')}</td>`).join('')}</tr>`).join('');
  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

function searchFilter(data, q, keys) {
  if (!q) return data;
  const lq = q.toLowerCase();
  return data.filter(r=>keys.some(k=>String(r[k]||'').toLowerCase().includes(lq)));
}

// ─── MINI CHARTS (SVG) ───────────────────────────────────────
function lineChart(points, w=300, h=80, color='#1B4FD8') {
  if (!points?.length) return '<div class="chart-empty">Tidak ada data</div>';
  const max = Math.max(...points.map(p=>p.y), 1);
  const min = Math.min(...points.map(p=>p.y), 0);
  const range = max - min || 1;
  const xs = points.map((_,i)=> (i/(points.length-1||1))*(w-20)+10);
  const ys = points.map(p=> h-10 - ((p.y-min)/range)*(h-20));
  const path = xs.map((x,i)=>`${i===0?'M':'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const area = `${path} L${xs[xs.length-1]},${h} L${xs[0]},${h} Z`;
  const labels = points.map((p,i)=>`<text x="${xs[i].toFixed(1)}" y="${h}" font-size="9" fill="#9ca3af" text-anchor="middle">${p.label||''}</text>`).join('');
  return `<svg viewBox="0 0 ${w} ${h+12}" style="width:100%;overflow:visible">
    <defs><linearGradient id="lg${color.replace('#','')}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="${area}" fill="url(#lg${color.replace('#','')})" />
    <path d="${path}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
    ${xs.map((x,i)=>`<circle cx="${x.toFixed(1)}" cy="${ys[i].toFixed(1)}" r="3" fill="${color}"/>`).join('')}
    ${labels}
  </svg>`;
}

function barChart(items, w=300, h=120, color='#1B4FD8') {
  if (!items?.length) return '<div class="chart-empty">Tidak ada data</div>';
  const max = Math.max(...items.map(d=>d.value), 1);
  const bw = Math.floor((w-20)/items.length) - 4;
  const bars = items.map((d,i)=>{
    const bh = Math.max(4, ((d.value/max)*(h-30)));
    const x = 10 + i*((w-20)/items.length);
    const y = h-20-bh;
    const clr = d.color || color;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw}" height="${bh.toFixed(1)}" fill="${clr}" rx="3"/>
      <text x="${(x+bw/2).toFixed(1)}" y="${h-4}" font-size="9" fill="#6b7280" text-anchor="middle">${d.label}</text>
      <text x="${(x+bw/2).toFixed(1)}" y="${(y-3).toFixed(1)}" font-size="8" fill="${clr}" text-anchor="middle">${d.value}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;overflow:visible">${bars}</svg>`;
}

function stackedBar(items, w=300, h=32) {
  // items: [{label, used, stock, satuan}]
  return items.map(it=>{
    const total = (it.used||0) + (it.stock||0);
    const pctUsed = total>0 ? (it.used/total*100) : 0;
    const pctStock = 100 - pctUsed;
    return `<div class="sbar-row">
      <div class="sbar-label">${it.label}</div>
      <div class="sbar-track">
        <div class="sbar-fill used" style="width:${pctUsed.toFixed(1)}%" title="Terpakai: ${fmt.number(it.used)} ${it.satuan}"></div>
        <div class="sbar-fill stock" style="width:${pctStock.toFixed(1)}%" title="Sisa: ${fmt.number(it.stock)} ${it.satuan}"></div>
      </div>
      <div class="sbar-info">
        <span class="used-dot">▪</span>${fmt.number(it.used)}
        <span class="stock-dot" style="margin-left:8px">▪</span>${fmt.number(it.stock)} ${it.satuan}
      </div>
    </div>`;
  }).join('');
}
