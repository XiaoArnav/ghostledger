# Security Policy 🛡️

GhostLedger is architected from first principles around **sovereign data privacy, zero-leak processing, and air-gapped security**.

## The Sovereign Threat Model

1. **Zero External Data Transmission:** GhostLedger does not send receipts, extracted names, line items, or metadata to external servers, cloud AI providers, or third-party telemetry endpoints.
2. **On-Device Local Inference:** When configured with Ollama or local open-weight models, all token generation occurs in local memory on your CPU/GPU.
3. **Irreversible NDA Tokenization:** Client non-disclosure agreement markers, project codenames, and credit card numbers are sanitized using deterministic regex and contextual entity masks before any export is written to disk or clipboard.

## Reporting a Vulnerability

If you discover a security vulnerability, privacy leak, or flaw in the privacy sanitization filters:
1. Please do **not** open a public issue.
2. Report the vulnerability privately via GitHub Security Advisories at [github.com/XiaoArnav/ghostledger/security/advisories](https://github.com/XiaoArnav/ghostledger/security/advisories).
3. Include details of the finding, reproduction steps, and potential privacy impact.

We will acknowledge receipt within 24 hours and collaborate on a prompt fix and patch release.
