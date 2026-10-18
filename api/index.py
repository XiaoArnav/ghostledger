"""Vercel Serverless Function entrypoint for GhostLedger API."""

import sys
import os
import json
import urllib.parse
from http.server import BaseHTTPRequestHandler

# Ensure repository root is on sys.path
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from privatereceipt.gemma_engine import GemmaEngine
from privatereceipt.models import ExpenseReport, ReceiptItem, TaxCategory
from privatereceipt.exporter import ExpenseExporter

engine = GemmaEngine()
SAMPLES_DIR = os.path.join(REPO_ROOT, "samples")


class handler(BaseHTTPRequestHandler):
    """Vercel Python serverless request handler."""

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        if url.path.rstrip("/") in ["/api/samples", "/samples"]:
            samples = {}
            if os.path.exists(SAMPLES_DIR):
                for fname in sorted(os.listdir(SAMPLES_DIR)):
                    if fname.endswith(".txt"):
                        with open(os.path.join(SAMPLES_DIR, fname), "r", encoding="utf-8") as f:
                            samples[fname] = f.read()
            self._send_json({"samples": samples})
        else:
            self.send_error(404, "Not Found")

    def do_POST(self):
        url = urllib.parse.urlparse(self.path)
        content_len = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_len).decode("utf-8")

        try:
            payload = json.loads(post_body) if post_body else {}
        except json.JSONDecodeError:
            self._send_json({"error": "Invalid JSON"}, status=400)
            return

        route = url.path.rstrip("/")
        if route in ["/api/parse", "/parse"]:
            raw_text = payload.get("text", "")
            item_id = payload.get("id", "REC-001")
            if not raw_text.strip():
                self._send_json({"error": "Text is required"}, status=400)
                return

            receipt_item = engine.parse_receipt(raw_text, receipt_id=item_id)
            self._send_json({"receipt": receipt_item.to_dict()})

        elif route in ["/api/export", "/export"]:
            raw_receipts = payload.get("receipts", [])
            fmt = payload.get("format", "csv")
            redact = payload.get("redact", True)

            report = ExpenseReport(title="Freelance Expense Report")
            for r_dict in raw_receipts:
                try:
                    category = TaxCategory(r_dict.get("category", TaxCategory.OTHER_BUSINESS.value))
                except ValueError:
                    category = TaxCategory.OTHER_BUSINESS

                item = ReceiptItem(
                    id=r_dict.get("id", "REC-000"),
                    merchant=r_dict.get("merchant", "Vendor"),
                    date=r_dict.get("date", "2026-10-18"),
                    total_amount=float(r_dict.get("total_amount", 0.0)),
                    currency=r_dict.get("currency", "USD"),
                    tax_amount=float(r_dict.get("tax_amount", 0.0)),
                    category=category,
                    deductible_percentage=float(r_dict.get("deductible_percentage", 1.0)),
                    deductible_amount=float(r_dict.get("deductible_amount", 0.0)),
                    audit_notes=r_dict.get("audit_notes", ""),
                    client_confidential=bool(r_dict.get("client_confidential", False)),
                    redacted_merchant=r_dict.get("redacted_merchant"),
                    redacted_notes=r_dict.get("redacted_notes"),
                    redacted_raw_text=r_dict.get("redacted_raw_text"),
                )
                report.receipts.append(item)

            report.recompute()

            if fmt == "csv":
                content = ExpenseExporter.to_csv(report, redact_confidential=redact)
                mime = "text/csv"
            elif fmt == "quickbooks":
                content = ExpenseExporter.to_quickbooks_csv(report, redact_confidential=redact)
                mime = "text/csv"
            elif fmt == "tsv":
                content = ExpenseExporter.to_tsv(report, redact_confidential=redact)
                mime = "text/tab-separated-values"
            elif fmt == "markdown":
                content = ExpenseExporter.to_markdown(report, redact_confidential=redact)
                mime = "text/markdown"
            elif fmt == "json":
                content = ExpenseExporter.to_json(report, redact_confidential=redact)
                mime = "application/json"
            else:
                content = ExpenseExporter.to_csv(report, redact_confidential=redact)
                mime = "text/csv"

            encoded = content.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", f"{mime}; charset=utf-8")
            self.send_header("Content-Length", str(len(encoded)))
            self.end_headers()
            self.wfile.write(encoded)
        else:
            self.send_error(404, "Unknown API route")

    def _send_json(self, data: dict, status: int = 200):
        encoded = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)
