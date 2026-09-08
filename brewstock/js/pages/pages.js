// ─── PAGE: PENJUALAN ────────────────────────────────────────
let _pjData=[], _pjMenu=[], _pjResep=[];
async function pagePenjualan(el) {
  el.innerHTML=`<div class="empty-state"><p>Memuat...</p></div>`;
  [_pjData,_pjMenu,_pjResep] = await Promise.all([DataAPI.getPenjualan().catch(()=>[]),DataAPI.getMenu().catch(()=>[]),DataAPI.getResep().catch(()=>[])]);
  _renderPenjualan(el,'');
}
function _renderPenjualan(el,q) {
  const data = searchFilter(_pjData,q,['menu_nama','shift','created_by']);
  const today = new Date().toISOString().split('T')[0];
  const todayTotal = _pjData.filter(p=>p.tanggal===today).reduce((s,p)=>s+p.total,0);

  el.innerHTML=`
  <div class="page-head">
    <div><h2>Input Penjualan</h2><p>Stok bahan otomatis berkurang sesuai resep saat penjualan diinput</p></div>
    <button class="btn btn-primary" onclick="_openPenjualan()">${IC.plus()} Input Penjualan</button>
  </div>
  <div class="kpi-grid" style="max-width:500px;margin-bottom:16px">
    <div class="kpi-card"><div class="kpi-label">Revenue Hari Ini</div><div class="kpi-val">${fmt.currency(todayTotal)}</div></div>
    <div class="kpi-card orange"><div class="kpi-label">Transaksi</div><div class="kpi-val">${data.length}</div></div>
  </div>
  <div class="card">
    <div class="card-head">
      <div class="search-box">${IC.search()}<input type="text" placeholder="Cari..." oninput="_renderPenjualan(document.getElementById('pc'),this.value)" /></div>
    </div>
    <div class="card-body-p0">
      ${buildTable({cols:[
        {key:'tanggal',label:'Tanggal'},{key:'shift',label:'Shift'},{key:'menu_nama',label:'Menu'},
        {label:'Qty',render:r=>`<b>${r.qty}</b>`},
        {label:'Total',render:r=>`<span class="font-mono">${fmt.currency(r.total)}</span>`},
        {key:'metode',label:'Metode'},{key:'created_by',label:'Oleh'},
      ],data,empty:'Belum ada penjualan'})}
    </div>
  </div>`;
  el.id='pc';
}

