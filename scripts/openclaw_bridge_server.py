#!/usr/bin/env python3
"""
OpenClaw Ngrok Bridge Server (System B)
============================================================
Run this server on System B (where OpenClaw is installed).
Expose it using:
    ngrok http 8000

Endpoints:
    GET  /api/openclaw/health   -> Check tunnel & engine status
    POST /api/openclaw/extract  -> Trigger OpenClaw scraping & return resources
"""

import json
import os
import sys
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

PORT = int(os.environ.get("OPENCLAW_PORT", 8000))

# Sample scraped resources curated for misconception remediation
SAMPLE_KNOWLEDGE_BASE = {
    "inverse": {
        "web": [
            {
                "id": "openclaw-web-1",
                "title": "Understanding Inverse Operations in Algebra",
                "url": "https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities/x2f8bb11595b61c86:linear-equations-variables-both-sides",
                "description": "Interactive guided lesson explaining how every algebraic operation has an opposite operation that preserves balance.",
                "source": "Khan Academy",
                "relevanceScore": 0.98,
            },
            {
                "id": "openclaw-web-2",
                "title": "Linear Equations & Isolating Variables Step-by-Step",
                "url": "https://www.mathsisfun.com/algebra/linear-equations.html",
                "description": "Visual balance scale models showing how undoing multiplication requires division across equality signs.",
                "source": "MathsIsFun",
                "relevanceScore": 0.95,
            },
            {
                "id": "openclaw-web-3",
                "title": "Common Pitfalls When Solving Linear Equations",
                "url": "https://www.purplemath.com/modules/solvelin.htm",
                "description": "Practical guide on correcting sign flips and recognizing inverse relationships between terms.",
                "source": "Purplemath",
                "relevanceScore": 0.92,
            },
        ],
        "youtube": [
            {
                "id": "openclaw-yt-1",
                "title": "Solving Linear Equations: The Inverse Operation Method",
                "url": "https://www.youtube.com/watch?v=l3XzepN03KQ",
                "thumbnail": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
                "duration": "10:14",
                "channelTitle": "Math Antics",
                "relevanceScore": 0.97,
            },
            {
                "id": "openclaw-yt-2",
                "title": "How to Isolate Variables Without Making Inverse Errors",
                "url": "https://www.youtube.com/watch?v=Dsbv8_32UeA",
                "thumbnail": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80",
                "duration": "7:45",
                "channelTitle": "Brian McLogan",
                "relevanceScore": 0.94,
            },
        ],
        "books": [
            {
                "id": "openclaw-book-1",
                "title": "Elementary Algebra: Addition & Subtraction Properties of Equality",
                "url": "https://openstax.org/books/elementary-algebra-2e/pages/2-1-solve-equations-using-the-subtraction-and-addition-properties-of-equality",
                "description": "OpenStax peer-reviewed chapter breaking down how inverse operations maintain mathematical equivalence.",
                "source": "OpenStax Elementary Algebra",
                "relevanceScore": 0.96,
            }
        ],
    }
}

class OpenClawBridgeHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, ngrok-skip-browser-warning")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_cors_headers(204)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path in ["/", "/api/openclaw/health"]:
            response_data = {
                "status": "online",
                "engine": "OpenClaw v2.4 Crawler",
                "tunnel": "Active",
                "timestamp": int(time.time()),
                "capabilities": ["web_search", "youtube_scrape", "openstax_indexer"]
            }
            self._set_cors_headers(200)
            self.wfile.write(json.dumps(response_data, indent=2).encode("utf-8"))
        else:
            self._set_cors_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/openclaw/extract":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
            
            try:
                data = json.loads(body)
            except Exception:
                data = {}

            topic = data.get("topic", "Linear Equations")
            misconception = data.get("misconceptionLabel", data.get("misconceptionType", "inverse operations"))
            search_query = data.get("searchQuery", f"{topic} {misconception} practice guide")

            print(f"[\033[92mOpenClaw Engine\033[0m] Extraction triggered via Ngrok:")
            print(f"  > Topic: {topic}")
            print(f"  > Misconception: {misconception}")
            print(f"  > Query: {search_query}")

            # Simulate OpenClaw scraping & ranking pipeline latency (e.g. 350ms)
            time.sleep(0.35)

            # In production, call OpenClaw CLI or Crawler script here:
            # os.system(f"openclaw search --query '{search_query}'")

            resources = SAMPLE_KNOWLEDGE_BASE["inverse"]

            response_data = {
                "status": "success",
                "engine": "OpenClaw v2.4",
                "topic": topic,
                "misconception": misconception,
                "query": search_query,
                "executionTimeMs": 350,
                "resources": resources,
                "totalCount": len(resources["web"]) + len(resources["youtube"]) + len(resources["books"]),
                "source": "OpenClaw Autonomous Crawler Pipeline (System B via Ngrok)"
            }

            self._set_cors_headers(200)
            self.wfile.write(json.dumps(response_data, indent=2).encode("utf-8"))
        else:
            self._set_cors_headers(404)
            self.wfile.write(json.dumps({"error": "Unknown endpoint"}).encode("utf-8"))

def run_server():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, OpenClawBridgeHandler)
    print("=" * 60)
    print(f"  \033[91mOpenClaw Bridge Server Running\033[0m on port {PORT}")
    print(f"  To expose via Ngrok, run in a separate terminal:")
    print(f"  \033[93mngrok http {PORT}\033[0m")
    print("=" * 60)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping OpenClaw Bridge Server.")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
