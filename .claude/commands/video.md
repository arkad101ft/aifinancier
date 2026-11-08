---
description: Make one finished faceless video from a one-sentence idea, using the channel defaults in studio/CHANNEL.md.
argument-hint: <your idea, e.g. "The entire history of Rome. Real footage only.">
---

Produce one finished video for this idea: $ARGUMENTS

1. Follow `CLAUDE.md` (studio rules) and `studio/CHANNEL.md` (defaults). Any
   override written in the idea itself (length, shape, "guided", a voice) wins
   over the defaults for this video only.
2. Follow `AGENT_GUIDE.md`: pick the pipeline per the routing table, read its
   manifest, run preflight, then go stage by stage reading each director skill.
3. Approval mode comes from `studio/CHANNEL.md` (`approvals`). In `auto`, run
   to the end without stopping, within the $0 / budget limit.
4. Deliver to `studio/output/<YYYY-MM-DD>-<slug>/` (`final.mp4`,
   `thumbnail.jpg`, `post.md` with title, description, hashtags, credits),
   verify the render, and send the files to the owner if this is a cloud session.
5. Finish with a 5-line summary: pipeline, duration, voice, footage sources,
   cost, and anything that fell back from the defaults.
