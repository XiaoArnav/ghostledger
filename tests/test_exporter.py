"""Tests for expense exporter."""

import unittest
from privatereceipt.models import ExpenseReport, ReceiptItem, TaxCategory
from privatereceipt.exporter import ExpenseExporter


class TestExpenseExporter(unittest.TestCase):

    def setUp(self):
        self.report = ExpenseReport(title="Test Report")
        item1 = ReceiptItem(
            id="REC-001",
            merchant="DigitalOcean",
            date="2026-10-01",
            total_amount=90.50,
            category=TaxCategory.SOFTWARE_SUBSCRIPTIONS,
            deductible_percentage=1.00,
            deductible_amount=90.50,
            audit_notes="Cloud server hosting",
            client_confidential=False,
        )
        item2 = ReceiptItem(
            id="REC-002",
            merchant="Bistro Cafe",
            date="2026-10-02",
            total_amount=100.00,
            category=TaxCategory.MEALS_ENTERTAINMENT,
            deductible_percentage=0.50,
            deductible_amount=50.00,
            audit_notes="Client dinner",
            client_confidential=True,
            redacted_merchant="[CONFIDENTIAL_CLIENT_1]",
            redacted_notes="[REDACTED_NDA_INFO]",
        )
        self.report.receipts.extend([item1, item2])
        self.report.recompute()

    def test_csv_export(self):
        csv_content = ExpenseExporter.to_csv(self.report, redact_confidential=True)
        self.assertIn("DigitalOcean", csv_content)
        self.assertIn("[CONFIDENTIAL_CLIENT_1]", csv_content)
        self.assertNotIn("Bistro Cafe", csv_content)

    def test_quickbooks_export(self):
        qb_content = ExpenseExporter.to_quickbooks_csv(self.report, redact_confidential=False)
        self.assertIn("-90.50", qb_content)
        self.assertIn("-100.00", qb_content)

    def test_markdown_export(self):
        md_content = ExpenseExporter.to_markdown(self.report)
        self.assertIn("Expense & Tax Audit Report", md_content)
        self.assertIn("$190.50", md_content)
        self.assertIn("$140.50", md_content)


if __name__ == "__main__":
    unittest.main()
