"""Vercel Serverless Function: POST /api/export"""

import sys
import os
import json
from http.server import BaseHTTPRequestHandler

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from privatereceipt.models import ExpenseReport, ReceiptItem, TaxCategory
from privatereceipt.exporter import ExpenseExporter


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        content_len = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_len).decode("utf-8")
        try:
            payload = json.loads(post_body) if post_body else {}
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON")
            return

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
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)