function _openPenjualan() {
  const approvedMenu = _pjMenu.filter(m=>m.status==='approved');
  let _selMenu=null;
  Modal.open({
    title:'Input Penjualan',
    body:`
    <div class="form-row cols-2">
      <div class="form-group"><label>Tanggal<span class="req">*</span></label><input id="pj-tgl" type="date" value="${new Date().toISOString().split('T')[0]}"/></div>
      <div class="form-group"><label>Shift<span class="req">*</span></label><select id="pj-shift"><option>Pagi</option><option>Siang</option><option>Malam</option></select></div>
    </div>
    <div class="form-group"><label>Menu<span class="req">*</span></label>
      <select id="pj-menu" onchange="_onPjMenu()"><option value="">— Pilih Menu —</option>
        ${approvedMenu.map(m=>`<option value="${m.id}" data-h="${m.harga}" data-n="${m.nama}">${m.nama} — ${fmt.currency(m.harga)}</option>`).join('')}
      </select></div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Qty<span class="req">*</span></label><input id="pj-qty" type="number" min="1" placeholder="0" oninput="_onPjQty()"/></div>
      <div class="form-group"><label>Metode</label><select id="pj-met"><option>Mixed</option><option>Cash</option><option>QRIS</option><option>Debit</option><option>Transfer</option></select></div>
    </div>
    <div class="form-group"><label>Total</label><input id="pj-total" readonly/></div>
    <div id="pj-preview" style="margin-top:8px"></div>`,
    footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
            <button class="btn btn-primary" onclick="_savePenjualan()">Submit & Kurangi Stok</button>`,
  });
}

function _onPjMenu() {
  const s=document.getElementById('pj-menu'); const o=s.options[s.selectedIndex];
  _onPjQty();
  const lines=_pjResep.filter(r=>r.menu_id==s.value);
  const qty=parseFloat(document.getElementById('pj-qty')?.value)||0;
  const prev=document.getElementById('pj-preview');
  if(!prev||!lines.length){if(prev)prev.innerHTML='';return;}
  prev.innerHTML=`<div style="background:var(--blue-50);border:1px solid var(--blue-100);border-radius:8px;padding:12px">
    <div style="font-size:11px;font-weight:700;color:var(--blue-700);margin-bottom:6px">📦 Bahan yang akan dikurangi${qty>0?' (qty '+qty+')':''}:</div>
    ${lines.map(r=>`<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
      <span>${r.bahan_nama}</span><span class="font-mono">${fmt.number(r.qty*(qty||1))} ${r.satuan}</span>
    </div>`).join('')}
  </div>`;
}
function _onPjQty(){
  const s=document.getElementById('pj-menu'); const o=s?.options[s?.selectedIndex];
  const qty=parseFloat(document.getElementById('pj-qty')?.value)||0;
  const harga=parseFloat(o?.dataset.h)||0;
  const el=document.getElementById('pj-total'); if(el) el.value=fmt.currency(harga*qty);
  _onPjMenu();
}

async function _savePenjualan() {
  const s=document.getElementById('pj-menu'); const o=s.options[s.selectedIndex];
  const tgl=document.getElementById('pj-tgl').value;
  const menuId=+s.value; const menuNama=o.dataset.n;
  const qty=+document.getElementById('pj-qty').value;
  const harga=+o.dataset.h;
  if(!tgl||!menuId||!qty){Toast.error('Isi semua field');return;}
  try {
    await DataAPI.savePenjualan({tanggal:tgl,shift:document.getElementById('pj-shift').value,menu_id:menuId,menu_nama:menuNama,qty,harga,total:harga*qty,metode:document.getElementById('pj-met').value,created_by:Auth.user.username});
    Modal.close(); Toast.success(`${menuNama} x${qty} disimpan — stok dikurangi otomatis`);
    _pjData=await DataAPI.getPenjualan().catch(()=>[]);
    const cont=document.getElementById('pc'); if(cont) _renderPenjualan(cont,'');
  } catch(e){Toast.error(e.message);}
}

// ─── PAGE: STOCK ─────────────────────────────────────────────
async function pageStock(el) {
  const [bahan,penjualan,resep]=await Promise.all([DataAPI.getBahan().catch(()=>[]),DataAPI.getPenjualan().catch(()=>[]),DataAPI.getResep().catch(()=>[])]);
  const today=new Date().toISOString().split('T')[0];
  const usage=DataAPI.computeUsage(penjualan,resep,today);

  el.innerHTML=`
  <div class="page-head"><div><h2>Stok Bahan</h2><p>Saldo stok sistem berdasarkan pembelian dikurangi penjualan</p></div></div>
  <div class="card">
    <div class="card-head"><span class="card-title">${IC.bahan()} Saldo Stok Saat Ini</span></div>
    <div class="card-body-p0">
      ${buildTable({cols:[
        {key:'kode',label:'Kode'},{key:'nama',label:'Bahan'},{key:'satuan',label:'Satuan'},
        {label:'Stok Sistem',render:r=>`<strong class="font-mono">${fmt.number(r.stock_current)}</strong>`},
        {label:'Min',render:r=>`<span class="font-mono">${fmt.number(r.min_stock)}</span>`},
        {label:'Terpakai Hari Ini',render:r=>{const u=usage.find(x=>x.bahan_id===r.id); return `<span class="font-mono" style="color:var(--orange-500)">${fmt.number(u?.total_used||0)} ${r.satuan}</span>`;}},
        {label:'Status',render:r=>r.stock_current<=r.min_stock?badge('critical'):r.stock_current<=r.min_stock*1.5?badge('warning'):badge('normal')},
        {label:'Level',render:r=>{
          const pct=Math.min(r.stock_current/Math.max(r.max_stock,1)*100,100);
          const c=r.stock_current<=r.min_stock?'var(--red-600)':r.stock_current<=r.min_stock*1.5?'var(--orange-500)':'var(--green-500)';
          return `<div class="stock-mini"><div class="stock-bar"><div class="stock-fill" style="width:${pct}%;background:${c}"></div></div><div style="font-size:10px;color:${c}">${pct.toFixed(0)}%</div></div>`;
        }},
      ],data:bahan.filter(b=>b.status==='approved'),empty:'Tidak ada bahan aktif'})}
    </div>
  </div>`;
}

// ─── PAGE: STOCK OPNAME (ADMIN ONLY) ────────────────────────
let _soData=[],_soBahan=[];
async function pageStockOpname(el) {
  el.innerHTML=`<div class="empty-state"><p>Memuat...</p></div>`;
  [_soData,_soBahan]=await Promise.all([DataAPI.getStockOpname().catch(()=>[]),DataAPI.getBahan().catch(()=>[])]);
  _renderOpname(el);
}
function _renderOpname(el) {
  el.innerHTML=`
  <div class="page-head">
    <div><h2>Stock Opname</h2><p>Pengecekan stok fisik vs sistem — stok sistem diupdate sesuai hasil fisik</p></div>
    <button class="btn btn-primary" onclick="_openOpname()">${IC.plus()} Input Opname</button>
  </div>
  <div class="kpi-grid" style="max-width:450px;margin-bottom:16px">
    <div class="kpi-card red"><div class="kpi-label">Critical</div><div class="kpi-val">${_soData.filter(d=>d.status==='critical').length}</div></div>
    <div class="kpi-card orange"><div class="kpi-label">Warning</div><div class="kpi-val">${_soData.filter(d=>d.status==='warning').length}</div></div>
    <div class="kpi-card green"><div class="kpi-label">Normal</div><div class="kpi-val">${_soData.filter(d=>d.status==='normal').length}</div></div>
  </div>
  <div class="card">
    <div class="card-body-p0">
      ${buildTable({cols:[
        {key:'tanggal',label:'Tanggal'},{key:'shift',label:'Shift'},{key:'bahan_nama',label:'Bahan'},
        {label:'Stok Sistem',render:r=>`<span class="font-mono">${fmt.number(r.system_stock)}</span>`},
        {label:'Stok Fisik',render:r=>`<span class="font-mono font-bold">${fmt.number(r.actual_stock)}</span>`},
        {label:'Variance',render:r=>`<span class="font-mono" style="color:${r.variance<0?'var(--red-600)':r.variance>0?'var(--orange-500)':'var(--green-600)'}">${r.variance>0?'+':''}${fmt.number(r.variance)}</span>`},
        {key:'reason',label:'Keterangan'},
        {label:'Status',render:r=>badge(r.status)},
        {key:'created_by',label:'Oleh'},
      ],data:_soData,empty:'Belum ada stock opname'})}
    </div>
  </div>`;
  el.id='so-page';
}

let _soFoto=null;
function _openOpname() {
  _soFoto=null;
  const approved=_soBahan.filter(b=>b.status==='approved');
  Modal.open({title:'Input Stock Opname',body:`
    <div class="form-row cols-2">
      <div class="form-group"><label>Tanggal<span class="req">*</span></label><input id="so-tgl" type="date" value="${new Date().toISOString().split('T')[0]}"/></div>
      <div class="form-group"><label>Shift<span class="req">*</span></label><select id="so-shift"><option>Pagi</option><option>Siang</option><option>Malam</option></select></div>
    </div>
    <div class="form-group"><label>Bahan<span class="req">*</span></label>
      <select id="so-bahan" onchange="_onSoBahan()"><option value="">— Pilih Bahan —</option>
        ${approved.map(b=>`<option value="${b.id}" data-stock="${b.stock_current}" data-sat="${b.satuan}">${b.nama} (sistem: ${fmt.number(b.stock_current)} ${b.satuan})</option>`).join('')}
      </select></div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Stok Sistem</label><input id="so-sys" readonly/></div>
      <div class="form-group"><label>Stok Fisik (Hitung Manual)<span class="req">*</span></label><input id="so-actual" type="number" placeholder="0" oninput="_onSoCalc()"/></div>
    </div>
    <div class="form-group"><label>Variance</label><input id="so-var" readonly/></div>
    <div id="so-status" style="margin:8px 0"></div>
    <div class="form-group"><label>Keterangan</label><textarea id="so-reason" rows="2" placeholder="Contoh: spillage, expired..."></textarea></div>
    <div class="form-group">
      <label>Foto Stok Fisik<span class="req">*</span></label>
      <div class="upload-zone" id="so-zone" onclick="document.getElementById('so-file').click()">
        <input type="file" id="so-file" accept="image/*" style="display:none" onchange="_onSoFoto(event)"/>
        ${IC.img()} <p>Klik untuk upload foto</p><small>JPG/PNG</small>
      </div>
    </div>`,
    footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
            <button class="btn btn-primary" onclick="_saveOpname()">Simpan & Update Stok</button>`,
  });
}
function _onSoBahan(){
  const s=document.getElementById('so-bahan'); const o=s.options[s.selectedIndex];
  const el=document.getElementById('so-sys'); if(el) el.value=`${fmt.number(o.dataset.stock||0)} ${o.dataset.sat||''}`;
  _onSoCalc();
}
function _onSoCalc(){
  const s=document.getElementById('so-bahan'); const o=s?.options[s?.selectedIndex];
  const sys=parseFloat(o?.dataset.stock)||0;
  const actual=parseFloat(document.getElementById('so-actual')?.value)||0;
  const variance=actual-sys;
  const pct=sys>0?Math.abs(variance/sys*100):0;
  const status=pct>=APP_CONFIG.variance_critical_pct?'critical':pct>=APP_CONFIG.variance_warning_pct?'warning':'normal';
  const el=document.getElementById('so-var'); if(el){el.value=`${variance>=0?'+':''}${fmt.number(variance)} ${o?.dataset.sat||''}`; el.style.color=variance<0?'var(--red-600)':variance>0?'var(--orange-500)':'var(--green-600)';}
  const sel=document.getElementById('so-status'); if(sel) sel.innerHTML=badge(status)+` <span class="text-sm text-gray" style="margin-left:6px">Variance ${pct.toFixed(1)}%</span>`;
}
function _onSoFoto(e){_soFoto=e.target.files[0]; if(!_soFoto)return; const z=document.getElementById('so-zone'); z.classList.add('done'); z.querySelector('p').textContent='✓ '+_soFoto.name;}
async function _saveOpname(){
  const s=document.getElementById('so-bahan'); const o=s.options[s.selectedIndex];
  const tgl=document.getElementById('so-tgl').value;
  const bahanId=+s.value; const bahanNama=o.text.split(' (')[0];
  const sys=parseFloat(o.dataset.stock)||0;
  const actual=parseFloat(document.getElementById('so-actual').value);
  if(!tgl||!bahanId||isNaN(actual)){Toast.error('Isi semua field');return;}
  if(!_soFoto){Toast.error('Foto stok fisik wajib diupload');return;}
  const variance=actual-sys;
  const pct=sys>0?Math.abs(variance/sys*100):0;
  const status=pct>=APP_CONFIG.variance_critical_pct?'critical':pct>=APP_CONFIG.variance_warning_pct?'warning':'normal';
  try{
    await DataAPI.saveStockOpname({tanggal:tgl,shift:document.getElementById('so-shift').value,bahan_id:bahanId,bahan_nama:bahanNama,system_stock:sys,actual_stock:actual,variance,reason:document.getElementById('so-reason').value,foto:true,status,created_by:Auth.user.username});
    Modal.close(); Toast.success('Opname disimpan — stok sistem diupdate ke '+fmt.number(actual));
    if(status==='critical') Toast.warning('⚠ CRITICAL: Selisih besar ditemukan! Perlu investigasi.');
    [_soData,_soBahan]=await Promise.all([DataAPI.getStockOpname().catch(()=>[]),DataAPI.getBahan().catch(()=>[])]);
    const el=document.getElementById('so-page'); if(el) _renderOpname(el);
  }catch(e){Toast.error(e.message);}
}

