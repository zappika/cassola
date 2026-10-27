# Task: complete waiter audio with a distinct voice

Status: **complete locally** (2026-10-27). User approved five Dani recordings: replace the three Martina waiter clips and add the two missing current-lesson lines. Not pushed or deployed. Native listening review remains pending.

## Voice split
- Waiter: **Dani — Warm Catalan Narrator**, `fTfoPZ1IWyahVIb25WKi` (male, Central Catalan).
- Customer: **Martina**, `OCsEi4G5LJzKMSZFmYBD` (female, Barcelona Catalan). Existing 63 recordings retained.
- Model `eleven_v4`, explicit language `ca`; one take per clip, no retries. Mono MP3, 44.1kHz, approximately 128kbps, verified with `afinfo`.

## Generated clips
| audio_id | Exact text | Generation ID |
|---|---|---|
| staff-booking | Bona nit, teniu reserva? | FobnvQxm0JBTlxc6mY7w |
| staff-name | A quin nom? | Ra1qwEaWpS5WNcmvsYPC |
| staff-late | Arribeu una mica tard. | j5TCAhgn0NFjLAHC4lmg |
| staff-size | Quantes persones sou? | ze3Xe0fBaFjld1Fv3Edf |
| staff-repeat | És clar. | R1HaQf9Rtllwgsl2x30R |

Flow: `SCTQsueafJsTdEuQq1K9`. Actual batch cost: **85.9914 credits / 1.56348 US cents**.

## Integration
- New paths: `audio/trial/<audio_id>-dani.mp3`, preventing stale cached Martina playback.
- Active entries in `content/audio-trial.mjs` record the voice per clip. Waiter entries have no learner role.
- Original three Martina files remain intact and their metadata is retained under `superseded_clips`.
- Review labels use each clip's voice; changed generation IDs invalidate prior clip-specific reviews. There are 91 review sections.
- All active clips remain `awaiting_native_listening_review`.

## Validation and next step
- 92 tests pass, including waiter coverage, learner voice preservation and review voice labels.
- Listen with a native Catalan reviewer before treating pronunciation, accent and pace as approved.
- Four waiter lines for future independent exchanges remain outside this approved batch: `staff-seat`, `staff-late-seat`, `staff-confirm-name`, `staff-confirm-party_size`.
- Do not deploy or generate more paid takes without authorization.
