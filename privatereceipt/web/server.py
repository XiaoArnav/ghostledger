"""Zero-dependency local HTTP server for PrivateReceipt dashboard."""

import http.server
import socketserver
import os
import json
import urllib.parse
from typing import Dict, Any

from ..models import ExpenseReport, ReceiptItem, TaxCategory
from ..gemma_engine import GemmaEngine
from ..exporter import ExpenseExporter

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
SAMPLES_DIR = os.path.join(PROJECT_ROOT, "samples")

engine = GemmaEngine()


class PrivateReceiptHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler for local web dashboard and REST API."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        if url.path in ["/", "/index"]:
            self.path = "/index.html"
            return super().do_GET()
        elif url.path == "/api/samples":
            self._handle_get_samples()
        else:
            clean_path = url.path.lstrip("/")
            target_file = os.path.abspath(os.path.join(STATIC_DIR, clean_path))
            if target_file.startswith(os.path.abspath(STATIC_DIR)) and os.path.isfile(target_file):
                self.path = "/" + clean_path
                return super().do_GET()
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

        if url.path == "/api/parse":
            self._handle_parse(payload)
        elif url.path == "/api/export":
            self._handle_export(payload)
        else:
            self.send_error(404, "Unknown API route")

    def _handle_get_samples(self):
        samples: Dict[str, str] = {}
        if os.path.exists(SAMPLES_DIR):
            for fname in sorted(os.listdir(SAMPLES_DIR)):
                if fname.endswith(".txt"):
                    fpath = os.path.join(SAMPLES_DIR, fname)
                    with open(fpath, "r", encoding="utf-8") as f:
                        samples[fname] = f.read()
        self._send_json({"samples": samples})

    def _handle_parse(self, payload: Dict[str, Any]):
        raw_text = payload.get("text", "")
        item_id = payload.get("id", "REC-001")
        if not raw_text.strip():
            self._send_json({"error": "Text is required"}, status=400)
            return

        receipt_item = engine.parse_receipt(raw_text, receipt_id=item_id)
        self._send_json({"receipt": receipt_item.to_dict()})

    def _handle_export(self, payload: Dict[str, Any]):
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
            )
            report.receipts.append(item)

        report.recompute()

        if fmt == "csv":
            content = ExpenseExporter.to_csv(report, redact_confidential=redact)
            mime = "text/csv"
        elif fmt == "quickbooks":
            content = ExpenseExporter.to_quickbooks_csv(report, redact_confidential=redact)
            mime = "text/csv"
        elif fmt == "markdown":
            content = ExpenseExporter.to_markdown(report, redact_confidential=redact)
            mime = "text/markdown"
        else:
            content = ExpenseExporter.to_json(report, redact_confidential=redact)
            mime = "application/json"

        self.send_response(200)
        self.send_header("Content-Type", f"{mime}; charset=utf-8")
        self.send_header("Content-Length", str(len(content.encode("utf-8"))))
        self.end_headers()
        self.wfile.write(content.encode("utf-8"))

    def _send_json(self, data: Dict[str, Any], status: int = 200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def start_server(port: int = 8080):
    handler = PrivateReceiptHandler
    # Allow port reuse immediately
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"🌍 PrivateReceipt Dashboard running at: http://localhost:{port}")
        print("💡 Open this URL in your browser to test and visualize receipts!")
        print("Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
