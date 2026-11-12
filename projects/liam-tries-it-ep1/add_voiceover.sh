#!/usr/bin/env bash
# Replace Liam's AI voice with your own recording in both videos (sound effects kept underneath).
# Usage:  ./add_voiceover.sh [voiceover.wav]
#   The file must start at 00:00.000 of the video; see out/voice_lines.txt for each line's window.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
VO="${1:-$HERE/voiceover.wav}"
[ -f "$VO" ] || { echo "No voiceover file at $VO"; exit 1; }
for V in 16x9 9x16; do
  bash "$HERE/scripts/mix.sh" "$HERE/out/liam_tries_it_ep1_${V}_sfx_only.mp4" "$VO" "$HERE/out/liam_tries_it_ep1_${V}.mp4"
  echo "→ $HERE/out/liam_tries_it_ep1_${V}.mp4 (your voice)"
done
