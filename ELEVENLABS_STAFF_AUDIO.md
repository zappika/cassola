# Task: generate the two missing waiter clips

Status: **not started**. Needs explicit user approval for this paid batch (2 clips).

## Why
The 63-clip batch (see `ELEVENLABS_REPLY_AUDIO.md`) covered **learner answers only**. Waiter lines were a separate 3-clip trial on 2026-10-17. Two waiter lines in `content/walking-in.v2.json` still have no audio, so the conversation goes silent from "Quantes persones sou?" onwards.

| audio_id | text (exact) | English | Used in |
|---|---|---|---|
| `staff-size` | Quantes persones sou? | How many people are you? | `type-table`, `choose-repeat` (also replayed after a correct "repeat" request) |
| `staff-repeat` | És clar. | Of course. | `choose-repeat`, said after a correct answer |

Every other waiter line already has a clip: `staff-booking`, `staff-name`, `staff-late`.

## Generation settings (match the existing clips exactly)
- Model `eleven_v4`, voice **Martina** `OCsEi4G5LJzKMSZFmYBD`, language `ca`
- One take per clip, no retries. Mono MP3, 44.1kHz, 128kbps
- Text must match the table character for character, including the accent in "És" and the question mark. `clipFor` only accepts a waiter clip whose `text` equals the lesson line exactly.

## Where the files go
1. `audio/trial/staff-size.mp3` and `audio/trial/staff-repeat.mp3`
2. Add both to `clips` in `content/audio-trial.mjs`, keyed by the audio_id, with the same fields as `staff-booking`: `text`, `path`, `duration_seconds`, `generation_id`, `credits`, `price_cents`, plus `generated_at`, `flow_id` and `"review_status": "awaiting_native_listening_review"`. **No `role` field.** `role: "learner"` is only for answers.
3. No code changes needed. `app/main.jsx` already renders a speaker button for both lines, and "Quantes persones sou?" autoplays like the other waiter lines.

## Verify
- `node --test tests/*.test.mjs` passes. The manifest test checks that every clip file exists and is an MP3.
- In the preview (port 4321), play through to "Quantes persones sou?": it should autoplay. Answer the repeat question correctly: "És clar." should get a speaker button.
- Add generation IDs and cost to HANDOFF.md. Both clips stay `awaiting_native_listening_review`.
- Do not deploy.
