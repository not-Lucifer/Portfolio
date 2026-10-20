# Aman Singh · portfolio

A scrapbook-style portfolio: full-screen slides, hand-built SVG collage pieces, two playable Unity games.
Static HTML/CSS/JS with **zero npm dependencies**. GSAP is vendored and hash-checked.

```
content.js        ← every word, link and stat on the site. Edit this.
build.mjs         ← turns content.js into dist/index.html
src/art.mjs       ← the SVG artwork (mascot, stamps, ticket, game posters)
site/             ← css, js, fonts, images, _headers (copied into dist/)
check.mjs         ← security + accessibility checks
dev.mjs           ← local preview with production headers
```

## Run it

```bash
node dev.mjs        # builds, then serves http://localhost:5173 with the real security headers
node check.mjs      # builds, then runs 27 checks; exits 1 if anything fails
```

Requires Node 20+. Nothing to install.

## Update your stats or projects

Everything lives in `content.js`. Anything set to `null` is **hidden**, never faked.

- **Competitive programming:** edit `cp.leetcode`, `cp.codechef` and `cp.topics`, then set `cp.lastUpdated` to today's date (`"YYYY-MM-DD"`). The page shows that date.
- **Exact LeetCode total:** set `cp.leetcode.solved` (e.g. `143`) and `split: { easy, medium, hard }`. Until then it shows `~140`.
- **Screenshots:** drop a `.webp` into `site/img/` and set the project's `screenshot`, e.g. `"img/haunted-house.webp"`. It replaces the drawn placeholder. Keep them under ~200 KB (1280px wide is plenty).
- **CV:** put `aman-singh-cv.pdf` in `site/` and set `links.cv: "/aman-singh-cv.pdf"`.
- **YouTube / Discord / Cisco credentials:** fill in the `url` fields in `afterHours` and `certifications`.

Run `node check.mjs` after editing. It refuses unsafe links (anything that isn't `https:`, `mailto:` or a site path).

## Deploy (Netlify: same place as the old site)

1. Push this repo to GitHub.
2. In Netlify, open the existing **aman0singh-portfolio** site → **Site configuration → Build & deploy → Link repository** and pick this repo.
   `netlify.toml` already sets the build command (`node build.mjs`) and the publish folder (`dist`).
3. Deploy. Check the headers at https://securityheaders.com: `site/_headers` sets CSP, HSTS, X-Frame-Options, Referrer-Policy and Permissions-Policy.

No Git? Run `node build.mjs` and drag the `dist/` folder onto **Deploys** in Netlify.
GitHub Pages also works, but it ignores `_headers`; the CSP still applies through the `<meta>` tag, and the other headers are lost.

## Make the games playable

Both games load only when a visitor presses **Play**, and phones get a "best played on desktop" note instead of the iframe.

### 1 · Build each game for the web

**Haunted House (Unity 6):**
1. **File → Build Profiles → Web** → **Switch Platform**.
2. **Player Settings → Resolution and Presentation:** default canvas **1280 × 720**.
3. **Player Settings → Publishing Settings:** Compression Format **Gzip**, and tick **Decompression Fallback**. itch.io and Netlify then both work without server config.
4. **Build** into an empty folder, e.g. `Builds/HauntedHouse-Web`.

**Kitchen Chaos (Unity 2022.3):** same steps, but via **File → Build Settings → WebGL** → **Switch Platform**.
If key rebinding saves with `PlayerPrefs`, that still works on the web (it uses browser storage).

Test locally before uploading: Unity's **Build And Run** serves the build for you. Opening `index.html` from disk won't work.

### 2 · Upload to itch.io (recommended)

1. itch.io → **Upload new project**. Set **Kind of project: HTML**.
2. Zip the *contents* of the build folder (so `index.html` sits at the root of the zip) and upload it. Tick **This file will be played in the browser**.
3. **Embed options:** viewport **1280 × 720**, tick **Fullscreen button**, leave **Mobile friendly** off.
4. Set visibility to **Public** and save. Restricted or draft pages can't be embedded.
5. Open the project's **Distribute → Embed game** page and copy the iframe `src`. It looks like `https://itch.io/embed-upload/1234567?color=151515`.
6. In `content.js`, under the game's `play`, set `embed` to that URL and `page` to the game's itch.io page URL.

### Or: host the build on this site

Copy the build folder to `site/games/haunted-house/` and set `embed: "/games/haunted-house/index.html"`.
`_headers` already gives `/games/*` the looser policy Unity needs (WebAssembly, blob workers, inline loader script). The rest of the site stays strict.

## Security notes

- Strict CSP: `script-src 'self'`, no inline scripts or styles anywhere, `frame-ancestors 'none'`, `object-src 'none'`.
- No third-party requests on page load: fonts, scripts and images are self-hosted. GSAP 3.12.5 matches the SHA-512 published by cdnjs, and `check.mjs` re-verifies it.
- Game iframes come only from itch.io (or this site) and are sandboxed. They're created on click and removed on **Close game**.
- Content is HTML-escaped at build time, and every link passes an allow-list (`https:`, `mailto:`, site paths).
- Your email is public through `mailto:` links (it was on the old site too).
