---
description: Make a video for every unchecked idea in studio/IDEAS.md, one after another, then tick each one.
argument-hint: [optional max number of videos]
---

Work through `studio/IDEAS.md` top to bottom. Limit: $ARGUMENTS (if empty, all unchecked ideas).

For each unchecked `- [ ]` idea:

1. Produce it exactly as `/video` does (read `.claude/commands/video.md` once and
   follow it), each in its own OpenMontage project, with overrides in `[...]`
   applying to that idea only.
2. When `final.mp4` is verified, change the line to `- [x]` and append
   ` → studio/output/<folder>`.
3. If one idea fails after a fair retry, mark it `- [ ] (failed: <short reason>)`
   and move on to the next. Don't let one idea stop the batch.

At the end, list every video made (folder, title, duration) and every failure.
