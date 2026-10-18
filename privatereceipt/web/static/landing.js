document.addEventListener('DOMContentLoaded', () => {
  let audioEnabled = true;

  // Web Audio SFX (Clean cybernetic haptics)
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = AudioContext ? new AudioContext() : null;

  function playCyberSound(type) {
    if (!audioEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;

      if (type === 'click') {
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
      }
    } catch (e) {
      console.warn("SFX error:", e);
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

  // Smooth Scroll
  const btnScrollTerm = document.getElementById('btnScrollTerminal');
  if (btnScrollTerm) {
    btnScrollTerm.addEventListener('click', () => {
      playCyberSound('click');
      document.getElementById('terminalSection').scrollIntoView({ behavior: 'smooth' });
    });
  }

  const btnScrollCalc = document.getElementById('btnScrollCalc');
  if (btnScrollCalc) {
    btnScrollCalc.addEventListener('click', () => {
      playCyberSound('click');
      document.getElementById('calcSection').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // 1. Hyperspace 3D Warp Field Engine
  const canvas = document.getElementById('warpCanvas');
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
      targetSpeed = 9;
    });

    window.addEventListener('click', () => {
      targetSpeed = 22;
      playCyberSound('warp');
      setTimeout(() => { targetSpeed = 4; }, 800);
    });

    function renderWarp() {
      ctx.fillStyle = '#02040a';
      ctx.fillRect(0, 0, width, height);

      speed += (targetSpeed - speed) * 0.05;
      if (targetSpeed > 4) targetSpeed -= 0.08;

      const cx = width / 2 + (mouseX - width / 2) * 0.15;
      const cy = height / 2 + (mouseY - height / 2) * 0.15;

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

  // 2. Interactive ROI Calculator
  const rngRevenue = document.getElementById('rngRevenue');
  const rngExpenses = document.getElementById('rngExpenses');
  const rngTaxRate = document.getElementById('rngTaxRate');
  const lblRevenue = document.getElementById('lblRevenue');
  const lblExpenses = document.getElementById('lblExpenses');
  const lblTaxRate = document.getElementById('lblTaxRate');
  const resTaxSavings = document.getElementById('resTaxSavings');
  const resSaasSaved = document.getElementById('resSaasSaved');
  const resCompounded = document.getElementById('resCompounded');

  function updateCalculator() {
    const rev = parseFloat(rngRevenue.value);
    const exp = parseFloat(rngExpenses.value);
    const taxRate = parseFloat(rngTaxRate.value) / 100;

    lblRevenue.textContent = '$' + rev.toLocaleString();
    lblExpenses.textContent = '$' + exp.toLocaleString();
    lblTaxRate.textContent = rngTaxRate.value + '%';

    // Projected average Schedule C deduction capture rate (e.g. 92% ordinary and necessary)
    const deductiblePortion = exp * 0.92;
    const taxSaved = deductiblePortion * taxRate;
    
    // Cloud SaaS subscription ($300/yr) + receipt token charges ($0.05 * ~800 receipts/yr = $400)
    const saasSaved = 300 + Math.round((exp / 30) * 0.05);

    // 5-Year compound wealth at 8% CAGR
    let compounded = 0;
    const annualTotal = taxSaved + saasSaved;
    for (let yr = 1; yr <= 5; yr++) {
      compounded = (compounded + annualTotal) * 1.08;
    }

    resTaxSavings.textContent = '$' + Math.round(taxSaved).toLocaleString();
    resSaasSaved.textContent = '$' + Math.round(saasSaved).toLocaleString();
    resCompounded.textContent = '$' + Math.round(compounded).toLocaleString();
  }

  [rngRevenue, rngExpenses, rngTaxRate].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        playCyberSound('click');
        updateCalculator();
      });
    }
  });
  updateCalculator();

  // 3. Interactive Cyber Terminal Holodeck
  const termButtons = document.querySelectorAll('.term-btn');
  const termOutput = document.getElementById('termOutput');

  const termSnippets = {
    'json-pipe': `<span class="prompt">$ </span>cat invoice.txt | ghostledger -q -f json | jq .
{
  "merchant": "DigitalOcean Holdings, Inc.",
  "total_amount": 90.50,
  "currency": "USD",
  "category": "Software & Subscriptions",
  "deductible_percentage": 1.0,
  "deductible_amount": 90.50,
  "client_confidential": false,
  "irs_audit_notes": "IRS Schedule C Line 18: 100% deductible cloud hosting and software services."
}`,
    'awk-tsv': `<span class="prompt">$ </span>ghostledger samples/ -f tsv | awk -F'\\t' '$4 ~ /Meals/'
REC-001	2026-10-12	The Blue Fin Bistro	Meals & Entertainment	148.20	USD	50%	74.10	YES	IRS Schedule C Line 24b: Business meal with client (50% deductible). [Privacy Protected: Detected NDA marker 'Project [CONFIDENTIAL_CLIENT_1]']`,
    'redact-csv': `<span class="prompt">$ </span>cat client_dinner.txt | ghostledger -q -r -f csv
ID,Date,Merchant,Category,Total Amount,Currency,Deductible %,Deductible Amount,Client Confidential,Audit Rationale
REC-001,2026-10-12,The Blue Fin Bistro,Meals & Entertainment,148.20,USD,50%,74.10,YES,IRS Schedule C Line 24b: Business meal [Privacy Protected: 'Project [CONFIDENTIAL_CLIENT_1]']`,
    'demo-audit': `<span class="prompt">$ </span>ghostledger demo
🚀 Running GhostLedger Demo Pipeline...
  ✓ Processed [REC-001] The Blue Fin Bistro      | $  148.20 | Meals & Entertainment
    🔒 [Privacy Shield Triggered] Sensitive client/NDA markers detected and sanitized.
  ✓ Processed [REC-002] Delta Air Lines e-Ticket | $  433.00 | Travel & Lodging
  ✓ Processed [REC-003] Apple Store - University | $ 1848.89 | Office Supplies & Equipment
  ✓ Processed [REC-004] DigitalOcean Holdings, I | $   90.50 | Software & Subscriptions
=================================================================
📊 SUMMARY: Q4 Freelance Expense & Tax Audit
=================================================================
  Total Gross Spend:              $   2520.59
  Total Tax Deductible Amount:    $   2446.49
  Estimated Tax Savings (25%):    $    611.62
  Sensitive NDA Receipts Shielded:          3
💾 Exported sanitized accountant CSV to: demo_expenses.csv`
  };

  termButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playCyberSound('click');
      termButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cmd = btn.getAttribute('data-cmd');
      const snippet = termSnippets[cmd] || '';
      
      // Typing effect
      termOutput.innerHTML = '';
      let index = 0;
      // Strip HTML for typing or just inject cleanly
      termOutput.innerHTML = snippet;
    });
  });
});
