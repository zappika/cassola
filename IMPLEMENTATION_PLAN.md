# Cassola: one useful Walking in lesson

Stage 1 · 2026-10-15. This plan supersedes conflicting roadmap assumptions in `plan.md` and `CLAUDE.md`. Execute only the stage requested; update `HANDOFF.md` and stop each time. No push/deploy without instruction.

## Current status — 2026-10-16

Stages 1, 2, 3A and 3B are implemented. Stages 3A and 3B are deployed at cassola.xyz (74 tests total). Native review is still pending. Next: Stage 4 audio, beginning with reviewed scripts and a bounded voice trial; paid generation requires explicit authorization. See HANDOFF.md for current evidence and the exact next prompt.

## Verified baseline

- Read repository instructions (`CLAUDE.md`; no applicable AGENTS.md found), `index.html`, `content/walking-in.json`, and `plan.md`.
- Static HTML, React 18/Babel via CDN; no package manifest, backend, or test suite. All components live in `index.html`; lesson JSON is fetched from `/content/` (the documented `/components/` and `/scenarios/` structure is stale).
- Practice already implements three multiple-choice steps. Every first option is correct, tone labels reveal answers, and formal/wordy responses fail. Situational facts are not explicit. All four scenario cards reach the same JSON; full-meal CTA has no handler.
- Audio is a noninteractive sticker with empty asset paths. Practice progress is calculated in memory, not saved; home counts and five-day streak are hardcoded. Hearts decrement and completion claims local competence regardless of performance. English translations are always visible.
- Preserve actual colors, fonts, Caçó SVG, borders, hard shadows, stickers, and mobile layout. No framework migration or unrelated refactoring. Optional English help overrides the old Catalan-only instruction.

## ElevenLabs discovery (read-only)

Authenticated hosted connector calls succeeded: `creative_list_voices(languages=["ca"])`, `creative_get_flow_node_types`, and `creative_get_model_schema(tts, eleven_v3)`. No audio, flows, agents, transcription, or account changes were created. No deprecated local MCP server installed.

