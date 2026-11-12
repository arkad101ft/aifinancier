#!/usr/bin/env bash
# Render "Liam Tries It" Ep. 1 into ./out (deterministic: same input → same frames).
#   out/liam_tries_it_ep1_{16x9,9x16}_sfx_only.mp4   sound effects only (for recording your own voice)
#   out/liam_tries_it_ep1_{16x9,9x16}.mp4            final: Liam's voice + sound effects
#   out/voice_lines.txt, out/liam_lines.srt          line timings
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
RC="$HERE/../../remotion-composer"
OUT="$HERE/out"; mkdir -p "$OUT"
PY="${PYTHON:-$HERE/../../.venv/bin/python}"; [ -x "$PY" ] || PY=python3
bash "$HERE/scripts/stage.sh"
BROWSER_ARGS=()
# Cloud sessions: Remotion cannot download its own Chrome; use the preinstalled one if present.
CH=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
[ -x "$CH" ] && BROWSER_ARGS=(--browser-executable="$CH")
cd "$RC"
for V in 16x9 9x16; do
  npx remotion render projects/liam-tries-it-ep1/src/index.tsx "LiamTriesItEp1-$V" "$OUT/liam_tries_it_ep1_${V}_sfx_only.mp4" \
    --public-dir="$RC/projects/liam-tries-it-ep1/public" --codec=h264 --crf=18 --pixel-format=yuv420p \
    --audio-codec=aac --audio-bitrate=192k --concurrency=4 --bundle-cache=false "${BROWSER_ARGS[@]}"
done
"$PY" "$HERE/scripts/export_lines.py" "$OUT"
# Liam's voice: your recording if voiceover.wav exists, otherwise the channel's AI voice for Liam
if [ -f "$HERE/voiceover.wav" ]; then VOICE="$HERE/voiceover.wav"; else "$PY" "$HERE/scripts/make_voice.py" "$OUT"; VOICE="$OUT/liam_voice.wav"; fi
for V in 16x9 9x16; do bash "$HERE/scripts/mix.sh" "$OUT/liam_tries_it_ep1_${V}_sfx_only.mp4" "$VOICE" "$OUT/liam_tries_it_ep1_${V}.mp4"; done
echo "Done → $OUT  (voice: $VOICE)"
