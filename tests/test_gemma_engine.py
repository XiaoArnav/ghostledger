"""Tests for Gemma engine parsing."""

import unittest
from privatereceipt.gemma_engine import GemmaEngine
from privatereceipt.models import TaxCategory


class TestGemmaEngine(unittest.TestCase):

    def setUp(self):
        self.engine = GemmaEngine()

    def test_parse_dinner_receipt(self):
        text = """The Blue Fin Bistro
Date: 2026-10-12
TOTAL: $148.20
Note: Dinner with Sarah (Client: Acme) discussing Project Apex under NDA.
"""
        item = self.engine.parse_receipt(text, receipt_id="REC-TEST-1")
        self.assertEqual(item.merchant, "The Blue Fin Bistro")
        self.assertEqual(item.total_amount, 148.20)
        self.assertEqual(item.category, TaxCategory.MEALS_ENTERTAINMENT)
        self.assertEqual(item.deductible_percentage, 0.50)
        self.assertEqual(item.deductible_amount, 74.10)
        self.assertTrue(item.client_confidential)
        self.assertIn("[CONFIDENTIAL_CLIENT_", item.redacted_notes)

    def test_parse_cloud_receipt(self):
        text = """DigitalOcean Holdings
Invoice Date: 2026-10-01
Droplet VPS: $48.00
TOTAL AMOUNT: $48.00
"""
        item = self.engine.parse_receipt(text, receipt_id="REC-TEST-2")
        self.assertEqual(item.total_amount, 48.00)
        self.assertEqual(item.category, TaxCategory.SOFTWARE_SUBSCRIPTIONS)
        self.assertEqual(item.deductible_percentage, 1.00)
        self.assertEqual(item.deductible_amount, 48.00)
        self.assertFalse(item.client_confidential)


if __name__ == "__main__":
    unittest.main()
