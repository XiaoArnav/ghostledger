# Contributing to GhostLedger 👻

Thank you for your interest in contributing to GhostLedger! We welcome contributions from developers, accountants, tax specialists, and open-source AI enthusiasts.

GhostLedger is an open-source, air-gapped financial intelligence tool submitted to **[Hacktoberfest 2026: Week 2 (Side Hustle)](https://dev.to/challenges/hacktoberfest-week2-2026-10-12)**.

---

## 🏛️ Core Architectural Principles

1. **Air-Gapped & Zero-Leak:** No user data or receipts should ever be transmitted to external third-party cloud servers or proprietary LLM APIs.
2. **Zero Runtime Dependencies:** The Python backend core must run on the Python standard library (Python 3.9+) without requiring mandatory external pip packages.
3. **Open-Weight AI First:** All AI capabilities are powered by open-weight models (Google's Gemma 2 family via Ollama or llama.cpp) with deterministic heuristic fallbacks.
4. **Unix Philosophy:** Support standard input (`stdin`), standard output (`stdout`), silent mode (`-q`), and composable output streams (`json`, `csv`, `tsv`).

---

## 🛠️ Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/XiaoArnav/ghostledger.git
cd ghostledger
```

### 2. Verify Python Environment
Ensure Python 3.9 or higher is installed:
```bash
python3 --version
```

### 3. Run the Test Suite
Before making any changes, ensure all tests pass:
```bash
python3 -m unittest discover -s tests
```

### 4. Run the Local Web Server
```bash
python3 -m privatereceipt.cli serve --port 8765
```
Open `http://localhost:8765` in your browser.

---

## 💡 Ways to Contribute

- **IRS Schedule C Rules:** Add jurisdiction-specific or updated tax deduction rules in `privatereceipt/categorizer.py`.
- **Gemma 2 Prompts:** Improve zero-shot and few-shot receipt extraction prompts in `privatereceipt/gemma_engine.py`.
- **Privacy Redactor Patterns:** Extend client confidential token filters, IBAN/BIC formats, and NDA markers in `privatereceipt/privacy_redactor.py`.
- **Export Formats:** Add support for additional accounting suites (Wave, Sage, FreeAgent) in `privatereceipt/exporter.py`.
- **Sample Receipts:** Add realistic edge cases and vendor invoice formats to `samples/`.

---

## 🧪 Testing Guidelines

Whenever you add or modify functionality:
1. Add corresponding test cases in `tests/`.
2. Ensure 100% of existing tests continue to pass:
   ```bash
   python3 -m unittest discover -s tests
   ```
3. Test the CLI pipeline end-to-end:
   ```bash
   cat samples/saas_subscription.txt | python3 -m privatereceipt.cli -q -f json
   ```

---

## 📄 Pull Request Process

1. Fork the repository and create your branch from `main`.
2. Commit your changes with clear, semantic commit messages (e.g. `feat: add Section 179 depreciation schedule calculator`).
3. Push to your fork and submit a Pull Request against `main`.
4. Ensure all GitHub Actions CI checks pass.

Thank you for building sovereign, private financial tools! 🚀
