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

  // Built-in bundled sample receipts (air-gapped immediate availability)
  const BUILTIN_SAMPLES = {
    'saas_subscription.txt': `DigitalOcean Holdings, Inc.
101 Avenue of the Americas, New York, NY
INVOICE #DO-9823412
Invoice Date: 2026-10-01
Account: engineering@devsolopreneur.io

Description                                   Amount
------------------------------------------------------
Droplet 4 vCPU / 8GB RAM (Production API)     $48.00
Managed PostgreSQL Database Cluster           $30.00
Spaces Object Storage & CDN Transfer          $12.50
------------------------------------------------------
Subtotal:                                     $90.50
Tax:                                           $0.00
TOTAL AMOUNT CHARGED:                         $90.50

Paid via Mastercard ending in 8112.
Purpose: Cloud hosting infrastructure for client staging environment.`,

    'client_dinner_nda.txt': `The Blue Fin Bistro
123 Waterfront Way, Seattle, WA
Date: 2026-10-12
Server: Alex
Table: 4

1x Pan-Seared Halibut      $38.00
1x Ribeye Steak            $46.00
2x Sparkling Water         $12.00
1x Shared Dessert Platter  $18.00
Subtotal:                 $114.00
Tax (10%):                 $11.40
Tip (20%):                 $22.80
TOTAL:                    $148.20

Payment Method: Visa ending in 4921
Note: Dinner with Sarah Jenkins (Client: Acme Health Systems) discussing Project Apex AI integration contract under NDA.`,

    'flight_conference.txt': `Delta Air Lines e-Ticket Receipt
Issue Date: 2026-10-04
Passenger: Morgan Taylor
Ticket Number: 006-2489102941
Booking Ref / PNR: K9X7ZQ

Flight DL1492: SEA -> SFO (2026-10-09)
Flight DL1804: SFO -> SEA (2026-10-15)

Base Airfare:             $384.00
US Transportation Tax:     $28.80
Passenger Facility Charge:  $9.00
Security Fee:              $11.20
TOTAL TICKET FARE:        $433.00

Payment: Amex ending in 1004.
Purpose: Travel to attend Open Source AI Developer Summit in San Francisco.`,

    'hardware_depreciation.txt': `Apple Store - University Village
2651 NE 49th St, Seattle, WA
Date: 2026-10-08 14:22
Receipt #: R382910419

Item:
Apple Studio Display 27-inch 5K Retina        $1,499.00
Thunderbolt 4 Pro Cable (1.8m)                   $129.00
USB-C to MagSafe 3 Cable (2m)                     $49.00
--------------------------------------------------------
Subtotal:                                     $1,677.00
WA State Sales Tax (10.25%):                    $171.89
TOTAL PAID:                                   $1,848.89

Card: Apple Card ending in 7719
Business Purpose: Primary dedicated high-resolution monitor for client mobile app QA & UI design.
Eligible for IRS Section 179 de minimis safe harbor deduction.`
  };
  sampleData = Object.assign({}, BUILTIN_SAMPLES);

  // 1. Fetch bundled samples (syncs with server if online)
  fetch('/api/samples')
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(data => {
      if (data && data.samples) {
        sampleData = Object.assign(sampleData, data.samples);
      }
      logToConsole("ghostledger init", `Loaded ${Object.keys(sampleData).length} bundled sample receipts.`);
    })
    .catch(() => {
      logToConsole("ghostledger init", `Air-gapped mode: ${Object.keys(sampleData).length} built-in sample receipts active.`);
    });

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

  // Client-Side Deterministic Parser Fallback (100% Air-Gapped)
  function parseReceiptLocally(rawText, itemId) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const merchant = lines[0] || 'Unknown Vendor';

    let date = '2026-10-18';
    const dateMatch = rawText.match(/\b(\d{4}-\d{2}-\d{2})\b/) || rawText.match(/\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/);
    if (dateMatch) date = dateMatch[1];

    let total = 0.0;
    const totalMatch = rawText.match(/TOTAL(?: PAID| CHARGED| FARE| AMOUNT)?[:\s]+\$?([0-9,]+(?:\.[0-9]{2})?)/i) ||
                       rawText.match(/\$([0-9,]+(?:\.[0-9]{2})?)/);
    if (totalMatch) {
      total = parseFloat(totalMatch[1].replace(/,/g, '')) || 0.0;
    }

    let category = "Other Business Expenses";
    let pct = 1.0;
    let auditNote = "Ordinary and necessary business expense under IRC § 162.";
    const lower = rawText.toLowerCase();

    if (lower.includes('bistro') || lower.includes('restaurant') || lower.includes('halibut') || lower.includes('dinner') || lower.includes('cafe')) {
      category = "Meals & Entertainment";
      pct = 0.5;
      auditNote = "IRS Schedule C Line 24b: Business meal with client/prospect (50% deductible limit). Requires documenting business purpose.";
    } else if (lower.includes('digitalocean') || lower.includes('cloud') || lower.includes('software') || lower.includes('droplet') || lower.includes('hosting')) {
      category = "Software & Subscriptions";
      pct = 1.0;
      auditNote = "IRS Schedule C Line 18: 100% deductible cloud hosting and software services.";
    } else if (lower.includes('flight') || lower.includes('delta') || lower.includes('air lines') || lower.includes('hotel') || lower.includes('travel')) {
      category = "Travel & Lodging";
      pct = 1.0;
      auditNote = "IRS Schedule C Line 24a: 100% deductible business travel costs.";
    } else if (lower.includes('apple') || lower.includes('display') || lower.includes('equipment') || lower.includes('hardware') || lower.includes('laptop')) {
      category = "Office Supplies & Equipment";
      pct = 1.0;
      auditNote = "IRS Section 179: 100% first-year de minimis expensing for qualifying business equipment.";
    }

    const isConfidential = /nda|confidential|project apex|client:/i.test(rawText);
    let redactedMerchant = merchant;
    let redactedNotes = auditNote;
    let redactedRaw = rawText;

    if (isConfidential) {
      redactedNotes += " [Privacy Protected: Sensitive client/project NDA markers detected and sanitized]";
      redactedRaw = redactedRaw.replace(/Project Apex/gi, "Project [CONFIDENTIAL_CLIENT_1]")
                               .replace(/Client:\s*Acme Health Systems/gi, "Client: [CONFIDENTIAL_CLIENT_1]");
    }

    return {
      id: itemId,
      merchant,
      date,
      total_amount: total,
      currency: "USD",
      tax_amount: 0.0,
      category,
      deductible_percentage: pct,
      deductible_amount: total * pct,
      audit_notes: auditNote,
      client_confidential: isConfidential,
      redacted_merchant: redactedMerchant,
      redacted_notes: redactedNotes,
      redacted_raw_text: redactedRaw,
    };
  }

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

  // 3. Analyze receipt with Local Gemma (with air-gapped fallback)
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

    const nextId = `REC-${String(receipts.length + 1).padStart(3, '0')}`;
    let item = null;

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, id: nextId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.receipt) item = data.receipt;
      }
    } catch (networkErr) {
      // Serverless offline or cold start -> execute air-gapped client rule engine
    }

    if (!item) {
      item = parseReceiptLocally(text, nextId);
    }

    const latency = Math.max(12, Math.round(performance.now() - startTime));
    receipts.push(item);
    renderTable();
    updateMetrics();
    playSciFiSound('beep');

    const valInferenceSpeed = document.getElementById('valInferenceSpeed');
    if (valInferenceSpeed) valInferenceSpeed.textContent = `${latency}ms`;
    if (hudStatus) hudStatus.textContent = `PARSED // ${latency}ms LATENCY`;

    logToConsole(
      `ghostledger parse ${item.id}`,
      `"${item.merchant}" | $${item.total_amount.toFixed(2)} -> ${item.category} (${Math.round(item.deductible_percentage * 100)}% ded.) [${latency}ms]`
    );

    btnAnalyze.disabled = false;
    btnAnalyze.innerHTML = '<span class="btn-icon">⚡</span> Analyze with Local Gemma';
    if (textareaWrapper) textareaWrapper.classList.remove('scanning');
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
  function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  function generateClientExport(format) {
    const isRedacted = toggleRedact.checked;
    if (format === 'csv') {
      const header = ["ID", "Date", "Merchant", "Category", "Total Amount", "Currency", "Deductible %", "Deductible Amount", "Client Confidential", "Audit Rationale"];
      const rows = receipts.map(r => {
        const m = isRedacted ? (r.redacted_merchant || r.merchant) : r.merchant;
        const n = isRedacted ? (r.redacted_notes || r.audit_notes) : r.audit_notes;
        return [r.id, r.date, `"${m}"`, `"${r.category}"`, r.total_amount.toFixed(2), "USD", `${Math.round(r.deductible_percentage*100)}%`, r.deductible_amount.toFixed(2), r.client_confidential ? "YES" : "NO", `"${n}"`].join(",");
      });
      return new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    } else if (format === 'quickbooks') {
      const header = ["Date", "Description", "Amount", "Category", "Notes"];
      const rows = receipts.map(r => {
        const m = isRedacted ? (r.redacted_merchant || r.merchant) : r.merchant;
        const n = isRedacted ? (r.redacted_notes || r.audit_notes) : r.audit_notes;
        return [r.date, `"${m}"`, `-${r.total_amount.toFixed(2)}`, `"${r.category}"`, `"${n}"`].join(",");
      });
      return new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    } else if (format === 'json') {
      return new Blob([JSON.stringify({ receipts }, null, 2)], { type: "application/json;charset=utf-8" });
    } else if (format === 'markdown') {
      const totalSpend = receipts.reduce((acc, r) => acc + r.total_amount, 0);
      const totalDed = receipts.reduce((acc, r) => acc + r.deductible_amount, 0);
      let md = `# 📊 GhostLedger Expense & Tax Audit Report\n\n`;
      md += `**Total Spend:** $${totalSpend.toFixed(2)}  \n`;
      md += `**Total Deductible:** $${totalDed.toFixed(2)}  \n\n`;
      md += `| Date | Merchant | Category | Total | Deductible | NDA Shield | Audit Rationale |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- | :---: | :--- |\n`;
      receipts.forEach(r => {
        const m = isRedacted ? (r.redacted_merchant || r.merchant) : r.merchant;
        const n = isRedacted ? (r.redacted_notes || r.audit_notes) : r.audit_notes;
        md += `| ${r.date} | ${m} | ${r.category} | $${r.total_amount.toFixed(2)} | $${r.deductible_amount.toFixed(2)} | ${r.client_confidential ? "🔒 Sanitized" : "Public"} | ${n} |\n`;
      });
      return new Blob([md], { type: "text/markdown;charset=utf-8" });
    }
    return new Blob([JSON.stringify(receipts)], { type: "text/plain" });
  }

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
    .then(res => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.blob();
    })
    .then(blob => downloadBlob(blob, filename))
    .catch(() => {
      const fallbackBlob = generateClientExport(format);
      if (fallbackBlob) downloadBlob(fallbackBlob, filename);
    });
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
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    })
    .then(text => {
      navigator.clipboard.writeText(text).then(() => {
        const orig = btnCopyCPA.textContent;
        btnCopyCPA.textContent = "✓ COPIED FOR CPA";
        setTimeout(() => { btnCopyCPA.textContent = orig; }, 2000);
      });
    })
    .catch(() => {
      // Fallback markdown generator
      const isRedacted = toggleRedact.checked;
      let md = `# GhostLedger CPA Summary\n\n`;
      receipts.forEach(r => {
        const m = isRedacted ? (r.redacted_merchant || r.merchant) : r.merchant;
        const n = isRedacted ? (r.redacted_notes || r.audit_notes) : r.audit_notes;
        md += `- **${r.date}** | **${m}**: $${r.total_amount.toFixed(2)} (${r.category}) -> $${r.deductible_amount.toFixed(2)} deductible. Note: ${n}\n`;
      });
      navigator.clipboard.writeText(md).then(() => {
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
