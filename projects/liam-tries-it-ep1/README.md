# Liam Tries It · Ep. 1 · "The Lemonade Fund"

A 40-second parody for Finance Den: Liam runs a kid-sized Ponzi scheme at a lemonade stand,
and it falls apart (real-world parallel: Bernie Madoff). Built in **Remotion (React)**. Every frame
is computed from the frame number only (no timers, no randomness), so each render is identical.

## What's here

| Path | What it is |
|---|---|
| `src/timeline.json` | **Single source of truth**: scene times, Liam's lines (start/end), sound-effect cues |
| `src/Episode.tsx` | The six scenes (title, pitch, "profit", it grows, Friday, caught) |
| `src/lib.tsx` | Palette, easing helpers, and the two layouts (`L16x9`, `L9x16`): every position lives here |
| `src/Liam.tsx` | Liam = `public/liam.png`, animated by transforms only + sweat / "!" / sparkle overlays |
| `src/Friends.tsx` | Original SVG zebra, giraffe, hippo (neutral/happy/angry) and Mum the lioness with the "SEC" clipboard |
| `src/Props.tsx` | Stand, jars, notes, coins, scoreboard, chalkboard, captions, speech bubbles, subtitles, tag |
| `public/liam.png` | The owner's Liam image: white background removed, upscaled 3x (not redrawn) |
| `public/sfx/*.wav` | Sound effects synthesised by `scripts/prepare_assets.py` (no downloads) |
| `public/fonts/` | Inter Black / Bold / SemiBold (SIL Open Font License) |
| `render.sh` | Renders both videos into `out/` and writes `out/voice_lines.txt` + `out/liam_lines.srt` |
| `add_voiceover.sh` | Mixes `voiceover.wav` into both videos (one command) |
| `scripts/` | `prepare_assets.py` (Liam cutout + sfx), `export_lines.py` (voice_lines.txt/.srt), `stage.sh`, `snap.mjs` (review stills) |

## Re-render

Needs Node 22+, ffmpeg, Python 3, and the repo's `remotion-composer/node_modules` (run `npm install` there once).

```bash
./render.sh
```

Outputs `out/liam_tries_it_ep1_16x9.mp4` (1920×1080) and `out/liam_tries_it_ep1_9x16.mp4` (1080×1920),
both 30 fps H.264, ~40 s, with only the synthesised sound effects as audio.

To change timing, edit `src/timeline.json` (lines and sfx) or the `t` values in `src/Episode.tsx`, then
re-render; `voice_lines.txt` is regenerated from the same file, so it always matches the video.
To rebuild `liam.png` or the sound effects: `python3 scripts/prepare_assets.py` (needs Pillow + numpy).

## Add your voiceover (one command)

1. Read `out/voice_lines.txt`. It lists each line with its exact on-screen window and a direction.
2. Record **one** file, `voiceover.wav`, that starts at 00:00.000 of the video, with each line inside its window.
3. Put it in this folder and run:

```bash
./add_voiceover.sh
```

Tip: `out/guide_voiceover.wav` is a timing guide made with Liam's AI voice (every line placed in its window). Play it to rehearse, or test the command with `./add_voiceover.sh out/guide_voiceover.wav`.

It writes `out/liam_tries_it_ep1_16x9_voiced.mp4` and `out/liam_tries_it_ep1_9x16_voiced.mp4`
(voice + sound effects, levelled to −14 LUFS for YouTube). You can also pass a path: `./add_voiceover.sh ~/take3.wav`.

## Layouts

`lib.tsx` holds two layout tables. The 9:16 version is re-laid out, not cropped: the title is stacked, the
stand is bigger and lower, the scoreboard and chalkboard sit at the top, and all text stays inside the
Shorts safe area (x 60–960, y 220–1440), clear of the top bar, the right-side buttons and the bottom caption block.
