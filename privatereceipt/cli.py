"""Command-line interface for PrivateReceipt."""

import sys
import os
import argparse
from typing import List
from .models import ExpenseReport, ReceiptItem
from .gemma_engine import GemmaEngine
from .exporter import ExpenseExporter


def print_banner():
    banner = r"""
   ____ _               _   _               _                  
  / ___| |__   ___  ___| |_| |    ___  __ _| | __ _  ___ _ __  
 | |  _| '_ \ / _ \/ __| __| |   / _ \/ _` | |/ _` |/ _ \ '__| 
 | |_| | | | | (_) \__ \ |_| |__|  __/ (_| | | (_| |  __/ |    
  \____|_| |_|\___/|___/\__|_____\___|\__,_|_|\__, |\___|_|    
                                              |___/            
   GhostLedger // 2100 • Zero-Leak Expense Defense • Powered by Gemma
"""
    print(banner)


def run_demo(engine: GemmaEngine, samples_dir: str):
    """Runs a complete demo over bundled sample receipts."""
    print("🚀 Running GhostLedger Demo Pipeline...\n")
    if not os.path.exists(samples_dir):
        print(f"❌ Samples directory not found at: {samples_dir}")
        return

    sample_files = sorted([f for f in os.listdir(samples_dir) if f.endswith(".txt")])
    if not sample_files:
        print(f"❌ No .txt receipt samples found in {samples_dir}")
        return

    report = ExpenseReport(title="Q4 Freelance Expense & Tax Audit")
    for idx, filename in enumerate(sample_files, start=1):
        filepath = os.path.join(samples_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        item = engine.parse_receipt(content, receipt_id=f"REC-{idx:03d}")
        report.receipts.append(item)
        print(f"  ✓ Processed [{item.id}] {item.merchant[:24]:<24} | ${item.total_amount:>8.2f} | {item.category.value}")
        if item.client_confidential:
            print(f"    🔒 [Privacy Shield Triggered] Sensitive client/NDA markers detected and sanitized.")

    report.recompute()

    print("\n" + "=" * 65)
    print(f"📊 SUMMARY: {report.title}")
    print("=" * 65)
    print(f"  Total Gross Spend:              ${report.total_spend:>10.2f}")
    print(f"  Total Tax Deductible Amount:    ${report.total_deductible:>10.2f}")
    print(f"  Estimated Tax Savings (25%):    ${report.estimated_tax_savings:>10.2f}")
    print(f"  Sensitive NDA Receipts Shielded: {report.redacted_items_count:>10d}")
    print("-" * 65)
    print("  Category Breakdown:")
    for cat, total in report.category_summary.items():
        print(f"    • {cat:<32} ${total:>8.2f}")
    print("=" * 65 + "\n")

    # Export demo files
    csv_out = "demo_expenses.csv"
    md_out = "demo_audit_report.md"
    with open(csv_out, "w", encoding="utf-8") as f:
        f.write(ExpenseExporter.to_csv(report, redact_confidential=True))
    with open(md_out, "w", encoding="utf-8") as f:
        f.write(ExpenseExporter.to_markdown(report, redact_confidential=True))

    print(f"💾 Exported sanitized accountant CSV to: {os.path.abspath(csv_out)}")
    print(f"📄 Exported IRS audit report to:          {os.path.abspath(md_out)}")
    print("\n✅ Demo completed successfully!\n")


def main():
    parser = argparse.ArgumentParser(
        prog="privatereceipt",
        description="Zero-leak local receipt and expense intelligence for freelancers, powered by Gemma."
    )
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # Demo command
    demo_parser = subparsers.add_parser("demo", help="Run demo with bundled sample receipts")

    # Process command
    proc_parser = subparsers.add_parser("process", help="Process receipt file(s)")
    proc_parser.add_argument("path", help="Path to receipt text file or folder")
    proc_parser.add_argument("--csv", help="Export path for standard CSV")
    proc_parser.add_argument("--quickbooks", help="Export path for QuickBooks CSV")
    proc_parser.add_argument("--json", help="Export path for JSON output")
    proc_parser.add_argument("--markdown", help="Export path for Markdown report")
    proc_parser.add_argument("--redact", action="store_true", help="Redact client/NDA details in exports")

    # Serve command
    serve_parser = subparsers.add_parser("serve", help="Launch the local web dashboard")
    serve_parser.add_argument("--port", type=int, default=8080, help="Port to serve on (default: 8080)")

    args = parser.parse_args()

    print_banner()

    engine = GemmaEngine()

    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    samples_dir = os.path.join(project_root, "samples")

    if args.command == "demo" or not args.command:
        run_demo(engine, samples_dir)
    elif args.command == "serve":
        from .web.server import start_server
        start_server(port=args.port)
    elif args.command == "process":
        target = args.path
        if not os.path.exists(target):
            print(f"❌ Error: Path does not exist: {target}")
            sys.exit(1)

        files: List[str] = []
        if os.path.isdir(target):
            files = [os.path.join(target, f) for f in os.listdir(target) if f.endswith(".txt")]
        else:
            files = [target]

        report = ExpenseReport(title="Processed Expenses")
        for idx, fpath in enumerate(files, start=1):
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
            item = engine.parse_receipt(content, receipt_id=f"REC-{idx:03d}")
            report.receipts.append(item)
            print(f"  ✓ Processed [{item.id}] {item.merchant} (${item.total_amount:.2f}) -> {item.category.value}")

        report.recompute()
        print(f"\nProcessed {len(report.receipts)} receipts. Total deductible: ${report.total_deductible:.2f}")

        if args.csv:
            with open(args.csv, "w", encoding="utf-8") as f:
                f.write(ExpenseExporter.to_csv(report, redact_confidential=args.redact))
            print(f"Exported CSV to {args.csv}")

        if args.quickbooks:
            with open(args.quickbooks, "w", encoding="utf-8") as f:
                f.write(ExpenseExporter.to_quickbooks_csv(report, redact_confidential=args.redact))
            print(f"Exported QuickBooks CSV to {args.quickbooks}")

        if args.json:
            with open(args.json, "w", encoding="utf-8") as f:
                f.write(ExpenseExporter.to_json(report, redact_confidential=args.redact))
            print(f"Exported JSON to {args.json}")

        if args.markdown:
            with open(args.markdown, "w", encoding="utf-8") as f:
                f.write(ExpenseExporter.to_markdown(report, redact_confidential=args.redact))
            print(f"Exported Markdown to {args.markdown}")


if __name__ == "__main__":
    main()
