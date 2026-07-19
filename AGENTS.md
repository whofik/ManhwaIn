# AGENTS.md — ManhwaIn (WibuKon)

A Node.js web scraper/reader for `https://www.manhwaindo.my`, built with Express + EJS (server-side rendered) and Tailwind via CDN. Entry point: `index.js` (`npm start`).

## Critical: the README is stale
`README.md` describes a different project ("WibuKon" anime streaming with routes `schedule/about/anime/watch` and `lib/ServerData.js`). **None of that matches the code.** Trust the code, not the README. The real project is a manhwa scraper named ManhwaIn.

## Routing reality (verify against `routes/`, not README)
- `routes/home.js` → `GET /`
- `routes/search.js` → `GET /search?q=...&page=...`
- `routes/browse.js` → `GET /popular`, `/latest`, `/genre/:name`
- `routes/detail.js` → `GET /series/*` and any path containing `-chapter-` (reader mode)
- A catch-all middleware in `index.js:23-28` re-routes `-chapter-` paths into `detailRoute`.
- A final 404 handler renders `views/404.ejs`.

Each route file exports an `express.Router()` and imports the scraper as a dependency: `require('../lib/ManhwaIndo')`. Keep this pattern for new routes.

## Data layer (`lib/ManhwaIndo.js`)
- Exports a **singleton instance** (`module.exports = new ManhwaIndo()`), not the class.
- All data is scraped live from manhwaindo.my via `axios` + `cheerio`. There is **no cache, fallback, or mock**. If the upstream site changes its HTML, parsing silently breaks (empty lists / wrong fields).
- Image URLs are read defensively from `data-src || data-lazy-src || src` (`getImageSrc`).
- `fetchHtml` has a 10s timeout; failures throw and are caught in routes, which render `views/error.ejs`.

## Commands
- `npm install` then `npm start` (the only npm script; there is **no test, lint, or typecheck**).
- Server listens on `process.env.PORT || 3001`. Note: README and `.env.example` say `3000` — that is wrong; code defaults to **3001**. Set `PORT` in `.env` (gitignored; copy from `.env.example`) if you need 3000.
- `dotenv` is loaded at the top of `index.js:1`; env must be set before/at startup.

## Deployment
- **Netlify**: `netlify/functions/server.js` wraps the app with `serverless-http`. `netlify.toml` sets `included_files = ["views/**", "public/**"]` — these must stay listed or EJS views / static assets break in the serverless bundle. Redirect `/* -> /.netlify/functions/server`.
- **Vercel**: `vercel.json` rewrites all paths to `index.js` (handled by `@vercel/node`).

## Conventions
- Keep scraped HTML selectors in one place (`lib/ManhwaIndo.js`), not in routes/views.
- New pages: add a route under `routes/`, register it in `index.js`, and create a matching `.ejs` in `views/` (layout partials live in `views/partials/`).
- UI is dark-mode EJS + Tailwind CDN; do not introduce a build step unless required.
