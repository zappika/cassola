# Cassola handoff

## Stage 3B complete — 2026-10-16

Stage 3A is deployed at https://cassola.xyz with user authorization. Stage 3B is now deployed at https://cassola.xyz with user authorization. The completed lesson, review tooling and saved progress are included in this GitHub release. No audio generation, paid calls or subagents.

### Completed / changed files

- `app/progress.mjs`: versioned browser-local learner storage, validated reload/resume, current exercise ID/order/answer/chunks/help/feedback/partial facts, submission records, separate skip/help/communicated evidence, unique goal counts and completed-run counts. Repeated Continue cannot duplicate a completion. Revisit becomes due after 24 hours without removing prior evidence. Lesson-version changes retain previous evidence separately and reset the active version. Reset affects only the learner key; storage failures are reported.
- `app/main.jsx`: connects persistence to guided exercises; home/intro display real counts, last activity, resume and confirmed reset. Guided practice never awards independent or spoken completion. Visual identity retained.
- `tests/progress.test.mjs`: nine persistence tests. `package.json`: adds `test:progress`.
- `content/ANSWER_RULES.md`: documents storage behavior and current deployment status.
- `IMPLEMENTATION_PLAN.md`: status updated; scope remains one Walking in lesson.

### Validation

- `node --test tests/engine.test.mjs tests/progress.test.mjs tests/review.test.mjs`: **74 passed** (58 evaluator, nine persistence, seven review).
- Structural content validator and `git diff --check` pass.
- Automated persistence: shuffled choices/typed/chunk drafts, help/feedback/partial facts, reload, reset isolation, repeat runs/idempotence, skip and assistance records, 24-hour due boundary, version change/archive, invalid JSON/nested data, blocked reads/writes/reset and quota failure.
- Local browser: submit with hint → reload → resume same shuffled selection/help/success feedback; Continue once increments goal count; skipped exercise stays distinct; partial phrase survives exit/resume; reset confirmation clears test progress and reload stays clear.
- Production browser: Stage 3A home, lesson intro and first exercise load; `/review` login remains available. Production native-review writes were not repeated. No review source/API changes in this stage.

### Decisions / limitations

- Storage key: `cassola.walking-in.progress.v1`. Browser-local only: no cross-device or concurrent-tab synchronization. Review persistence is separate and unchanged. No recordings or credentials stored.
- Guided evidence is `practised_with_help` even when no optional hint was used: the guided environment itself supplies support. Actual per-step assistance flags remain separate. Independent completion stays unavailable until Stage 6.
- Archived versions preserve completed-step/submission evidence; unfinished drafts reset when content changes. Revisit is measured from the latest finished exercise with a submission or communicated result; skips alone do not establish practice.
- Native Catalan review, audio, recording/transcription and independent exchange remain pending. No full-lesson competence claim. Storage failure permits in-memory practice with a warning; failed erase warns old progress may return.

### Deployment

Stage 3A: `dpl_7suEueTpDCGSMRBNLwD5KGUEc574`, https://cassola-hlvehk1or-sarper-se.vercel.app, aliased https://cassola.xyz. Deployed working files over base commit `9ad2121825e628e6b9639484a74352b9a7377fe8`; no Git commit/push. Stage 3B: `dpl_DTzHCACHxBawoaTMP9VUfxx1jjes`, https://cassola-ekot95rx8-sarper-se.vercel.app, READY and aliased to https://cassola.xyz. Public app/main.jsx, app/progress.mjs and review/index.html match the tested local files byte-for-byte; /review returns HTTP 200. All 74 tests pass before release.

Project `sarper-se/cassola` (`prj_4x2IMv5591pZqeNovpXtV20TftPb`). Private review Blob store `cassola-native-review` (`store_xlR2wLvmTMSGYHo9`, cdg1). Reviewer code remains a server secret shared earlier in chat; never commit it. Ignored `.vercel/` and `.env.local` exist. CLI deployment used existing credentials. Local server: http://127.0.0.1:4321/ (`npm run dev:review`).

## Exact next-stage prompt

> STAGE 4 ONLY — AUDIO: Read CLAUDE.md, IMPLEMENTATION_PLAN.md, HANDOFF.md, content/ANSWER_RULES.md and the current lesson/engine/progress code. Verify the native-review status of the proposed scripts and discover current hosted ElevenLabs tools/model/voice capabilities. Prepare a small, reviewable Catalan voice trial and state its exact texts and paid-generation scope; obtain explicit paid-generation authorization if not already given. Do not generate a full batch before native listening approval. Within authorized scope, add reviewed static audio assets and a versioned manifest, real play/replay/loading/error controls and single-clip playback; preserve optional text/English access and honest reading/listening progress. Test playback, missing assets, interrupted playback and content-version mapping; distinguish automated checks from required native listening and iOS Safari/Android Chrome checks. Keep credentials server-side. Do not implement recording, transcription, conversation or other scenarios. Do not push/deploy without explicit authorization. Update HANDOFF.md with completed work, validation, blockers and the exact next-stage prompt, then stop. Avoid subagents and unrelated refactoring.
