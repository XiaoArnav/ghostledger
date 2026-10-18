"""Tests for tax categorizer."""

import unittest
from privatereceipt.models import TaxCategory
from privatereceipt.categorizer import TaxCategorizer


class TestTaxCategorizer(unittest.TestCase):

    def test_meal_classification(self):
        category, rate, rationale = TaxCategorizer.classify_text("Business dinner at The Capital Grille with client")
        self.assertEqual(category, TaxCategory.MEALS_ENTERTAINMENT)
        self.assertEqual(rate, 0.50)
        self.assertIn("50% deductible", rationale)

    def test_software_classification(self):
        category, rate, rationale = TaxCategorizer.classify_text("DigitalOcean cloud server invoice")
        self.assertEqual(category, TaxCategory.SOFTWARE_SUBSCRIPTIONS)
        self.assertEqual(rate, 1.00)
        self.assertIn("100% deductible", rationale)

    def test_travel_classification(self):
        category, rate, rationale = TaxCategorizer.classify_text("Delta Air Lines flight ticket to conference")
        self.assertEqual(category, TaxCategory.TRAVEL_LODGING)
        self.assertEqual(rate, 1.00)

    def test_office_equipment_classification(self):
        category, rate, rationale = TaxCategorizer.classify_text("Apple Store monitor purchase")
        self.assertEqual(category, TaxCategory.OFFICE_SUPPLIES)
        self.assertEqual(rate, 1.00)
        self.assertIn("Section 179", rationale)


if __name__ == "__main__":
    unittest.main()
