"""Vercel Serverless Function: GET /api/samples"""

import sys
import os
import json
from http.server import BaseHTTPRequestHandler

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAMPLES_DIR = os.path.join(REPO_ROOT, "samples")


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        samples = {}
        if os.path.exists(SAMPLES_DIR):
            for fname in sorted(os.listdir(SAMPLES_DIR)):
                if fname.endswith(".txt"):
                    with open(os.path.join(SAMPLES_DIR, fname), "r", encoding="utf-8") as f:
                        samples[fname] = f.read()
        encoded = json.dumps({"samples": samples}).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)
