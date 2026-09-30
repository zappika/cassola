# Plan: Cassola

## Last session — 2026-05-29
- What we built: Scenario intro screen (faithful CassolaScenario port + en Caçó filling the space above a pinned CTA) and a lightweight Home↔Scenario screen-state router. Then a full identity pass — rich link-preview card (OG + Twitter meta + 1200×630 og.png) and the Caçó favicon set (svg + 32px + 180px apple-touch), all live on cassola.xyz; og.html/icon.html kept as regen sources but .vercelignore'd.
- Where we stopped: Scenario intro is live and navigable from Home (tap any scenario row → intro → back). Per-scenario content not yet wired — every row shows walking-in content + hardcoded "ESCENA 01". Practice screen not started. Link previews + favicon done and verified live.
- Next action: build the Practice screen — lift CassolaPractice (waiter line → 3 tagged responses → "Comprova"), wired behind the scenario's "COMENÇA, VINGA" CTA

## Goal
A Catalan-only restaurant phrase app for Barcelona expats. Covers the full arc of a meal — walking in, ordering, paying, leaving. The first version uses a card-based mechanic (flip through phrases for the situation) to get something real in front of people and answer whether that model feels right or wants to be conversational instead. Should feel right on a phone, opened standing outside a bar.

## Phase 1: Something you can actually use
- [x] Home screen — greeting, full-flow CTA ("Mode complet"), scenario list
- [x] Scenario intro screen — cover card, variant list, "Som-hi" CTA
- [ ] Practice screen — conversational multiple-choice (waiter line → tagged responses → "Comprova")
- [ ] Phrase content wired in for "Walking in" scenario (the entry point)
- [ ] Native audio playback — tap a phrase, hear it spoken via the browser's built-in Catalan voice (Web Speech API, `utterance.lang = "ca-ES"`). Free, no pipeline, works on iOS out of the box.
- [ ] Deploys cleanly on mobile, fonts and colors correct

Acceptance criteria: you can open it on your phone, tap "Walking in", flip through the phrases, and it feels like something worth showing someone.

## Phase 2: All 9 scenarios + cultural hacks
- [ ] Content for all 9 contexts (walking in, table, menu, drinks, ordering, mid-meal, after, paying, leaving)
- [ ] Cultural hack callouts inline — "Short = native", "Merci is very Barcelona", etc.
- [ ] Mode complet — randomised full-meal flow that draws from all scenarios in order
- [ ] Mistake or correction screen (Caçó "oh" expression, before/after callout)

Acceptance criteria: a full meal flows start to finish, cultural hacks land in the right moments.

## Phase 3: Retention layer
- [ ] Conversational mechanic explored — waiter says something, you pick a response
- [ ] Streak or session tracking (lightweight, no accounts)
- [ ] End-of-session reward screen (Caçó proud)
- [ ] Onboarding (1-3 screens, first run only)

Acceptance criteria: there is a reason to open it more than once.

## Phase 4: Distribution
- [ ] QR code sticker design (scenario-specific deep links)
- [ ] Print-ready sticker files
- [ ] Share mechanic or landing page for bar discovery

Acceptance criteria: something you can stick on a wall.

## Phase 5: Studio-quality audio (deferred — don't start yet)
> Deliberately parked. Native voice carries us until the content settles. Don't build the content → ElevenLabs → export → ship pipeline before there's enough content to make it worth running once.

**Trigger to start:** content has stabilised (most of the Phase 2 phrases written and unlikely to churn daily), AND/OR real usage shows the native compact voice is too robotic for a pronunciation app, or Android/desktop users report no sound.

- [ ] Create an ElevenLabs account, add the Catalan voice/package
- [ ] Generate audio for the full fixed phrase set (one batch, not per-edit)
- [ ] Commit/serve the MP3s as static assets, swap playback from `speechSynthesis` to `<audio>`
- [ ] Verify identical playback across iOS / Android / desktop

Acceptance criteria: every phrase sounds like a real, warm Barcelona voice, identically on every device — no dependency on what's installed on the user's phone.

Why this is cheap to defer: the phrase set is finite and known, so the native→pre-generated swap is a self-contained job that can happen any time. Starting native costs nothing we can't reclaim later.

## Decision log
- 2026-05-29: Card-based mechanic for Phase 1 (not conversational). Reason: fastest path to something testable. Revisit after real usage.
- 2026-05-29 (revised): Phase 1 Practice screen is the conversational multiple-choice mechanic, not card-based flip-through. Reason: the only practice screen actually in the design canvas (CassolaPractice) is the multiple-choice one — lifting it is the fastest path to something real, and reacting to it answers the "does this model feel right" question just as well. Conversational pulled forward from Phase 3.
- 2026-05-29: Plain HTML + React via CDN, no build step. Reason: no bundler overhead for a static phrase app at this stage.
- 2026-05-29: Design system fully specced (Cassola brand) before first line of app code. Reason: design handover from Claude Design already complete.
- 2026-05-29: Domain cassola.xyz added to Vercel. Every push to main auto-deploys.
- 2026-05-29: Identity pass once the page was live — OG/Twitter link-preview card + Caçó favicon, both from the existing brand. PNG og.png (WhatsApp/iMessage need raster), full-bleed favicon PNGs (iOS blackens transparent corners), og.html/icon.html .vercelignore'd. Captured as the reusable /s-identity command for future projects.
- 2026-05-29: Sticker and CassolaMascot components lifted directly from design canvas — no changes needed.
- 2026-05-29: Audio strategy — start with the native browser voice (Web Speech API, `utterance.lang = "ca-ES"`), upgrade to pre-generated ElevenLabs files later (Phase 5). Reason: iOS ships a compact Catalan voice in firmware (Jordi/Montserrat), so setting `lang = "ca-ES"` speaks Catalan out of the box with zero pipeline, zero storage, zero cost — fastest path to validating the core "tap → hear → repeat" loop. Confirmed Apple bundles it; no download required. Known gaps accepted for now: (1) compact voice is robotic, which matters more for a pronunciation app than most; (2) it's an iOS guarantee — Android (Google TTS) and desktop Windows treat Catalan as a downloadable pack that's often absent, so those users may get silence or a wrong-accent fallback. What would change it: content stabilises, or those gaps bite in real usage → run the one-time ElevenLabs export. Deferred deliberately to avoid building an "add content → upload to ElevenLabs → pull files → ship" loop before there's enough content to justify it.
