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
| `src/Friends.tsx` | Original SVG zebra (gold hoodie), giraffe (blue turtleneck), hippo (dungarees) and Mum the lioness (cardigan, "SEC" clipboard), drawn on Liam's proportions and face. Expressions neutral/happy/angry |
| `src/Cast.tsx` | Review sheet: the cast next to Liam (composition `Cast`) |
| `src/Props.tsx` | Stand, jars, notes, coins, scoreboard, chalkboard, captions, speech bubbles, subtitles, tag |
| `public/liam.png` | The owner's Liam image: white background removed, upscaled 3x (not redrawn) |
| `public/sfx/*.wav` | Sound effects synthesised by `scripts/prepare_assets.py` (no downloads) |
| `public/fonts/` | Inter Black / Bold / SemiBold (SIL Open Font License) |
| `render.sh` | Renders both videos into `out/` (effects-only masters, then the final mix with Liam's voice) and writes `out/voice_lines.txt` + `out/liam_lines.srt` |
| `add_voiceover.sh` | Swaps your own `voiceover.wav` in for Liam's AI voice in both videos (one command) |
| `scripts/` | `prepare_assets.py` (Liam cutout + sfx), `make_voice.py` (Liam's AI voice track), `mix.sh`, `export_lines.py` (voice_lines.txt/.srt), `stage.sh`, `snap.mjs` (review stills) |

## Re-render

Needs Node 22+, ffmpeg, Python 3, and the repo's `remotion-composer/node_modules` (run `npm install` there once).

```bash
./render.sh
```

Outputs, all 30 fps H.264, ~40 s:
- `out/liam_tries_it_ep1_16x9.mp4` (1920×1080) and `out/liam_tries_it_ep1_9x16.mp4` (1080×1920): **final**, Liam's voice + sound effects
- `out/liam_tries_it_ep1_{16x9,9x16}_sfx_only.mp4`: sound effects only, the masters your voiceover is mixed onto

Liam's voice is the channel's AI voice for him (Kokoro "am_liam", generated locally by `scripts/make_voice.py`,
each line placed in its subtitle window). If a `voiceover.wav` sits in this folder, `render.sh` uses that instead.

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

Tip: `out/liam_voice.wav` is Liam's AI voice with every line in its window; play it to rehearse.

It rewrites `out/liam_tries_it_ep1_16x9.mp4` and `out/liam_tries_it_ep1_9x16.mp4` with your voice on top of the
sound effects, levelled to −14 LUFS for YouTube. You can also pass a path: `./add_voiceover.sh ~/take3.wav`.

## Layouts

`lib.tsx` holds two layout tables. The 9:16 version is re-laid out, not cropped: the title is stacked, the
stand is bigger and lower, the scoreboard and chalkboard sit at the top, and all text stays inside the
Shorts safe area (x 60–960, y 220–1440), clear of the top bar, the right-side buttons and the bottom caption block.
