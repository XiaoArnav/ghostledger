"""Tests for privacy and NDA redactor."""

import unittest
from privatereceipt.privacy_redactor import PrivacyRedactor


class TestPrivacyRedactor(unittest.TestCase):

    def setUp(self):
        self.redactor = PrivacyRedactor()

    def test_detect_confidential_client(self):
        text = "Meeting at cafe. Client: Acme Health Systems discussing Project Titan under NDA."
        is_conf, reasons = self.redactor.detect_confidential(text)
        self.assertTrue(is_conf)
        self.assertTrue(any("Client:" in r or "NDA" in r or "Project" in r for r in reasons))

    def test_redact_client_and_project(self):
        text = "Dinner with Sarah. Client: Goldman Sachs regarding Project Falcon."
        sanitized, was_redacted = self.redactor.redact_text(text)
        self.assertTrue(was_redacted)
        self.assertNotIn("Goldman Sachs", sanitized)
        self.assertNotIn("Falcon", sanitized)
        self.assertIn("[CONFIDENTIAL_CLIENT_", sanitized)

    def test_mask_card_number(self):
        text = "Payment via card 4111-2222-3333-4444 approved."
        sanitized, was_redacted = self.redactor.redact_text(text)
        self.assertTrue(was_redacted)
        self.assertNotIn("4111", sanitized)
        self.assertIn("[CARD_ENDING_4444]", sanitized)


if __name__ == "__main__":
    unittest.main()
