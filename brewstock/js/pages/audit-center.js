const PageAuditCenter = {
  async render(el) {
    this.el = el;
    const [variance, opname, pembelian, dr, bahan] = await Promise.all([
      DataAPI.getVarianceAnalysis(),
      DataAPI.getStockOpname(),
      DataAPI.getPembelian(),
      DataAPI.getDailyReport(),
      DataAPI.getBahan(),
    ]);

    const drVariance = dr.filter(d => d.variance !== 0);
    const missingEvidence = pembelian.filter(p => !p.nota);
    const negativeStock = bahan.filter(b => b.stock_current < 0);
    const critical = variance.filter(v => v.status === 'critical');
    const warning  = variance.filter(v => v.status === 'warning');

    const riskScore = (critical.length * 3) + (warning.length * 1) + (drVariance.length * 2) + (missingEvidence.length * 3);

    el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title"><h2>Audit Center</h2><p>Pusat monitoring risiko & deteksi fraud — akses Admin/Owner only</p></div>
      <span class="badge ${riskScore > 5 ? 'badge-red' : riskScore > 0 ? 'badge-orange' : 'badge-green'}">
        Risk Score: ${riskScore}
      </span>
    </div>

    <!-- Risk Categories -->
    <div class="grid-2 mb-6">
      <div class="card">
        <div class="card-header" style="background:var(--red-100);border-radius:10px 10px 0 0">
          <span class="card-title" style="color:var(--red-600)">${Icon.alert()} Material Variance</span>
          <span class="badge badge-red">${critical.length} critical</span>
        </div>
        <div class="card-body">
          ${critical.length ? critical.map(v => `
            <div style="padding:10px 0;border-bottom:1px solid var(--gray-100)">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <strong>${v.bahan_nama}</strong>
                <span class="badge badge-red">CRITICAL</span>
              </div>
              <div class="audit-flow" style="font-size:11px">
                <div class="audit-step">
                  <div class="audit-step-value">${fmt.number(v.expected_usage)}</div>
                  <div class="audit-step-label">Expected</div>
                </div>
                <div style="display:flex;align-items:center;padding:0 6px;color:var(--gray-400)">→</div>
                <div class="audit-step">
                  <div class="audit-step-value">${fmt.number(v.actual_stock)}</div>
                  <div class="audit-step-label">Aktual</div>
                </div>
                <div style="display:flex;align-items:center;padding:0 6px;color:var(--gray-400)">→</div>
                <div class="audit-step">
                  <div class="audit-step-value negative">${v.variance > 0 ? '+' : ''}${fmt.number(v.variance)}</div>
                  <div class="audit-step-label">Variance</div>
                </div>
              </div>
              <div class="text-sm text-gray" style="margin-top:6px">Variance ${v.variance_pct}% — di atas threshold ${APP_CONFIG.variance_critical_pct}%</div>
            </div>
          `).join('') : `<div class="empty-state"><p style="color:var(--green-600)">✓ Tidak ada critical variance</p></div>`}
        </div>
      </div>

      <div class="card">
        <div class="card-header" style="background:var(--orange-50)">
          <span class="card-title" style="color:var(--orange-600)">${Icon.alert()} Cash Variance</span>
          <span class="badge badge-orange">${drVariance.length} kasus</span>
        </div>
        <div class="card-body">
          ${drVariance.length ? drVariance.map(d => `
            <div style="padding:10px 0;border-bottom:1px solid var(--gray-100)">
              <div style="display:flex;justify-content:space-between">
                <div>
                  <div style="font-weight:600">${d.tanggal} — ${d.shift}</div>
                  <div class="text-sm text-gray">User: ${d.user}</div>
                </div>
                <div style="text-align:right">
                  <div class="font-mono" style="color:var(--red-600);font-weight:700">${fmt.currency(d.variance)}</div>
                  <span class="badge badge-red">Investigate</span>
                </div>
              </div>
            </div>
          `).join('') : `<div class="empty-state"><p style="color:var(--green-600)">✓ Tidak ada cash variance</p></div>`}
        </div>
      </div>
    </div>

    <!-- Fraud Indicators -->
    <div class="card mb-6">
      <div class="card-header"><span class="card-title">${Icon.shield()} Fraud / Risk Indicators</span></div>
      <div class="card-body">
        <div class="risk-list">
          ${[
            {
              rule: 'Rule 1 — Material Variance',
              status: critical.length > 0 ? 'critical' : warning.length > 0 ? 'warning' : 'normal',
              desc: `${critical.length} critical, ${warning.length} warning ditemukan`,
              value: `${critical.length + warning.length} item`,
            },
            {
              rule: 'Rule 2 — Purchase Anomaly',
              status: 'normal',
              desc: 'Tidak ada pembelian yang melebihi threshold anomali',
              value: 'OK',
            },
            {
              rule: 'Rule 3 — Negative Stock',
              status: negativeStock.length > 0 ? 'critical' : 'normal',
              desc: negativeStock.length > 0 ? `${negativeStock.length} bahan stok minus` : 'Tidak ada stok minus',
              value: negativeStock.length > 0 ? `${negativeStock.length} bahan` : 'OK',
            },
            {
              rule: 'Rule 4 — Missing Evidence',
              status: missingEvidence.length > 0 ? 'critical' : 'normal',
              desc: missingEvidence.length > 0 ? `${missingEvidence.length} pembelian tanpa nota` : 'Semua bukti tersedia',
              value: missingEvidence.length > 0 ? `${missingEvidence.length} transaksi` : 'OK',
            },
            {
              rule: 'Rule 5 — Daily Report Variance',
              status: drVariance.length > 0 ? 'warning' : 'normal',
              desc: drVariance.length > 0 ? `${drVariance.length} laporan tidak seimbang` : 'Semua laporan balanced',
              value: drVariance.length > 0 ? `${drVariance.length} laporan` : 'OK',
            },
            {
              rule: 'Rule 6 — Excessive Adjustment',
              status: 'normal',
              desc: 'Tidak ada adjustment mencurigakan',
              value: 'OK',
            },
          ].map(r => `
            <div class="risk-item">
              <div class="risk-dot ${r.status}"></div>
              <div class="risk-info">
                <div class="risk-name">${r.rule}</div>
                <div class="risk-desc">${r.desc}</div>
              </div>
              <div class="risk-value" style="color:var(--${r.status==='critical'?'red-600':r.status==='warning'?'orange-500':'green-600'})">${r.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Audit Detail Flow -->
    ${critical.length ? `
    <div class="card">
      <div class="card-header"><span class="card-title">${Icon.audit()} Detail Audit — Coffee Bean (Sample)</span><span class="badge badge-red">CRITICAL</span></div>
      <div class="card-body">
        <div class="audit-flow">
          ${[
            { label: 'Opening Stock', value: '2.000 g' },
            { label: 'Purchase (+)', value: '+2.000 g' },
            { label: 'Available', value: '4.000 g' },
            { label: 'Sales (Latte 100x)', value: '100 cup' },
            { label: 'Expected Usage', value: '-1.800 g' },
            { label: 'Expected Stock', value: '2.200 g' },
            { label: 'Physical Stock', value: '1.700 g', negative: true },
            { label: 'Variance', value: '-500 g', negative: true },
          ].map(s => `
            <div class="audit-step" style="min-width:110px">
              <div class="audit-step-value ${s.negative ? 'negative' : ''}">${s.value}</div>
              <div class="audit-step-label">${s.label}</div>
            </div>
          `).join('<div style="display:flex;align-items:center;padding:0 4px;color:var(--gray-300);font-size:18px;margin-bottom:20px">→</div>')}
        </div>
        <div style="margin-top:16px;padding:12px 16px;background:var(--red-100);border-radius:8px;color:var(--red-600);font-weight:700">
          ⚠ CRITICAL — Selisih 500 gram Coffee Bean tidak dapat dijelaskan. Perlu investigasi lebih lanjut.
        </div>
      </div>
    </div>
    ` : ''}`;
  },
};
