# Aman Singh · portfolio

**Live:** https://aman0singh-portfolio.netlify.app

A scrapbook-style portfolio: full-screen slides, hand-built SVG collage pieces, and two Unity games you can play in the page.
Static HTML/CSS/JS with **zero npm dependencies**. GSAP is vendored and hash-checked.

```
content.js        ← every word, link and stat on the site. Edit this.
cp.json           ← competitive-programming stats (written by update-cp.mjs from Codolio)
build.mjs         ← turns content.js into dist/ (home page, /certificates/, game play pages)
src/art.mjs       ← the SVG artwork (stamps, ticket, tape, game drawings)
site/             ← css, js, fonts, images, certificate PDFs, _headers (copied into dist/)
check.mjs         ← security + accessibility checks
dev.mjs           ← local preview with production headers
update-cp.mjs     ← refreshes cp.json from Codolio
import-game.mjs   ← only for self-hosting a Unity build (see below)
netlify.toml      ← Netlify build settings
```

## Run it locally

```bash
node dev.mjs        # builds, then serves http://localhost:5173 with the real security headers
node check.mjs      # builds, then runs the security + accessibility checks; exits 1 if anything fails
```

Requires Node 20+. Nothing to install. `dev.mjs` builds once at start-up, so after an edit press **Ctrl+C** and run it again.

## Deploying

Netlify deploys the site from this repo's `main` branch. **Every push to `main` goes live** within a minute or two. `netlify.toml` tells Netlify to run `node build.mjs` and publish `dist/` with Node 22.

Typical update:

```bash
# edit content.js (or anything else)
node check.mjs
git add -A
git commit -m "Update stats"
git push
```

If the repo isn't linked yet: Netlify → **aman0singh-portfolio → Site configuration → Build & deploy → Continuous deployment → Link repository** → GitHub → `not-Lucifer/Portfolio`, branch `main`. Leave the build settings empty; `netlify.toml` covers them.

Deploy from your PC without git (this also works while a repo is linked, but the next push replaces it):

```bash
npx netlify-cli login       # once
npx netlify-cli link --name aman0singh-portfolio   # once per folder
node build.mjs
npx netlify-cli deploy --dir dist          # draft URL to check first
npx netlify-cli deploy --dir dist --prod   # live
```

## Updating content

Everything lives in `content.js`. Anything set to `null` is **hidden** on the page, never faked.

- **Competitive programming:** run `node update-cp.mjs`. It reads the public [Codolio profile](https://codolio.com/profile/not-lucifer) (LeetCode, CodeChef, HackerRank) and rewrites `cp.json`, including the "last updated" date. The live site never calls Codolio; it only reads `cp.json`. The LeetCode global-rank percentage and the CodeChef division aren't in Codolio's data, so edit those by hand under `cp` in `content.js`.
- **Projects:** each project has a title, tagline, summary, stack, an honesty badge ("AI-assisted", "Team project", "Tutorial + my additions"…) and links.
- **Screenshots:** save a `.webp` (about 1280 px wide, under ~200 KB) in `site/img/` and point the project's `screenshot` (or GameStash's `screenshots`) at it. A missing screenshot falls back to a drawn placeholder.
- **Certificates:** put the PDF in `site/certificates/` with a plain filename (no email or student ID in it), then add an entry to `certifications`. It shows up on `/certificates/`, and the folder on the main page updates its count.
- **Resume:** replace `site/aman-singh-resume.pdf` with the new version (keep the filename). It's linked from the notebook (`VIEW RESUME`) and the footer. Set `links.resume: null` to take it down; the site then shows "Resume coming soon".
- **After hours:** the YouTube channel and Discord server under `afterHours`.
- **Favicon:** replace `site/favicon-32.png`, `site/favicon-192.png` and `site/apple-touch-icon.png` (180×180, no transparency).

Run `node check.mjs` after editing. The build refuses unsafe links (anything that isn't `https:`, `mailto:` or a site path).

## The games

Both games are hosted on **Unity Play** and load into the page only when a visitor presses **Play**. Phones get a "best played on desktop" note instead, because both games need a keyboard.

| Game | Unity Play page |
|---|---|
| Haunted House | https://play.unity.com/en/games/7e52970d-9ecd-4dbd-9a49-3eefb72661fd/haunted-house |
| Kitchen Chaos | https://play.unity.com/en/games/b3080f64-4f1a-4d4f-ad74-fbd22210822d/kitchen-chaos |

- **Updating a game:** upload a new build to the same game on Unity Play. The site embeds `…/build/latest/frame`, so it picks up the newest build without any change here.
- **How it's wired:** under each game's `play` in `content.js`, `embed` is Unity Play's game frame (the player without the page around it) and `page` is the public game page used by **Open in new tab**. To add another Unity Play game, take the ID from its URL and use `https://play-prod.struckd.com/api/v1/games/game/<ID>/build/latest/frame`.
- **Caveat:** that frame address is Unity Play's internal player URL, not a documented embed feature. If Unity changes it, **Open in new tab** still goes to the game's Unity Play page. Switch to itch.io or self-hosting in that case.
- **Black screen at first:** Unity Play shows nothing while the game downloads, so the site displays "Loading the game. A black screen for up to a minute is normal."
- The **Quit / Exit** buttons in both games do nothing in a browser (Unity ignores `Application.Quit` on the web).

### Other ways to host a game

**itch.io:** upload the Web build as an HTML project (zip the build folder's contents, tick **This file will be played in the browser**, set it **Public**), then copy the iframe `src` from **Distribute → Embed game** into `play.embed`. itch.io is already allowed in the CSP.

**Self-hosting on this site** (only for deploys from your PC, because the builds don't fit in git):

```bash
node import-game.mjs "D:/Mygames/Haunted House/Builds/Web" haunted-house
```

This copies the build into `games/<id>/` (git-ignored). The build then generates a play page with the site's loading bar, and `play.embed: null` makes the Play button use it. Build in Unity with **Compression Format: Brotli** and **Decompression Fallback** ticked, or the downloads stay huge (the uncompressed builds were 158 MB and 88 MB).

**Building for the web in Unity:** **File → Build Profiles → Web** (Unity 6) or **File → Build Settings → WebGL** (2022.3) → **Switch Platform**, set the default canvas to **1280 × 720**, then **Build**. Test with **Build And Run**; opening `index.html` straight from disk won't work.

## Security

- Strict Content Security Policy on every page: `script-src 'self'`, no inline scripts or styles, `object-src 'none'`, `frame-ancestors 'none'`. It's set in `site/_headers` and repeated in a `<meta>` tag.
- Other headers: HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy and a Permissions-Policy that only lets the game frame use fullscreen.
- No third-party requests on page load: fonts, scripts and images are self-hosted. GSAP 3.12.5 matches the SHA-512 published by cdnjs, and `check.mjs` re-verifies it on every run.
- Game iframes may come only from Unity Play, itch.io or this site. They're sandboxed, created when Play is pressed and removed on **Close game**.
- Everything from `content.js` is HTML-escaped at build time, and every link passes an allow-list.
- `check.mjs` also scans the repo for API keys, tokens, private keys and `.env` files.
- The contact email is public through `mailto:` links.
