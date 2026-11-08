# Channel defaults

Claude reads this file before every video. Edit any value; the next video uses it.
These are standing answers, so Claude won't ask them each time.

## Channel

- channel_name: Finance Den
- host: Liam the Lion (animated, faceless channel). Reference: `studio/characters/liam-reference.png`.
  Puppet: `studio/characters/Liam.tsx` (expressions: happy, smug, curious, wince, impressed, yawn;
  poses: idle, crossed, point, wave; lip-flap from narration timings). Reuse it, never redraw him.
- niche: how money works around the world (Wall Street, London, Singapore, Dubai, Lagos, Kigali),
  70% evergreen explainers, 30% timely videos with background. Series: "Money Cities".
- audience: global English-speaking viewers, curious, no jargon
- tone: confident, curious, a little playful, never hype
- language: English

## Format

- target_platform: youtube
- shape: landscape                      # landscape = 16:9 1920x1080 | vertical short = 9:16 1080x1920
- duration: set by the narration (Ep. 1 = 10 min at explainer pace)
- captions: none burned in (on-screen text carries key numbers); YouTube auto-captions
- end_card: next-episode teaser + subscribe; keep the bottom-right clear for the last 20 s (end-screen elements)

## Look and sound (Finance Den style guide)

- default_pipeline: animated-explainer, atelier mode (illustrated backgrounds + hand-built overlays)
- look: detailed hand-drawn storybook illustration (ink outlines, vivid full colour, lush, bird's-eye cities),
  reference: `studio/characters/style-reference.jpg`. Backgrounds are generated locally for free with
  SDXL-Lightning (`projects/finance-den-ep1/gen_images.py`, ~35 s/image on CPU); numbers, maps, charts and
  captions are exact code overlays on top; Liam (SVG) is composited over the scene.
- palette: paper #F7F4EE, navy #13233A, gold #F5A623, muted blue #5B8DEF; red #D93A3F ONLY for losses and crime
- type: Inter Black / Bold; numbers large and exact, never rounded differently from the narration
- motion: slow push-ins, numbers count up, maps draw themselves, new image every 3-6 s
- transitions: cuts and quick wipes; gold swoosh between sections
- branding: small "FINANCE DEN" tag bottom-left throughout
- rules: no real faces (silhouettes + name captions), no real logos or mastheads (invented headline cards)
- voice: Kokoro "am_liam" (free, local, natural), speed 0.92 (~155 wpm, confident). The owner may later
  supply a recorded voiceover per section (assets/audio/real/), which re-times everything automatically.
- music: calm curious instrumental bed (Pixabay) + a tense cue for crashes/crime, ~17 dB under the voice

## Money and approvals

- budget_per_video_usd: 0               # 0 = free path only; raise to allow paid providers
- approvals: auto                       # auto = run start to finish, no stops | guided = stop at each checkpoint

## Working notes (learned on Ep. 1)

- Scripts and briefs live in the owner's Claude Docs (one doc per episode, tabs: Narration, AI video brief).
- Template project: `projects/finance-den-ep1/` (see its README-studio.md). New episode = copy it,
  replace narration.json + scenes, keep lib.tsx / Maps.tsx / Liam / Composition layers.
- Check temp-voice pronunciation by transcribing tricky lines with Whisper `small`; fix with
  phonetic spellings in narration.json `spoken_fixes` (e.g. "Monny-tary Aw-thority").
- Remotion in cloud sessions: pass `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`
  (Remotion's own Chrome download is blocked). Stage sources by COPYING into
  `remotion-composer/projects/<slug>/` (a symlink breaks module resolution).
- d3 map bounds: the fit box must be a clockwise ring, or the map fits the whole globe.
- 4 CPUs render ~6 fps at 1080p: a 10-minute episode takes ~50 minutes. Review with `snap.mjs`
  contact sheets before the full render.