// ─── PAGE: DAILY REPORT ─────────────────────────────────────
let _drData=[], _drFoto=null;
async function pageDailyReport(el) {
  _drData=await DataAPI.getDailyReport().catch(()=>[]);
  _renderDR(el);
}
function _renderDR(el){
  el.innerHTML=`
  <div class="page-head">
    <div><h2>Daily Report</h2><p>Laporan kas harian — rekonsiliasi tunai vs non-tunai</p></div>
    <button class="btn btn-primary" onclick="_openDR()">${IC.plus()} Input Report</button>
  </div>
  <div class="card">
    <div class="card-body-p0">
      ${buildTable({cols:[
        {key:'tanggal',label:'Tanggal'},{key:'user',label:'User'},{key:'shift',label:'Shift'},
        {label:'Total Sales',render:r=>`<strong class="font-mono">${fmt.currency(r.total_sales)}</strong>`},
        {label:'Cash',render:r=>fmt.currency(r.cash)},
        {label:'Non-Cash',render:r=>fmt.currency((r.qris||0)+(r.debit||0)+(r.credit||0)+(r.ewallet||0))},
        {label:'Variance',render:r=>`<span class="font-mono" style="color:${r.variance!==0?'var(--red-600)':'var(--green-600)'}">${r.variance>=0?'+':''}${fmt.currency(r.variance)}</span>`},
        {label:'Status',render:r=>r.variance===0?badge('approved'):badge('warning')},
      ],data:_drData,empty:'Belum ada daily report'})}
    </div>
  </div>`;
  el.id='dr-page';
}
function _openDR(){
  _drFoto=null;
  Modal.open({title:'Input Daily Report',size:'lg',body:`
    <div class="form-row cols-2">
      <div class="form-group"><label>Tanggal<span class="req">*</span></label><input id="dr-tgl" type="date" value="${new Date().toISOString().split('T')[0]}"/></div>
      <div class="form-group"><label>Shift<span class="req">*</span></label><select id="dr-shift"><option>Pagi</option><option>Siang</option><option>Malam</option></select></div>
    </div>
    <div class="form-group"><label>Total Sales dari POS<span class="req">*</span></label><input id="dr-sales" type="number" placeholder="0" oninput="_drCalc()"/></div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Cash</label><input id="dr-cash" type="number" value="0" oninput="_drCalc()"/></div>
      <div class="form-group"><label>QRIS</label><input id="dr-qris" type="number" value="0" oninput="_drCalc()"/></div>
    </div>
    <div class="form-row cols-3">
      <div class="form-group"><label>Debit</label><input id="dr-dbt" type="number" value="0" oninput="_drCalc()"/></div>
      <div class="form-group"><label>Credit</label><input id="dr-crd" type="number" value="0" oninput="_drCalc()"/></div>
      <div class="form-group"><label>E-Wallet</label><input id="dr-ew" type="number" value="0" oninput="_drCalc()"/></div>
    </div>
    <div class="form-row cols-2">
      <div class="form-group"><label>Total Laporan</label><input id="dr-total" readonly/></div>
      <div class="form-group"><label>Variance</label><input id="dr-var" readonly/></div>
    </div>
    <div id="dr-rec" style="margin:8px 0"></div>
    <div class="form-group"><label>Catatan</label><textarea id="dr-cat" rows="2"></textarea></div>
    <div class="form-group"><label>Foto Bukti POS<span class="req">*</span></label>
      <div class="upload-zone" id="dr-zone" onclick="document.getElementById('dr-file').click()">
        <input type="file" id="dr-file" accept="image/*" style="display:none" onchange="_drFotoFn(event)"/>
        ${IC.img()} <p>Klik upload foto POS</p><small>JPG/PNG</small>
      </div>
    </div>`,
    footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button>
            <button class="btn btn-primary" onclick="_saveDR()">Submit Daily Report</button>`,
  });
}
function _drCalc(){
  const sales=+document.getElementById('dr-sales')?.value||0;
  const cash=+document.getElementById('dr-cash')?.value||0;
  const qris=+document.getElementById('dr-qris')?.value||0;
  const dbt=+document.getElementById('dr-dbt')?.value||0;
  const crd=+document.getElementById('dr-crd')?.value||0;
  const ew=+document.getElementById('dr-ew')?.value||0;
  const tot=cash+qris+dbt+crd+ew; const variance=tot-sales;
  const te=document.getElementById('dr-total'); if(te) te.value=fmt.currency(tot);
  const ve=document.getElementById('dr-var'); if(ve){ve.value=`${variance>=0?'+':''}${fmt.currency(variance)}`;ve.style.color=variance!==0?'var(--red-600)':'var(--green-600)';}
  const re=document.getElementById('dr-rec'); if(re&&sales>0) re.innerHTML=variance===0?`<span class="badge bg-green">BALANCED — Rekonsiliasi sesuai</span>`:`<span class="badge bg-red">INVESTIGATE — Selisih ${fmt.currency(Math.abs(variance))}</span>`;
}
function _drFotoFn(e){_drFoto=e.target.files[0]; if(!_drFoto)return; const z=document.getElementById('dr-zone'); z.classList.add('done'); z.querySelector('p').textContent='✓ '+_drFoto.name;}
async function _saveDR(){
  const tgl=document.getElementById('dr-tgl').value;
  const sales=+document.getElementById('dr-sales').value;
  if(!tgl||!sales){Toast.error('Tanggal dan Total Sales wajib');return;}
  if(!_drFoto){Toast.error('Foto bukti POS wajib');return;}
  const cash=+document.getElementById('dr-cash').value;
  const qris=+document.getElementById('dr-qris').value;
  const dbt=+document.getElementById('dr-dbt').value;
  const crd=+document.getElementById('dr-crd').value;
  const ew=+document.getElementById('dr-ew').value;
  const tot=cash+qris+dbt+crd+ew; const variance=tot-sales;
  try{
    await DataAPI.saveDailyReport({tanggal:tgl,user:Auth.user.username,shift:document.getElementById('dr-shift').value,total_sales:sales,cash,qris,debit:dbt,credit:crd,ewallet:ew,total_pos:tot,variance,catatan:document.getElementById('dr-cat').value,pos_foto:true,status:'submitted'});
    Modal.close(); Toast.success('Daily report disubmit');
    if(variance!==0) Toast.warning('Cash variance terdeteksi: '+fmt.currency(Math.abs(variance)));
    _drData=await DataAPI.getDailyReport().catch(()=>[]);
    const el=document.getElementById('dr-page'); if(el) _renderDR(el);
  }catch(e){Toast.error(e.message);}
}

// ─── PAGE: MASTER BAHAN ──────────────────────────────────────
let _mbData=[], _mbQ='';
async function pageMasterBahan(el){
  el.id='mb-page';
  _mbData=await DataAPI.getBahan().catch(()=>[]);
  _renderMB(el);
}
function _renderMB(el){
  const data=searchFilter(_mbData,_mbQ,['kode','nama','satuan','supplier']);
  el.innerHTML=`
  <div class="page-head">
    <div><h2>Master Bahan</h2><p>Data bahan baku — perlu approval admin sebelum aktif</p></div>
    ${!Auth.isAdmin()?`<button class="btn btn-primary" onclick="_openMB()">${IC.plus()} Tambah Bahan</button>`:''}
  </div>
  <div class="card">
    <div class="card-head">
      <div class="search-box">${IC.search()}<input type="text" placeholder="Cari..." value="${_mbQ}" oninput="_mbQ=this.value;_renderMB(document.getElementById('mb-page'))"/></div>
      <span class="text-sm text-gray">${data.length} bahan</span>
    </div>
    <div class="card-body-p0">
      ${buildTable({cols:[
        {key:'kode',label:'Kode'},{key:'nama',label:'Nama'},{key:'satuan',label:'Satuan'},
        {label:'Stok',render:r=>`<span class="font-mono">${fmt.number(r.stock_current||0)}</span>`},
        {label:'Min',render:r=>`<span class="font-mono">${fmt.number(r.min_stock)}</span>`},
        {label:'Harga/sat',render:r=>fmt.currency(r.harga_ref)},
        {key:'supplier',label:'Supplier'},
        {label:'Status',render:r=>badge(r.status)},
        {label:'',render:r=>Auth.isAdmin()&&r.status==='waiting'?`<div style="display:flex;gap:6px"><button class="btn btn-success btn-sm" onclick="_mbApprove(${r.id})">Approve</button><button class="btn btn-danger btn-sm" onclick="_mbReject(${r.id})">Reject</button></div>`:''},
      ],data,empty:'Belum ada bahan'})}
    </div>
  </div>`;
}
function _openMB(){Modal.open({title:'Tambah Bahan Baku',body:`
  <div class="form-row cols-2">
    <div class="form-group"><label>Kode<span class="req">*</span></label><input id="mb-kode" placeholder="BB001"/></div>
    <div class="form-group"><label>Nama<span class="req">*</span></label><input id="mb-nama" placeholder="Coffee Bean"/></div>
  </div>
  <div class="form-row cols-2">
    <div class="form-group"><label>Satuan<span class="req">*</span></label><select id="mb-sat"><option>gram</option><option>ml</option><option>pcs</option><option>kg</option><option>liter</option></select></div>
    <div class="form-group"><label>Harga/satuan (Rp)</label><input id="mb-hrg" type="number" value="0"/></div>
  </div>
  <div class="form-row cols-2">
    <div class="form-group"><label>Min Stock</label><input id="mb-min" type="number" value="500"/></div>
    <div class="form-group"><label>Max Stock</label><input id="mb-max" type="number" value="5000"/></div>
  </div>
  <div class="form-group"><label>Supplier</label><input id="mb-sup" placeholder="Nama supplier"/></div>`,
  footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" onclick="_saveMB()">Submit untuk Approval</button>`,
});}
async function _saveMB(){
  const kode=document.getElementById('mb-kode').value.trim();
  const nama=document.getElementById('mb-nama').value.trim();
  if(!kode||!nama){Toast.error('Kode dan nama wajib');return;}
  try{
    await DataAPI.saveBahan({kode,nama,satuan:document.getElementById('mb-sat').value,harga_ref:+document.getElementById('mb-hrg').value,min_stock:+document.getElementById('mb-min').value,max_stock:+document.getElementById('mb-max').value,supplier:document.getElementById('mb-sup').value,status:'waiting',stock_current:0,created_by:Auth.user.username});
    Modal.close(); Toast.success('Bahan disubmit untuk approval');
    _mbData=await DataAPI.getBahan().catch(()=>[]); _renderMB(document.getElementById('mb-page'));
  }catch(e){Toast.error(e.message);}
}
async function _mbApprove(id){await DataAPI.updateBahanStatus(id,'approved'); Toast.success('Bahan diapprove'); _mbData=await DataAPI.getBahan().catch(()=>[]); _renderMB(document.getElementById('mb-page'));}
async function _mbReject(id){await DataAPI.updateBahanStatus(id,'rejected'); Toast.warning('Bahan direject'); _mbData=await DataAPI.getBahan().catch(()=>[]); _renderMB(document.getElementById('mb-page'));}

