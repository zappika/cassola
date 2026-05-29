# Cassola

A Catalan-only restaurant language app for expats in Barcelona. Learn exactly what to say in a restaurant — walking in, ordering, asking for the check — strictly in Catalan. No grammar, no vocab lists. Just the real phrases for one specific place.

## Stack
- Frontend: Plain HTML + React (JSX via Babel CDN, no build step)
- Data: JSON files (scenarios, phrases, variants)
- Deploy: Vercel, connected to GitHub at https://github.com/zappika/cassola — live at https://cassola.xyz

## Brand
- Name: Cassola / Tagline: "Català que cou a foc lent."
- Mascot: en Caçó — a smiling clay cassola pot (inline SVG, `expression` prop: happy/oh/wink/proud/sleepy/confused)
- Colors: Yellow flood (#FFD23F) light / Deep ink (#14110D) dark
- Type: Space Grotesk (display + UI) · Newsreader italic (accents) · IBM Plex Mono (kickers)
- Component system: 2.5px solid border + hard offset shadow (no blur) + ±3° rotation on stickers
- Full spec in ~/Desktop/Restaurant\ Catalan/CASSOLA-SPEC.md

## Structure
```
/scenarios/          — JSON data per scenario (walking-in, ordering, check, etc.)
/components/         — React components lifted from design canvas
index.html           — entry point, bootstraps React
```

## Screens designed (in ~/Desktop/Restaurant Catalan/)
1. Brand sheet
2. Home — greeting, full-flow CTA, scenario list
3. Scenario intro — cover card + variant list + "som-hi" CTA
4. Practice — waiter line + multiple-choice + "comprova"
5. Mistake/correction — Caçó banner + before/after + continue

Reference files: direction-cassola.jsx (light), direction-cassola-dark.jsx (dark), shared.jsx, canvas.jsx

## Current state
Folder created. Design spec complete. Starting implementation from design canvas components.
