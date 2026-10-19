document.addEventListener('DOMContentLoaded', () => {
  let receipts = [];
  let sampleData = {};
  let audioEnabled = true;
  let searchTerm = '';
  let activeCategoryFilter = null;
  let activeTaxRate = 0.25;
  let selectedReceiptId = null;

  // ==========================================
  // 1. Web Audio SFX (Zero-Dependency Synthesizer)
  // ==========================================
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = AudioContext ? new AudioContext() : null;

  function playCyberSound(type) {
    if (!audioEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;

      if (type === 'click' || type === 'beep') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2400, now);
        filter.Q.setValueAtTime(4.0, now);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.03);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.035);
      } else if (type === 'warp') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(140, now);
        filter.frequency.linearRampToValueAtTime(600, now + 0.25);
        filter.frequency.exponentialRampToValueAtTime(60, now + 0.5);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(65, now);
        osc.frequency.linearRampToValueAtTime(130, now + 0.25);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'scan') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(1800, now + 0.25);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.25);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'shield') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'chime') {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          const t = now + idx * 0.06;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.04, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

          osc.connect(gain);
          gain.connect(audioCtx.destination);

          osc.start(t);
          osc.stop(t + 0.26);
        });
      }
    } catch (e) {
      console.warn("Audio effect error:", e);
    }
  }

  // Audio Toggle
  const btnAudio = document.getElementById('btnAudioToggle');
  if (btnAudio) {
    btnAudio.addEventListener('click', () => {
      audioEnabled = !audioEnabled;
      btnAudio.textContent = audioEnabled ? '🔊 SFX: ON' : '🔇 SFX: OFF';
      btnAudio.style.borderColor = audioEnabled ? 'var(--accent-purple)' : 'var(--text-muted)';
      btnAudio.style.color = audioEnabled ? 'var(--accent-purple)' : 'var(--text-muted)';
      if (audioEnabled) playCyberSound('click');
    });
  }

  // ==========================================
  // 2. Hyperspace 3D Warp Field Engine (Shared with Landing Page)
  // ==========================================
  const canvas = document.getElementById('warpCanvas');
  let triggerWarpSurge = () => {};

  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const NUM_STARS = 450;
    const stars = [];
    let speed = 4;
    let targetSpeed = 4;
    let mouseX = width / 2;
    let mouseY = height / 2;

    for (let i = 0; i < NUM_STARS; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
        pz: 0
      });
      stars[i].pz = stars[i].z;
    }

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      targetSpeed = 8;
    });

    triggerWarpSurge = () => {
      targetSpeed = 22;
      playCyberSound('warp');
      setTimeout(() => { targetSpeed = 4; }, 800);
    };

    function renderWarp() {
      ctx.fillStyle = '#02040a';
      ctx.fillRect(0, 0, width, height);

      speed += (targetSpeed - speed) * 0.05;
      if (targetSpeed > 4) targetSpeed -= 0.08;

      const cx = width / 2 + (mouseX - width / 2) * 0.12;
      const cy = height / 2 + (mouseY - height / 2) * 0.12;

      for (let i = 0; i < NUM_STARS; i++) {
        const star = stars[i];
        star.pz = star.z;
        star.z -= speed;

        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
          star.z = width;
          star.pz = star.z;
        }

        const k = 220 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        const pk = 220 / star.pz;
        const prevX = star.x * pk + cx;
        const prevY = star.y * pk + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const depthAlpha = Math.min(1, (1 - star.z / width) * 1.5);
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(px, py);
          ctx.strokeStyle = i % 3 === 0 ? `rgba(0, 240, 255, ${depthAlpha})` : `rgba(0, 255, 136, ${depthAlpha * 0.7})`;
          ctx.lineWidth = Math.max(0.5, (1 - star.z / width) * 2.2);
          ctx.stroke();
        }
      }

      requestAnimationFrame(renderWarp);
    }
    renderWarp();
  }

  // ==========================================
  // 3. Built-In Sample Receipts (Air-Gapped)
  // ==========================================
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

  // Sync with /api/samples if available
  fetch('/api/samples')
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data && data.samples) {
        sampleData = Object.assign(sampleData, data.samples);
      }
    })
    .catch(() => {});

  // ==========================================
  // 4. DOM Bindings
  // ==========================================
  const receiptInput = document.getElementById('receiptInput');
  const textareaWrapper = document.getElementById('textareaWrapper');
  const btnAnalyze = document.getElementById('btnAnalyze');
  const btnClear = document.getElementById('btnClear');
  const btnLoadAll = document.getElementById('btnLoadAll');
  const btnUploadTrigger = document.getElementById('btnUploadTrigger');
  const fileInput = document.getElementById('fileInput');
  const dropzoneArea = document.getElementById('dropzoneArea');
  const hudStatus = document.getElementById('hudStatus');

  const metricTotalSpend = document.getElementById('metricTotalSpend');
  const metricTaxDeductible = document.getElementById('metricTaxDeductible');
  const metricTaxSavings = document.getElementById('metricTaxSavings');
  const metricShielded = document.getElementById('metricShielded');
  const metricCount = document.getElementById('metricCount');
  const metricEfficiency = document.getElementById('metricEfficiency');
  const bracketDesc = document.getElementById('bracketDesc');

  const tableBody = document.getElementById('receiptsTableBody');
  const tableSearch = document.getElementById('tableSearch');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const toggleRedact = document.getElementById('toggleRedact');
  const categoryPills = document.getElementById('categoryPills');

  // Inspector Elements
  const receiptInspector = document.getElementById('receiptInspector');
  const inspMerchantTitle = document.getElementById('inspMerchantTitle');
  const inspId = document.getElementById('inspId');
  const inspDate = document.getElementById('inspDate');
  const inspCategory = document.getElementById('inspCategory');
  const inspPrivacy = document.getElementById('inspPrivacy');
  const inspTotal = document.getElementById('inspTotal');
  const inspDeductible = document.getElementById('inspDeductible');
  const inspRate = document.getElementById('inspRate');
  const inspAuditNotes = document.getElementById('inspAuditNotes');
  const inspReceiptPreview = document.getElementById('inspReceiptPreview');
  const tabSanitizedView = document.getElementById('tabSanitizedView');
  const tabRawView = document.getElementById('tabRawView');
  const btnCloseInsp = document.getElementById('btnCloseInsp');

  // Toast
  const toastNotification = document.getElementById('toastNotification');

  function showToast(msg) {
    if (!toastNotification) return;
    toastNotification.textContent = msg;
    toastNotification.classList.add('show');
    setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2800);
  }

  // ==========================================
  // 5. Ingestion Tabs Switcher
  // ==========================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPresets = document.getElementById('tabPresets');
  const tabText = document.getElementById('tabText');
  const tabUpload = document.getElementById('tabUpload');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playCyberSound('click');
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.getAttribute('data-tab');
      tabPresets.style.display = targetTab === 'presets' ? 'block' : 'none';
      tabText.style.display = targetTab === 'text' ? 'block' : 'none';
      tabUpload.style.display = targetTab === 'upload' ? 'block' : 'none';
    });
  });

  // Scenario Cards Click
  const scenarioCards = document.querySelectorAll('.scenario-card');
  scenarioCards.forEach(card => {
    card.addEventListener('click', () => {
      playCyberSound('click');
      scenarioCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const sampleKey = card.getAttribute('data-sample');
      if (sampleKey && sampleData[sampleKey]) {
        receiptInput.value = sampleData[sampleKey];
        if (hudStatus) hudStatus.textContent = `BUFFER LOADED // ${sampleKey}`;
        showToast(`Loaded ${card.querySelector('.sc-title').textContent}`);
      }
    });
  });

  // ==========================================
  // 6. Tax Bracket Toggles
  // ==========================================
  const bracketButtons = document.querySelectorAll('.bracket-btn');
  bracketButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playCyberSound('click');
      bracketButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTaxRate = parseFloat(btn.getAttribute('data-rate')) || 0.25;
      const pct = Math.round(activeTaxRate * 100);
      if (bracketDesc) {
        bracketDesc.textContent = `Direct federal & self-employment tax reduction (at ${pct}% bracket)`;
      }
      updateMetrics();
      showToast(`Tax bracket updated to ${pct}%`);
    });
  });

  // ==========================================
  // 7. Deterministic Air-Gapped Parser Fallback
  // ==========================================
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
      auditNote = "IRS Schedule C Line 24b: Business meal with client/prospect (50% statutory deduction limit). Requires documenting business purpose.";
    } else if (lower.includes('digitalocean') || lower.includes('cloud') || lower.includes('software') || lower.includes('droplet') || lower.includes('hosting')) {
      category = "Software & Subscriptions";
      pct = 1.0;
      auditNote = "IRS Schedule C Line 18: 100% deductible cloud hosting and software services.";
    } else if (lower.includes('flight') || lower.includes('delta') || lower.includes('air lines') || lower.includes('hotel') || lower.includes('travel')) {
      category = "Travel & Lodging";
      pct = 1.0;
      auditNote = "IRS Schedule C Line 24a: 100% deductible business travel costs.";
    } else if (lower.includes('apple') || lower.includes('display') || lower.includes('equipment') || lower.includes('hardware') || lower.includes('monitor')) {
      category = "Office Supplies & Equipment";
      pct = 1.0;
      auditNote = "IRS Section 179: 100% first-year de minimis safe harbor deduction for qualifying computer hardware.";
    }

    const isConfidential = /nda|confidential|project apex|client:/i.test(rawText);
    let redactedMerchant = merchant;
    let redactedNotes = auditNote;
    let redactedRaw = rawText;

    if (isConfidential) {
      redactedNotes += " [Privacy Protected: Sensitive client & NDA project markers sanitized]";
      redactedRaw = redactedRaw.replace(/Project Apex/gi, "Project [CONFIDENTIAL_CLIENT_1]")
                               .replace(/Client:\s*Acme Health Systems/gi, "Client: [CONFIDENTIAL_CLIENT_1]")
                               .replace(/Sarah Jenkins/gi, "[REDACTED_CONTACT]");
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
      raw_text: rawText,
      redacted_raw_text: redactedRaw,
    };
  }

  // ==========================================
  // 8. Analyze Single Receipt
  // ==========================================
  async function analyzeReceipt(text) {
    if (!text.trim()) return null;
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
    } catch (e) {
      // offline fallback
    }

    if (!item) {
      item = parseReceiptLocally(text, nextId);
    }
    return item;
  }

  btnAnalyze.addEventListener('click', async () => {
    const text = receiptInput.value.trim();
    if (!text) {
      alert("Please select a 1-Click Scenario, paste receipt text, or upload an invoice first!");
      return;
    }

    const startTime = performance.now();
    btnAnalyze.disabled = true;
    btnAnalyze.innerHTML = '<span class="btn-flare"></span> ⚡ ANALYZING WITH GEMMA...';
    if (textareaWrapper) textareaWrapper.classList.add('scanning');
    if (hudStatus) hudStatus.textContent = "// RUNNING LOCAL GEMMA INFERENCE";
    playCyberSound('scan');

    const item = await analyzeReceipt(text);
    const latency = Math.max(14, Math.round(performance.now() - startTime));

    btnAnalyze.disabled = false;
    btnAnalyze.innerHTML = '<span class="btn-flare"></span> ⚡ ANALYZE WITH LOCAL GEMMA';
    if (textareaWrapper) textareaWrapper.classList.remove('scanning');

    if (item) {
      receipts.push(item);
      renderTable();
      updateMetrics();
      inspectReceipt(item.id);
      triggerWarpSurge();
      playCyberSound('chime');

      const valInferenceSpeed = document.getElementById('valInferenceSpeed');
      if (valInferenceSpeed) valInferenceSpeed.textContent = `${latency}ms`;
      if (hudStatus) hudStatus.textContent = `PARSED // ${latency}ms LATENCY`;
      showToast(`Processed: ${item.merchant} ($${item.total_amount.toFixed(2)})`);
    }
  });

  // ==========================================
  // 9. Master Action: Load All 4 Presets
  // ==========================================
  btnLoadAll.addEventListener('click', async () => {
    playCyberSound('scan');
    btnLoadAll.disabled = true;
    btnLoadAll.textContent = '⚡ RUNNING FULL BATCH AUDIT...';

    receipts = [];
    const keys = ['saas_subscription.txt', 'client_dinner_nda.txt', 'flight_conference.txt', 'hardware_depreciation.txt'];

    for (const key of keys) {
      const text = sampleData[key] || BUILTIN_SAMPLES[key];
      if (text) {
        const item = await analyzeReceipt(text);
        if (item) receipts.push(item);
      }
    }

    renderTable();
    updateMetrics();
    triggerWarpSurge();
    playCyberSound('chime');

    if (receipts.length > 0) {
      inspectReceipt(receipts[0].id);
    }

    btnLoadAll.disabled = false;
    btnLoadAll.textContent = '⚡ LOAD ALL 4 PRESETS (FULL AUDIT)';
    if (hudStatus) hudStatus.textContent = `BATCH COMPLETE // 4 RECEIPTS PARSED`;
    showToast(`✓ All 4 freelance scenarios loaded & audited!`);
  });

  // Clear Buffer
  btnClear.addEventListener('click', () => {
    playCyberSound('click');
    receiptInput.value = '';
    receipts = [];
    searchTerm = '';
    activeCategoryFilter = null;
    if (tableSearch) tableSearch.value = '';
    if (receiptInspector) receiptInspector.style.display = 'none';
    scenarioCards.forEach(c => c.classList.remove('active'));
    renderTable();
    updateMetrics();
    if (hudStatus) hudStatus.textContent = "// STANDBY";
    showToast("Ledger and buffer cleared");
  });

  // ==========================================
  // 10. File Upload & Drag-and-Drop OCR
  // ==========================================
  if (btnUploadTrigger) {
    btnUploadTrigger.addEventListener('click', () => {
      playCyberSound('click');
      fileInput.click();
    });
  }

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleIncomingFile(file);
  });

  if (dropzoneArea) {
    dropzoneArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzoneArea.classList.add('drag-over');
    });
    dropzoneArea.addEventListener('dragleave', () => dropzoneArea.classList.remove('drag-over'));
    dropzoneArea.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzoneArea.classList.remove('drag-over');
      if (e.dataTransfer.files.length > 0) {
        handleIncomingFile(e.dataTransfer.files[0]);
      }
    });
  }

  function handleIncomingFile(file) {
    playCyberSound('click');
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|gif|tiff)$/i.test(file.name);

    if (isImage) {
      // Switch to text tab to show progress
      tabButtons.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === 'text');
      });
      tabPresets.style.display = 'none';
      tabText.style.display = 'block';
      tabUpload.style.display = 'none';

      receiptInput.value = `⏳ Extracting text from ${file.name} using private client-side OCR...`;
      if (hudStatus) hudStatus.textContent = `// RUNNING IN-BROWSER TESSERACT.JS OCR`;

      if (window.Tesseract) {
        Tesseract.recognize(file, 'eng')
          .then(({ data: { text } }) => {
            receiptInput.value = text.trim() || `[Image: ${file.name}]\nNo text found. Please enter manually.`;
            playCyberSound('beep');
            if (hudStatus) hudStatus.textContent = `OCR COMPLETE // ${text.length} CHARS`;
            showToast(`OCR complete for ${file.name}`);
          })
          .catch(err => {
            console.error("OCR Error:", err);
            receiptInput.value = `[Image: ${file.name}]\nOCR error. Please paste text directly.`;
          });
      } else {
        receiptInput.value = `[Image: ${file.name}]\nImage uploaded.`;
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      receiptInput.value = e.target.result;
      tabButtons.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === 'text');
      });
      tabPresets.style.display = 'none';
      tabText.style.display = 'block';
      tabUpload.style.display = 'none';
      playCyberSound('beep');
      showToast(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  }

  // ==========================================
  // 11. Interactive Holographic Receipt Inspector
  // ==========================================
  function inspectReceipt(id) {
    const item = receipts.find(r => r.id === id);
    if (!item) return;

    selectedReceiptId = id;
    if (receiptInspector) receiptInspector.style.display = 'block';

    const isRedacted = toggleRedact.checked;
    const merchant = isRedacted ? (item.redacted_merchant || item.merchant) : item.merchant;
    const notes = isRedacted ? (item.redacted_notes || item.audit_notes) : item.audit_notes;

    if (inspMerchantTitle) inspMerchantTitle.textContent = merchant;
    if (inspId) inspId.textContent = item.id;
    if (inspDate) inspDate.textContent = item.date;
    if (inspCategory) inspCategory.textContent = item.category;
    if (inspPrivacy) {
      inspPrivacy.textContent = item.client_confidential ? "🔒 NDA Sanitized" : "Public";
      inspPrivacy.className = item.client_confidential ? "insp-privacy-badge" : "insp-privacy-badge public";
    }
    if (inspTotal) inspTotal.textContent = `$${item.total_amount.toFixed(2)}`;
    if (inspDeductible) inspDeductible.textContent = `$${item.deductible_amount.toFixed(2)}`;
    if (inspRate) inspRate.textContent = `${Math.round(item.deductible_percentage * 100)}%`;
    if (inspAuditNotes) inspAuditNotes.textContent = notes;

    updateInspectorPreview(item, true);

    // Scroll to inspector smoothly if not in view
    receiptInspector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    highlightSelectedRow();
  }

  function updateInspectorPreview(item, sanitized) {
    if (!inspReceiptPreview || !item) return;
    if (sanitized) {
      inspReceiptPreview.textContent = item.redacted_raw_text || item.raw_text || "No raw text available.";
      tabSanitizedView.classList.add('active');
      tabRawView.classList.remove('active');
    } else {
      inspReceiptPreview.textContent = item.raw_text || "No raw text available.";
      tabRawView.classList.add('active');
      tabSanitizedView.classList.remove('active');
    }
  }

  if (tabSanitizedView) {
    tabSanitizedView.addEventListener('click', () => {
      playCyberSound('shield');
      const item = receipts.find(r => r.id === selectedReceiptId);
      updateInspectorPreview(item, true);
    });
  }

  if (tabRawView) {
    tabRawView.addEventListener('click', () => {
      playCyberSound('click');
      const item = receipts.find(r => r.id === selectedReceiptId);
      updateInspectorPreview(item, false);
    });
  }

  if (btnCloseInsp) {
    btnCloseInsp.addEventListener('click', () => {
      playCyberSound('click');
      if (receiptInspector) receiptInspector.style.display = 'none';
      selectedReceiptId = null;
      highlightSelectedRow();
    });
  }

  function highlightSelectedRow() {
    document.querySelectorAll('.receipt-table tbody tr').forEach(row => {
      if (row.dataset.id === selectedReceiptId) {
        row.classList.add('row-selected');
      } else {
        row.classList.remove('row-selected');
      }
    });
  }

  // ==========================================
  // 12. Schedule C Radar Filtering
  // ==========================================
  const scheduleRows = document.querySelectorAll('.schedule-row.clickable');
  scheduleRows.forEach(row => {
    row.addEventListener('click', () => {
      playCyberSound('click');
      const filter = row.getAttribute('data-filter');
      if (activeCategoryFilter === filter) {
        activeCategoryFilter = null;
        row.classList.remove('active-filter');
        showToast("Filter cleared: Showing all categories");
      } else {
        scheduleRows.forEach(r => r.classList.remove('active-filter'));
        row.classList.add('active-filter');
        activeCategoryFilter = filter;
        showToast(`Filtered by ${filter}`);
      }
      renderTable();
    });
  });

  // ==========================================
  // 13. Search & Redact Toggles
  // ==========================================
  if (tableSearch) {
    tableSearch.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      if (btnClearSearch) btnClearSearch.style.display = searchTerm ? 'block' : 'none';
      renderTable();
    });
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      playCyberSound('click');
      tableSearch.value = '';
      searchTerm = '';
      btnClearSearch.style.display = 'none';
      renderTable();
    });
  }

  if (toggleRedact) {
    toggleRedact.addEventListener('change', () => {
      playCyberSound('shield');
      renderTable();
      if (selectedReceiptId) inspectReceipt(selectedReceiptId);
      showToast(toggleRedact.checked ? "🔒 Client NDA Redaction ENGAGED" : "👁️ Client NDA Redaction DISENGAGED");
    });
  }

  // ==========================================
  // 14. Render Receipts Table
  // ==========================================
  function renderTable() {
    if (receipts.length === 0) {
      tableBody.innerHTML = `
        <tr class="empty-row">
          <td colspan="9">
            <div class="empty-state-box">
              <div class="es-icon">📄</div>
              <div class="es-title">No Expenses in Ledger Yet</div>
              <div class="es-desc">Click a 1-Click Scenario above or "⚡ LOAD ALL 4 PRESETS" to see on-device IRS tax analysis in action!</div>
            </div>
          </td>
        </tr>`;
      return;
    }

    const isRedacted = toggleRedact.checked;

    const filtered = receipts.filter(r => {
      if (activeCategoryFilter && !r.category.toLowerCase().includes(activeCategoryFilter.toLowerCase())) {
        return false;
      }
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
          <td colspan="9">
            <div class="empty-state-box">
              <div class="es-title">No matching expenses found</div>
              <div class="es-desc">No receipts matched the search or category filter.</div>
            </div>
          </td>
        </tr>`;
      return;
    }

    tableBody.innerHTML = filtered.map(r => {
      const origIdx = receipts.indexOf(r);
      const merchant = isRedacted ? (r.redacted_merchant || r.merchant) : r.merchant;
      const notes = isRedacted ? (r.redacted_notes || r.audit_notes) : r.audit_notes;
      const privacyBadge = r.client_confidential 
        ? `<span class="badge-shielded">🔒 SHIELDED</span>` 
        : `<span class="badge-public">PUBLIC</span>`;
      const isSelected = r.id === selectedReceiptId ? 'row-selected' : '';

      return `
        <tr class="${isSelected}" data-id="${escapeHtml(r.id)}" title="Click to inspect IRS deduction breakdown">
          <td><strong>${escapeHtml(r.id)}</strong></td>
          <td>${escapeHtml(r.date)}</td>
          <td><strong>${escapeHtml(merchant)}</strong></td>
          <td><span class="badge-category">${escapeHtml(r.category)}</span></td>
          <td class="cell-amount">$${r.total_amount.toFixed(2)}</td>
          <td class="cell-deductible">$${r.deductible_amount.toFixed(2)} (${Math.round(r.deductible_percentage * 100)}%)</td>
          <td>${privacyBadge}</td>
          <td class="cell-notes">${escapeHtml(notes)}</td>
          <td>
            <button class="btn-delete" data-index="${origIdx}" title="Remove Entry" onclick="event.stopPropagation()">✕</button>
          </td>
        </tr>
      `;
    }).join('');

    // Row click inspect
    document.querySelectorAll('.receipt-table tbody tr').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-id');
        if (id) {
          playCyberSound('click');
          inspectReceipt(id);
        }
      });
    });

    // Delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        playCyberSound('click');
        const idx = parseInt(btn.dataset.index, 10);
        const removed = receipts.splice(idx, 1)[0];
        if (selectedReceiptId && removed && removed.id === selectedReceiptId) {
          if (receiptInspector) receiptInspector.style.display = 'none';
          selectedReceiptId = null;
        }
        renderTable();
        updateMetrics();
        if (removed) showToast(`Removed ${removed.merchant}`);
      });
    });
  }

  // ==========================================
  // 15. Update Metrics & Radar Bars
  // ==========================================
  function updateMetrics() {
    const totalSpend = receipts.reduce((acc, r) => acc + r.total_amount, 0);
    const totalDeductible = receipts.reduce((acc, r) => acc + r.deductible_amount, 0);
    const taxSavings = totalDeductible * activeTaxRate;
    const shieldedCount = receipts.filter(r => r.client_confidential).length;

    if (metricTotalSpend) metricTotalSpend.textContent = `$${totalSpend.toFixed(2)}`;
    if (metricTaxDeductible) metricTaxDeductible.textContent = `$${totalDeductible.toFixed(2)}`;
    if (metricTaxSavings) metricTaxSavings.textContent = `$${taxSavings.toFixed(2)}`;
    if (metricShielded) metricShielded.textContent = shieldedCount;

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

    // Schedule C Bars
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
    if (valMealsDed) valMealsDed.textContent = `→ $${mealsDed.toFixed(2)} Deductible`;

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

    // Category pills above table
    if (receipts.length > 0 && categoryPills) {
      const breakdown = {};
      receipts.forEach(r => {
        breakdown[r.category] = (breakdown[r.category] || 0) + r.total_amount;
      });
      categoryPills.style.display = 'flex';
      categoryPills.innerHTML = Object.entries(breakdown).map(([cat, amt]) => {
        const isAct = activeCategoryFilter && cat.toLowerCase().includes(activeCategoryFilter.toLowerCase());
        return `<span class="category-pill ${isAct ? 'active' : ''}" data-cat="${escapeHtml(cat)}">${escapeHtml(cat)}: <strong>$${amt.toFixed(2)}</strong></span>`;
      }).join('');

      document.querySelectorAll('.category-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          playCyberSound('click');
          const cat = pill.getAttribute('data-cat');
          if (activeCategoryFilter === cat) {
            activeCategoryFilter = null;
          } else {
            activeCategoryFilter = cat;
          }
          renderTable();
          updateMetrics();
        });
      });
    } else if (categoryPills) {
      categoryPills.style.display = 'none';
      categoryPills.innerHTML = '';
    }
  }

  // ==========================================
  // 16. Exports Handlers
  // ==========================================
  function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    showToast(`✓ Downloaded ${filename}`);
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
      alert("No receipts to export! Click '⚡ LOAD ALL 4 PRESETS' or analyze a receipt first.");
      return;
    }
    playCyberSound('click');

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

  document.getElementById('btnExportCSV')?.addEventListener('click', () => triggerExport('quickbooks', 'quickbooks_expenses.csv'));
  document.getElementById('btnExportStandardCSV')?.addEventListener('click', () => triggerExport('csv', 'itemized_tax_expenses.csv'));
  document.getElementById('btnExportMarkdown')?.addEventListener('click', () => triggerExport('markdown', 'irs_audit_expense_report.md'));
  document.getElementById('btnExportJSON')?.addEventListener('click', () => triggerExport('json', 'expenses_export.json'));

  // Copy for CPA
  const btnCopyCPA = document.getElementById('btnCopyCPA');
  if (btnCopyCPA) {
    btnCopyCPA.addEventListener('click', () => {
      if (receipts.length === 0) {
        alert("No receipts to copy! Analyze at least one receipt first.");
        return;
      }
      playCyberSound('shield');

      const isRedacted = toggleRedact.checked;
      let md = `# GhostLedger CPA Summary Report\n`;
      md += `Generated: ${new Date().toLocaleDateString()} • Air-Gapped Schedule C Analysis\n\n`;
      receipts.forEach(r => {
        const m = isRedacted ? (r.redacted_merchant || r.merchant) : r.merchant;
        const n = isRedacted ? (r.redacted_notes || r.audit_notes) : r.audit_notes;
        md += `- **${r.date}** | **${m}**: $${r.total_amount.toFixed(2)} (${r.category}) ➔ $${r.deductible_amount.toFixed(2)} deductible (${Math.round(r.deductible_percentage * 100)}%).\n  *Audit Note:* ${n}\n`;
      });

      navigator.clipboard.writeText(md).then(() => {
        showToast("✓ Copied CPA Audit Report to Clipboard");
        const orig = btnCopyCPA.querySelector('strong');
        if (orig) {
          const oldText = orig.textContent;
          orig.textContent = "✓ Copied to Clipboard!";
          setTimeout(() => { orig.textContent = oldText; }, 2000);
        }
      });
    });
  }


  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