// ─── PAGE: MASTER MENU ───────────────────────────────────────
let _mmData=[];
async function pageMasterMenu(el){
  el.id='mm-page'; _mmData=await DataAPI.getMenu().catch(()=>[]);
  el.innerHTML=`
  <div class="page-head">
    <div><h2>Master Menu</h2><p>Daftar produk yang dijual</p></div>
    ${!Auth.isAdmin()?`<button class="btn btn-primary" onclick="_openMM()">${IC.plus()} Tambah Menu</button>`:''}
  </div>
  <div class="card"><div class="card-body-p0">
    ${buildTable({cols:[
      {key:'kode',label:'Kode'},{key:'nama',label:'Menu'},{key:'kategori',label:'Kategori'},
      {label:'Harga',render:r=>fmt.currency(r.harga)},
      {label:'Status',render:r=>badge(r.status)},
      {label:'',render:r=>Auth.isAdmin()&&r.status==='waiting'?`<div style="display:flex;gap:6px"><button class="btn btn-success btn-sm" onclick="_mmApprove(${r.id})">Approve</button><button class="btn btn-danger btn-sm" onclick="_mmReject(${r.id})">Reject</button></div>`:''},
    ],data:_mmData,empty:'Belum ada menu'})}
  </div></div>`;
}
function _openMM(){Modal.open({title:'Tambah Menu',body:`
  <div class="form-row cols-2">
    <div class="form-group"><label>Kode<span class="req">*</span></label><input id="mm-kode" placeholder="MN001"/></div>
    <div class="form-group"><label>Nama Menu<span class="req">*</span></label><input id="mm-nama" placeholder="Latte"/></div>
  </div>
  <div class="form-row cols-2">
    <div class="form-group"><label>Kategori</label><select id="mm-kat"><option>Coffee</option><option>Non-Coffee</option><option>Specialty</option><option>Food</option></select></div>
    <div class="form-group"><label>Harga Jual<span class="req">*</span></label><input id="mm-hrg" type="number" placeholder="25000"/></div>
  </div>`,
  footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" onclick="_saveMM()">Submit Approval</button>`,
});}
async function _saveMM(){
  const kode=document.getElementById('mm-kode').value.trim(); const nama=document.getElementById('mm-nama').value.trim(); const harga=+document.getElementById('mm-hrg').value;
  if(!kode||!nama||!harga){Toast.error('Semua field wajib');return;}
  try{await DataAPI.saveMenu({kode,nama,kategori:document.getElementById('mm-kat').value,harga,status:'waiting',created_by:Auth.user.username}); Modal.close(); Toast.success('Menu disubmit'); _mmData=await DataAPI.getMenu().catch(()=>[]); pageMasterMenu(document.getElementById('mm-page'));}
  catch(e){Toast.error(e.message);}
}
async function _mmApprove(id){await DataAPI.updateMenuStatus(id,'approved'); Toast.success('Menu diapprove'); _mmData=await DataAPI.getMenu().catch(()=>[]); pageMasterMenu(document.getElementById('mm-page'));}
async function _mmReject(id){await DataAPI.updateMenuStatus(id,'rejected'); Toast.warning('Menu direject'); _mmData=await DataAPI.getMenu().catch(()=>[]); pageMasterMenu(document.getElementById('mm-page'));}

