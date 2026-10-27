# Cassola handoff

## Learner audio merged and pushed — 2026-10-27

The local learner-audio work was 9 commits behind origin (the live conversation redesign, Web Audio playback, speech-to-text). It was committed on `learner-audio`, merged with origin/main, and pushed to main. Nothing was deployed and no audio was generated.

- Resolution: kept origin's conversation UI, Web Audio player and speech input. Re-applied only the learner audio on top: `clipFor` learner matching in `app/audio.mjs`, and the speaker button on accepted choice/listen-choice/build bubbles in `SentMessages` (`app/main.jsx`), plus its inverted style on the dark learner bubble (`app/lesson.css`). The manifest is ours (a superset of origin's three staff clips).
- Dropped as superseded: the local `TryAgain` card. Origin's "retry replaces failed reply" flow covers it.
- `tests/audio.test.mjs` player tests were rewritten for the Web Audio player (fake context and loader). **90 tests pass**; `git diff --check` is clean.
- Browser (local, desktop): "Si tenim reserva." and the built "A nom de Martí si us plau" both show the speaker button, play and end. Their MP3s return 200, with no console errors. Native listening review is still pending for all 63 learner clips and the 3 staff clips.

## Learner reply audio complete locally — 2026-10-27

User explicitly selected all 63 clips, including the interpretation answer and every accepted build combination. Generated one take per clip, no retries, using the connected ElevenLabs workflow with Martina `OCsEi4G5LJzKMSZFmYBD`, `eleven_v4`, explicit `language_code: ca`.

- Flow `wB7nP6Tq7eQCz0PZBpmk`; all 63 generation IDs and actual individual costs/durations are recorded in `content/audio-trial.mjs` with `role: learner`, per-clip generation date/flow, and `awaiting_native_listening_review`.
- Actual batch total: **2796.7203 credits / 50.84946 US cents (~$0.5085)**; 225.04 seconds provider-reported duration; 4,744,191 bytes. All 63 files verified mono MP3, 44.1kHz, approximately 128kbps using `afinfo`.
- Covers the original 14 replies plus 49 unique variants, including all 53 accepted build permutations. The provider caps each run at 20 nodes, so 63 distinct nodes were started in four batches; no duplicate generation calls.
- `review/catalog.mjs` includes all learner recordings as generation-specific Voice trial sections (89 sections total). `app/main.jsx` now explicitly limits learner audio to choice/listen-choice/build exercises, keeping typed replies text-only.
- Validation: **90 tests pass**, including exhaustive build/choice audio coverage, punctuation matching, and review entry coverage. Browser verification: accepted interpretation and built name with “si us plau” get playback controls, play successfully, and reach “↻ Torna a escoltar”. Native pronunciation/accent/pace approval remains pending; automated format checks do not establish speech quality.
- Local assets and code only; no push or deployment. Local preview: http://127.0.0.1:4321/ and /review. Review UI verified with all 89 sections and learner audio controls. Existing published site is unchanged.
- Next: listen with a native Catalan reviewer, record feedback for these specific generations, and approve or request corrections. Obtain explicit authorization before any additional paid takes or deployment. Do not implement recording/transcription or agents as part of this batch.


## Audio trials published — 2026-10-17

