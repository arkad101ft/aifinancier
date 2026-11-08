# Finance Den Ep. 1: how this project works

Hand-built (atelier) Remotion animation, made by the studio from the owner's Claude Doc
"Finance Den Ep. 1" (tabs: Narration, AI video brief). Everything here is $0: original
illustration in code, Piper voice, Pixabay music.

| File | What it is |
|---|---|
| `artifacts/narration.json` | The Narration tab, split into the brief's 10 sections, plus pronunciation fixes for the temp voice |
| `build_voice.py` | Builds `public/voice.wav` + `artifacts/timeline.json` (word timings) + refreshes `artifacts/props.json` |
| `Liam.tsx` | Liam the Lion as an SVG puppet: 6 expressions, wave/point/crossed arms, blinking, lip-flap on narration |
| `ScenesA/B/C.tsx` | The 10 sections from the brief's scene table; every shot cuts on a narration phrase (`cueTime`) |
| `Composition.tsx` | Layers: scenes, Liam's appearances, gold swooshes + chapter labels, FINANCE DEN tag, voice + music |
| `Thumbnail.tsx` | The thumbnail |
| `snap.mjs` | Contact-sheet stills for review |

## Swap in the real voiceover

1. Put one audio file per section in `assets/audio/real/`, named by section id:
   `s01_hook`, `s02_independence`, `s03_clock`, `s04_referee`, `s05_barings`, `s06_crisis`,
   `s07_numbers`, `s08_scandal`, `s09_kigali`, `s10_close` (any of .wav .mp3 .m4a .flac).
   Sections without a file keep the temp voice.
2. Rebuild the timings (from the repo root):
   ```bash
   source .venv/bin/activate && HF_HUB_DISABLE_XET=1 python projects/finance-den-ep1/build_voice.py
   ```
3. Re-render (from `remotion-composer/`, after copying the sources in):
   ```bash
   cp ../projects/finance-den-ep1/*.tsx projects/finance-den-ep1/ && npx remotion render projects/finance-den-ep1/index.tsx FinanceDenEp1 ../projects/finance-den-ep1/renders/master.mp4 --props=../projects/finance-den-ep1/artifacts/props.json --public-dir=../projects/finance-den-ep1/public --concurrency=4 --crf=18
   ```
   (In cloud sessions add `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`.)
4. Loudness pass for YouTube (-14 LUFS):
   ```bash
   ffmpeg -i renders/master.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k renders/final.mp4
   ```

Every visual is cued on a phrase from the script, so the real voice re-times the whole video
automatically, at whatever pace it is read.
