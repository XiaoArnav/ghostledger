"""Privacy and NDA redaction engine for PrivateReceipt.

Ensures client names, project codenames, attendee names, and PII
are sanitized before sharing with accountants, tax authorities, or cloud backups.
"""

import re
from typing import Tuple, List, Dict, Set


class PrivacyRedactor:
    """Scans for and anonymizes confidential business, client, and personal markers."""

    # Patterns for sensitive entities
    CARD_PATTERN = re.compile(r'\b(?:\d[ -]*?){13,16}\b')
    SSN_EIN_PATTERN = re.compile(r'\b\d{2,3}[-]?\d{2}[-]?\d{4}\b')
    EMAIL_PATTERN = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
    PHONE_PATTERN = re.compile(r'\b(?:\+?1[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b')
    
    # Common markers indicating NDA or sensitive clients
    NDA_MARKERS = [
        re.compile(r'\b(?:client|customer|account)\s*:\s*([A-Za-z0-9\s&\'\"-]+?)(?=\s+(?:regarding|re|discussing|for|about|under|project)|[.,\n;]|$)', re.IGNORECASE),
        re.compile(r'\b(?:project|code-?name)\s+([A-Za-z0-9_-]+)', re.IGNORECASE),
        re.compile(r'\bunder\s+NDA\b', re.IGNORECASE),
        re.compile(r'\bconfidential\b', re.IGNORECASE),
        re.compile(r'\bproprietary\b', re.IGNORECASE),
        re.compile(r'\battendees?\s*:\s*([A-Za-z0-9\s&\'\"-]+?)(?=[.,\n;]|$)', re.IGNORECASE),
        re.compile(r'\bdinner with\s+([A-Za-z0-9\s&\'\"-]+?)(?=\s+(?:re|discussing|about|under|client|project)|[.,\n;]|$)', re.IGNORECASE),
    ]

    def __init__(self):
        self.known_client_tokens: Dict[str, str] = {}
        self._client_counter = 1

    def detect_confidential(self, text: str) -> Tuple[bool, List[str]]:
        """Detect whether a receipt snippet contains sensitive or NDA markers."""
        reasons: List[str] = []
        
        if self.CARD_PATTERN.search(text):
            reasons.append("Detected possible credit/debit card number")
        if self.SSN_EIN_PATTERN.search(text):
            reasons.append("Detected SSN/EIN format")
        if self.EMAIL_PATTERN.search(text):
            reasons.append("Detected personal email address")
        if self.PHONE_PATTERN.search(text):
            reasons.append("Detected phone number")
            
        for pattern in self.NDA_MARKERS:
            match = pattern.search(text)
            if match:
                snippet = match.group(0).strip()
                reasons.append(f"Detected NDA/Client marker: '{snippet}'")
                
        return len(reasons) > 0, reasons

    def redact_text(self, text: str) -> Tuple[str, bool]:
        """Redacts sensitive PII, client names, and project markers from text."""
        sanitized = text
        was_redacted = False

        # Redact cards (keep last 4)
        def _mask_card(m):
            digits = re.sub(r'\D', '', m.group(0))
            if len(digits) >= 12:
                return f"[CARD_ENDING_{digits[-4:]}]"
            return "[CARD_MASKED]"
        
        if self.CARD_PATTERN.search(sanitized):
            sanitized = self.CARD_PATTERN.sub(_mask_card, sanitized)
            was_redacted = True

        # Redact emails
        if self.EMAIL_PATTERN.search(sanitized):
            sanitized = self.EMAIL_PATTERN.sub("[REDACTED_EMAIL]", sanitized)
            was_redacted = True

        # Redact phone numbers
        if self.PHONE_PATTERN.search(sanitized):
            sanitized = self.PHONE_PATTERN.sub("[REDACTED_PHONE]", sanitized)
            was_redacted = True

        # Redact project and client names
        for pattern in self.NDA_MARKERS:
            def _mask_marker(m):
                full_match = m.group(0)
                if m.groups() and m.group(1):
                    val = m.group(1).strip()
                    if val not in self.known_client_tokens:
                        self.known_client_tokens[val] = f"[CONFIDENTIAL_CLIENT_{self._client_counter}]"
                        self._client_counter += 1
                    placeholder = self.known_client_tokens[val]
                    return full_match.replace(val, placeholder)
                return "[REDACTED_NDA_INFO]"

            if pattern.search(sanitized):
                sanitized = pattern.sub(_mask_marker, sanitized)
                was_redacted = True

        return sanitized, was_redacted
