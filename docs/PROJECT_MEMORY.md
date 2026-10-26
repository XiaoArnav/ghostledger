# 🧠 GhostLedger // 2100 — Deep Project Memory & Historical Record

> **Historical Context:**
> This document archives the complete memory, architecture, decisions, rationale, bug fixes, and development trajectory of **GhostLedger // 2100** (originally conceived as *PrivateReceipt*).
> It serves as the persistent brain of the project across all future coding sessions, AI pair-programming instances, and contributor onboarding.

---

## 1. Executive Summary & Problem Space

### The Core Problem: The Freelancer "Shoebox" Dilemma
Every tax season, independent software engineers, consultants, freelance designers, and solopreneurs face an agonizing choice:
1. **Manual Spreadsheet Sorting:** Spend 30–50 hours reading through PDF receipts, Stripe receipts, airline ticket emails, restaurant checks, and cloud hosting bills, guessing which IRS Schedule C expense categories apply and risking audit penalties.
2. **Cloud Accounting SaaS (Dext, Expensify, QuickBooks Online):** Upload sensitive receipts to proprietary cloud servers. This presents an intolerable **Client Confidentiality & NDA breach**:
   - Receipts often state: *"Dinner with Sarah Jenkins (Client: Acme Health Systems) discussing Project Apex AI integration contract under NDA."*
   - Sending this raw text to public cloud accounting or closed cloud LLM APIs (OpenAI, Anthropic) sends client trade secrets, confidential project codenames, secret dining locations, and credit card snippets into external databases and third-party AI training data.
3. **The Micro-SaaS Unit Economics Trap:** A developer attempting to build a privacy-first bookkeeping tool using proprietary closed-source LLMs faces catastrophic unit economics: closed multimodal APIs charge \$0.03 to \$0.08 per receipt call. For a freelancer scanning 300 receipts per year, API fees alone consume \$12 to \$24—obliterating the margin of a \$29 one-time desktop purchase or \$9/month subscription.

### The Solution: GhostLedger
**GhostLedger // 2100** is an open-source, 100% air-gapped financial machine that runs **Google's Gemma 2** open-weight models (`gemma2:2b`, `gemma2:9b`) locally on the user's laptop via Ollama.
- **Zero Outbound Bytes:** Receipt data never touches a server or external network.
- **Client NDA Privacy Shield:** Sensitive client names, trade secrets, and credit cards are identified and redacted before accountant export.
- **IRS Schedule C Compliance:** Automatically distinguishes statutory limits (e.g., 50% statutory meal deduction under IRC § 274(n) vs. 100% cloud infrastructure expensing under IRC § 162).
- **1-Click Audit Defense:** Exports formatted reports with plain-English IRS rationale to QuickBooks CSV, standard itemized tax CSV, audit-ready Markdown, and JSON.

---

## 2. Chronological Build History & Milestones

### Phase 1: Core Engine & Data Models (`privatereceipt/`)
- Designed clean, immutable dataclasses in `models.py`:
  - `TaxCategory`: Enumeration of IRS Schedule C categories.
  - `LineItem`: Granular breakdown of individual receipt line items.
  - `ReceiptItem`: Complete structured receipt model including raw text, redacted text, deductible amounts, audit rationale, and confidentiality flags.
  - `ExpenseReport`: Aggregate ledger with automatic totals for Gross Spend, Verified Deductions, Tax Savings, and Redacted Items.
- Built `categorizer.py`: Heuristic & statutory deduction classifier embedding IRC rules (50% meals, 100% travel, 100% software, Section 179 de minimis safe harbor).
- Built `privacy_redactor.py`: Regular expression and entity extraction engine to tokenize credit cards, email addresses, confidential client entities, and NDA project markers.
- Built `gemma_engine.py`: Multi-tier inference orchestrator:
  1. Local Ollama (`gemma2:2b`, `gemma2:9b`) for true air-gapped local processing.
  2. Optional Google AI Gemma API endpoint for hybrid environments.
  3. Deterministic local parser fallback ensuring 100% offline functionality without Ollama installed.
- Built `exporter.py`: Production-grade CSV, QuickBooks IIF/CSV, Markdown, and JSON exporters.
- Created `tests/`: 15 comprehensive unit tests covering all categorization, redaction, and export logic (100% passing).

### Phase 2: Web Platform & Hyperspace 3D Warp Field
- Created static frontend in `public/` and Vercel serverless functions in `api/`:
  - `api/index.py`: Unified serverless handler for `/api/parse`, `/api/export`, and `/api/samples`.
  - `vercel.json`: Clean URL rewrites mapping `/workbench` and `/landing`.
- Implemented **Hyperspace 3D Warp Field** (`#warpCanvas`):
  - Canvas-based dynamic starfield with depth perspective, velocity surges on action triggers, and mouse parallax tracking.
- Created the Cyberpunk Starship Telemetry design language matching a sovereign financial command center from the year 2100.

