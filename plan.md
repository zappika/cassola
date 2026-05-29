# Plan: Cassola

## Last session — 2026-05-29
- What we built: full bootstrap (GitHub repo, Vercel deploy, cassola.xyz domain) + Home screen matching design canvas exactly
- Where we stopped: Home screen live at cassola.xyz, sub-chunk 1 of Phase 1 complete
- Next action: build sub-chunk 2 — Scenario intro screen

## Goal
A Catalan-only restaurant phrase app for Barcelona expats. Covers the full arc of a meal — walking in, ordering, paying, leaving. The first version uses a card-based mechanic (flip through phrases for the situation) to get something real in front of people and answer whether that model feels right or wants to be conversational instead. Should feel right on a phone, opened standing outside a bar.

## Phase 1: Something you can actually use
- [x] Home screen — greeting, full-flow CTA ("Mode complet"), scenario list
- [ ] Scenario intro screen — cover card, variant list, "Som-hi" CTA
- [ ] Practice screen — card-based, flip through phrases for one scenario
- [ ] Phrase content wired in for "Walking in" scenario (the entry point)
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

## Decision log
- 2026-05-29: Card-based mechanic for Phase 1 (not conversational). Reason: fastest path to something testable. Revisit after real usage.
- 2026-05-29: Plain HTML + React via CDN, no build step. Reason: no bundler overhead for a static phrase app at this stage.
- 2026-05-29: Design system fully specced (Cassola brand) before first line of app code. Reason: design handover from Claude Design already complete.
- 2026-05-29: Domain cassola.xyz added to Vercel. Every push to main auto-deploys.
- 2026-05-29: Sticker and CassolaMascot components lifted directly from design canvas — no changes needed.
