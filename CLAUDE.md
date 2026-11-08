# AIFinancier Studio (built on OpenMontage)

This repo is a faceless-video studio. The owner gives a video idea (often one
sentence) and Claude Code produces a finished, ready-to-post MP4 using the
OpenMontage pipeline system in this repo.

## Before any production work

1. Environment: if `.venv/` is missing, run `bash scripts/studio_setup.sh` once.
   Then prefix every Python/tool command with `source .venv/bin/activate &&`
   (Piper TTS is only found on PATH when the venv is active).
2. Read `studio/CHANNEL.md`: the owner's standing defaults (format, length,
   voice, style, budget, approval mode). These are the owner's answers to the
   questions the pipelines would otherwise ask. Do not re-ask them.
3. Then follow `AGENT_GUIDE.md` (mandatory, unchanged OpenMontage contract):
   pipelines, stage director skills, preflight, checkpoints, reviewer.

## How the owner talks to you

- `/video <idea>` or just an idea sentence: produce one video.
- `/video-batch`: produce every unchecked idea in `studio/IDEAS.md`.
- "autopilot" / "skip approvals" in the request: same as `approvals: auto`.

## Pipeline choice (default routing)

| The idea is mainly...                                  | Pipeline              |
|--------------------------------------------------------|-----------------------|
| history, places, events, "real footage only", documentary | `documentary-montage` |
| numbers, money, how-something-works, charts, comparisons  | `animated-explainer`  |
| a story with characters / a cinematic mood               | `cinematic` (only with paid keys) |

If `studio/CHANNEL.md` sets a different default pipeline, use that.

## Standing approval policy (owner's instruction, overrides checkpoint prompts)

When `approvals: auto` in `studio/CHANNEL.md` (or the request says autopilot):

- Run every stage to the end without stopping at `human_approval_default`
  checkpoints. Still write every checkpoint, still run the reviewer skill,
  still log every decision in `decision_log` (including both render runtimes
  in `options_considered`). Pick the recommended option yourself.
- This standing approval covers **$0 work only** (free path: archive footage,
  Piper voice, local render). Any step with a non-zero cost estimate needs an
  explicit yes from the owner first, unless `budget_per_video_usd` in
  `studio/CHANNEL.md` covers it.
- If a blocker forces a different path than the defaults (e.g. no footage
  found for a scene), pick the closest free substitute, note it in the
  delivery summary, and keep going. Do not stall the run waiting for a reply.

When `approvals: guided`, follow `AGENT_GUIDE.md` checkpoints normally.

## Delivery (every video)

Put the final deliverables in `studio/output/<YYYY-MM-DD>-<slug>/`:

- `final.mp4`: the rendered video (format from `studio/CHANNEL.md`)
- `thumbnail.jpg`: a strong frame or generated title card
- `post.md`: title (≤ 70 chars), description, 5-10 hashtags, and a
  **Credits** section listing every footage/music source with its license and
  author (CC-BY material must be attributed here).

Then verify the file plays (`ffprobe` duration, resolution, audio stream) and
sample frames with `frame_sampler` before calling it done. In a cloud session,
send `final.mp4` and `post.md` to the owner with the SendUserFile tool, since
the container is temporary. `studio/output/` is git-ignored: never commit media.

After a batch, tick the idea in `studio/IDEAS.md` (`- [x]`) and append the
output folder name.