### Phase 3: The Complete 3D Physics Overhaul
Following user feedback to make all tabs and cards deeply 3D interactable:
- Implemented `init3DInteractables()` and 60 FPS physics RAF loop in `public/app.js`:
  1. **Gyroscopic Perspective Tilt:** Elements tilt dynamically following the mouse cursor relative to card center, with spring lerping (`lerpRot: 0.14`).
  2. **Multi-layer 3D Parallax Depth:** Floating elements pop out at distinct Z-planes (`translateZ(14px)` to `translateZ(54px)`).
  3. **Specular Raytraced Glare:** Dynamic radial sheen follows cursor coordinates (`--glare-x`, `--glare-y`).
  4. **Chromatic Rainbow Diffraction Rim:** Spectral border gradient rotates dynamically with `--rot-y`.
  5. **Click-and-Drag 360° Free Rotation:** Free 3D spinning with momentum inertia and frictional coasting (`velocity *= 0.90`).
  6. **Mechanical Spring Press & Recoil:** Tactile `translateZ(-10px)` compression with bounce overshoot on release.
  7. **Holographic 3D Laser Sparks:** Clicks burst 32 particle sparks on `#warpCanvas`.
  8. **Synthesizer Spatial Audio Haptics:** Procedural Web Audio micro-frequencies.
- Connected interactive routing:
  - Step Cards: Step 01 (Presets), Step 02 (Gemma Run), Step 03 (Audit Ledger).
  - HUD Stat Boxes: Total Spend (Reset filters), Deductible (Isolate deductions), Savings (Cycle tax brackets), Shielded (Toggle NDA redaction).

### Phase 4: Expansion to 9 Realistic Freelance Scenarios
To showcase every common IRS Schedule C situation, 9 authentic fixtures were written to `samples/` and mirrored in offline `BUILTIN_SAMPLES`:
1. **DigitalOcean Cloud Server** (`saas_subscription.txt`): \$90.50 — Line 18 (100%)
2. **Client Dinner under NDA** (`client_dinner_nda.txt`): \$148.20 — Line 24b (50% Cap, masks "Project Apex")
3. **AI Summit Travel Flight** (`flight_conference.txt`): \$433.00 — Line 24a (100%)
4. **Apple Studio Display Rig** (`hardware_depreciation.txt`): \$1,848.89 — Section 179 (100% Safe Harbor)
5. **WeWork Dedicated Desk** (`coworking_wework.txt`): \$299.00 — Line 20b (100%)
6. **Gigabit Fiber Internet** (`home_office_internet.txt`): \$147.50 — Line 25 (100%)
7. **Client On-Site Rideshare** (`rideshare_client_trip.txt`): \$42.50 — Line 24a (100%)
8. **LLM Agents Book & Masterclass** (`book_ai_training.txt`): \$79.99 — Line 27a (100%)
9. **Pen-Test Security Contractor** (`security_audit_contractor.txt`): \$650.00 — Line 11 (100%, NDA masked)

---

## 3. Key Design Decisions & Rationale

| Decision | Alternative Considered | Why Chosen |
| :--- | :--- | :--- |
| **Gemma 2 Open Weights** | Closed cloud LLMs (GPT-4o, Claude 3.5) | Zero data leakage, strict air-gap compliance, and eliminates per-call API cost. |
| **Vanilla HTML5/JS/CSS** | React / Next.js / Vue | Instant load time, zero bundle bloat, direct DOM manipulation for 60 FPS 3D canvas/CSS transforms. |
| **Client NDA Tokenization** | Cloud encryption / HSM | Cloud encryption still transfers raw ciphertext off-device; on-device tokenization guarantees data never leaves localhost. |
| **Mechanical 3D Card Physics** | Flat CSS transitions | Tactile, video-game grade feedback makes tax bookkeeping engaging, tactile, and immediately understandable. |
| **Dual Engine Parity** | Ollama-only requirement | Deterministic parser fallback ensures tests, CI/CD, and lightweight browsers run 100% without local GPU setup. |

---

## 4. IRS Schedule C Mapping Reference

```
IRS Form 1040 Schedule C (Profit or Loss from Business)
├── Line 11: Contract Labor (Independent contractors, security auditors) -> 100%
├── Line 18: Office Expenses & Software (SaaS, cloud droplets, APIs) -> 100%
├── Line 20b: Rent or Lease (Other business property, coworking desks) -> 100%
├── Line 24a: Travel (Airfare, lodging, local business transit, rideshare) -> 100%
├── Line 24b: Deductible Meals (50% statutory cap under IRC § 274(n)) -> 50%
├── Line 25: Utilities (Dedicated fiber internet, business communications) -> 100%
├── Line 27a: Other Expenses (Technical books, courses, professional education) -> 100%
└── Section 179 Safe Harbor: Qualifying computer equipment under $2,500 -> 100%
```

---

## 5. DEV Challenge Submission & Community Details

- **Article Title:** GhostLedger: The Sovereign Financial Machine — Why Our AI Bookkeeper Math Only Works Because Gemma Runs Air-Gapped
- **DEV Draft ID:** `4873267`
- **DEV Post URL:** `https://dev.to/polymath_arnav/ghostledger-the-sovereign-financial-machine-why-our-ai-bookkeeper-math-only-works-because-gemma-n9e-temp-slug-6508792`
- **Author Profile:** Arnav Patel (`@polymath_arnav` on DEV / `@XiaoArnav` on GitHub)
- **Challenge:** DEV Open-Source AI Challenge (Week 2: Side Hustle)
- **Required Tags:** `#devchallenge`, `#gemma`, `#opensource`, `#hacktoberfest`
- **Hacktoberfest Stickers & Completionist++:**
  - Participating in all 4 weeks of the DEV Hacktoberfest Open-Source AI Challenge qualifies for the **Completionist++** achievement badge.
  - DEV & MLH distribute physical sticker packs and swag to qualifying contributors upon challenge completion.
