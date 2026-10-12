#!/usr/bin/env python3
"""
OpenClaw + Ngrok One-Click Runner (System B)
============================================================
Run this on System B:
    python3 scripts/start_openclaw_ngrok.py

It will:
1. Start the OpenClaw Bridge Server on port 8000
2. Start the Ngrok tunnel to port 8000
3. Automatically fetch and display the exact URL to paste into System A!
"""

import subprocess
import time
import urllib.request
import json
import os
import sys

PORT = 8000

def main():
    print("\033[94m============================================================\033[0m")
    print("  \033[92mStarting OpenClaw Bridge Server on port\033[0m", PORT)
    print("\033[94m============================================================\033[0m")

    # Start bridge server
    server_proc = subprocess.Popen(
        [sys.executable, "scripts/openclaw_bridge_server.py"],
        env=dict(os.environ, OPENCLAW_PORT=str(PORT))
    )

    time.sleep(1)

    print("\033[93m[1/2] Launching Ngrok tunnel...\033[0m")
    try:
        ngrok_proc = subprocess.Popen(
            ["ngrok", "http", str(PORT), "--log=stdout"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    except FileNotFoundError:
        print("\033[91m[Error] 'ngrok' command not found.\033[0m")
        print("Please install ngrok from https://ngrok.com/download or run:")
        print("    brew install ngrok  # On Mac")
        print("    sudo apt install ngrok  # On Linux")
        server_proc.terminate()
        return

    # Wait for Ngrok API to come online
    public_url = None
    for _ in range(15):
        time.sleep(1)
        try:
            req = urllib.request.Request("http://127.0.0.1:4040/api/tunnels")
            with urllib.request.urlopen(req, timeout=2) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                tunnels = data.get("tunnels", [])
                for t in tunnels:
                    url = t.get("public_url", "")
                    if url.startswith("https://"):
                        public_url = url
                        break
                if public_url:
                    break
        except Exception:
            pass

    if public_url:
        print("\n\033[92m" + "=" * 60 + "\033[0m")
        print("  \033[1;92mSUCCESS! YOUR OPENCLAW NGROK LINK IS:\033[0m")
        print(f"  \033[1;97;41m {public_url} \033[0m")
        print("\033[92m" + "=" * 60 + "\033[0m\n")
        print("👉 \033[1mNext Step:\033[0m")
        print(f"1. Go to System A (GTDA UI: http://localhost:5173/student/practice)")
        print(f"2. Click the [OPENCLAW EXECUTED ACTIVE] badge")
        print(f"3. Paste this link: {public_url}")
        print("4. Click 'Test' and then 'Save & Connect'!\n")
        print("Press Ctrl+C to stop the bridge and tunnel anytime.")
    else:
        print("\n\033[93mNgrok is running. Look for the 'Forwarding' link in your terminal or ngrok dashboard.\033[0m")

    try:
        server_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping server and tunnel...")
        server_proc.terminate()
        ngrok_proc.terminate()

if __name__ == "__main__":
    main()
