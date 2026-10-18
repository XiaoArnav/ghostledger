"""Core data models for PrivateReceipt."""

from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict, Any
from enum import Enum


class TaxCategory(str, Enum):
    MEALS_ENTERTAINMENT = "Meals & Entertainment"
    TRAVEL_LODGING = "Travel & Lodging"
    SOFTWARE_SUBSCRIPTIONS = "Software & Subscriptions"
    OFFICE_SUPPLIES = "Office Supplies & Equipment"
    PROFESSIONAL_SERVICES = "Professional & Legal Services"
    ADVERTISING_MARKETING = "Advertising & Marketing"
    EDUCATION_CONFERENCES = "Education & Conferences"
    UTILITIES_COMMUNICATION = "Utilities & Internet"
    OTHER_BUSINESS = "Other Business Expense"


@dataclass
class LineItem:
    description: str
    amount: float
    tax_category: TaxCategory
    deductibility_percentage: float = 1.0  # e.g., 0.5 for Meals, 1.0 for Software


@dataclass
class ReceiptItem:
    id: str
    merchant: str
    date: str
    total_amount: float
    currency: str = "USD"
    tax_amount: float = 0.0
    category: TaxCategory = TaxCategory.OTHER_BUSINESS
    deductible_percentage: float = 1.0
    deductible_amount: float = 0.0
    audit_notes: str = ""
    client_confidential: bool = False
    redacted_merchant: Optional[str] = None
    redacted_notes: Optional[str] = None
    original_raw_text: str = ""
    redacted_raw_text: str = ""
    line_items: List[LineItem] = field(default_factory=list)
    confidence_score: float = 0.95

    def calculate_deductible(self) -> float:
        self.deductible_amount = round(self.total_amount * self.deductible_percentage, 2)
        return self.deductible_amount

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["category"] = self.category.value
        data["line_items"] = [
            {
                "description": item.description,
                "amount": item.amount,
                "tax_category": item.tax_category.value,
                "deductibility_percentage": item.deductibility_percentage,
            }
            for item in self.line_items
        ]
        return data


@dataclass
class ExpenseReport:
    title: str
    receipts: List[ReceiptItem] = field(default_factory=list)
    total_spend: float = 0.0
    total_deductible: float = 0.0
    estimated_tax_savings: float = 0.0  # based on default marginal bracket (e.g., 25%)
    redacted_items_count: int = 0
    category_summary: Dict[str, float] = field(default_factory=dict)

    def recompute(self, tax_rate: float = 0.25) -> None:
        self.total_spend = round(sum(r.total_amount for r in self.receipts), 2)
        self.total_deductible = round(sum(r.calculate_deductible() for r in self.receipts), 2)
        self.estimated_tax_savings = round(self.total_deductible * tax_rate, 2)
        self.redacted_items_count = sum(1 for r in self.receipts if r.client_confidential)
        
        summary: Dict[str, float] = {}
        for r in self.receipts:
            cat_name = r.category.value
            summary[cat_name] = round(summary.get(cat_name, 0.0) + r.total_amount, 2)
        self.category_summary = summary

    def to_dict(self) -> Dict[str, Any]:
        return {
            "title": self.title,
            "total_spend": self.total_spend,
            "total_deductible": self.total_deductible,
            "estimated_tax_savings": self.estimated_tax_savings,
            "redacted_items_count": self.redacted_items_count,
            "category_summary": self.category_summary,
            "receipts": [r.to_dict() for r in self.receipts],
        }