User authorized production deployment for native listening. READY deployment `dpl_JAak61BcHj1rYLywa4SD6WNDEN17` (https://cassola-bx9jyb4kg-sarper-se.vercel.app), aliased https://cassola.xyz. Three trial clips and their Voice trial review sections are now live at https://cassola.xyz/review. This supersedes local-only status below. No Git push or new audio generation.

- Validation: 88 tests pass; diff whitespace check clean. Public review HTML, app/main.jsx, app/audio.mjs, review catalog/client, audio manifest and all three MP3s return 200 and match local bytes. MP3 MIME is audio/mpeg. Review API returns 401 without authentication. Authenticated production save was not exercised; existing review storage/configuration unchanged.
- Changed files this deployment turn: HANDOFF.md only; deployed existing tested working-tree changes. Native listening approval and real-device checks remain pending.
- Next-stage prompt: “Read HANDOFF.md. Collect native-speaker feedback on the three live Voice trial sections at /review, apply agreed corrections, and update the handoff. Do not assume approval, generate more paid audio, or advance to recording/transcription without authorization.”

## Stage 4 voice trial — 2026-10-17

Three user-authorized paid clips generated and integrated locally. No deployment/push, full batch, recording, transcription or agents. Earlier published UI remains live.

- Hosted MCP verified: TTS v4 (default), v3, Multilingual v2, Flash/Turbo v2.5; transcription node exposes only `eleven_scribe_v1`. Official current model docs list Catalan for v4/v3; not Multilingual v2 or Flash/Turbo v2.5. Chose v4 instead of the earlier provisional v3 based on current default/support. Ten Catalan voices found; Martina's metadata explicitly identifies Barcelona Catalan (`OCsEi4G5LJzKMSZFmYBD`). Voice/model support verified, native output quality not certified.
- Flow `JUM4idT5iUmZMx19RUKJ`: one take each, no retries. “Bona nit, teniu reserva?” (1.68s, generation `B8nKNVbmRzt0S3Q66ZA0`); “A quin nom?” (0.88s, `PTOhFKEaeQkZvihIdA4C`); “Arribeu una mica tard.” (1.36s, `TnpDWPbIJXSsCQFuQe32`). Total 56.9943 credits / 1.03626 US cents per provider results. Estimate-only call also left an unused node; no generation charge for that estimate.
- `audio/trial/*.mp3`: generated mono 44.1kHz 128kbps assets. `content/audio-trial.mjs`: exact text/version, IDs, model, voice, cost/duration and pending native-listening status; no signed URLs or credentials.
- `app/audio.mjs`, `app/main.jsx`, `app/lesson.css`: click-to-play, stop, replay/loading/error states, shared single player with timeout/race protection; stop on turn change, exit or hidden tab. Only matching text/version gets a control. Text stays visible; no listening/independent/pronunciation credit is granted. No runtime provider call or client secret.
- `review/catalog.mjs`, `review/review.mjs`, `review/index.html`: three new audio-specific sections, real audio controls, clear listening approval wording and generation-specific revision identity. Existing script approvals cannot approve the audio. `scripts/review-dev.mjs`: MP3 MIME. Local dev server restarted on 4321.
- `tests/audio.test.mjs` adds five checks; review catalog test updated for 26 sections. **88 tests pass**; `git diff --check` passes. Files verified as MP3. Browser confirmed three controls play, late clip reaches replay state, and native-review section contains audio with correct approval wording. Errors/overlap/timeout/text mismatch tested with fake media, not native devices.
- Limitations: native reviewer has not approved these new recordings; production review events were not retrieved during this turn, so no script approval was assumed. Very short clips require a native check for pace and clipping. iOS Safari/Android Chrome checks remain pending. Draft runtime is local, not release-ready audio. No transcript quality testing or recording implementation.


## Published — 2026-10-17

Home, contextual English help and conversation UI are live at https://cassola.xyz. Deployment `dpl_7muKvBvxK9nC2UmwmUbYfYRdgUaK` (https://cassola-6o7j44tfg-sarper-se.vercel.app) is READY. All 83 tests pass; live main/conversation/language-help/progress/catalog files match local files byte-for-byte. `/review` returns 200; review API correctly requires authentication (401). No Git push in this publication turn. Earlier local-only notes below describe the development passes and are superseded by this release record.

Current scenarios follow the fixed authored order: booked, walk-in, late, with repetition practice. Only choices/chunks shuffle. Independent branch selection (least attempted, random tie-break) remains unimplemented Stage 6.

## Home simplification complete — 2026-10-17

User requested a curious, playful home instead of instruction-heavy screens. Local only, alongside the conversation/UI work below; not pushed/deployed.

- Changed `app/main.jsx` and `app/lesson.css`: Caçó greeting, one red Walking in invitation, one start/resume action. Retained future scenarios as small decorative cards under a single coming-soon label. Removed full-meal promotion and the intermediate instruction screen.
- Progress/reset live in collapsed “Your practice”; a small About disclosure holds current text-only scope and pending native review. Storage failures remain visible. Fresh/finished sessions start a new run; interrupted sessions resume directly without resetting evidence.
- Validation: 83 existing tests pass; browser verified direct resume into the existing conversation, exit back home and expandable progress/reset. 390 × 844 visual check and `git diff --check` pass. No new low-impact presentation tests added.
- Screenshot: `/Users/sarper/.codex/visualizations/2026/10/15/01a13e80-7d12-7850-bca6-c7a20ff4627d/cassola-home-invitation.png`.
- New greeting/tagline copy is draft, pending native review. No assessment changes, paid calls, push or deployment.

## Conversation UI complete — 2026-10-17

User approved replacing step screens with a chat mental model. This and the previous simplified UI remain local; not pushed/deployed. Production remains Stage 3B. No audio, recording, paid calls or subagents.

### Completed / changed files

- `app/main.jsx`: persistent waiter/learner messages, scene changes and instructions within the thread, changing choice/chunk/text composer. ENVIA sends; selection/typing alone never adds a reply or feedback. Success appends the sent reply and moves directly to the next composer. Failed replies and follow-ups stay visible. No numbered exercise header, progress bar or normal Continue step. Legacy successful drafts retain one Continue action for compatibility.
- `app/conversation.mjs`: derives current-run history from saved evidence, resolves choice IDs to actual replies, avoids repeating unchanged staff lines/context, retains sent text/translation and missing details. Never invents unsaved historical replies.
- `app/progress.mjs`: accepts validated optional translation/missing-detail metadata while preserving old stored submissions. Successful send saves the draft and completion atomically to avoid lost/duplicate replies. Previous run evidence stays separate.
- `app/lesson.css`: sticky conversation header, left waiter/right learner bubbles, quieter scene/instruction notes, reply composer and post-send status. Original Cassola identity retained.
- `tests/conversation.test.mjs`: atomic send/reload, history isolation, scene boundaries and literal typed/chunk replies. Existing glossary changes (`app/language-help.mjs`, `review/catalog.mjs`, `tests/language-help.test.mjs`) remain included locally.

### Validation

- `node --test tests/*.test.mjs`: **83 passed**. `git diff --check` passes.
- Browser: existing saved session reconstructs transcript; selecting only changes the draft; Send appends the choice and switches immediately to typing; partial typed reply gets a missing-detail follow-up, then “Som dos.” succeeds; reload restores both replies; repetition produces the authored repeated waiter question and advances to chunks.
- 390 × 844 visual check: persistent header, earlier messages, scene transition, waiter line and chunk composer. Screenshot: `/Users/sarper/.codex/visualizations/2026/10/15/01a13e80-7d12-7850-bca6-c7a20ff4627d/cassola-conversation.png`.

### Decisions / limitations

- Still the existing supported guided content and answer rules, now presented conversationally. The independent branching exchange remains Stage 6; no unrestricted chatbot or independent-competence claim.
- Staff/choice/chunk English is shown after sending. Free text is retained literally, not falsely translated. Inline word help and native-review metadata remain from the previous revision.
- Audio/recording remain unavailable; their future composer modes are not simulated. Native review of lesson/glossary remains pending. Home/intro were subsequently simplified in the pass above.
- Earlier saved submissions without missing-detail metadata use authored choice information or a generic follow-up. Legacy chunk replies without stored translation remain Catalan only.

### Deployment

Stage 3A: `dpl_7suEueTpDCGSMRBNLwD5KGUEc574`, https://cassola-hlvehk1or-sarper-se.vercel.app, aliased https://cassola.xyz. Deployed working files over base commit `9ad2121825e628e6b9639484a74352b9a7377fe8`; no Git commit/push. Stage 3B: `dpl_DTzHCACHxBawoaTMP9VUfxx1jjes`, https://cassola-ekot95rx8-sarper-se.vercel.app, READY and aliased to https://cassola.xyz. Public app/main.jsx, app/progress.mjs and review/index.html match the tested local files byte-for-byte; /review returns HTTP 200. All 74 tests pass before release.

Project `sarper-se/cassola` (`prj_4x2IMv5591pZqeNovpXtV20TftPb`). Private review Blob store `cassola-native-review` (`store_xlR2wLvmTMSGYHo9`, cdg1). Reviewer code remains a server secret shared earlier in chat; never commit it. Ignored `.vercel/` and `.env.local` exist. CLI deployment used existing credentials. Local server: http://127.0.0.1:4321/ (`npm run dev:review`).


## Exact next-stage prompt

> STAGE 4 CONTINUATION ONLY: Read HANDOFF.md, content/audio-trial.mjs, app/audio.mjs and the current conversation UI. Listen with the user/native reviewer to the three existing Martina/v4 clips before spending more credits. Record pronunciation, accent, pace and wording feedback per clip in the Voice trial sections. Apply agreed corrections without treating script approval as audio approval. Generate further clips only after native listening approval and within explicit paid-generation authorization. Finish the reviewed audio manifest/playback coverage, test missing/error/overlap/version changes, and record actual iOS Safari/Android Chrome checks separately from automated tests. Keep text accessible and progress honest. Do not implement recording/transcription, agents or independent branches. Do not push/deploy without explicit authorization. Update HANDOFF.md with validation, blockers and the exact next-stage prompt, then stop.
