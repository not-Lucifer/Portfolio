// Builds dist/ from content.js + site/. Zero dependencies: `node build.mjs`.
import { cp, mkdir, rm, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import content from "./content.js";
import * as art from "./src/art.mjs";

const C = content;
const OUT = new URL("./dist/", import.meta.url);

// Self-hosted Unity builds (imported with import-game.mjs into games/<id>/, git-ignored).
const hosted = {};
for (const p of C.projects.filter((x) => x.play)) {
  try {
    hosted[p.id] = JSON.parse(await readFile(new URL(`./games/${p.id}/manifest.json`, import.meta.url), "utf8"));
  } catch {
    /* not imported: the Play button explains that */
  }
}
const kcShot = C.projects.find((x) => x.id === "kitchen-chaos")?.screenshot;

// ── helpers ───────────────────────────────────────────────
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function safeUrl(u) {
  // Only http(s), mailto and same-site paths are ever emitted as links.
  if (u == null) return null;
  const s = String(u).trim();
  if (/^(https:\/\/|mailto:|\/(?!\/)|#)/i.test(s) || /^[\w./-]+$/.test(s)) return s;
  throw new Error(`Refusing unsafe URL in content.js: ${s}`);
}

const ext = (href, inner, cls = "", label) =>
  `<a class="${cls}" href="${esc(safeUrl(href))}" target="_blank" rel="noopener noreferrer"${label ? ` aria-label="${esc(label)}"` : ""}>${inner}</a>`;

const rich = (parts) =>
  (Array.isArray(parts) ? parts : [parts])
    .map((p) => {
      if (typeof p === "string") return esc(p);
      if (p.blue) return `<span class="ink-blue">${esc(p.blue)}</span>`;
      if (p.circle) return `<span class="circled">${esc(p.circle)}${art.ellipse("circled-mark")}</span>`;
      if (p.cite) return `&#8288;<sup class="cite">[${p.cite}]</sup>&#8288;`;
      return "";
    })
    .join("");

const fmtDate = (iso) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).toUpperCase();

const titleLines = (lines, cls = "") =>
  lines.map((l) => `<span class="line ${cls}"><span class="line-in">${esc(l)}</span></span>`).join("");

const byIssuer = (list) => Object.entries(list.reduce((m, c) => ((m[c.issuer] = (m[c.issuer] || 0) + 1), m), {}));

const badgeClass = (b) => ({ "AI-assisted": "badge-ai", "Team project": "badge-team" })[b] || "badge-tut";

// ── persistent chrome ─────────────────────────────────────
const L = C.links;
const cvLink = L.cv ? safeUrl(L.cv) : null;

const topbar = () => `
<header class="topbar">
  <p class="tb-loc"><span>${esc(C.person.location)}</span><span class="tb-coords">${esc(C.person.coords)}</span></p>
  <p class="tb-time"><span>LOCAL TIME</span><time class="tb-clock" data-clock data-tz="${esc(C.person.timeZone)}">IST</time></p>
  <nav class="tb-nav" aria-label="Main">
    <a href="#gamestash" class="nav-link">WORK</a>
    <a href="#haunted-house" class="nav-link">PLAY</a>
    <div class="connect" data-connect>
      <button class="nav-link connect-btn" type="button" aria-expanded="false" aria-controls="connect-menu">CONNECT${art.ellipse("connect-ring", false)}</button>
      <ul class="connect-menu" id="connect-menu">
        <li>${ext(L.github, `${art.icons.github}<span class="icon-label">GITHUB</span>`, "icon-btn", "GitHub")}</li>
        <li>${ext(L.linkedin, `${art.icons.linkedin}<span class="icon-label">LINKEDIN</span>`, "icon-btn", "LinkedIn")}</li>
        <li><a class="icon-btn" href="mailto:${esc(L.email)}" aria-label="Email">${art.icons.email}<span class="icon-label">EMAIL</span></a></li>
      </ul>
    </div>
    <span class="tb-dot" aria-hidden="true"></span>
  </nav>
</header>`;

const pager = () => `
<nav class="pager" aria-label="Projects" data-pager>
  <ol>
    ${C.projects.map((p, i) => `<li><a href="#${p.id}" data-pager-for="${p.id}" aria-label="Project ${i + 1}: ${esc(p.title.join(" "))}">${String(i + 1).padStart(2, "0")}</a></li>`).join("")}
    <li><a href="#whats-next" data-pager-for="whats-next" aria-label="What's next">${String(C.projects.length + 1).padStart(2, "0")}</a></li>
  </ol>
</nav>
<a class="to-top" href="#top"><span aria-hidden="true">↑</span> TOP</a>`;

// ── hero ──────────────────────────────────────────────────
const P = C.person;
const hero = () => `
<section class="slide hero" id="top" aria-labelledby="hero-name">
  ${topbar()}
  <span class="stripes" aria-hidden="true"></span>
  <div class="hero-text" data-hero-text>
    <h1 class="hero-name" id="hero-name">${titleLines(P.name)}</h1>
    <p class="hero-tagline hand" data-pop>${P.tagline.map(esc).join("<br>")}${art.underline("hero-tagline-line")}</p>
    <p class="hero-intro" data-pop>${esc(P.intro.before)}<span class="u-ink">${esc(P.intro.underline)}</span>${esc(P.intro.after)}</p>
    <p class="label-tag" data-pop>CURRENTLY INTO:</p>
    <ul class="into-list" data-pop>${P.currentlyInto.map((i) => `<li><span class="dot dot-${i.dot}" aria-hidden="true"></span>${esc(i.label)}</li>`).join("")}</ul>
    <p class="into-more" data-pop>${rich(P.alsoInto.map((x, i) => (i === 0 ? x + "\n" : x))).replace("\n", "<br>")}</p>
  </div>

  <div class="collage" data-collage>
    <div class="c-item c-circle" data-speed="0.6"><svg viewBox="0 0 400 400" aria-hidden="true"><path d="${art.roughCircle(200, 200, 190, 5)}" fill="#D61F1F"/></svg>${art.ticket()}</div>
    <p class="c-item c-hand c-alter hand" data-speed="1.3">${esc(P.avatar.note)}${art.arrowDown("c-alter-arrow")}</p>
    <div class="c-item c-mascot" data-speed="0.9"><img src="${esc(safeUrl(P.avatar.src))}" alt="${esc(P.avatar.alt)}" width="640" height="640" fetchpriority="high" decoding="async"></div>
    <p class="c-item c-label" data-speed="1.1">PLAYER 1 <span aria-hidden="true">★</span></p>
    <div class="c-item c-stamp" data-speed="1.2" data-no-spin>${art.circleStamp("SHIPPED WITH AI ★ UNDERSTOOD BY ME ★", "arc-hero", "", "#151515", 12)}${art.selectionBox()}</div>
    <span class="c-item c-bluedot" data-speed="1.6" aria-hidden="true"></span>
    <figure class="c-item c-polaroid" data-speed="0.7">
      ${art.tape("tape-black")}
      <img class="polaroid-img" src="${esc(safeUrl(P.polaroid.src))}" alt="${esc(P.polaroid.alt)}" width="1280" height="720" decoding="async">
      <figcaption>${esc(P.polaroid.caption)}</figcaption>
    </figure>
    <p class="c-item c-hand c-believe hand" data-speed="1.4">still can't believe<br>I built this.${art.arrowCurve("c-believe-arrow")}</p>
    <div class="c-item c-bluecard" data-speed="1.0"><span class="bc-top">LEETCODE</span><span class="bc-big">100 DAYS</span><span class="bc-small">BADGE · 2026</span></div>
    <div class="c-item c-rednote" data-speed="0.8">
      ${art.tape("tape-beige")}
      <div class="keys" aria-hidden="true"><span>W</span><span>A</span><span>S</span><span>D</span></div>
      <p class="hand">my most-used<br>four keys</p>
    </div>
    <div class="c-item c-sun" data-speed="1.2">${art.sunController()}<p class="sun-caption"><span>PLAYTEST</span><br>break it<br>fix it<br>repeat</p></div>
  </div>

  <a class="explore" href="#gamestash" data-pop>EXPLORE THE SITE <span aria-hidden="true">↓</span></a>
</section>`;

// ── project slides ────────────────────────────────────────
function projectText(p, i) {
  const n = String(i + 1).padStart(2, "0");
  return `
  <div class="pj-text">
    ${i === 0 ? `<p class="section-kicker" data-rv><span class="slash">/</span> SELECTED WORK</p>` : ""}
    <p class="pj-num" data-rv>${n}</p>
    <h2 class="pj-title" id="${p.id}-title">${titleLines(p.title)}</h2>
    <p class="pj-tagline hand" data-rv>${esc(p.tagline)}${art.underlineArrow("pj-tagline-arrow")}</p>
    <p class="pj-summary" data-rv>${esc(p.summary)}</p>
    <p class="pj-cat" data-rv>${esc(p.category)}</p>
    <p class="pj-stack" data-rv>${p.stack.map(esc).join(" · ")}</p>
    ${p.badge === "AI-assisted" ? `<p class="pj-badge ${badgeClass(p.badge)}" data-rv>${esc(p.badge)}</p>` : ""}
  </div>`;
}

const statement = (p) =>
  `<p class="pj-statement" data-rv-statement><span>${esc(p.statement[0])}</span><span class="acc-text">${esc(p.statement[1])}</span></p>`;

const ctaButton = (label, href) =>
  `<a class="cta" href="${esc(safeUrl(href))}" target="_blank" rel="noopener noreferrer" data-rv-cta><span>${esc(label)}</span><span class="cta-arrow" aria-hidden="true"></span></a>`;

function visualGameStash(p) {
  const shots = p.screenshots || [];
  const shot = shots.length
    ? shots
        .map(
          (s, i) => `
      <figure class="gs-shot gs-${i + 1}">
        <img src="${esc(safeUrl(s.src))}" alt="${esc(s.alt)}" loading="lazy" decoding="async" width="1280" height="720">
        <figcaption class="float-label hand">${esc(s.label)}</figcaption>
      </figure>`
        )
        .join("")
    : `
      <div class="app-window" role="img" aria-label="Sketch of the GameStash window: search, sort, an ending-soon spotlight, a grid of giveaways and the stash panel">
        <div class="aw-bar"><span>GameStash</span><span class="aw-ctrl" aria-hidden="true">— ▢ ✕</span></div>
        <div class="aw-body">
          <div class="aw-tools"><span class="aw-search">search giveaways…</span><span class="aw-pill on">Newest</span><span class="aw-pill">Ending soon</span><span class="aw-pill">Value</span></div>
          <div class="aw-spot"><span class="aw-spot-k">SPOTLIGHT</span><span>next giveaway to end</span><span class="aw-timer">02:14:09</span></div>
          <div class="aw-grid">${["STEAM", "EPIC", "GOG", "UBISOFT", "EA", "ITCH.IO"].map((s) => `<div class="aw-card"><span class="aw-thumb"></span><span class="aw-store">${s}</span><span class="aw-free">FREE</span></div>`).join("")}</div>
        </div>
        <div class="aw-stash"><span class="aw-stash-k">MY STASH</span>${[["Steam", 70], ["Epic", 52], ["GOG", 30], ["Other", 18]].map(([s, w]) => `<span class="aw-row"><span>${s}</span><span class="aw-bar-fill w${w}"></span></span>`).join("")}</div>
      </div>`;
  return `
  <div class="pj-visual vis-gamestash" data-rv-visual>
    ${shot}
    ${shots.length ? "" : `<span class="float-label hand fl-search">SEARCH</span><span class="float-label hand fl-ends">ENDS SOON</span><span class="float-label hand fl-stash">STASH</span>`}
    <div class="blueprint">
      <p class="bp-title hand">built end to end.</p>
      <dl>${p.blueprint.map((r) => `<div><dt>${esc(r.key)}</dt><dd>${esc(r.value)}</dd></div>`).join("")}</dl>
      <a class="bp-note hand" href="#how-i-work">yes, the AI helped <span aria-hidden="true">↗</span></a>
    </div>
  </div>`;
}

function visualRag(p) {
  const c = p.chat;
  return `
  <div class="pj-visual vis-rag" data-rv-visual>
    <figure class="rag-shot">
      ${art.tape("tape-beige")}
      <img src="${esc(p.screenshot)}" alt="Screenshot of the real app answering a question with numbered citations" loading="lazy" decoding="async" width="1280" height="652">
      <figcaption class="hand">the real thing</figcaption>
    </figure>
    <div class="chat" data-chat aria-label="Replay of a real question and its cited answer">
      <p class="chat-status"><span class="ok-dot" aria-hidden="true"></span>${esc(c.status)}</p>
      <p class="chat-q"><span class="chat-q-text" data-chat-q data-text="${esc(c.question)}">${esc(c.question)}</span><span class="caret" aria-hidden="true"></span></p>
      <div class="chat-a" data-chat-a>
        <p>${rich(c.answer)}</p>
        <p class="chat-src"><span class="src-chip">[1]</span><span class="src-file">${esc(c.source.file)}</span><span class="src-page">${esc(c.source.page)}</span></p>
      </div>
    </div>
    <ol class="pipeline" aria-label="How an answer is made">${p.pipeline.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
    <p class="rag-details">${esc(p.details)}</p>
  </div>`;
}

function visualFit(p) {
  return `
  <div class="pj-visual vis-fit" data-rv-visual>
    <div class="cam" role="img" aria-label="Webcam view with a pose skeleton doing squats and a rep counter">
      <span class="cam-rec" aria-hidden="true">● REC</span>
      ${art.skeleton()}
      <div class="cam-hud" aria-hidden="true"><span class="hud-k">SQUAT</span><span class="hud-reps"><span class="hud-n" data-reps>07</span> REPS</span></div>
      <span class="cam-corner tl" aria-hidden="true"></span><span class="cam-corner tr" aria-hidden="true"></span><span class="cam-corner bl" aria-hidden="true"></span><span class="cam-corner br" aria-hidden="true"></span>
    </div>
    <ul class="ex-list" aria-label="Exercises it counts">${p.exercises.map((e, i) => `<li${i === 0 ? ' class="on"' : ""}>${esc(e)}</li>`).join("")}</ul>
    <p class="stamp-rect stamp-team">TEAM PROJECT<br><span>5 PEOPLE</span></p>
    <p class="taped-note hand">${art.tape("tape-beige")}${p.myPart.map(esc).join("<br>")}</p>
  </div>`;
}

function visualGame(p, scene) {
  const poster = p.screenshot
    ? `<img class="tv-poster" src="${esc(p.screenshot)}" alt="" loading="lazy" decoding="async">`
    : scene("tv-poster");
  const keys = p.controls
    .map((c) => `<div class="kb-row"><span class="kb-keys">${c.keys.map((k) => `<kbd>${esc(k)}</kbd>`).join("")}</span><span class="kb-does hand">${esc(c.does)}</span></div>`)
    .join("");
  const local = hosted[p.id];
  const embed = p.play.embed ? safeUrl(p.play.embed) : local ? `/games/${p.id}/` : "";
  const page = p.play.page ? safeUrl(p.play.page) : "";
  const size = !p.play.embed && local ? `<span class="play-size">${Math.round(local.bytes / 1048576)} MB download</span>` : "";
  return `
  <div class="pj-visual vis-game" data-rv-visual>
    <div class="tv" data-game data-embed="${esc(embed)}" data-page="${esc(page)}" data-title="${esc(p.title.join(" "))}">
      ${art.tape("tape-black tv-tape-l")}${art.tape("tape-beige tv-tape-r")}
      <div class="tv-screen" data-game-screen>
        ${poster}
        <button class="play-btn" type="button" data-game-play><span class="play-tri" aria-hidden="true"></span><span>PLAY ${esc(p.title.join(" "))}</span>${size}</button>
        <p class="tv-msg" data-game-msg role="status"></p>
      </div>
      <div class="tv-tools" data-game-tools hidden>
        <button type="button" data-game-fs>FULLSCREEN</button>
        <a data-game-newtab target="_blank" rel="noopener noreferrer" href="${esc(page || embed || p.repo)}">OPEN IN NEW TAB <span aria-hidden="true">↗</span></a>
        <button type="button" data-game-close>CLOSE GAME</button>
      </div>
    </div>
    <div class="keyboard">${keys}</div>
    <p class="stamp-rect stamp-tut">${esc(p.badge.toUpperCase())}</p>
    <p class="game-note hand">${esc(p.additions)}</p>
    ${p.howItWorks ? `<p class="game-how">${esc(p.howItWorks)}</p>` : ""}
  </div>`;
}

function projectSlide(p, i) {
  const visual = {
    gamestash: visualGameStash,
    "rag-qa": visualRag,
    fitvision: visualFit,
    "haunted-house": (x) => visualGame(x, art.hauntedScene),
    "kitchen-chaos": (x) => visualGame(x, art.kitchenScene),
  }[p.id](p);
  const isGame = Boolean(p.play);
  const cta = isGame
    ? `<a class="cta" href="#${p.id}-play" data-rv-cta data-play-cta="${p.id}"><span>PLAY NOW</span><span class="cta-arrow" aria-hidden="true"></span></a>`
    : ctaButton(p.id === "gamestash" ? "GET IT ON GITHUB" : p.cta.label, p.cta.href);
  return `
<section class="slide project acc-${p.accent}" id="${p.id}" aria-labelledby="${p.id}-title" data-slide="${p.id}">
  ${projectText(p, i)}
  ${visual.replace('class="tv"', `class="tv" id="${p.id}-play"`)}
  ${statement(p)}
  ${cta}
  ${isGame ? `<p class="repo-link">${ext(p.repo, `SOURCE ON GITHUB <span aria-hidden="true">↗</span>`, "u-link")}</p>` : ""}
</section>`;
}

// ── the numbers ───────────────────────────────────────────
function numbersSlide() {
  const { leetcode: lc, codechef: cc, hackerrank: hr, topics, lastUpdated, source } = C.cp;
  const max = Math.max(...topics.flatMap((g) => g.items.map(([, n]) => n)));
  const parts = [["LeetCode", lc?.solved], ["CodeChef", cc?.solved], ["HackerRank", hr?.solved]].filter(([, n]) => Number.isFinite(n));
  const total = parts.reduce((sum, [, n]) => sum + n, 0);
  const bar = (name, n) =>
    `<li title="${esc(name)}: ${n} solved"><span class="bar-name">${esc(name)}</span><span class="bar-n">${n}</span><svg class="bar-track" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><rect class="bar" width="${((n / max) * 100).toFixed(1)}" height="10" rx="1"/></svg></li>`;
  return `
<section class="slide numbers" id="numbers" aria-labelledby="numbers-title" data-slide="numbers">
  <div class="nb-head">
    <p class="section-kicker" data-rv><span class="slash">/</span> COMPETITIVE PROGRAMMING</p>
    <h2 class="nb-title" id="numbers-title">${titleLines(["SHOWING UP,", "AGAIN AND AGAIN."])}</h2>
    <p class="nb-intro" data-rv>I practise data structures and algorithms in C++. Consistency matters more to me than the rating, so it goes first.</p>
    <p class="nb-updated" data-rv>last updated <time datetime="${esc(lastUpdated)}">${esc(fmtDate(lastUpdated))}</time> · ${ext(source.url, `every platform on ${esc(source.name)} <span aria-hidden="true">↗</span>`, "u-link")}</p>
  </div>

  <div class="nb-stats">
    <div class="big-stat st-1" data-rv-pop><span class="bs-n">${lc.activeDays}</span><span class="bs-l">ACTIVE DAYS ON LEETCODE</span><span class="bs-sub hand">longest streak: ${lc.maxStreak} days</span></div>
    <div class="big-stat st-2" data-rv-pop><span class="bs-n">${total}</span><span class="bs-l">PROBLEMS SOLVED</span><span class="bs-sub hand">${parts.map(([p, n]) => `${p} ${n}`).join(" + ")}</span></div>
    <div class="big-stat st-3" data-rv-pop><span class="bs-n">${lc.contests + cc.contests}</span><span class="bs-l">RATED CONTESTS</span><span class="bs-sub hand">${lc.contests} LeetCode + ${cc.contests} CodeChef</span></div>
  </div>

  <div class="scorecards">
    <div class="scorecard" data-rv-pop>
      <p class="sc-head">${ext(L.leetcode, `LEETCODE · @${esc(lc.handle)} <span aria-hidden="true">↗</span>`, "u-link")}</p>
      <dl>
        <div><dt>Contest rating</dt><dd>${lc.rating} <small>(peak ${lc.peak})</small></dd></div>
        <div><dt>Global rank</dt><dd>top ${lc.topPercent}%</dd></div>
        <div><dt>Solved</dt><dd>${lc.solved}</dd></div>
        <div><dt>Easy · med · hard</dt><dd>${lc.easy} · ${lc.medium} · ${lc.hard}</dd></div>
      </dl>
    </div>
    <div class="scorecard sc-cc" data-rv-pop>
      <p class="sc-head">${ext(L.codechef, `CODECHEF · @${esc(cc.handle)} <span aria-hidden="true">↗</span>`, "u-link")}</p>
      <dl>
        <div><dt>Rating</dt><dd>${cc.rating} <small>${"★".repeat(cc.stars || 0)} · ${esc(cc.division)}</small></dd></div>
        <div><dt>Contests</dt><dd>${cc.contests}</dd></div>
        <div><dt>Solved</dt><dd>${cc.solved}</dd></div>
        <div><dt>Language</dt><dd>${esc(lc.language)}</dd></div>
      </dl>
    </div>
  </div>

  <figure class="graph-sheet" data-rv-visual>
    ${art.tape("tape-beige gs-tape")}
    <figcaption class="hand">LeetCode problems solved, by topic</figcaption>
    ${topics
      .map(
        (g) => `
    <div class="bars-group">
      <p class="bars-level">${esc(g.level)}</p>
      <ul class="bars">${g.items.map(([name, n]) => bar(name, n)).join("")}</ul>
      ${g.more.length ? `<p class="bars-more">+ ${g.more.map(([name, n]) => `${esc(name)} ${n}`).join(", ")}</p>` : ""}
    </div>`
      )
      .join("")}
  </figure>
</section>`;
}

// ── how I work with AI ────────────────────────────────────
function aiSlide() {
  const A = C.ai;
  return `
<section class="slide ai" id="how-i-work" aria-labelledby="ai-title" data-slide="how-i-work">
  <div class="ai-left">
    <p class="section-kicker" data-rv><span class="slash">/</span> HOW I WORK WITH AI</p>
    <h2 class="ai-title" id="ai-title">${titleLines(["SHIPPED WITH AI.", "UNDERSTOOD BY ME."])}</h2>
    <p class="ai-intro" data-rv>I use Claude and Claude Code to plan, build, debug and polish. GameStash and the RAG system were built with AI assistance, and I used Claude Code to redesign FitVision's UI.</p>
    <p class="ai-mypart" data-rv><strong>My part:</strong> ${esc(A.myPart.slice(0, -1).join(", "))}, and ${esc(A.myPart.at(-1))}.</p>
    <div class="explain" data-tabs data-rv>
      <p class="explain-k hand" id="explain-k">ask me to explain…</p>
      <div class="explain-tabs" role="tablist" aria-labelledby="explain-k">
        ${A.canExplain.map((c, i) => `<button type="button" role="tab" id="tab-${i}" aria-controls="panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(c.project)}</button>`).join("")}
      </div>
      ${A.canExplain
        .map(
          (c, i) =>
            `<ul class="explain-panel" role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}"${i === 0 ? "" : " hidden"}>${c.points.map((pt) => `<li>${esc(pt)}</li>`).join("")}</ul>`
        )
        .join("")}
    </div>
  </div>
  <div class="ai-page" data-rv-visual>
    ${art.tape("tape-beige ai-tape")}
    <p class="ai-page-head">my workflow</p>
        <ol class="ai-steps">
      ${A.steps.map(([t, d], i) => `<li class="step step-${i + 1}"><span class="step-n">${i + 1}</span><span class="step-t">${esc(t)}</span><span class="step-d">${esc(d)}</span></li>`).join("")}
    </ol>
  </div>
</section>`;
}

// ── toolbox ───────────────────────────────────────────────
function toolboxSlide() {
  const cert = C.certifications;
  return `
<section class="slide toolbox" id="toolbox" aria-labelledby="toolbox-title" data-slide="toolbox">
  <div class="tb-head">
    <p class="section-kicker" data-rv><span class="slash">/</span> SKILLS &amp; CERTIFICATES</p>
    <h2 class="tbx-title" id="toolbox-title">${titleLines(["WHAT I", "WORK WITH"])}</h2>
    <p class="tbx-edu" data-rv>${esc(C.person.education)}</p>
  </div>
  <div class="cards">
    ${C.skills
      .map(
        (s, i) => `<div class="index-card ic-${i + 1}" data-rv-pop>
      <p class="ic-k">${esc(s.group)}</p>
      <ul>${s.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      ${s.group === "Game dev" ? `<p class="ic-foot">${ext(C.firstProject.repo, `${esc(C.firstProject.note)} <span aria-hidden="true">↗</span>`, "u-link hand")}</p>` : ""}
    </div>`
      )
      .join("")}
  </div>
  <a class="folder" href="/certificates/" data-rv-pop>
    <span class="folder-tab">certificates</span>
    <span class="folder-n">${cert.length}</span>
    <span class="folder-list">${byIssuer(cert)
      .map(([issuer, n]) => `<span>${esc(issuer)} <b>×${n}</b></span>`)
      .join("")}</span>
    <span class="folder-open">open the folder <span aria-hidden="true">→</span></span>
  </a>
  <div class="after" data-rv-pop>
    ${art.tape("tape-black after-tape")}
    <p class="after-k hand">after hours</p>
    <ul>${C.afterHours
      .map((a) => `<li><span class="after-name">${a.url ? ext(a.url, `${esc(a.name)} <span aria-hidden="true">↗</span>`, "u-link") : esc(a.name)}</span><span class="after-what">${esc(a.what)}</span></li>`)
      .join("")}</ul>
    <p class="after-skills">${esc(C.afterHoursSkills)}</p>
  </div>
</section>`;
}

// ── closing notebook ──────────────────────────────────────
function notebookSlide() {
  const N = C.notebook;
  const next = String(C.projects.length + 1).padStart(2, "0");
  const cvBtn = cvLink
    ? ext(cvLink, `VIEW CV <span aria-hidden="true">↗</span>`, "cv-btn")
    : `<span class="cv-btn cv-missing">CV COMING SOON</span>`;
  return `
<section class="slide notebook-slide" id="whats-next" aria-labelledby="nb-notes-title" data-slide="whats-next">
  <div class="notebook" data-notebook>
    <span class="nb-grid-sheet" aria-hidden="true"></span>
    %%COVER%%
    <div class="nb-spiral" aria-hidden="true">${Array.from({ length: 18 }, () => "<span></span>").join("")}</div>
    <div class="nb-page nb-right">
      <p class="nb-small hand">${C.projects.length} projects later…</p>
      <h2 class="nb-next marker">what's<br><span class="ink-blue">next?</span>${art.underline("nb-next-line")}</h2>
      <figure class="nb-polaroid">${art.tape("tape-blue")}${kcShot ? `<img class="nb-pol-img" src="${esc(kcShot)}" alt="Kitchen Chaos: a top-down kitchen with an order list, counters, a stove and the yellow chef" loading="lazy" decoding="async" width="1280" height="720">` : art.kitchenScene("nb-pol-img")}<figcaption class="hand">kitchen chaos, v0.1.0</figcaption></figure>
      <p class="nb-caption hand">${esc(N.nextCaption)}</p>
      <p class="nb-slot"><span class="slot-n">${next}</span><span class="slot-slash">/</span><span class="slot-line"></span></p>
      <p class="nb-empty hand">this one's still empty</p>
      <p class="nb-tab hand" aria-hidden="true">more<br>to build</p>
    </div>
  </div>
</section>`.replace("%%COVER%%", `
    <div class="nb-cover" data-nb-cover>
      <div class="nb-cover-front" aria-hidden="true"><span class="cover-label">A. SINGH · NOTES</span></div>
      <div class="nb-cover-back nb-page nb-left">
        <p class="nb-pagehead">PAGE ${next} · KEPT FOR MYSELF</p>
        <h2 class="nb-notes-title marker" id="nb-notes-title">A FEW <span class="ink-blue">notes</span>${art.underline("nb-notes-line")}</h2>
        <ul class="nb-notes">${N.notes.map((n) => `<li class="hand">${rich(n)}</li>`).join("")}</ul>
        <p class="nb-ticket">${art.tape("tape-beige")}<span>${esc(N.ticket[0])}</span><small>${esc(N.ticket[1])}</small></p>
        <p class="wax-seal" aria-hidden="true"><span>P1</span></p>
        <p class="nb-cv"><span class="hand">the boring details<br>are in my CV</span>${cvBtn}</p>
      </div>
    </div>`);
}

// ── footer ────────────────────────────────────────────────
function footerSlide() {
  const unit = `<span class="mq-unit" aria-hidden="true">HAVE A GOOD IDEA? <span class="mq-arrow">→</span> <span class="ink-blue">LET'S TALK</span> ${art.star4("mq-star")}</span>`;
  return `
<footer class="slide footer" id="connect" data-slide="connect">
  <h2 class="visually-hidden">Contact</h2>
  <div class="marquee" data-marquee>
    <a class="mq-link" href="mailto:${esc(L.email)}"><span class="visually-hidden">Have a good idea? Let's talk: email me</span><span class="mq-track">${unit.repeat(4)}</span></a>
  </div>
  <ul class="ft-links">
    <li><a class="u-link" href="mailto:${esc(L.email)}">EMAIL <span aria-hidden="true">↗</span></a></li>
    <li>${ext(L.github, `GITHUB <span aria-hidden="true">↗</span>`, "u-link")}</li>
    <li>${ext(L.linkedin, `LINKEDIN <span aria-hidden="true">↗</span>`, "u-link")}</li>
    <li>${cvLink ? ext(cvLink, `CV <span aria-hidden="true">↗</span>`, "u-link") : `<span class="u-link is-off">CV (SOON)</span>`}</li>
  </ul>
  <p class="ft-email">${esc(L.email)}</p>
  <p class="stamp-rect stamp-footer">OPEN TO<br>INTERNSHIPS <span aria-hidden="true">☺</span></p>
  <p class="ft-copy">© ${new Date().getFullYear()} AMAN SINGH</p>
</footer>`;
}

// ── page ──────────────────────────────────────────────────
const S = C.site;
const csp = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src 'self' https://itch.io https://*.itch.io https://*.itch.zone https://www.youtube-nocookie.com",
  "manifest-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

// Favicons: the avatar, rendered to PNG (see README → "Change the favicon").
const ICONS = `<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/favicon-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">`;

const page = () => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(S.title)}</title>
<meta name="description" content="${esc(S.description)}">
<meta name="author" content="Aman Singh">
<meta name="theme-color" content="#EDE6D8">
<link rel="canonical" href="${esc(S.url)}/">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(S.url)}/">
<meta property="og:title" content="${esc(S.title)}">
<meta property="og:description" content="${esc(S.description)}">
<meta property="og:image" content="${esc(S.url)}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="AMAN SINGH in huge black letters on cream paper, with a red stamp and a chibi avatar in a black hoodie">
<meta name="twitter:card" content="summary_large_image">
${ICONS}
<link rel="preload" href="/fonts/anton.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/jetbrains-mono.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/style.css?v=${HASH}">
<script src="/js/boot.js?v=${HASH}"></script>
<script src="/js/vendor/gsap.min.js" defer></script>
<script src="/js/vendor/ScrollTrigger.min.js" defer></script>
<script src="/js/main.js?v=${HASH}" defer></script>
</head>
<body>
<a class="skip" href="#gamestash">Skip to projects</a>
${art.defs()}
<main>
${hero()}
${C.projects.map(projectSlide).join("\n")}
${numbersSlide()}
${aiSlide()}
${toolboxSlide()}
${notebookSlide()}
</main>
${footerSlide()}
${pager()}
</body>
</html>
`;

// Cache-busting hash from the static assets.
const hashOf = async (...files) => {
  const h = createHash("sha256");
  for (const f of files) h.update(await readFile(new URL(f, import.meta.url)));
  return h.digest("hex").slice(0, 10);
};
const HASH = await hashOf("./site/css/style.css", "./site/js/main.js", "./site/js/boot.js", "./content.js");

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await cp(new URL("./site/", import.meta.url), OUT, { recursive: true });
await writeFile(new URL("index.html", OUT), page());

// /certificates/: the receipts live on their own page, so the scrapbook stays uncluttered. No JavaScript.
const issuerClass = (i) => (/unity/i.test(i) ? "is-unity" : /cisco/i.test(i) ? "is-cisco" : "is-other");
const certPage = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>Certificates · Aman Singh</title>
<meta name="description" content="Courses Aman Singh has completed: Unity Learn, Cisco Networking Academy and NASSCOM FutureSkills Prime. Each links to the original certificate.">
<link rel="canonical" href="${esc(S.url)}/certificates/">
<meta name="theme-color" content="#EDE6D8">
${ICONS}
<link rel="stylesheet" href="/css/style.css?v=${HASH}">
</head>
<body class="certs-page">
${art.defs()}
<header class="cp-top">
  <a class="u-link" href="/#toolbox"><span aria-hidden="true">←</span> BACK TO THE PORTFOLIO</a>
  <span>AMAN SINGH</span>
</header>
<main class="cp-main">
  <h1 class="cp-title">CERTIFICATES</h1>
  <div class="cp-sub">
    <p class="cp-intro">Courses I've finished, newest first. Each one opens the original certificate as a PDF.</p>
    <p class="cp-aside hand">the projects are the proof.<br>these are the receipts.</p>
  </div>
  <ol class="stubs">
    ${C.certifications
      .map((c, i) => {
        const d = new Date(c.date + "T00:00:00Z");
        const day = d.getUTCDate();
        const mon = d.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }).toUpperCase();
        const meta = [c.issuer, c.length, c.note].filter(Boolean).map(esc).join(" · ");
        return `
    <li class="stub ${issuerClass(c.issuer)} stub-${(i % 3) + 1}">
      <time class="stub-date" datetime="${esc(c.date)}"><b>${day}</b> ${esc(mon)}</time>
      <div class="stub-body">
        <p class="stub-meta">${meta}</p>
        <h2 class="stub-name">${esc(c.name)}</h2>
        <p class="stub-links">${ext(`/certificates/${c.file}`, `VIEW CERTIFICATE (PDF) <span aria-hidden="true">↗</span>`, "u-link")}${c.course ? ext(c.course, `COURSE PAGE <span aria-hidden="true">↗</span>`, "u-link") : ""}</p>
      </div>
    </li>`;
      })
      .join("")}
  </ol>
</main>
<footer class="cp-foot"><p>© ${new Date().getFullYear()} AMAN SINGH</p><a class="u-link" href="/#connect">SAY HI <span aria-hidden="true">↗</span></a></footer>
</body>
</html>
`;
await mkdir(new URL("certificates/", OUT), { recursive: true });
await writeFile(new URL("certificates/index.html", OUT), certPage);

