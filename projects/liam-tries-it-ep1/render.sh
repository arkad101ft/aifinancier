#!/usr/bin/env bash
# Render both versions of "Liam Tries It" Ep. 1 into ./out (deterministic: same input → same frames).
# Usage:  ./render.sh            (from this folder; needs the repo's remotion-composer/node_modules)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
RC="$HERE/../../remotion-composer"
OUT="$HERE/out"; mkdir -p "$OUT"
bash "$HERE/scripts/stage.sh"
BROWSER_ARGS=()
# Cloud sessions: Remotion cannot download its own Chrome; use the preinstalled one if present.
CH=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
[ -x "$CH" ] && BROWSER_ARGS=(--browser-executable="$CH")
cd "$RC"
for V in 16x9 9x16; do
  npx remotion render projects/liam-tries-it-ep1/src/index.tsx "LiamTriesItEp1-$V" "$OUT/liam_tries_it_ep1_$V.mp4" \
    --public-dir="$RC/projects/liam-tries-it-ep1/public" --codec=h264 --crf=18 --pixel-format=yuv420p \
    --audio-codec=aac --audio-bitrate=192k --concurrency=4 --bundle-cache=false "${BROWSER_ARGS[@]}"
done
python3 "$HERE/scripts/export_lines.py" "$OUT"
echo "Done → $OUT"
