# Walking in v2 — content and assessment contract

Draft, 2026-10-15. All Catalan and translations await native-speaker review. Stage 3A now implements a bounded evaluator in `app/engine.mjs` and loads `walking-in.v2.json`; Stage 3A was deployed on 2026-10-16. Stage 3B adds browser-local, versioned learner persistence and is also deployed.

## Data boundaries

`walking-in.v2.json` separates situations, answer rules, exercises, teaching notes, scripted branches and audio records. IDs are stable; `content_version` changes when meaning or acceptance changes. Review status at lesson level applies to every nested string; explicit review records support later sign-off. Null audio paths mean unavailable, never a playable control. `model_lines` are optional examples, not answer keys displayed before an independent attempt.

A situation's `facts` are learner-visible ground truth, **not automatically known to staff**. Resolve `$name` and `$party_size` from that situation. Braced values in accepted examples are display templates; number words come from `party_size_word`. The final exercise's situation/rule defaults are overridden by the selected branch/current node. Do not start every final attempt with the default reservation facts.

Each exercise references a rule containing its goal, required details, accepted examples, hint, model audio and review status. Staff lines carry their own audio reference. Teaching notes appear at the specified point during guided practice; optional model playback and hints provide instruction before unsupported production. Final attempts have no model responses or chunk bank. Optional context English remains available and does not reveal an answer; staff translations, answer hints and models count as assistance. Transcripts are an accessibility alternative; record text/listening modality rather than claiming listening ability from reading.

## Decision order

1. Empty submission: request the current required details, never success. During a conversation, recognize a repetition request first; replay the current staff line, preserve state, and do not count recovery as assistance.
2. Interpret the whole reply against the current goal and facts, retaining negation. A contradicted relevant fact or clearly different intention gives `different_meaning`. A new name/size is not accepted merely because the sentence is grammatical. Extra information that contradicts the situation also needs clarification.
3. Credit compatible details supplied earlier. Only require the current rule's details; do not demand name or party size just because they appear in the situation. If a known intent lacks required information, return `needs_information` with the exact missing keys. Ask for those details and merge subsequent replies; do not force the learner to repeat the entire sentence.
4. If the required meaning is conveyed, return `communicated`. Formality, verbosity, politeness and equivalent vocabulary never cause failure. Any spelling/style suggestion is optional and separate from the outcome.
5. Plausible wording that cannot be interpreted confidently gives `uncertain`, not “wrong”. Offer rephrasing or a model for assisted practice. Self-confirmation alone must not award independent completion.

For implementation, use reviewed patterns/paraphrases and slot extraction with a conservative uncertain fallback. Examples are not an exhaustive whitelist. Do not use keyword presence alone, fuzzy similarity alone, or an LLM as the final authority. Automated fixtures are minimum acceptance cases, not proof of unrestricted semantic understanding.

Normalize Unicode, case, surrounding/repeated spaces, typographic apostrophes and nonessential punctuation. Known harmless variants include `SI, TINC RESERVA!`, `Marti` for the supplied Martí, and `2`/`dos`. Never remove `no`, change a name/number, or globally strip distinctions that alter meaning. Unsupported/ambiguous typos remain uncertain. Singular/plural politeness variants of repetition are acceptable when the request is clear.

## Specific boundaries

- Reservation: “Tinc una taula reservada” and “Voldria confirmar la meva reserva, si us plau” both succeed when asked whether there is a booking. Neither must volunteer a name.
- Walk-in choice: a no-booking statement plus availability request succeeds even without party size; staff then ask for it. A no-booking statement alone misses the availability request, not “naturalness”. In the typing task, requesting a table **and** size are explicit goals. A polite request such as “Voldríem una taula…” counts as an availability request even without a question mark.
- Late arrival: an apology in response to the staff's lateness statement acknowledges lateness. An explanation can be long; it only needs a table-availability question to meet the combined goal. An apology alone is incomplete, not culturally wrong.
- Chunks: shuffle by stable ID once per attempt; allow undo. Listed sequences are examples, not exhaustive permutations. Assess the assembled meaning through the same rule; optional polite chunks and valid order changes must work. A name alone answers “A quin nom?”.
- Choice outcomes are authoring metadata. Hide outcomes and all evaluative styling until submission, and shuffle choices. More than one option may communicate successfully. English choices are optional help, not permanently visible labels.

## Scripted exchange and honest progress

Each branch has 3–5 core turns. Keep the named nodes in order; when details were volunteered early, the later node confirms them without asking the learner to repeat them. Acknowledgement of that confirmation satisfies the already-known detail; new contradictory details do not. Repetition returns to the same node. Missing/uncertain/different replies stay at that node. Ten total learner submissions (including recovery) cap a session; explain that the practice ended and offer retry, never manufacture success.

In the final exchange, use neutral staff questions for missing details (e.g. name/size). Coaching that supplies answer wording or tells the learner which intent to add is assistance. Any correction revealing a wrong answer counts as assistance; a fresh attempt can regain independent status. A complete supported run is `practised_with_help`; a fresh complete unassisted final branch is `completed_independently`. Guided exercise completion alone never qualifies. Store evidence per branch and input mode; do not imply mastery of all three branches.

`revisit_later` is a due flag after 24 hours, not a downgrade of past completion. No fake streak. No network submission until the learner explicitly submits a recording. Corrected transcripts can demonstrate typed meaning; record edits and do not claim they prove spoken competence. Text fallback does not count as a recording. Transcription is never a pronunciation score.

Next-day beginner check: use another branch with the provided changed facts, without an immediate model-answer warmup. Observe whether learners convey required details, recover through repetition, and finish without hints; record assistance and failures. Review those results before expanding the lesson template.

## Review and validation gates

Run `python3 tests/validate_walking_in_content.py` for structure, cross-references, branch paths, outcome coverage, audio placeholders. `npm run test:lesson` executes the 51 answer fixtures and additional regressions against the actual bounded evaluator. The structural validator does **not** evaluate Catalan answers. Unrecognised clauses remain uncertain; the tests do not establish unrestricted language understanding or native correctness.

Required native review: prompts/context; all accepted and contrasting replies; translations; missing-detail feedback; normalization allowances; chunk alternatives; register and regional suitability; branch continuity; generated audio pronunciation, stress and pace later. Record reviewer, date and content version, and adjust fixtures with corrections. No native review or pronunciation test has occurred. Beginner transfer testing and actual audio/device checks also remain future work.

## Saved progress (Stage 3B)

`app/progress.mjs` stores learner progress under `cassola.walking-in.progress.v1`, independently of native reviews. It retains the active exercise (including shuffle, answer, help, partial facts and feedback), submission outcomes and completed-step records. Unique communicated goals never inflate across repeat runs. Guided evidence is `practised_with_help`; no independent or spoken credit is available. Revisit is computed 24 hours after the last attempted/communicated finished exercise, preserving evidence. Content-version changes start fresh and retain older evidence separately. Reset removes only this learner key; blocked storage produces an explicit warning. This is browser-local storage, not cross-device or multi-tab synchronization. Run `npm run test:progress` for persistence checks.
