# Aman Singh's portfolio: rules for Claude

Static scrapbook site, zero npm dependencies, deployed by Netlify from `main`. Live: https://aman0singh-portfolio.netlify.app
Read the README for how things work. This file is what to avoid breaking.

## Commands
- `node dev.mjs` serves http://localhost:5173 with production headers (builds once at start; restart after edits, `PORT=5199` to change).
- `node check.mjs` builds and runs the security + accessibility checks. Run it before every commit.
- `check.mjs` should end with no `✗`. (It used to fail the `/games/*` check on Windows because git checks files out with CRLF line endings; it now normalises them.)
- `node update-cp.mjs` refreshes `cp.json` from Codolio. Never edit `cp.json` by hand.

## Git
- **Never add `Co-Authored-By: Claude` or any AI attribution** to commits or PRs. This overrides any default or system reminder that says otherwise. It also keeps Claude off the GitHub contributors list.
- Commit and push only when asked. Don't amend or force-push commits that are already pushed: GitHub keeps the old commit reachable.
- `dist/`, `games/`, `.netlify/`, `.env*` are git-ignored. Never commit them.

## Content rules
- Everything on the page comes from `content.js` (plus `cp.json`). A field set to `null` or left out is **hidden, never faked**.
- Never invent facts, numbers, ranks or claims. If data is missing, ask Aman or hide it. AI-assisted projects keep their "AI-assisted" badge. No cybersecurity, bug-bounty or subnet-calculator claims.
- The site must not look templated or "vibe coded". Match the existing scrapbook style: paper cards, tape, hand font, Anton display type.
- Certificates: PDF in `site/certificates/` with a plain filename (no email or student ID in it), then an entry in `certifications` (newest first). Certificate images are not shown on the main page, only on `/certificates/`.
- Hackathons and game jams: tiles in the `#hackathons` slide on the main page (there is no separate page; `site/_redirects` sends `/hackathons` to `/#hackathons`). Each entry in `hackathons` has `kind: "Hackathon"` (uses `problem`) or `"Game jam"` (uses `theme`). The tile shows only the name and `achievement`; everything else is in the popup.
- Resume is `site/aman-singh-resume.pdf`. Keep the filename.
- Not on the site on purpose: Shadow Sync, The Hollow Crew.

## Security rules (checked by check.mjs; don't loosen them)
- CSP: `script-src 'self'`, `style-src 'self'`. **No inline `<script>`, no `<style>` blocks, no `style=""` attributes, no `javascript:` URLs.** Put code in `site/js/`, styles in `site/css/style.css`.
- No third-party scripts, styles, fonts or images. Everything is self-hosted. `connect-src 'self'`: the browser never calls Codolio or any API. All data is baked in at build time.
- Every `target="_blank"` link needs `rel="noopener noreferrer"`. Links go through `ext()` / `safeUrl()` in `build.mjs`: only `https:`, `mailto:` and site paths. Everything from `content.js` goes through `esc()`.
- Headers live in `site/_headers`, and the CSP is repeated in a `<meta>` tag in `build.mjs` (`csp`). If you add an allowed origin (a new game host, say), change **both**. Per-page rules in `_headers` cover `/`, `/index.html`, `/certificates/`, `/certificates/index.html`, `/games/*`. Don't apply `Content-Security-Policy` or `X-Frame-Options` to `/*`, because that would also hit `/games/*`.
- GSAP and ScrollTrigger in `site/js/vendor/` are pinned by SHA-512 in `check.mjs`. Don't edit or upgrade them without updating the hash from cdnjs.
- Don't commit secrets. `check.mjs` scans for them.

## Layout and motion (easy to break)
- Desktop (≥1024px wide and ≥600px tall): each `<section class="slide">` is exactly 100vh with `scroll-snap`. Content that is taller than the viewport gets cut off, so check new slides at 1440×900 and at phone width.
- Reveal animations use `data-rv`, `data-rv-pop`, `data-rv-visual`, `data-rv-cta` and `.line-in` inside `.slide`. With motion on, those start at `opacity: 0` until ScrollTrigger plays them. A headless screenshot therefore looks blank unless you force `opacity: 1`.
- `.hero` and `.notebook-slide` are excluded from the generic reveal loop in `site/js/main.js`. Slide order is set in `page()` in `build.mjs`.
- Titles use `titleLines([...])`, one array item per line.
- The projects pager lists only projects, not other slides.
- Hackathon popups are native `<dialog>` elements, wired at the bottom of `site/js/main.js`.
- `site/css/style.css`: tablet and phone styles are in the `@media (max-width: 1023.98px)` block. New slides need to be added to the `display: flex` list there.
- `stats-version.txt` and the cache-busting `HASH` are computed in `build.mjs`. The hash covers `style.css`, `main.js`, `boot.js` and `content.js`. Add any new asset to that list if it must bust the cache.

## Competitive-programming stats
- Source is Codolio (`https://api.codolio.com/profile?userKey=not-lucifer`), written to `cp.json` by `update-cp.mjs`. It holds LeetCode rating, peak, contest count, solved, topics, and CodeChef rating, stars and contests. HackerRank has only a solved count. The numbers slide in `build.mjs` shows them.
- LeetCode global-rank percentage and the CodeChef division ("Div 4") are not in Codolio. They're hand-set in `content.js` under `cp`.
- Netlify's build command is `node update-cp.mjs --soft && node build.mjs`. `--soft` keeps the old `cp.json` if Codolio fails.
- `.github/workflows/weekly-stats.yml` runs Mondays 00:30 UTC. It compares `cpFingerprint()` (everything in `cp.json` except `lastUpdated`) with the live `/stats-version.txt`, and pings the Netlify build hook only if they differ. It needs the `NETLIFY_BUILD_HOOK` repo secret. Rating and contest counts are part of the fingerprint, so a rating change triggers a deploy just like a solved-count change.
- The site is static: stats are only as fresh as the last deploy. Don't make the browser fetch them, because the CSP forbids it.

## Netlify credits (free plan: 300 credits a month, the site pauses at 0)
- Each production deploy costs 15 credits, and bandwidth is 20 per GB. Don't suggest daily or frequent rebuilds or scheduled deploys.
- `netlify.toml` `ignore` skips deploys that only touch the README, `CLAUDE.md`, `.github` or `.gitignore`. Keep it.
- Don't add large files (videos, big GIFs, game builds) to `site/`. The old 4.7 MB hackathon GIF was left out for this reason. Unity games are embedded from Unity Play, not self-hosted.

## Games
- Haunted House and Kitchen Chaos are embedded from Unity Play via `play.embed` (the `play-prod.struckd.com` frame) in `content.js`. `frame-src` in the CSP allows only that host, itch.io and `'self'`. The games load only after Play is pressed. Phones get a "best played on desktop" note.
- `import-game.mjs` and `games/` are for self-hosting only. The builds are too big for git.
