# GhostLedger Workspace Rules

> Rule scope: Always active within the `ghostledger` repository.

## 1. Zero Outbound Privacy Invariant
- Never introduce any network call, telemetry, or external API that sends raw receipt text, invoice amounts, or user names off-device.
- All receipt parsing must use local Ollama open weights (`gemma2:2b`, `gemma2:9b`) or the deterministic offline fallback.
- Client NDA names and project codes must be tokenized/redacted before any export is produced.

## 2. IRS Schedule C Mapping Standards
- Meals & Entertainment: Always enforce 50% statutory deduction limit (IRC § 274(n) / Line 24b).
- Software & Cloud Hosting: 100% deduction (IRC § 162 / Line 18).
- Business Travel: 100% deduction (IRC § 162 / Line 24a).
- Office Equipment & Hardware under \$2,500: 100% expensing under Section 179 De Minimis Safe Harbor.
- Business Space & Coworking: 100% deduction (IRC § 162 / Line 20b).
- Utilities & Internet: 100% deduction (Line 25).
- Continuing Technical Education: 100% deduction (Line 27a).
- Contract Labor: 100% deduction (Line 11).

## 3. Frontend 3D Physics Standards
- Keep `transform-style: preserve-3d` and `perspective` on 3D containers.
- Maintain specular glare CSS variables (`--glare-x`, `--glare-y`, `--glare-opacity`).
- Maintain rainbow diffraction CSS variables (`--rot-y`, `--rim-opacity`).
- Ensure all 9 sample receipt fixtures remain in sync between `samples/` and `BUILTIN_SAMPLES` in `public/app.js`.

## 4. Test Verification
- Run `python3 -m unittest discover -s tests` before and after making any code changes.
- All 15 tests must pass without regressions.
