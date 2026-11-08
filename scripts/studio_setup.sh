#!/usr/bin/env bash
# One-shot, idempotent setup for the AIFinancier video studio (OpenMontage).
# Usage: bash scripts/studio_setup.sh     (from the repo root; safe to re-run)
# Needs: python3 >= 3.10, node >= 22, ffmpeg. Installs everything else.
set -euo pipefail
export HF_HUB_DISABLE_XET=1   # plain HTTPS model downloads (works behind proxies)
cd "$(dirname "$0")/.."

echo "==> Python virtual environment (.venv)"
[ -x .venv/bin/python3 ] || python3 -m venv .venv
[ -e .venv/bin/python ] || ln -s python3 .venv/bin/python
PIP=".venv/bin/python -m pip"
$PIP install -q --upgrade pip

echo "==> OpenMontage Python dependencies + free offline voice (Piper)"
$PIP install -q -r requirements.txt piper-tts

echo "==> Footage matching (CLIP), video and transcription tools"
$PIP install -q torch transformers opencv-python-headless yt-dlp faster-whisper Pygments "av<16"
# av<16: faster-whisper 1.2 passes metadata_errors= to av.open(), removed in PyAV 16+.

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

echo "==> Whisper caption model (word timings)"
HF_HUB_DISABLE_XET=1 .venv/bin/python -c "from faster_whisper import WhisperModel; WhisperModel('base', compute_type='int8')"

echo "==> CLIP model (matches footage to each scene)"
.venv/bin/python -c "from transformers import CLIPModel, CLIPProcessor as P; m='openai/clip-vit-base-patch32'; P.from_pretrained(m); CLIPModel.from_pretrained(m)"

echo "==> Check"
.venv/bin/python -c "import torch, transformers, cv2; print('python deps ok')"
PATH="$PWD/.venv/bin:$PATH" .venv/bin/python - <<'PY'
from tools.tool_registry import registry
registry.discover()
for name in ("piper_tts", "direct_clip_search", "clip_search", "corpus_builder",
             "transcriber", "subtitle_gen", "video_compose"):
    tool = registry.get(name)
    status = tool.get_status().value if tool else "not found"
    note = " (fine: key-based stock sources not configured)" if status == "degraded" else ""
    print(f"  {name:20} {status}{note}")
PY
echo "Done. Open this repo in Claude Code and type:  /video <your idea>"
