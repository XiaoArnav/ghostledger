document.addEventListener('DOMContentLoaded', () => {
  let receipts = [];
  let sampleData = {};
  let audioEnabled = true;
  let searchTerm = '';

  // Web Audio Context for zero-dependency cyber haptic design
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = AudioContext ? new AudioContext() : null;

  function playSciFiSound(type) {
    if (!audioEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;

      if (type === 'beep') {
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

  // Bind DOM Elements
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
  const consoleLogBody = document.getElementById('consoleLogBody');
  const tableSearch = document.getElementById('tableSearch');

  const metricTotalSpend = document.getElementById('metricTotalSpend');
  const metricTaxDeductible = document.getElementById('metricTaxDeductible');
  const metricTaxSavings = document.getElementById('metricTaxSavings');
  const metricShielded = document.getElementById('metricShielded');
  const metricCount = document.getElementById('metricCount');
  const metricEfficiency = document.getElementById('metricEfficiency');

  const btnExportCSV = document.getElementById('btnExportCSV');
  const btnExportStandardCSV = document.getElementById('btnExportStandardCSV');
  const btnExportMarkdown = document.getElementById('btnExportMarkdown');
  const btnExportJSON = document.getElementById('btnExportJSON');
  const btnCopyCPA = document.getElementById('btnCopyCPA');

  function logToConsole(cmd, text) {
    if (!consoleLogBody) return;
    const line = document.createElement('div');
    line.className = 'log-line';
    line.innerHTML = `<span class="log-prompt">$</span> <strong>${escapeHtml(cmd)}</strong> ${text ? escapeHtml(text) : ''}`;
    consoleLogBody.appendChild(line);
    consoleLogBody.scrollTop = consoleLogBody.scrollHeight;
  }

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
      logToConsole("ghostledger init", `Loaded ${Object.keys(sampleData).length} bundled sample receipts.`);
    })
    .catch(err => console.error("Could not load samples:", err));

  // Quick Preset Chips
  document.querySelectorAll('.sample-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const sampleKey = chip.getAttribute('data-sample');
      if (sampleKey && sampleData[sampleKey]) {
        receiptInput.value = sampleData[sampleKey];
        playSciFiSound('beep');
        logToConsole(`ghostledger load samples/${sampleKey}`, `[BUFFER POPULATED: ${chip.textContent}]`);
      }
    });
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
      logToConsole(`ghostledger ocr ${file.name}`, `[IN-BROWSER TESSERACT.JS ENGAGED]`);
      if (window.Tesseract) {
        Tesseract.recognize(file, 'eng')
          .then(({ data: { text } }) => {
            receiptInput.value = text.trim() || `[Image: ${file.name}]\nNo legible text detected. Please enter details manually.`;
            playSciFiSound('beep');
            logToConsole(`ghostledger ocr complete`, `Extracted ${text.length} chars.`);
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
      logToConsole(`ghostledger load ${file.name}`, `[READ ${e.target.result.length} BYTES]`);
    };
    reader.readAsText(file);
  }

  // 3. Analyze receipt with Local Gemma
  btnAnalyze.addEventListener('click', async () => {
    const text = receiptInput.value.trim();
    if (!text) {
      alert("Please paste receipt text or upload a file first!");
      return;
    }

    const startTime = performance.now();
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
        const latency = Math.round(performance.now() - startTime);
        receipts.push(data.receipt);
        renderTable();
        updateMetrics();
        playSciFiSound('beep');

        const valInferenceSpeed = document.getElementById('valInferenceSpeed');
        if (valInferenceSpeed) valInferenceSpeed.textContent = `${latency}ms`;
        if (hudStatus) hudStatus.textContent = `PARSED // ${latency}ms LATENCY`;

        logToConsole(
          `ghostledger parse ${data.receipt.id}`,
          `"${data.receipt.merchant}" | $${data.receipt.total_amount.toFixed(2)} -> ${data.receipt.category} (${Math.round(data.receipt.deductible_percentage * 100)}% ded.) [${latency}ms]`
        );
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
    }
  });

  // 4. Clear & Toggle & Search
  btnClear.addEventListener('click', () => {
    playSciFiSound('beep');
    receiptInput.value = '';
    receipts = [];
    searchTerm = '';
    if (tableSearch) tableSearch.value = '';
    renderTable();
    updateMetrics();
    if (hudStatus) hudStatus.textContent = "// STANDBY";
    logToConsole("ghostledger reset", "[WORKBENCH CLEARED]");
  });

  toggleRedact.addEventListener('change', () => {
    playSciFiSound('shield');
    renderTable();
    logToConsole("ghostledger redact toggle", `CPA Privacy Shield: ${toggleRedact.checked ? 'ENGAGED' : 'DISENGAGED'}`);
  });

  if (tableSearch) {
    tableSearch.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      renderTable();
    });
  }

  // 5. Render receipts table
  function renderTable() {
    if (receipts.length === 0) {
      tableBody.innerHTML = `
        <tr class="empty-row">
          <td colspan="9">No receipts processed yet. Click a PRESET above or drop a receipt to begin local analysis!</td>
        </tr>`;
      return;
    }

    const isRedacted = toggleRedact.checked;

    const filtered = receipts.filter(r => {
      if (!searchTerm) return true;
      const m = (r.merchant || '').toLowerCase();
      const c = (r.category || '').toLowerCase();
      const n = (r.audit_notes || '').toLowerCase();
      const id = (r.id || '').toLowerCase();
      return m.includes(searchTerm) || c.includes(searchTerm) || n.includes(searchTerm) || id.includes(searchTerm);
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr class="empty-row">
          <td colspan="9">No receipts match search term "${escapeHtml(searchTerm)}".</td>
        </tr>`;
      return;
    }

    tableBody.innerHTML = filtered.map((r) => {
      const origIdx = receipts.indexOf(r);
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
          <td><button class="btn-delete" data-index="${origIdx}" title="Remove Entry">✕</button></td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        playSciFiSound('beep');
        const idx = parseInt(e.target.dataset.index, 10);
        const removed = receipts.splice(idx, 1)[0];
        renderTable();
        updateMetrics();
        if (removed) {
          logToConsole(`ghostledger delete ${removed.id}`, `Removed ${removed.merchant}`);
        }
      });
    });
  }

  // 6. Update metrics, radar breakdown, and category pills
  function updateMetrics() {
    const totalSpend = receipts.reduce((acc, r) => acc + r.total_amount, 0);
    const totalDeductible = receipts.reduce((acc, r) => acc + r.deductible_amount, 0);
    const taxSavings = totalDeductible * 0.25;
    const shieldedCount = receipts.filter(r => r.client_confidential).length;

    metricTotalSpend.textContent = `$${totalSpend.toFixed(2)}`;
    metricTaxDeductible.textContent = `$${totalDeductible.toFixed(2)}`;
    metricTaxSavings.textContent = `$${taxSavings.toFixed(2)}`;
    metricShielded.textContent = shieldedCount;

    if (metricCount) {
      metricCount.textContent = `${receipts.length} ${receipts.length === 1 ? 'RECEIPT' : 'RECEIPTS'}`;
    }

    const efficiencyPct = totalSpend > 0 ? (totalDeductible / totalSpend) * 100 : 0;
    if (metricEfficiency) {
      metricEfficiency.textContent = `${efficiencyPct.toFixed(1)}% CAPTURED`;
    }
    const valOverallEfficiency = document.getElementById('valOverallEfficiency');
    if (valOverallEfficiency) {
      valOverallEfficiency.textContent = `${efficiencyPct.toFixed(1)}%`;
    }

    // Schedule C Category Radar Breakdown
    let mealsGross = 0, mealsDed = 0;
    let softwareGross = 0, softwareDed = 0;
    let travelGross = 0, travelDed = 0;
    let equipmentGross = 0, equipmentDed = 0;

    receipts.forEach(r => {
      const cat = r.category || '';
      if (cat.includes('Meals')) {
        mealsGross += r.total_amount;
        mealsDed += r.deductible_amount;
      } else if (cat.includes('Software') || cat.includes('Subscription')) {
        softwareGross += r.total_amount;
        softwareDed += r.deductible_amount;
      } else if (cat.includes('Travel') || cat.includes('Lodging')) {
        travelGross += r.total_amount;
        travelDed += r.deductible_amount;
      } else if (cat.includes('Office') || cat.includes('Equipment')) {
        equipmentGross += r.total_amount;
        equipmentDed += r.deductible_amount;
      }
    });

    const maxCat = Math.max(mealsGross, softwareGross, travelGross, equipmentGross, 50);

    const barMeals = document.getElementById('barMeals');
    const valMealsGross = document.getElementById('valMealsGross');
    const valMealsDed = document.getElementById('valMealsDed');
    if (barMeals) barMeals.style.width = `${Math.min(100, (mealsGross / maxCat) * 100)}%`;
    if (valMealsGross) valMealsGross.textContent = `$${mealsGross.toFixed(2)} Gross`;
    if (valMealsDed) valMealsDed.textContent = `→ $${mealsDed.toFixed(2)} Deductible (50%)`;

    const barSoftware = document.getElementById('barSoftware');
    const valSoftwareGross = document.getElementById('valSoftwareGross');
    const valSoftwareDed = document.getElementById('valSoftwareDed');
    if (barSoftware) barSoftware.style.width = `${Math.min(100, (softwareGross / maxCat) * 100)}%`;
    if (valSoftwareGross) valSoftwareGross.textContent = `$${softwareGross.toFixed(2)} Gross`;
    if (valSoftwareDed) valSoftwareDed.textContent = `→ $${softwareDed.toFixed(2)} Deductible`;

    const barTravel = document.getElementById('barTravel');
    const valTravelGross = document.getElementById('valTravelGross');
    const valTravelDed = document.getElementById('valTravelDed');
    if (barTravel) barTravel.style.width = `${Math.min(100, (travelGross / maxCat) * 100)}%`;
    if (valTravelGross) valTravelGross.textContent = `$${travelGross.toFixed(2)} Gross`;
    if (valTravelDed) valTravelDed.textContent = `→ $${travelDed.toFixed(2)} Deductible`;

    const barEquipment = document.getElementById('barEquipment');
    const valEquipmentGross = document.getElementById('valEquipmentGross');
    const valEquipmentDed = document.getElementById('valEquipmentDed');
    if (barEquipment) barEquipment.style.width = `${Math.min(100, (equipmentGross / maxCat) * 100)}%`;
    if (valEquipmentGross) valEquipmentGross.textContent = `$${equipmentGross.toFixed(2)} Gross`;
    if (valEquipmentDed) valEquipmentDed.textContent = `→ $${equipmentDed.toFixed(2)} Deductible`;

    // Category pills
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
    logToConsole(`ghostledger export -f ${format} > ${filename}`, `[STREAMING ${receipts.length} RECEIPTS]`);

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
    logToConsole("ghostledger export -q -r -f markdown | pbcopy", `[CPA AUDIT REPORT COPIED TO CLIPBOARD]`);
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

  // ==========================================
  // 3D INTERACTIVE VISUAL ENGINE (Vanilla Canvas)
  // ==========================================

  // 1. Interactive 3D Point-Cloud Mesh Background
  const bgCanvas = document.getElementById('bg3d');
  if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    let width = bgCanvas.width = window.innerWidth;
    let height = bgCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = bgCanvas.width = window.innerWidth;
      height = bgCanvas.height = window.innerHeight;
    });

    const numPoints = 55;
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 800,
        z: (Math.random() - 0.5) * 800,
      });
    }

    let mouseX = 0, mouseY = 0;
    let targetRotX = 0, targetRotY = 0;
    let rotX = 0, rotY = 0;
    let isSurging = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / width - 0.5) * 2;
      mouseY = (e.clientY / height - 0.5) * 2;
      targetRotY = mouseX * 0.45;
      targetRotX = -mouseY * 0.45;
    });

    function render3DBackground() {
      ctx.clearRect(0, 0, width, height);

      const speed = isSurging ? 0.015 : 0.0025;
      targetRotY += speed;
      rotX += (targetRotX - rotX) * 0.05;
      rotY += (targetRotY - rotY) * 0.05;

      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const fov = 600;
      const projected = [];

      for (let i = 0; i < numPoints; i++) {
        const p = points[i];
        let x1 = p.x * cosY + p.z * sinY;
        let z1 = -p.x * sinY + p.z * cosY;
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX + 800;

        const scale = fov / z2;
        projected.push({
          x: width / 2 + x1 * scale,
          y: height / 2 + y2 * scale,
          scale: scale,
          alpha: Math.min(1, Math.max(0.1, (1000 - z2) / 600))
        });
      }

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.07)';
      ctx.lineWidth = 1;
      for (let i = 0; i < numPoints; i++) {
        for (let j = i + 1; j < numPoints; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < numPoints; i++) {
        const p = projected[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.scale * 2.2), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha * 0.7})`;
        ctx.fill();
      }

      requestAnimationFrame(render3DBackground);
    }
    render3DBackground();

    btnAnalyze.addEventListener('click', () => {
      isSurging = true;
      setTimeout(() => { isSurging = false; }, 2500);
    });
  }

  // 2. Rotating 3D Hologram Cube in Header
  const holoCanvas = document.getElementById('hologram3d');
  if (holoCanvas) {
    const hctx = holoCanvas.getContext('2d');
    const hw = holoCanvas.width;
    const hh = holoCanvas.height;

    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1]
    ];
    const edges = [
      [0,1],[1,2],[2,3],[3,0],
      [4,5],[5,6],[6,7],[7,4],
      [0,4],[1,5],[2,6],[3,7]
    ];

    let hRotX = 0.5, hRotY = 0.5;
    function renderHologram() {
      hctx.clearRect(0, 0, hw, hh);
      hRotX += 0.018;
      hRotY += 0.025;

      const cosX = Math.cos(hRotX), sinX = Math.sin(hRotX);
      const cosY = Math.cos(hRotY), sinY = Math.sin(hRotY);

      const proj = vertices.map(v => {
        let x = v[0] * 12;
        let y = v[1] * 12;
        let z = v[2] * 12;

        let x1 = x * cosY + z * sinY;
        let z1 = -x * sinY + z * cosY;
        let y2 = y * cosX - z1 * sinX;
        let z2 = y * sinX + z1 * cosX + 50;

        const scale = 36 / z2;
        return [hw / 2 + x1 * scale, hh / 2 + y2 * scale];
      });

      const color = toggleRedact.checked ? '#00ff88' : '#00f0ff';
      hctx.strokeStyle = color;
      hctx.lineWidth = 1.4;
      hctx.shadowColor = color;
      hctx.shadowBlur = 6;

      for (const [i, j] of edges) {
        hctx.beginPath();
        hctx.moveTo(proj[i][0], proj[i][1]);
        hctx.lineTo(proj[j][0], proj[j][1]);
        hctx.stroke();
      }

      requestAnimationFrame(renderHologram);
    }
    renderHologram();
  }

  // 3. Interactive 3D Card Tilt (Top metric cards only; input & schedule panels remain completely stable)
  const tiltElements = document.querySelectorAll('.metric-card');
  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = (-y / (rect.height / 2)) * 6;
      const rotateY = (x / (rect.width / 2)) * 6;
      el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
});