// ─── PAGE: RESEP ────────────────────────────────────────────
async function pageResep(el){
  const [resep,menu,bahan]=await Promise.all([DataAPI.getResep().catch(()=>[]),DataAPI.getMenu().catch(()=>[]),DataAPI.getBahan().catch(()=>[])]);
  const byMenu={};
  resep.forEach(r=>{if(!byMenu[r.menu_nama])byMenu[r.menu_nama]=[];byMenu[r.menu_nama].push(r);});
  const approvedMenu=menu.filter(m=>m.status==='approved');
  const approvedBahan=bahan.filter(b=>b.status==='approved');

  el.innerHTML=`
  <div class="page-head">
    <div><h2>Resep</h2><p>Komposisi bahan per menu — dasar kalkulasi pengurangan stok otomatis</p></div>
    ${!Auth.isAdmin()?`<button class="btn btn-primary" onclick="_openResep(${JSON.stringify(approvedMenu.map(m=>({id:m.id,nama:m.nama}))).replace(/"/g,'&quot;')},${JSON.stringify(approvedBahan.map(b=>({id:b.id,nama:b.nama,satuan:b.satuan}))).replace(/"/g,'&quot;')})">${IC.plus()} Buat Resep</button>`:''}
  </div>
  ${Object.keys(byMenu).length?Object.entries(byMenu).map(([nama,lines])=>`
    <div class="card mb-4">
      <div class="card-head"><span class="card-title">${IC.menu()} ${nama}</span></div>
      <div class="card-body-p0">
        ${buildTable({cols:[{key:'bahan_nama',label:'Bahan'},{label:'Qty',render:r=>`<span class="font-mono">${r.qty} ${r.satuan}</span>`}],data:lines})}
      </div>
    </div>`).join(''):`<div class="card"><div class="card-body"><div class="empty-state"><p>Belum ada resep</p></div></div></div>`}`;
}

function _openResep(menus,bahans){
  let lines=[{id:0}];
  Modal.open({title:'Buat Resep',size:'lg',body:`
    <div class="form-group"><label>Menu<span class="req">*</span></label>
      <select id="rp-menu"><option value="">— Pilih Menu —</option>${menus.map(m=>`<option value="${m.id}">${m.nama}</option>`).join('')}</select></div>
    <div class="divider"></div>
    <div id="rp-lines">
      <div class="form-row" style="grid-template-columns:1fr 100px 80px 36px;gap:8px;margin-bottom:8px" id="rp-line-0">
        <select class="rp-bahan" onchange="this.nextElementSibling.nextElementSibling.value=this.options[this.selectedIndex].dataset.sat||''">
          <option value="">— Pilih Bahan —</option>${bahans.map(b=>`<option value="${b.id}" data-sat="${b.satuan}">${b.nama}</option>`).join('')}
        </select>
        <input class="rp-qty" type="number" placeholder="Qty"/>
        <input class="rp-sat" readonly placeholder="sat"/>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="this.closest('[id^=rp-line]').remove()">${IC.trash()}</button>
      </div>
    </div>
    <button class="btn btn-ghost btn-sm" onclick="_addResepLine(${JSON.stringify(bahans).replace(/"/g,'&quot;')})">${IC.plus()} Tambah Bahan</button>`,
    footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" onclick="_saveResep()">Simpan Resep</button>`,
  });
}
let _resepLineCount=0;
function _addResepLine(bahans){
  _resepLineCount++;
  const div=document.createElement('div');
  div.className='form-row'; div.id=`rp-line-${_resepLineCount}`;
  div.style='grid-template-columns:1fr 100px 80px 36px;gap:8px;margin-bottom:8px';
  div.innerHTML=`<select class="rp-bahan" onchange="this.nextElementSibling.nextElementSibling.value=this.options[this.selectedIndex].dataset.sat||''"><option value="">— Pilih Bahan —</option>${bahans.map(b=>`<option value="${b.id}" data-sat="${b.satuan}">${b.nama}</option>`).join('')}</select><input class="rp-qty" type="number" placeholder="Qty"/><input class="rp-sat" readonly placeholder="sat"/><button class="btn btn-ghost btn-icon btn-sm" onclick="this.closest('[id^=rp-line]').remove()">${IC.trash()}</button>`;
  document.getElementById('rp-lines').appendChild(div);
}
async function _saveResep(){
  const menuSel=document.getElementById('rp-menu'); const menuId=+menuSel.value; const menuNama=menuSel.options[menuSel.selectedIndex]?.text;
  if(!menuId){Toast.error('Pilih menu');return;}
  const lines=[...document.querySelectorAll('[id^=rp-line]')].map(row=>{
    const b=row.querySelector('.rp-bahan'); const q=row.querySelector('.rp-qty'); const s=row.querySelector('.rp-sat');
    if(!b?.value||!q?.value)return null;
    return{menu_id:menuId,menu_nama:menuNama,bahan_id:+b.value,bahan_nama:b.options[b.selectedIndex]?.text,qty:+q.value,satuan:s?.value||'',created_by:Auth.user.username};
  }).filter(Boolean);
  if(!lines.length){Toast.error('Tambahkan minimal 1 bahan');return;}
  try{await DataAPI.saveResep(lines); Modal.close(); Toast.success('Resep disimpan'); App.go('resep');}
  catch(e){Toast.error(e.message);}
}

// ─── PAGE: AUDIT TRAIL ───────────────────────────────────────
async function pageAuditTrail(el){
  const data=await DataAPI.getAuditTrail().catch(()=>[]);
  el.innerHTML=`
  <div class="page-head"><div><h2>Audit Trail</h2><p>Log seluruh aktivitas sistem</p></div></div>
  <div class="card"><div class="card-body-p0">
    ${buildTable({cols:[
      {key:'tanggal',label:'Waktu'},{key:'user',label:'User'},{key:'activity',label:'Aktivitas'},
      {key:'module',label:'Modul'},{key:'record',label:'Record'},
    ],data,empty:'Belum ada aktivitas'})}
  </div></div>`;
}

// ─── PAGE: USER MANAGEMENT ───────────────────────────────────
let _usrData=[];
async function pageUsers(el){
  el.id='usr-page'; _usrData=await DataAPI.getUsers().catch(()=>[]);
  _renderUsers(el);
}
function _renderUsers(el){
  el.innerHTML=`
  <div class="page-head">
    <div><h2>User Management</h2><p>Kelola akun pengguna</p></div>
    <button class="btn btn-primary" onclick="_openUser()">${IC.plus()} Tambah User</button>
  </div>
  <div class="card"><div class="card-body-p0">
    ${buildTable({cols:[
      {key:'username',label:'Username'},{key:'nama',label:'Nama'},
      {label:'Role',render:r=>r.role==='admin'?`<span class="badge bg-blue">Admin</span>`:`<span class="badge bg-gray">Bartender</span>`},
      {key:'outlet',label:'Outlet'},{label:'Status',render:r=>badge(r.status)},
      {label:'',render:r=>`<button class="btn btn-sm ${r.status==='ACTIVE'?'btn-danger':'btn-success'}" onclick="_toggleUser(${r.id},'${r.status==='ACTIVE'?'INACTIVE':'ACTIVE'}')">${r.status==='ACTIVE'?'Nonaktifkan':'Aktifkan'}</button>`},
    ],data:_usrData,empty:'Tidak ada user'})}
  </div></div>`;
}
function _openUser(){Modal.open({title:'Tambah User',body:`
  <div class="form-row cols-2">
    <div class="form-group"><label>Nama<span class="req">*</span></label><input id="u-nama"/></div>
    <div class="form-group"><label>Username<span class="req">*</span></label><input id="u-uname"/></div>
  </div>
  <div class="form-row cols-2">
    <div class="form-group"><label>Password<span class="req">*</span></label><input id="u-pass" type="password"/></div>
    <div class="form-group"><label>Role</label><select id="u-role"><option value="user">Bartender</option><option value="admin">Admin/Owner</option></select></div>
  </div>
  <div class="form-group"><label>Outlet</label><input id="u-outlet" value="Main Store"/></div>`,
  footer:`<button class="btn btn-ghost" onclick="Modal.close()">Batal</button><button class="btn btn-primary" onclick="_saveUser()">Tambah</button>`,
});}
async function _saveUser(){
  const nama=document.getElementById('u-nama').value.trim(); const uname=document.getElementById('u-uname').value.trim(); const pass=document.getElementById('u-pass').value;
  if(!nama||!uname||!pass){Toast.error('Semua field wajib');return;}
  try{await DataAPI.saveUser({nama,username:uname,password:pass,role:document.getElementById('u-role').value,outlet:document.getElementById('u-outlet').value,status:'ACTIVE'}); Modal.close(); Toast.success('User ditambahkan'); _usrData=await DataAPI.getUsers().catch(()=>[]); _renderUsers(document.getElementById('usr-page'));}
  catch(e){Toast.error(e.message);}
}
async function _toggleUser(id,status){
  await DataAPI.updateUserStatus(id,status); Toast.success('Status user diubah');
  _usrData=await DataAPI.getUsers().catch(()=>[]); _renderUsers(document.getElementById('usr-page'));
}
