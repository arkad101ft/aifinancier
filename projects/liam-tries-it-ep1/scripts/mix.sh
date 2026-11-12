#!/usr/bin/env bash
# mix.sh <video_with_sfx.mp4> <voice.wav> <out.mp4>: voice on top of the sound effects, levelled for YouTube.
set -euo pipefail
ffmpeg -y -v error -i "$1" -i "$2" -filter_complex \
  "[1:a]aresample=48000,apad[vo];[0:a]volume=0.55[fx];[fx][vo]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart "$3"
