"""Tests for GhostLedger Unix-style CLI."""

import unittest
import subprocess
import sys
import os
import json


class TestCLI(unittest.TestCase):

    def setUp(self):
        self.repo_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.sample_path = os.path.join(self.repo_dir, "samples", "saas_subscription.txt")

    def test_cli_pipe_stdin_json(self):
        """Test piping receipt content into stdin and getting valid JSON on stdout."""
        with open(self.sample_path, "r", encoding="utf-8") as f:
            content = f.read()

        cmd = [sys.executable, "-m", "privatereceipt.cli", "-q", "-f", "json"]
        proc = subprocess.run(
            cmd,
            input=content,
            text=True,
            capture_output=True,
            cwd=self.repo_dir
        )
        self.assertEqual(proc.returncode, 0, f"CLI failed with error: {proc.stderr}")
        
        # Verify valid JSON parse
        data = json.loads(proc.stdout)
        self.assertIn("receipts", data)
        self.assertEqual(len(data["receipts"]), 1)
        self.assertEqual(data["receipts"][0]["merchant"], "DigitalOcean Holdings, Inc.")
        self.assertEqual(data["receipts"][0]["total_amount"], 90.50)

    def test_cli_tsv_output(self):
        """Test TSV output format contains tab delimiters and correct columns."""
        cmd = [sys.executable, "-m", "privatereceipt.cli", self.sample_path, "-q", "-f", "tsv"]
        proc = subprocess.run(
            cmd,
            text=True,
            capture_output=True,
            cwd=self.repo_dir
        )
        self.assertEqual(proc.returncode, 0)
        lines = proc.stdout.strip().split("\n")
        self.assertGreaterEqual(len(lines), 2)
        header = lines[0].split("\t")
        self.assertIn("Merchant", header)
        self.assertIn("Deductible_Amount", header)

    def test_cli_quiet_mode_stderr(self):
        """Test that quiet mode emits no stderr diagnostic banners."""
        cmd = [sys.executable, "-m", "privatereceipt.cli", self.sample_path, "-q", "-f", "json"]
        proc = subprocess.run(
            cmd,
            text=True,
            capture_output=True,
            cwd=self.repo_dir
        )
        self.assertEqual(proc.stderr, "")


if __name__ == "__main__":
    unittest.main()
