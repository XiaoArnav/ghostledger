"""Export formats for PrivateReceipt: Standard CSV, QuickBooks CSV, JSON, and Markdown."""

import csv
import json
from typing import Optional
from .models import ExpenseReport


class ExpenseExporter:
    """Handles data transformation and export for accounting software."""

    @staticmethod
    def to_csv(report: ExpenseReport, redact_confidential: bool = False) -> str:
        """Generates standard CSV content."""
        import io
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "ID", "Date", "Merchant", "Category", "Total Amount", 
            "Currency", "Deductible %", "Deductible Amount", 
            "Client Confidential", "Audit Rationale"
        ])

        for r in report.receipts:
            merchant = (r.redacted_merchant or r.merchant) if redact_confidential else r.merchant
            notes = (r.redacted_notes or r.audit_notes) if redact_confidential else r.audit_notes
            writer.writerow([
                r.id,
                r.date,
                merchant,
                r.category.value,
                f"{r.total_amount:.2f}",
                r.currency,
                f"{int(r.deductible_percentage * 100)}%",
                f"{r.deductible_amount:.2f}",
                "YES" if r.client_confidential else "NO",
                notes,
            ])

        return output.getvalue()

    @staticmethod
    def to_quickbooks_csv(report: ExpenseReport, redact_confidential: bool = False) -> str:
        """Generates QuickBooks / Xero compatible banking feed CSV."""
        import io
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Date", "Description", "Amount", "Category", "Notes"])

        for r in report.receipts:
            merchant = (r.redacted_merchant or r.merchant) if redact_confidential else r.merchant
            notes = (r.redacted_notes or r.audit_notes) if redact_confidential else r.audit_notes
            writer.writerow([
                r.date,
                merchant,
                f"-{r.total_amount:.2f}",  # expenses are debits in bank feeds
                r.category.value,
                notes,
            ])

        return output.getvalue()

    @staticmethod
    def to_tsv(report: ExpenseReport, redact_confidential: bool = False) -> str:
        """Generates tab-separated values (TSV) stream ideal for Unix tools (awk, cut, join)."""
        import io
        output = io.StringIO()
        writer = csv.writer(output, delimiter="\t")
        writer.writerow([
            "ID", "Date", "Merchant", "Category", "Total", 
            "Currency", "Deductible_Pct", "Deductible_Amount", 
            "Confidential", "Audit_Rationale"
        ])

        for r in report.receipts:
            merchant = (r.redacted_merchant or r.merchant) if redact_confidential else r.merchant
            notes = (r.redacted_notes or r.audit_notes) if redact_confidential else r.audit_notes
            clean_notes = (notes or "").replace("\t", " ").replace("\n", " ")
            writer.writerow([
                r.id,
                r.date,
                merchant,
                r.category.value,
                f"{r.total_amount:.2f}",
                r.currency,
                f"{int(r.deductible_percentage * 100)}%",
                f"{r.deductible_amount:.2f}",
                "YES" if r.client_confidential else "NO",
                clean_notes,
            ])

        return output.getvalue()

    @staticmethod
    def to_json(report: ExpenseReport, redact_confidential: bool = False, indent: int = 2) -> str:
        """Generates JSON content."""
        data = report.to_dict()
        if redact_confidential:
            for item in data["receipts"]:
                if item.get("client_confidential"):
                    item["merchant"] = item.get("redacted_merchant") or item["merchant"]
                    item["audit_notes"] = item.get("redacted_notes") or item["audit_notes"]
                    item["original_raw_text"] = item.get("redacted_raw_text") or item["original_raw_text"]
        return json.dumps(data, indent=indent)

    @staticmethod
    def to_markdown(report: ExpenseReport, redact_confidential: bool = False) -> str:
        """Generates audit-ready Markdown expense report."""
        lines = [
            f"# 📊 Expense & Tax Audit Report: {report.title}",
            "",
            f"**Total Gross Spend:** \${report.total_spend:.2f}  ",
            f"**Tax Deductible Portion:** \${report.total_deductible:.2f}  ",
            f"**Estimated Tax Savings (at 25% bracket):** \${report.estimated_tax_savings:.2f}  ",
            f"**Confidential / NDA Items Sanitized:** {report.redacted_items_count}  ",
            "",
            "## Category Breakdown",
            "",
            "| Tax Category | Total Spend |",
            "| :--- | :--- |",
        ]
        for cat, total in report.category_summary.items():
            lines.append(f"| {cat} | \${total:.2f} |")

        lines.extend([
            "",
            "## Itemized Deduction Schedule",
            "",
            "| Date | Merchant | Category | Total | Deductible | NDA Shield | Audit Rationale |",
            "| :--- | :--- | :--- | :--- | :--- | :---: | :--- |",
        ])

        for r in report.receipts:
            merchant = (r.redacted_merchant or r.merchant) if redact_confidential else r.merchant
            notes = (r.redacted_notes or r.audit_notes) if redact_confidential else r.audit_notes
            shield = "🔒 Sanitized" if r.client_confidential else "Public"
            lines.append(
                f"| {r.date} | {merchant} | {r.category.value} | \${r.total_amount:.2f} | "
                f"\${r.deductible_amount:.2f} ({int(r.deductible_percentage*100)}%) | {shield} | {notes} |"
            )

        return "\n".join(lines)
