# AIFinancier Studio: how to use it

You bring the idea, Claude Code makes the video. The engine is
[OpenMontage](https://github.com/calesthio/OpenMontage) (AGPL-3.0), installed at
the root of this repo. This folder holds your settings and your idea queue.

## First time (once per machine)

```bash
bash scripts/studio_setup.sh
```

Needs Python 3.10+, Node 22+ and ffmpeg. In Claude Code cloud sessions, use the
**aifinancier** environment (it allows the free footage archives and the voice
download).

## Every day

| You type in Claude Code                      | What happens                                         |
|----------------------------------------------|------------------------------------------------------|
| `/video The entire history of Rome. Real footage only.` | One finished video, start to finish |
| `/video-batch`                               | Makes every unchecked idea in `studio/IDEAS.md`      |
| `/video ... [landscape, 90s, guided]`        | Same, with per-video overrides                       |
| `/backlot`                                   | Opens the live storyboard to watch a run             |

Results land in `studio/output/<date>-<slug>/`: `final.mp4`, `thumbnail.jpg`,
and `post.md` (title, description, hashtags, footage credits).

## Change the defaults

Edit `studio/CHANNEL.md`: niche, vertical or landscape, length, voice, music,
budget, and `approvals: auto` (no stops) or `guided` (Claude asks at each step).

## Free vs paid

Default is the free path at $0: real footage from Archive.org, Wikimedia, NASA
and the Library of Congress, offline Piper narration, local Remotion render.
To unlock AI video, AI images or premium voices, put API keys in `.env` (see
`docs/PROVIDERS.md`) and raise `budget_per_video_usd` in `studio/CHANNEL.md`.

## Rights

Archive footage is public domain or Creative Commons. CC-BY clips must be
credited; Claude writes the credits into `post.md`, so paste them into your
video description. You're responsible for what you publish.
