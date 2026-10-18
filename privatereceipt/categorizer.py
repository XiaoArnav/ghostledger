"""Tax categorization and IRS Schedule C deductibility engine."""

import re
from typing import Tuple, Dict, Any
from .models import TaxCategory


class TaxCategorizer:
    """Classifies business expenses into Schedule C tax categories with audit rationales."""

    # Keyword rules for fast heuristic classification and fallback
    RULES = [
        (
            re.compile(r'\b(restaurant|cafe|bistro|diner|dinner|lunch|breakfast|coffee|starbucks|grill|bar|food|catering|meal)\b', re.IGNORECASE),
            TaxCategory.MEALS_ENTERTAINMENT,
            0.50,
            "IRS Schedule C Line 24b: Business meal with client/prospect or during business travel (50% deductible). Requires documenting business purpose.",
        ),
        (
            re.compile(r'\b(airline|flight|delta|united|american air|southwest|hotel|airbnb|marriott|hilton|uber|lyft|taxi|train|amtrak|car rental|hertz|avis)\b', re.IGNORECASE),
            TaxCategory.TRAVEL_LODGING,
            1.00,
            "IRS Schedule C Line 24a: Business travel away from tax home (100% deductible for transportation and lodging).",
        ),
        (
            re.compile(r'\b(github|gitlab|digitalocean|aws|amazon web services|gcp|google cloud|azure|vercel|render|openai|anthropic|cloudflare|slack|figma|notion|jetbrains|domain|godaddy|namecheap|docker|datadog|sentry|mongodb)\b', re.IGNORECASE),
            TaxCategory.SOFTWARE_SUBSCRIPTIONS,
            1.00,
            "IRS Schedule C Line 18 / Other Expenses: Ordinary and necessary cloud infrastructure, developer tooling, and SaaS software subscriptions (100% deductible).",
        ),
        (
            re.compile(r'\b(apple store|best buy|micro center|dell|lenovo|laptop|monitor|keyboard|mouse|cables|adapter|desk|chair|stationery|staples|paper|office depot)\b', re.IGNORECASE),
            TaxCategory.OFFICE_SUPPLIES,
            1.00,
            "IRS Schedule C Line 18 / Section 179: Office supplies and computer equipment under de minimis safe harbor ($2,500 threshold, 100% deductible in year acquired).",
        ),
        (
            re.compile(r'\b(legal|attorney|lawyer|cpa|accounting|tax prep|consultant|notary|trademark|patent|contractor)\b', re.IGNORECASE),
            TaxCategory.PROFESSIONAL_SERVICES,
            1.00,
            "IRS Schedule C Line 17: Legal and professional services directly related to freelance/business operations (100% deductible).",
        ),
        (
            re.compile(r'\b(google ads|facebook ads|meta ads|linkedin ads|twitter ads|adwords|sponsorship|billboard|flyers|promo|branding|marketing|seo)\b', re.IGNORECASE),
            TaxCategory.ADVERTISING_MARKETING,
            1.00,
            "IRS Schedule C Line 8: Advertising and promotional expenses to acquire customers or establish brand presence (100% deductible).",
        ),
        (
            re.compile(r'\b(conference|summit|symposium|ticket|oreilly|course|udemy|coursera|workshop|tutorial|certification|book)\b', re.IGNORECASE),
            TaxCategory.EDUCATION_CONFERENCES,
            1.00,
            "IRS Schedule C Other Expenses: Professional education and industry conferences to maintain or improve existing professional skills (100% deductible).",
        ),
        (
            re.compile(r'\b(verizon|at&t|t-mobile|comcast|spectrum|internet|fiber|cellular|phone bill)\b', re.IGNORECASE),
            TaxCategory.UTILITIES_COMMUNICATION,
            1.00,
            "IRS Schedule C Line 25: Utilities and communications for business operations (deductible to extent of documented business usage).",
        ),
    ]

    @classmethod
    def classify_text(cls, text: str) -> Tuple[TaxCategory, float, str]:
        """Classifies text into a TaxCategory, deductibility percentage, and IRS rationale."""
        for pattern, category, rate, rationale in cls.RULES:
            if pattern.search(text):
                return category, rate, rationale

        return (
            TaxCategory.OTHER_BUSINESS,
            1.00,
            "IRS Schedule C Line 27a / Other Expenses: Ordinary and necessary miscellaneous business expense (100% deductible if substantiated).",
        )
