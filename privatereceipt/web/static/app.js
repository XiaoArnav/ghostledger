document.addEventListener('DOMContentLoaded', () => {
  let receipts = [];
  let sampleData = {};
  let audioEnabled = true;

  // Web Audio Context for zero-dependency sci-fi sound design
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = AudioContext ? new AudioContext() : null;

  function playSciFiSound(type) {
    if (!audioEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;

      if (type === 'beep') {
        // Subtle cybernetic haptic click (damped 35ms bandpass impulse)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2200, now);
        filter.Q.setValueAtTime(3.5, now);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.035);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'scan') {
        // Deep sub-bass pulse + low-pass resonant data sweep
        const osc = audioCtx.createOscillator();
        const sub = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, now);
        filter.frequency.exponentialRampToValueAtTime(900, now + 0.22);
        filter.frequency.exponentialRampToValueAtTime(80, now + 0.45);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(75, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.22);

        sub.type = 'sine';
        sub.frequency.setValueAtTime(48, now);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.09, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        osc.connect(filter);
        filter.connect(gain);
        sub.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        sub.start(now);
        osc.stop(now + 0.45);
        sub.stop(now + 0.45);
      } else if (type === 'shield') {
        // Cybernetic air-tight mechanical lock / shutter thump
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(500, now);
        filter.Q.setValueAtTime(2.5, now);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.16);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch (e) {
      console.warn("Audio effect error:", e);
    }
  }

  const sampleSelect = document.getElementById('sampleSelect');
  const receiptInput = document.getElementById('receiptInput');
  const textareaWrapper = document.getElementById('textareaWrapper');
  const btnAnalyze = document.getElementById('btnAnalyze');
  const btnUpload = document.getElementById('btnUpload');
  const fileInput = document.getElementById('fileInput');
  const btnClear = document.getElementById('btnClear');
  const toggleRedact = document.getElementById('toggleRedact');
  const tableBody = document.getElementById('receiptsTableBody');
  const categoryPills = document.getElementById('categoryPills');
  const btnAudioToggle = document.getElementById('btnAudioToggle');
  const hudStatus = document.getElementById('hudStatus');

  const metricTotalSpend = document.getElementById('metricTotalSpend');
  const metricTaxDeductible = document.getElementById('metricTaxDeductible');
  const metricTaxSavings = document.getElementById('metricTaxSavings');
  const metricShielded = document.getElementById('metricShielded');

  const btnExportCSV = document.getElementById('btnExportCSV');
  const btnExportStandardCSV = document.getElementById('btnExportStandardCSV');
  const btnExportMarkdown = document.getElementById('btnExportMarkdown');
  const btnExportJSON = document.getElementById('btnExportJSON');
  const btnCopyCPA = document.getElementById('btnCopyCPA');

  // Audio Toggle
  btnAudioToggle.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    btnAudioToggle.textContent = audioEnabled ? "🔊 SFX: ON" : "🔇 SFX: OFF";
    if (audioEnabled) playSciFiSound('beep');
  });

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
      playSciFiSound('beep');
    }
  });

  // 2. File Upload & Drag-and-Drop
  btnUpload.addEventListener('click', () => {
    playSciFiSound('beep');
    fileInput.click();
  });
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
    playSciFiSound('beep');
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|gif|tiff)$/i.test(file.name);
    if (isImage) {
      receiptInput.value = `⏳ Extracting text from ${file.name} using private client-side OCR...`;
      if (window.Tesseract) {
        Tesseract.recognize(file, 'eng')
          .then(({ data: { text } }) => {
            receiptInput.value = text.trim() || `[Image: ${file.name}]\nNo legible text detected. Please enter details manually.`;
            playSciFiSound('beep');
          })
          .catch(err => {
            console.error("OCR error:", err);
            receiptInput.value = `[Image: ${file.name}]\nOCR error. Please paste text directly.`;
          });
      } else {
        receiptInput.value = `[Image: ${file.name}]\nImage uploaded. OCR loading...`;
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      receiptInput.value = e.target.result;
      playSciFiSound('beep');
    };
    reader.readAsText(file);
  }

  // 3. Analyze receipt with Cyber Scanning effect
  btnAnalyze.addEventListener('click', async () => {
    const text = receiptInput.value.trim();
    if (!text) {
      alert("Please paste receipt text or upload a file first!");
      return;
    }

    btnAnalyze.disabled = true;
    btnAnalyze.innerHTML = '<span class="btn-icon">⚡</span> Analyzing with Gemma...';
    if (textareaWrapper) textareaWrapper.classList.add('scanning');
    if (hudStatus) hudStatus.textContent = "// RUNNING LOCAL GEMMA INFERENCE";
    playSciFiSound('scan');

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
        playSciFiSound('beep');
      } else {
        alert(data.error || "Parsing failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting local Gemma inference engine.");
    } finally {
      btnAnalyze.disabled = false;
      btnAnalyze.innerHTML = '<span class="btn-icon">⚡</span> Analyze with Local Gemma';
      if (textareaWrapper) textareaWrapper.classList.remove('scanning');
      if (hudStatus) hudStatus.textContent = "// ANALYSIS COMPLETE";
    }
  });

  // 4. Clear & Toggle
  btnClear.addEventListener('click', () => {
    playSciFiSound('beep');
    receiptInput.value = '';
    receipts = [];
    sampleSelect.value = '';
    renderTable();
    updateMetrics();
    if (hudStatus) hudStatus.textContent = "// CLEARED";
  });

  toggleRedact.addEventListener('change', () => {
    playSciFiSound('shield');
    renderTable();
  });

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
        ? `<span class="badge badge-shielded">🔒 SHIELDED</span>` 
        : `<span class="badge badge-public">PUBLIC</span>`;

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
          <td><button class="btn-delete" data-index="${idx}" title="Remove Entry">✕</button></td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        playSciFiSound('beep');
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
    playSciFiSound('beep');

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

  btnCopyCPA.addEventListener('click', () => {
    if (receipts.length === 0) {
      alert("No receipts to copy! Analyze at least one receipt first.");
      return;
    }
    playSciFiSound('shield');
    fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receipts, format: 'markdown', redact: toggleRedact.checked })
    })
    .then(r => r.text())
    .then(text => {
      navigator.clipboard.writeText(text).then(() => {
        const orig = btnCopyCPA.textContent;
        btnCopyCPA.textContent = "✓ COPIED FOR CPA";
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
