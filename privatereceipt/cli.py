"""Command-line interface for GhostLedger (privatereceipt).

Adheres to Unix philosophy:
- Streamable: reads from file arguments, directory paths, or stdin (-)
- Composable: pure structured data on stdout, human logs/diagnostics on stderr
- Pipeable: directly composable with jq, grep, awk, cut, column, and xargs
- Quiet mode: (-q/--quiet) completely silences banners and non-data output
- Formats: (-f/--format) json, csv, tsv, markdown, quickbooks, text
"""

import sys
import os
import argparse
from typing import List, Tuple
from .models import ExpenseReport, ReceiptItem
from .gemma_engine import GemmaEngine
from .exporter import ExpenseExporter


def print_banner(file=sys.stderr):
    """Prints ASCII banner to stderr so stdout remains clean for piping."""
    banner = r"""   ____ _               _   _               _                  
  / ___| |__   ___  ___| |_| |    ___  __ _| | __ _  ___ _ __  
 | |  _| '_ \ / _ \/ __| __| |   / _ \/ _` | |/ _` |/ _ \ '__| 
 | |_| | | | | (_) \__ \ |_| |__|  __/ (_| | | (_| |  __/ |    
  \____|_| |_|\___/|___/\__|_____\___|\__,_|_|\__, |\___|_|    
                                              |___/            
   GhostLedger // 2100 • Zero-Leak Expense Defense • Powered by Gemma"""
    file.write(banner + "\n\n")
    file.flush()


