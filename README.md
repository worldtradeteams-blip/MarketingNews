# Global Marketing Intelligence

A selective, teaching-oriented dashboard of global marketing cases. Static site — no API keys, no backend required.

## Run locally
Serve the folder with any static server (needed for `fetch()` of `config/sources.json`), e.g.:
```
npx serve .
```
Then open the printed URL.

## Deploy
Drag-and-drop this folder onto Netlify, or `netlify deploy`. No environment variables required.

## How it works
- Ships with 5 hand-curated seed teaching cases (`js/seedCases.js`) so the dashboard is never empty.
- On load, it *attempts* to fetch each RSS source in `config/sources.json` through a public CORS relay.
  Live items are scored with a conservative keyword heuristic and dedupe against existing cases.
- If a source is blocked/unreachable, it's marked "unavailable" in **Sources** and the rest of the app
  continues unaffected — no fake/live data is shown for a failed source.
- Live items are labeled "pending editorial review" — they haven't gone through full human/LLM case analysis.
  Treat `js/seedCases.js` as the model for fully analyzed cases.

## Optional: remove CORS dependency entirely
Deploy `netlify/functions/fetch-source.js` and point `CORS_PROXY` in `js/app.js` to
`/.netlify/functions/fetch-source?url=` instead of the public relay. No API key needed.

## Extending
- Add/edit sources in `config/sources.json`.
- Add fully-analyzed cases by following the object shape in `js/seedCases.js`.
- Scoring thresholds: 85+ Featured, 75–84 Strong, 65–74 Watchlist, <65 hidden.

## Data & copyright
Only headlines, short original summaries, and links to original articles are shown — never full article text.
