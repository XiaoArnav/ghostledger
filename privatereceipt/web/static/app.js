document.addEventListener('DOMContentLoaded', () => {
  let receipts = [];
  let sampleData = {};

  const sampleSelect = document.getElementById('sampleSelect');
  const receiptInput = document.getElementById('receiptInput');
  const btnAnalyze = document.getElementById('btnAnalyze');
  const btnUpload = document.getElementById('btnUpload');
  const fileInput = document.getElementById('fileInput');
  const btnClear = document.getElementById('btnClear');
  const toggleRedact = document.getElementById('toggleRedact');
  const tableBody = document.getElementById('receiptsTableBody');
  const categoryPills = document.getElementById('categoryPills');

  const metricTotalSpend = document.getElementById('metricTotalSpend');
  const metricTaxDeductible = document.getElementById('metricTaxDeductible');
  const metricTaxSavings = document.getElementById('metricTaxSavings');
  const metricShielded = document.getElementById('metricShielded');

  const btnExportCSV = document.getElementById('btnExportCSV');
  const btnExportStandardCSV = document.getElementById('btnExportStandardCSV');
  const btnExportMarkdown = document.getElementById('btnExportMarkdown');
  const btnExportJSON = document.getElementById('btnExportJSON');
  const btnCopyCPA = document.getElementById('btnCopyCPA');

  // 1. Fetch bundled samples
  fetch('/api/samples')
    .then(r => r.json())
    .then(data => {
      sampleData = data.samples || {};
      for (const [filename, content] of Object.entries(sampleData)) {
        const opt = document.createElement('option');
        opt.value = filename;
        opt.textContent = filename.replace('.txt', '').replace(/_/g, ' ');
        sampleSelect.appendChild(opt);
      }
    })
    .catch(err => console.error("Could not load samples:", err));

  sampleSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val && sampleData[val]) {
      receiptInput.value = sampleData[val];
    }
  });

  // 2. File Upload & Drag-and-Drop
  btnUpload.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) readFile(file);
  });

  receiptInput.addEventListener('dragover', (e) => {
    e.preventDefault();
    receiptInput.classList.add('drag-over');
  });
  receiptInput.addEventListener('dragleave', () => receiptInput.classList.remove('drag-over'));
  receiptInput.addEventListener('drop', (e) => {
    e.preventDefault();
    receiptInput.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
      readFile(e.dataTransfer.files[0]);
    }
  });

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => { receiptInput.value = e.target.result; };
    reader.readAsText(file);
  }

  // 3. Analyze receipt
  btnAnalyze.addEventListener('click', async () => {
    const text = receiptInput.value.trim();
    if (!text) {
      alert("Please paste receipt text or upload a file first!");
      return;
    }

    btnAnalyze.disabled = true;
    btnAnalyze.innerHTML = '<span class="btn-icon">⏳</span> Processing...';

    try {
      const nextId = `REC-${String(receipts.length + 1).padStart(3, '0')}`;
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, id: nextId })
      });
      const data = await res.json();
      if (data.receipt) {
        receipts.push(data.receipt);
        renderTable();
        updateMetrics();
      } else {
        alert(data.error || "Failed to parse receipt");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting local Gemma inference engine.");
    } finally {
      btnAnalyze.disabled = false;
      btnAnalyze.innerHTML = '<span class="btn-icon">⚡</span> Analyze with Local Gemma';
    }
  });

  // 4. Clear & Toggle
  btnClear.addEventListener('click', () => {
    receiptInput.value = '';
    receipts = [];
    sampleSelect.value = '';
    renderTable();
    updateMetrics();
  });

  toggleRedact.addEventListener('change', () => renderTable());

  // 5. Render receipts table
  function renderTable() {
    if (receipts.length === 0) {
      tableBody.innerHTML = `
        <tr class="empty-row">
          <td colspan="9">No receipts processed yet. Select a sample above or paste receipt text to get started!</td>
        </tr>`;
      return;
    }

    const isRedacted = toggleRedact.checked;

    tableBody.innerHTML = receipts.map((r, idx) => {
      const merchant = isRedacted ? (r.redacted_merchant || r.merchant) : r.merchant;
      const notes = isRedacted ? (r.redacted_notes || r.audit_notes) : r.audit_notes;
      const privacyBadge = r.client_confidential 
        ? `<span class="badge badge-shielded">🔒 Shielded</span>` 
        : `<span class="badge badge-public">Public</span>`;

      return `
        <tr>
          <td><strong>${escapeHtml(r.id)}</strong></td>
          <td>${escapeHtml(r.date)}</td>
          <td><strong>${escapeHtml(merchant)}</strong></td>
          <td><span class="badge badge-category">${escapeHtml(r.category)}</span></td>
          <td class="cell-amount">$${r.total_amount.toFixed(2)}</td>
          <td class="cell-deductible">$${r.deductible_amount.toFixed(2)} (${Math.round(r.deductible_percentage * 100)}%)</td>
          <td>${privacyBadge}</td>
          <td class="cell-notes">${escapeHtml(notes)}</td>
          <td><button class="btn-delete" data-index="${idx}" title="Remove entry">✕</button></td>
        </tr>
      `;
    }).join('');

    // Attach row delete handlers
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        receipts.splice(idx, 1);
        renderTable();
        updateMetrics();
      });
    });
  }

  // 6. Update metrics & category pills
  function updateMetrics() {
    const totalSpend = receipts.reduce((acc, r) => acc + r.total_amount, 0);
    const totalDeductible = receipts.reduce((acc, r) => acc + r.deductible_amount, 0);
    const taxSavings = totalDeductible * 0.25;
    const shieldedCount = receipts.filter(r => r.client_confidential).length;

    metricTotalSpend.textContent = `$${totalSpend.toFixed(2)}`;
    metricTaxDeductible.textContent = `$${totalDeductible.toFixed(2)}`;
    metricTaxSavings.textContent = `$${taxSavings.toFixed(2)}`;
    metricShielded.textContent = shieldedCount;

    // Render category pills
    if (receipts.length > 0) {
      const breakdown = {};
      receipts.forEach(r => {
        breakdown[r.category] = (breakdown[r.category] || 0) + r.total_amount;
      });
      categoryPills.style.display = 'flex';
      categoryPills.innerHTML = Object.entries(breakdown).map(([cat, amt]) => `
        <span class="category-pill">${escapeHtml(cat)}: <strong>$${amt.toFixed(2)}</strong></span>
      `).join('');
    } else {
      categoryPills.style.display = 'none';
      categoryPills.innerHTML = '';
    }
  }

  // 7. Export handlers
  function triggerExport(format, filename) {
    if (receipts.length === 0) {
      alert("No receipts to export! Analyze at least one receipt first.");
      return;
    }

    fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receipts,
        format,
        redact: toggleRedact.checked
      })
    })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch(err => console.error("Export error:", err));
  }

  btnExportCSV.addEventListener('click', () => triggerExport('quickbooks', 'quickbooks_expenses.csv'));
  btnExportStandardCSV.addEventListener('click', () => triggerExport('csv', 'itemized_tax_expenses.csv'));
  btnExportMarkdown.addEventListener('click', () => triggerExport('markdown', 'irs_audit_expense_report.md'));
  btnExportJSON.addEventListener('click', () => triggerExport('json', 'expenses_export.json'));

  // 8. 1-Click Copy for CPA
  btnCopyCPA.addEventListener('click', () => {
    if (receipts.length === 0) {
      alert("No receipts to copy! Analyze at least one receipt first.");
      return;
    }
    fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receipts, format: 'markdown', redact: toggleRedact.checked })
    })
    .then(r => r.text())
    .then(text => {
      navigator.clipboard.writeText(text).then(() => {
        const orig = btnCopyCPA.textContent;
        btnCopyCPA.textContent = "✓ Copied!";
        setTimeout(() => { btnCopyCPA.textContent = orig; }, 2000);
      });
    });
  });

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