def run_demo(engine: GemmaEngine, samples_dir: str, quiet: bool = False):
    """Runs a complete demo over bundled sample receipts."""
    log = (lambda *a, **kw: None) if quiet else (lambda *a, **kw: print(*a, file=sys.stderr, **kw))

    log("🚀 Running GhostLedger Demo Pipeline...\n")
    if not os.path.exists(samples_dir):
        sys.stderr.write(f"❌ Samples directory not found at: {samples_dir}\n")
        return

    sample_files = sorted([f for f in os.listdir(samples_dir) if f.endswith(".txt")])
    if not sample_files:
        sys.stderr.write(f"❌ No .txt receipt samples found in {samples_dir}\n")
        return

    report = ExpenseReport(title="Q4 Freelance Expense & Tax Audit")
    for idx, filename in enumerate(sample_files, start=1):
        filepath = os.path.join(samples_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        item = engine.parse_receipt(content, receipt_id=f"REC-{idx:03d}")
        report.receipts.append(item)
        log(f"  ✓ Processed [{item.id}] {item.merchant[:24]:<24} | ${item.total_amount:>8.2f} | {item.category.value}")
        if item.client_confidential:
            log(f"    🔒 [Privacy Shield Triggered] Sensitive client/NDA markers detected and sanitized.")

    report.recompute()

    summary_text = f"""=================================================================
📊 SUMMARY: {report.title}
=================================================================
  Total Gross Spend:              ${report.total_spend:>10.2f}
  Total Tax Deductible Amount:    ${report.total_deductible:>10.2f}
  Estimated Tax Savings (25%):    ${report.estimated_tax_savings:>10.2f}
  Sensitive NDA Receipts Shielded: {report.redacted_items_count:>10d}
-----------------------------------------------------------------
  Category Breakdown:"""
    log(summary_text)
    for cat, total in report.category_summary.items():
        log(f"    • {cat:<32} ${total:>8.2f}")
    log("=================================================================\n")

    # Export demo files
    csv_out = "demo_expenses.csv"
    md_out = "demo_audit_report.md"
    with open(csv_out, "w", encoding="utf-8") as f:
        f.write(ExpenseExporter.to_csv(report, redact_confidential=True))
    with open(md_out, "w", encoding="utf-8") as f:
        f.write(ExpenseExporter.to_markdown(report, redact_confidential=True))

    log(f"💾 Exported sanitized accountant CSV to: {os.path.abspath(csv_out)}")
    log(f"📄 Exported IRS audit report to:          {os.path.abspath(md_out)}")
    log("\n✅ Demo completed successfully!\n")

    if quiet:
        sys.stdout.write(ExpenseExporter.to_json(report, redact_confidential=True) + "\n")


def collect_inputs(paths: List[str]) -> List[Tuple[str, str]]:
    """Gathers (label, raw_text) pairs from files, directories, or stdin."""
    items = []
    for p in paths:
        if p == "-" or p == "/dev/stdin":
            raw = sys.stdin.read()
            items.append(("stdin", raw))
        elif os.path.isdir(p):
            for fname in sorted(os.listdir(p)):
                if fname.endswith(".txt") or fname.endswith(".md") or fname.endswith(".receipt"):
                    fpath = os.path.join(p, fname)
                    with open(fpath, "r", encoding="utf-8", errors="replace") as f:
                        items.append((fname, f.read()))
        elif os.path.isfile(p):
            with open(p, "r", encoding="utf-8", errors="replace") as f:
                items.append((os.path.basename(p), f.read()))
        else:
            sys.stderr.write(f"Warning: path not found: {p}\n")
    return items


def format_report_output(report: ExpenseReport, fmt: str, redact: bool) -> str:
    """Renders the expense report in the requested output format."""
    fmt = fmt.lower()
    if fmt == "json":
        return ExpenseExporter.to_json(report, redact_confidential=redact)
    elif fmt == "csv":
        return ExpenseExporter.to_csv(report, redact_confidential=redact)
    elif fmt == "tsv":
        return ExpenseExporter.to_tsv(report, redact_confidential=redact)
    elif fmt in ("markdown", "md"):
        return ExpenseExporter.to_markdown(report, redact_confidential=redact)
    elif fmt in ("quickbooks", "qb"):
        return ExpenseExporter.to_quickbooks_csv(report, redact_confidential=redact)
    else:  # text / summary
        lines = [
            f"GhostLedger Report: {report.title}",
            f"Gross Spend:       ${report.total_spend:.2f}",
            f"Tax Deductible:    ${report.total_deductible:.2f}",
            f"Est. Tax Savings:  ${report.estimated_tax_savings:.2f}",
            f"Shielded Receipts: {report.redacted_items_count}",
            "",
            "Receipts:",
        ]
        for r in report.receipts:
            merchant = (r.redacted_merchant or r.merchant) if redact else r.merchant
            shield = "[SHIELDED]" if r.client_confidential else "          "
            lines.append(f"  {r.id:<8} {r.date:<10} {merchant:<26} ${r.total_amount:>8.2f}  {r.category.value:<24} {shield}")
        return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        prog="ghostledger",
        description="GhostLedger: Zero-leak local receipt and expense intelligence for freelancers, powered by Gemma.",
        epilog="Unix examples:\n"
               "  cat receipt.txt | ghostledger -q -f json | jq .total_deductible\n"
               "  ghostledger samples/ -f tsv | awk -F'\\t' '$4 ~ /Meals/'\n"
               "  ghostledger samples/client_dinner_nda.txt -r -f markdown\n"
               "  ghostledger serve --port 8765\n"
               "  ghostledger demo\n",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    parser.add_argument("paths", nargs="*", default=[], help="Path(s) to receipt file(s), directory, or '-' for stdin")
    parser.add_argument("-q", "--quiet", action="store_true", help="Quiet mode: suppress banners and logs (clean stdout stream)")
    parser.add_argument("-r", "--redact", action="store_true", help="Redact client/NDA confidential tokens in output")
    parser.add_argument("-f", "--format", choices=["text", "json", "csv", "tsv", "markdown", "quickbooks"], default=None,
                        help="Output format on stdout (defaults to 'text' for TTY, 'json' when piped)")

    # Direct export flags
    parser.add_argument("--csv", help="Export path for standard CSV")
    parser.add_argument("--tsv", help="Export path for TSV")
    parser.add_argument("--quickbooks", help="Export path for QuickBooks CSV")
    parser.add_argument("--json", help="Export path for JSON output")
    parser.add_argument("--markdown", help="Export path for Markdown report")

    # Service / Demo flags
    parser.add_argument("--serve", action="store_true", help="Launch the local 3D web dashboard")
    parser.add_argument("--port", type=int, default=8765, help="Port to serve on (default: 8765)")
    parser.add_argument("--demo", action="store_true", help="Run demo with bundled sample receipts")

    args = parser.parse_args()

    # Normalize positional arguments for subcommands
    paths = list(args.paths)
    is_serve = args.serve
    is_demo = args.demo

    if paths:
        first = paths[0].lower()
        if first == "serve":
            is_serve = True
            paths = paths[1:]
        elif first == "demo":
            is_demo = True
            paths = paths[1:]
        elif first == "process":
            paths = paths[1:]

    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    samples_dir = os.path.join(project_root, "samples")
    engine = GemmaEngine()

    if is_serve:
        from .web.server import start_server
        start_server(port=args.port)
        return

    if is_demo:
        run_demo(engine, samples_dir, quiet=args.quiet)
        return

    # Check if standard input is piped (e.g. `cat receipt.txt | ghostledger`)
    if not paths and not sys.stdin.isatty():
        paths = ["-"]

    # If no paths and terminal is interactive: show demo onboarding
    if not paths:
        if not args.quiet and sys.stderr.isatty():
            print_banner(sys.stderr)
        run_demo(engine, samples_dir, quiet=args.quiet)
        return

    # Effective format: if piped and not specified, default to json
    requested_fmt = args.format
    if requested_fmt is None:
        requested_fmt = "text" if sys.stdout.isatty() else "json"

    # Print banner to stderr if interactive and not quiet
    if not args.quiet and sys.stderr.isatty():
        print_banner(sys.stderr)

    log = (lambda *a, **kw: None) if args.quiet else (lambda *a, **kw: print(*a, file=sys.stderr, **kw))

    # Read inputs
    raw_inputs = collect_inputs(paths)
    if not raw_inputs:
        sys.stderr.write("❌ No receipt content found.\n")
        sys.exit(1)

    report = ExpenseReport(title="Expense Report")
    for idx, (label, content) in enumerate(raw_inputs, start=1):
        if not content.strip():
            continue
        item = engine.parse_receipt(content, receipt_id=f"REC-{idx:03d}")
        report.receipts.append(item)
        log(f"  ✓ [{item.id}] {item.merchant[:24]:<24} | ${item.total_amount:>8.2f} | {item.category.value}")
        if item.client_confidential:
            log(f"    🔒 [Privacy Shield Triggered] Confidential markers detected.")

    report.recompute()

    # Export to requested files if specified
    if args.csv:
        with open(args.csv, "w", encoding="utf-8") as f:
            f.write(ExpenseExporter.to_csv(report, redact_confidential=args.redact))
        log(f"Exported CSV to {args.csv}")

    if args.tsv:
        with open(args.tsv, "w", encoding="utf-8") as f:
            f.write(ExpenseExporter.to_tsv(report, redact_confidential=args.redact))
        log(f"Exported TSV to {args.tsv}")

    if args.quickbooks:
        with open(args.quickbooks, "w", encoding="utf-8") as f:
            f.write(ExpenseExporter.to_quickbooks_csv(report, redact_confidential=args.redact))
        log(f"Exported QuickBooks CSV to {args.quickbooks}")

    if args.json:
        with open(args.json, "w", encoding="utf-8") as f:
            f.write(ExpenseExporter.to_json(report, redact_confidential=args.redact))
        log(f"Exported JSON to {args.json}")

    if args.markdown:
        with open(args.markdown, "w", encoding="utf-8") as f:
            f.write(ExpenseExporter.to_markdown(report, redact_confidential=args.redact))
        log(f"Exported Markdown to {args.markdown}")

    # Output pure stream to stdout
    output_data = format_report_output(report, requested_fmt, redact=args.redact)
    sys.stdout.write(output_data + "\n")
    sys.stdout.flush()


if __name__ == "__main__":
    main()