- Workspace TTS list: `eleven_multilingual_v2`, `eleven_turbo_v2_5`, `eleven_flash_v2_5`, `eleven_v3`, `eleven_v4` (current default). The skill's default differs from the live tool; use discovered capabilities.
- Proposed first audio trial: `eleven_v3`, language `ca`, Martina — Customer Support & Call Center, voice ID `OCsEi4G5LJzKMSZFmYBD`. Returned voice metadata explicitly says Barcelona Catalan, with `language: ca`, `accent: ca-standard`. Ten Catalan candidates returned; Bernat (`xhY8Usy3vWXXo4lHdNGd`) is an alternative.
- [Official model documentation](https://elevenlabs.io/docs/overview/models) lists Catalan for v3 and v4, but not Multilingual v2 or Flash/Turbo v2.5. V3 is a provisional fixed-clip choice with documented TTS API support, not a claim that it is the newest or best voice.
- Connector transcription node exposes `eleven_scribe_v1` only. Runtime candidate is API `scribe_v2`; [official STT documentation](https://elevenlabs.io/docs/overview/capabilities/speech-to-text) lists Catalan (`cat`). Do not equate MCP node IDs with API model IDs or assume Scribe v2 MCP access.
- Voice metadata and model language support are verified; actual paired output, native accent quality, runtime credentials/entitlements and recording accuracy are untested. Schema reports legacy `voice_id` plus `language_code`; recheck generation tool/schema when authoring, rather than guessing parameters.
- MCP is for authoring/testing. Ship fixed reviewed audio assets; use server-side APIs/SDKs for runtime transcription. Never put API secrets in HTML, browser storage, or public JSON. Hosted connector access does not establish app API credentials.

## Concrete lesson flow

Target: a beginner communicates arrival needs and repairs a missed question. About 8–12 minutes; all Catalan examples below remain draft. Every exercise states who you are, reservation status, party size, and any relevant name/time; optional English explains the situation without supplying the answer.

| Order | Exercise | Situation and success |
| --- | --- | --- |
| 1 | Listen + identify meaning | Hear “Teniu reserva?”; identify that staff ask about a booking. Replay and optional transcript/English available. |
| 2 | Choose | Booking under Martí for two. Accept any option conveying a reservation; ask for name/size separately if not yet requested. |
| 3 | Assemble chunks | Staff ask whose name. Build a response conveying Martí; allow valid alternative word orders and extra polite chunks. |
| 4 | Choose | No booking, two diners. Communicate no reservation and ask availability; missing party size prompts a follow-up, not a style penalty. |
| 5 | Type | Ask for a table for two without a booking. Accept equivalent requests, not only “Teniu lloc per a dos?”. |
| 6 | Listen + choose recovery | Missed the staff question. Choose a request to repeat, e.g. “Ho podeu repetir, si us plau?”. Replay the question after recovery. |
| 7 | Assemble chunks | Booking, arriving 15 minutes late. Acknowledge lateness and ask whether the table is still available. An apology alone leaves the availability question missing. |
| 8 | Type | Respond to the late-arrival situation in your own words; explanation length/formality is not a failure. |
| 9 | Speak | Say an arrival response and a repetition request in two short recordings. Replay, inspect/correct transcript, retry or use text. |
| 10 | Independent exchange | One of three arrival branches, 3–5 learner turns, no suggested replies/chunks. State need, supply requested details, respond to outcome; repetition always supported. Replay offers the other branches. |

Final exchange uses new name/party-size facts within taught vocabulary. Asking for repetition counts as successful recovery, not failure. Help remains available but is recorded as assisted practice; text completion and spoken attempts are distinguished. Do not infer mastery of all branches from one exchange.

## Answer contract and completion

- Assess intent plus only the information requested by this turn, incorporating already supplied context. Distinguish `communicated`, `needs_information`, `different_meaning`, and `uncertain`; style notes are separate and optional.
- “Tinc una taula reservada” answers whether there is a booking. “Voldria confirmar la meva reserva, si us plau” must not fail for formality. “Hi hauria alguna taula disponible, si us plau?” requests availability; follow up for party size if unknown. Native review must confirm exact examples.
- Missing name/size produces a specific follow-up. Wrong party size, contradicted reservation status, or unrelated intent does not pass. Negation must not be lost by normalization.
- Normalize case, whitespace, apostrophe variants and punctuation; tolerate harmless accent/typing errors with optional spelling help. Preserve meaning-bearing differences. Curated alternatives are examples, not an exhaustive exact-string whitelist. Unrecognized plausible answers get clarification/self-review, not an authoritative “wrong”.
- Persist versioned lesson/step IDs, attempts, assistance, completion and last activity locally; no raw recordings in progress storage. Resume after reload, provide reset, tolerate unavailable/corrupt storage honestly. Remove streak initially rather than invent it.
- Completion reports tasks practiced and unresolved details; independent completion requires the branch's requested information. No hearts, native/fluent claim, pronunciation percentage, or forced perfect first attempt. A skipped microphone task cannot count as spoken practice.

## Small reviewable stages

| Stage | Bounded deliverable | Exit check |
| --- | --- | --- |
| 2 — Content and answer rules | Draft `content/walking-in.v2.json`, a short answer contract, and acceptance fixtures; keep current app/data compatible by leaving legacy JSON untouched. Stable IDs, all ten exercises, three final branches, English help and review status. No engine/audio work. | Parse JSON; validate IDs/references/required fields, branch coverage, and positive/missing/contradictory/uncertain examples for each intent. Explicit native-review checklist. |
| 3A — Exercise engine | Wire v2 listening shell, choice, chunks and typing; context, optional help, answer outcomes, stable per-attempt shuffle. Remove hearts/labels; only Walking in opens, others and full-meal mode say Coming soon. | Fixtures exercise actual evaluator; verify valid alternatives, negation, selection after shuffle, keyboard operation and retry. Audio/speech clearly unavailable pending later stages. |
| 3B — Saved progress | Versioned local progress, resume/reset, truthful home counts and completion. | Reload/restart, repeated completion, content-version change, corrupt/blocked storage; no invented streak or speech credit. |
| 4 — Audio | After content review and explicit paid-generation authorization, trial selected voice/model with a few phrases via hosted MCP; native listening approval before bounded batch. Static assets and manifest; real play/replay/error states. | Every clip maps to reviewed text/version; no dead controls or overlapping playback. Test iOS Safari/Android Chrome manually. No guaranteed browser Catalan voice fallback. |
| 5 — Recording/transcription | Short press-to-record/stop/replay flow; server endpoint uses Scribe v2 API; display editable transcript and text fallback. | Mock API tests for permission denial, unsupported MIME, empty/noisy audio, timeout and size/duration limits. Explicit upload action, short-lived audio, server-side secret, request limits; consented live smoke test separately authorized. No pronunciation scoring. |
| 6 — Constrained conversation | Three finite-state branches using same answer contract and reviewed staff clips; typed or recorded turns, follow-ups, recovery, turn cap, truthful outcome. No open-ended agent required. | Each branch, missing/contradictory details, repeat request, uncertain answer, off-topic input, assistance and exhausted turns tested. No invented booking actions or unjustified success. |
| 7 — Verification | Focused end-to-end and accessibility checks; native-speaker review of full lesson and audio, beginner trial; fix only lesson defects. | Recorded results for all branches and modalities; unresolved checks explicitly block release readiness. No push/deploy. |

Automated checks establish data integrity and software behavior, not Catalan validity. Required native-speaker review must cover every prompt, accepted alternative, rejected example, translation, spelling tolerance, register note, final branch and generated clip (pronunciation, stress, pace, accent). Record reviewer/date/content version and corrections; no review has happened yet. Beginner observation must confirm context is clear and the final exchange works without answer hints. All stages end with concise handoff and the next exact prompt; no automatic continuation.
