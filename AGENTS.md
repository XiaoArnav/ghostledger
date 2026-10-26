# 👻 GhostLedger // 2100 — Master Agent Memory & Workspace Rules

> **System Notice for AI Agents:**
> You are operating inside the official **GhostLedger** codebase (formerly PrivateReceipt).
> This document is the sovereign source of truth for all project context, architectural invariants, IRS tax rules, Gemma 2 AI integration, 3D frontend mechanics, and operational history.

---

## 🏛️ Project Identity & Core Mission

- **Project Name:** GhostLedger // 2100 (Repository: `XiaoArnav/ghostledger`)
- **Tagline:** The Sovereign Financial Machine — Why Our AI Bookkeeper Math Only Works Because Gemma 2 Runs Air-Gapped.
- **Creator:** Arnav Patel (`@polymath_arnav` on DEV / `XiaoArnav` on GitHub)
- **Primary Domain:** Air-gapped, zero-leak automated expense bookkeeping & IRS Schedule C tax deduction extraction for freelancers, solopreneurs, and independent contractors.
- **Key Hackathon / Event:** DEV Open-Source AI Challenge (Week 2: Side Hustle) & Hacktoberfest 2026.
- **Canonical URLs:**
  - **Live Web App:** [https://ghostledger-topaz.vercel.app](https://ghostledger-topaz.vercel.app)
  - **Command Center Workbench:** [https://ghostledger-topaz.vercel.app/workbench](https://ghostledger-topaz.vercel.app/workbench)
  - **Mission Manifesto (Landing):** [https://ghostledger-topaz.vercel.app/landing](https://ghostledger-topaz.vercel.app/landing)
  - **GitHub Source (MIT):** [https://github.com/XiaoArnav/ghostledger](https://github.com/XiaoArnav/ghostledger)
  - **DEV Submission Post:** [DEV Draft #4873267](https://dev.to/polymath_arnav/ghostledger-the-sovereign-financial-machine-why-our-ai-bookkeeper-math-only-works-because-gemma-n9e-temp-slug-6508792/edit)

---

## 🔒 The Core Invariant: The Sovereign Air-Gap

GhostLedger solves the **Shoebox Dilemma** faced by independent consultants and freelancers:
1. **The NDA & Confidentiality Breach:** Uploading client receipts to cloud SaaS (Expensify, Dext, QuickBooks) or proprietary cloud LLM APIs (OpenAI, Anthropic) sends client names, secret meeting dinners under NDA, project codenames (`Project Apex`), and financial data to external servers and model training sets.
2. **The Unit Economics Trap:** Calling closed multimodal APIs at \$0.04 to \$0.08 per receipt destroys the unit economics of a low-cost or one-time desktop bookkeeping utility.

### Non-Negotiable Engineering Invariants:
- **Zero Outbound Packets for Receipt Text:** Receipts are parsed **100% on-device** using local Google Gemma 2 open weights (`gemma2:2b`, `gemma2:9b` via Ollama) or an air-gapped deterministic parser fallback.
- **Automatic Client NDA Sanitization:** Before any export is prepared for a CPA or external accountant, all confidential client identifiers, project codenames, and sensitive contact names are masked (`[CONFIDENTIAL_CLIENT_1]`, `[REDACTED_CONTACT]`).
- **Schedule C Compliance:** Every categorized line item must map strictly to official IRS Schedule C lines (Line 11, Line 18, Line 20b, Line 24a, Line 24b, Line 25, Line 27a, Section 179).

---

## 🗺️ Codebase Map & Directory Architecture

```
ghostledger/
├── GEMINI.md                    # This master agent memory & rules file
├── AGENTS.md                    # Universal multi-agent memory file
├── DEV_SUBMISSION.md            # Authoritative DEV challenge submission draft
├── README.md                    # Public GitHub documentation & quickstart
├── pyproject.toml / setup.py    # Python package configuration (CLI: ghostledger)
├── vercel.json                  # Vercel serverless deployment & route rewrites
├── requirements.txt             # Python dependencies
├── privatereceipt/              # Core Python intelligence engine
│   ├── __init__.py              # Package export definitions
│   ├── models.py                # Data models (ReceiptItem, ExpenseReport, TaxCategory)
│   ├── gemma_engine.py          # Gemma 2 local Ollama & fallback inference engine
│   ├── categorizer.py           # IRS Schedule C classification & statutory limits
│   ├── privacy_redactor.py      # Client NDA & PII detection and tokenization
│   ├── exporter.py              # QuickBooks CSV, standard CSV, Markdown, JSON exporters
│   └── cli.py                   # Terminal CLI entrypoint
├── api/                         # Vercel Python Serverless API handlers
│   ├── index.py                 # Unified API router (/api/parse, /api/export, /api/samples)
│   ├── parse.py                 # Individual receipt parsing endpoint
│   ├── export.py                # Multi-format report export endpoint
│   └── samples.py               # Built-in sample receipts endpoint
├── public/                      # Static web frontend (Zero frameworks, pure native web tech)
│   ├── index.html / landing.html # 2100 Sovereign Manifesto landing page
│   ├── workbench.html           # Command Center interactive workbench
│   ├── app.js                   # Client controller: 3D physics, warp field, audio, parser
│   ├── style.css                # Workbench styles, 3D card elevation, glassmorphism
│   ├── landing.css              # Cyberpunk / starship telemetry landing design
│   └── favicon.svg              # Holographic ghostledger icon
├── samples/                     # 9 Real-world authentic freelance receipt fixtures
│   ├── saas_subscription.txt    # DigitalOcean ($90.50) — Line 18 (100%)
│   ├── client_dinner_nda.txt    # Blue Fin Bistro ($148.20) — Line 24b (50% Cap, NDA)
│   ├── flight_conference.txt    # Delta Air Lines ($433.00) — Line 24a (100%)
│   ├── hardware_depreciation.txt # Apple Studio Display ($1,848.89) — Section 179 (100%)
│   ├── coworking_wework.txt     # WeWork Dedicated Desk ($299.00) — Line 20b (100%)
│   ├── home_office_internet.txt # Gigabit Fiber Utility ($147.50) — Line 25 (100%)
│   ├── rideshare_client_trip.txt # Uber Client Dispatch ($42.50) — Line 24a (100%)
│   ├── book_ai_training.txt     # O'Reilly LLM Agent Book ($79.99) — Line 27a (100%)
│   └── security_audit_contractor.txt # Apex CyberSec Pen-Test ($650.00) — Line 11 (NDA)
├── tests/                       # Unit test suite (15/15 tests passing)
│   ├── test_categorizer.py      # Tests Schedule C deduction calculations
│   ├── test_engine.py           # Tests deterministic & Ollama parsing
│   ├── test_exporter.py         # Tests QuickBooks & Markdown exports
│   └── test_privacy.py          # Tests regex client NDA redaction
└── docs/                        # Deep project memory, session logs & guides
    ├── PROJECT_MEMORY.md        # Deep chronological archive & architecture specs
    ├── DEV_POST_AND_COMMUNITY.md # DEV post links, Hacktoberfest tags, sticker guide
    └── SESSION_ARCHIVE.md       # Full conversation trajectory and decisions
```

---

## ⚖️ IRS Schedule C Deduction Rules & Mapping

When parsing expenses, the agent and model must adhere to IRS statutory provisions:

| Expense Category | IRS Schedule C Line | Deductibility | Statutory Code | Example Vendors / Keywords |
| :--- | :---: | :---: | :--- | :--- |
| **Software & Subscriptions** | Line 18 | **100%** | IRC § 162(a) | DigitalOcean, AWS, OpenAI, GitHub, Vercel |
| **Meals & Entertainment** | Line 24b | **50% Statutory Cap** | IRC § 274(n) | Restaurants, Bistros, Dinners (requires business purpose) |
| **Travel & Lodging** | Line 24a | **100%** | IRC § 162(a)(2) | Delta Air Lines, United, Hotels, Airbnb |
| **Local Travel & Transit** | Line 24a | **100%** | IRC § 162(a) | Uber, Lyft, Taxis, Transit passes |
| **Office Supplies & Equipment** | Line 18 / § 179 | **100% Safe Harbor** | IRS Notice 2015-82 | Apple Display, Keyboards, Monitors (under \$2,500 de minimis) |
| **Rent / Lease (Business Space)**| Line 20b | **100%** | IRC § 162(a)(3) | WeWork, Industrious, Coworking dedicated desks |
| **Utilities & Communications** | Line 25 | **100%** | IRC § 162(a) | Lumen, CenturyLink, Fiber Internet, Static IP |
| **Education & Technical Research**| Line 27a | **100%** | Treas. Reg. § 1.162-5| O'Reilly Media, Coursera, DeepLearning.AI books/courses |
| **Contract Labor (Freelancers)** | Line 11 | **100%** | IRC § 162(a)(1) | Subcontractor pen-testers, UI designers, QA auditors |

---

## 🎮 3D Frontend Physics Engine Reference

The workbench UI features an interactive **3D physics engine** (`public/app.js` and `public/style.css`):

1. **60 FPS Gyroscopic Tilt:**
   - Elements track cursor position relative to element center (`normX`, `normY` between -1 and +1).
   - Angles `rotX` and `rotY` lerp smoothly (`rot += (target - rot) * 0.14`).
   - Cards tilt up to ±22°; buttons and tabs tilt up to ±14°.
2. **Multi-Layer Z Parallax Depth:**
   - Parent containers use `perspective: 1000px` and `transform-style: preserve-3d`.
   - `.step-icon` & `.sc-icon` pop out to `translateZ(24px)` (hover: `translateZ(48px) scale(1.15)`).
   - `.stat-number` floats at `translateZ(42px)` (hover: `translateZ(54px) scale(1.05)`).
   - Rule pills, badges, and buttons sit at `translateZ(14px)` to `translateZ(28px)`.
3. **Specular Glare & Chromatic Diffraction Rim:**
   - Real-time radial sheen tracks `--glare-x` and `--glare-y` across the card face.
   - Rainbow diffraction border rotates dynamically with `--rot-y` tilt angle.
4. **Click-and-Drag 360° Free Rotation with Momentum Inertia:**
   - Clicking and dragging any card allows users to freely spin and inspect it in 3D space.
   - Releasing coasts with angular momentum (`velocity *= 0.90`) before springing back upright.
5. **Mechanical Spring Press & Recoil Overshoot:**
   - `mousedown` / `touchstart`: Sinks back to `translateZ(-10px) scale(0.97)`.
   - `mouseup` / `touchend`: Recoils with spring overshoot to `translateZ(maxZ + 6px) scale(1.02)`.
6. **3D Laser Sparks & Audio Haptics:**
   - Clicks fire 32 holographic particle sparks on `#warpCanvas` in the card's theme color (`#00f0ff`, `#00ff88`, `#ffb703`, `#a855f7`).
   - Web Audio synthesizer generates micro-frequency tactile clicks and cyber shield chimes.

---

## 🛠️ Developer Runbook & Verification Commands

```bash
# 1. Run full test suite (15 unit tests)
python3 -m unittest discover -s tests

# 2. Start local development server
python3 -m http.server 8765 --directory public

# 3. Test CLI local receipt parsing
python3 -m privatereceipt.cli parse samples/saas_subscription.txt

# 4. Check git status & commit
git status
git commit -am "feat: ..."
git push origin main
```

---

## 📝 DEV Community & Hackathon Information

- **Submission Post URL:** `https://dev.to/polymath_arnav/ghostledger-the-sovereign-financial-machine-why-our-ai-bookkeeper-math-only-works-because-gemma-n9e-temp-slug-6508792`
- **DEV Draft ID:** `4873267`
- **Author:** Arnav Patel (`polymath_arnav`)
- **Required Tags:** `#devchallenge`, `#gemma`, `#opensource`, `#hacktoberfest`
- **Challenge:** DEV Open-Source AI Challenge (Week 2: Side Hustle)
- **Stickers & Completionist++:** Submitting to all 4 weeks of DEV Hacktoberfest challenges qualifies for the exclusive **Completionist++** badge and the physical Hacktoberfest sticker pack delivered via DEV/MLH distribution.

---

## 🤖 Instructions for AI Agents Working on GhostLedger

1. **Preserve Air-Gapped Privacy:** Never add cloud telemetry or proprietary closed APIs without explicit user consent. Always preserve local Gemma open-weight inference and deterministic fallback parity.
2. **Preserve 3D Interactive Styling:** Keep `transform-style: preserve-3d`, specular glare variables, and lerp physics intact when editing frontend components.
3. **Always Run Tests:** Execute `python3 -m unittest discover -s tests` before and after any modification to `privatereceipt/` or `api/`.
4. **Preserve Documentation Integrity:** Maintain all existing comments, docstrings, and citations to IRS Schedule C sections.
5. **GitHub Attribution & Streak Invariant:** Always commit with `user.name = XiaoArnav` and `user.email = 322868724+XiaoArnav@users.noreply.github.com` so every push registers toward the user's GitHub contribution streak.
