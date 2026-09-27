# Karma browser app

This local browser app is built from the FastAPI work in `biggiebarker8-cloud/fastapi-on-azure-functions`. It lives alongside the JavaScript studio assistant; the runtimes are separate.

## iMac, then phone

1. Install Python 3.10 or newer.
2. In Terminal, change to this folder and run `chmod +x "Start Karma.command"` once after downloading from GitHub. Then double-click `Start Karma.command`. If macOS blocks it, right-click and choose **Open**. You can also run `bash "Start Karma.command"` from Terminal.
3. Enter the access key printed in Terminal. Keep Terminal open.
4. On the same Wi-Fi, open the phone address printed in Terminal and enter the key. Allow the macOS firewall prompt if needed.

The first launch installs packages. Records and the access key are in `.data/`. Back up that folder. Do not forward port 7071 to the public internet.

The browser includes an idea organiser, universe and character records, reference notes and approvals. AI chat requires `KARMA_MODEL_URL` (an HTTPS OpenAI-compatible chat completions URL), `KARMA_MODEL_NAME` and `KARMA_MODEL_KEY` in the environment. Keep keys out of Git. Live platform integrations and remote cloud hosting are not connected.

Run tests from this folder with `python3 -m pytest test_browser_app.py` after installing `pytest` and `httpx`.
