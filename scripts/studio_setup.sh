#!/usr/bin/env bash
# One-shot, idempotent setup for the AIFinancier video studio (OpenMontage).
# Usage: bash scripts/studio_setup.sh     (from the repo root; safe to re-run)
# Needs: python3 >= 3.10, node >= 22, ffmpeg. Installs everything else.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Python virtual environment (.venv)"
[ -x .venv/bin/python3 ] || python3 -m venv .venv
[ -e .venv/bin/python ] || ln -s python3 .venv/bin/python
PIP=".venv/bin/python -m pip"
$PIP install -q --upgrade pip

echo "==> OpenMontage Python dependencies + free offline voice (Piper)"
$PIP install -q -r requirements.txt piper-tts

echo "==> Footage matching (CLIP), video and transcription tools"
$PIP install -q torch transformers opencv-python-headless yt-dlp faster-whisper Pygments

echo "==> Remotion composer (renders the final video)"
(cd remotion-composer && npm install --no-audit --no-fund --loglevel=error)

echo "==> Piper voices -> ~/.piper/models"
VOICES="$HOME/.piper/models"; mkdir -p "$VOICES"
HF="https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US"
for v in lessac/medium/en_US-lessac-medium ryan/high/en_US-ryan-high; do
  name="$(basename "$v")"
  for ext in onnx onnx.json; do
    [ -s "$VOICES/$name.$ext" ] || curl -fsSL -o "$VOICES/$name.$ext" "$HF/$v.$ext"
  done
done

[ -f .env ] || cp .env.example .env

echo "==> Check"
.venv/bin/python -c "import torch, transformers, cv2; print('python deps ok')"
PATH="$PWD/.venv/bin:$PATH" .venv/bin/python - <<'PY'
from tools.tool_registry import registry
registry.discover()
menu = registry.provider_menu()
for cap in ("tts", "clip_acquisition", "clip_retrieval", "corpus_population", "subtitle", "video_post"):
    ok = [t["name"] for t in menu.get(cap, {}).get("available", [])]
    print(f"  {cap:18} {'OK  ' if ok else 'MISSING'} {', '.join(ok[:4])}")
PY
echo "Done. Open this repo in Claude Code and type:  /video <your idea>"