// One play page per hosted game. No inline script, so /games/* keeps a strict CSP too.
for (const [id, m] of Object.entries(hosted)) {
  const p = C.projects.find((x) => x.id === id);
  const dir = new URL(`games/${id}/`, OUT);
  await cp(new URL(`./games/${id}/`, import.meta.url), dir, { recursive: true, filter: (src) => !src.endsWith("manifest.json") });
  await writeFile(
    new URL("index.html", dir),
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(p.title.join(" "))} · play</title>
${ICONS}
<link rel="stylesheet" href="/css/game-frame.css?v=${HASH}">
</head>
<body>
<main class="gf acc-${esc(p.accent)}" data-game-frame data-loader="${esc(m.files.loader)}" data-framework="${esc(m.files.framework)}" data-code="${esc(m.files.code)}" data-data="${esc(m.files.data)}" data-company="${esc(m.company)}" data-product="${esc(m.product)}" data-version="${esc(m.version)}">
  <canvas id="unity-canvas" tabindex="-1" aria-label="${esc(p.title.join(" "))} game"></canvas>
  <div class="gf-load">
    <p class="gf-title">${esc(p.title.join(" "))}</p>
    <div class="gf-bar" aria-hidden="true"><span></span></div>
    <p class="gf-status" role="status">Loading 0%</p>
    <p class="gf-hint">${Math.round(m.bytes / 1048576)} MB · ${esc(p.controls.map((c) => `${c.keys.join("")} ${c.does}`).join(" · "))}</p>
  </div>
</main>
<script src="/js/game-frame.js?v=${HASH}"></script>
</body>
</html>
`
  );
}
if (Object.keys(hosted).length) console.log(`hosted games: ${Object.keys(hosted).join(", ")}`);
console.log(`built dist/ (${HASH})`);
