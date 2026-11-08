# Channel defaults

Claude reads this file before every video. Edit any value; the next video uses it.
These are standing answers, so Claude won't ask them each time.

## Channel

- channel_name: AIFinancier            # shown nowhere on screen unless you ask
- niche: >                              # one or two lines; helps the research + tone
  (write your niche here, e.g. "money history and how finance really works")
- audience: curious adults, no jargon
- language: English

## Format

- target_platform: youtube              # youtube | tiktok | instagram | linkedin | generic
- shape: vertical short                 # vertical short = 9:16 1080x1920 | landscape = 16:9 1920x1080
- duration_seconds: 60
- captions: burned-in, word-by-word, bold, center-lower third
- end_card: none                        # or e.g. "Follow for one a day"

## Look and sound

- default_pipeline: auto                # auto (see CLAUDE.md routing) | documentary-montage | animated-explainer
- visuals: real archive footage first (Archive.org, Wikimedia, NASA, Library of Congress), stills with slow motion second
- voice: piper en_US-ryan-high          # free, offline. Alternative: en_US-lessac-medium
- narration_style: confident storyteller, short sentences, hook in first 2 seconds
- music: quiet royalty-free bed under the voice (pixabay_music or music_library/), or none

## Money and approvals

- budget_per_video_usd: 0               # 0 = free path only; raise to allow paid providers
- approvals: auto                       # auto = run start to finish, no stops | guided = stop at each checkpoint
