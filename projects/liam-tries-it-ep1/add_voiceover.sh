#!/usr/bin/env bash
# Mix your recorded voiceover into both videos (keeps the sound effects underneath).
# Usage:  ./add_voiceover.sh [voiceover.wav]
#   voiceover.wav must start at 00:00.000 of the video; see out/voice_lines.txt for line timings.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
VO="${1:-$HERE/voiceover.wav}"
[ -f "$VO" ] || { echo "No voiceover file at $VO"; exit 1; }
for V in 16x9 9x16; do
  IN="$HERE/out/liam_tries_it_ep1_$V.mp4"; OUTF="$HERE/out/liam_tries_it_ep1_${V}_voiced.mp4"
  ffmpeg -y -v error -i "$IN" -i "$VO" -filter_complex \
    "[1:a]aresample=48000,apad[vo];[0:a]volume=0.6[fx];[fx][vo]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5[a]" \
    -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart "$OUTF"
  echo "→ $OUTF"
done
