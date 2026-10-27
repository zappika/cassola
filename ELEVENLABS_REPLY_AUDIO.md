# Task: generate ElevenLabs clips for learner replies

Status: **complete and pushed** (2026-10-27). All 63 user-approved learner clips are generated and integrated; native listening review is pending. Not deployed.

## Completed batch
- User confirmed audio for “Si tenim reserva.” and full coverage of all accepted chunk combinations.
- 63 clips: the 14 listed below plus 49 unique build variants; all 53 accepted build permutations are covered.
- One take each, no retries; Martina / `eleven_v4`, explicit language `ca`. All files verified mono MP3, 44.1kHz, approximately 128kbps.
- Flow `wB7nP6Tq7eQCz0PZBpmk`; per-clip generation IDs, actual costs and durations are in `content/audio-trial.mjs`.
- Actual total: 2796.7203 credits / 50.84946 US cents (~$0.5085); 225.04 seconds of provider-reported audio.
- All 90 tests pass, including exhaustive accepted-build coverage and generation-specific listening review entries.
- All recordings remain `awaiting_native_listening_review`.

## Goal
Once a learner's reply is accepted, its bubble in the conversation gets the same ▶ Escolta / ↻ Torna a escoltar button as the waiter lines.
Scope: **multiple-choice and build replies only**. Typed replies stay text-only, because their wording is open-ended and can't be generated ahead of time.

## Previous access blocker (resolved)
The session that built the UI had no ElevenLabs MCP connector and no API key (`.env.local` only has `VERCEL_OIDC_TOKEN`).
The three waiter clips were made through the hosted ElevenLabs MCP (see HANDOFF.md). Use that connector, or an `ELEVENLABS_API_KEY` that the user adds to `.env.local` (never in chat or git).

## Generation settings (match the existing trial)
- Model `eleven_v4`, voice **Martina** `OCsEi4G5LJzKMSZFmYBD` (Barcelona Catalan), language `ca`
- One take per clip, no retries. Mono MP3, 44.1kHz, 128kbps
- Each clip is a paid call (the first 3 clips cost ~1¢ in total). The user has approved this batch only.

## Original requested clips (14; now generated)
Generated from `content/walking-in.v2.json` (content_version `2.0.0-draft.1`): options with `expected_outcome: "communicated"`, plus each build rule's `accepted_responses` with facts filled in.

| id | text |
|---|---|
| reply-listen-booking | Si tenim reserva. |
| reply-booking-1 | Tinc una taula reservada. |
| reply-booking-2 | Voldria confirmar la meva reserva, si us plau. |
| reply-booking-3 | Sí, tinc reserva. |
| reply-name-1 | A nom de Martí. |
| reply-name-2 | La reserva és a nom de Martí. |
| reply-name-3 | Martí. |
| reply-walk-in-1 | No tenim reserva. Hi hauria alguna taula disponible, si us plau? |
| reply-walk-in-2 | No, però teniu lloc per a dos? |
| reply-repeat-1 | Ho podeu repetir, si us plau? |
| reply-repeat-2 | Una altra vegada, si us plau. |
| reply-late-1 | Sí, perdó! Encara tenim taula? |
| reply-late-2 | Arribem tard. Encara ens podeu donar la taula? |
| reply-late-3 | Ho sento, hem arribat tard. Encara tenim la taula reservada? |

Build exercises can also be accepted with an extra "si us plau" chunk (e.g. "A nom de Martí si us plau"). Check `evaluate` in `app/engine.mjs` for which chunk combinations are accepted, and generate clips for those too if they can occur. Otherwise those replies simply show no button.

Note: "Si tenim reserva." is an interpretation answer ("whether we have a booking"), not something you'd say to a waiter. The user explicitly confirmed it should have audio on 2026-10-27.

## Where the files go
1. MP3s go in `audio/trial/<id>.mp3`.
2. Add each one to `clips` in `content/audio-trial.mjs`, with the same fields as the existing entries (`text`, `path`, `duration_seconds`, `generation_id`, `credits`, `price_cents`) **plus `"role": "learner"`**.
3. Nothing else is needed. `clipFor` in `app/audio.mjs` matches learner clips to a reply by text, ignoring case and punctuation, and only when `role === 'learner'`. `SentMessages` in `app/main.jsx` already renders `<AudioButton>` on accepted replies.

## Verify
- `node --test tests/*.test.mjs` passes (88 at the time of writing). Consider adding a test that `clipFor` matches "A nom de Martí" to the "A nom de Martí." clip.
- In the preview (`cassola`, port 4321), accept a choice reply and a build reply. The bubble should show ▶ Escolta, play the audio, then show ↻ Torna a escoltar.
- Update HANDOFF.md with the generation IDs and cost. All clips stay `awaiting_native_listening_review`. Review sections in `review/catalog.mjs` may need adding for the new clips.
