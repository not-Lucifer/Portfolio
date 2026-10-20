// Security + hygiene checks on the built site. `node check.mjs` (runs build first). Exits 1 on any failure.
import { readFile, readdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { join, extname } from "node:path";

execFileSync(process.execPath, ["build.mjs"], { stdio: "ignore" });

const fails = [];
const warn = [];
const ok = [];
const check = (cond, msg) => (cond ? ok.push(msg) : fails.push(msg));

const html = await readFile("dist/index.html", "utf8");
const headers = await readFile("dist/_headers", "utf8");

// 1. CSP-friendly markup: nothing inline that a strict policy would have to allow.
check(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(html), "no inline <script> blocks");
check(!/\son[a-z]+\s*=/i.test(html.replace(/<svg[\s\S]*?<\/svg>/g, "")), "no inline event handlers (onclick=…)");
check(!/\sstyle\s*=/i.test(html), "no inline style attributes");
check(!/<style[\s>]/i.test(html), "no <style> blocks");
check(!/javascript:/i.test(html), "no javascript: URLs");

// 2. Links.
const anchors = [...html.matchAll(/<a\s[^>]*>/gi)].map((m) => m[0]);
const blank = anchors.filter((a) => /target="_blank"/.test(a));
check(blank.every((a) => /rel="[^"]*noopener[^"]*noreferrer[^"]*"/.test(a)), `all ${blank.length} new-tab links use rel="noopener noreferrer"`);
const urls = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
const insecure = urls.filter((u) => /^http:\/\//i.test(u));
check(insecure.length === 0, "no plain-http URLs" + (insecure.length ? `: ${insecure.join(", ")}` : ""));
const thirdPartyAssets = [...html.matchAll(/<(?:script|link|img)\s[^>]*(?:src|href)="(https?:\/\/[^"]+)"/gi)].map((m) => m[1]).filter((u) => !u.startsWith("https://aman0singh-portfolio"));
check(thirdPartyAssets.length === 0, "no third-party scripts, styles, fonts or images (everything self-hosted)" + (thirdPartyAssets.length ? `: ${thirdPartyAssets}` : ""));

// 3. Headers file.
for (const h of ["Content-Security-Policy", "Strict-Transport-Security", "X-Content-Type-Options: nosniff", "X-Frame-Options: DENY", "Referrer-Policy", "Permissions-Policy", "frame-ancestors 'none'", "object-src 'none'", "base-uri 'none'"]) {
  check(headers.includes(h), `_headers sets ${h}`);
}
const metaCsp = /http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html)?.[1] || "";
check(/script-src 'self'(;|$)/.test(metaCsp) && !/unsafe-(inline|eval)/.test(metaCsp), "meta CSP: script-src 'self' only, no unsafe-inline/eval");

// 4. Vendored libraries match the hashes published by cdnjs (verified 2026-10-20).
const pinned = {
  "site/js/vendor/gsap.min.js": "7eHRwcbYkK4d9g/6tD/mhkf++eoTHwpNM9woBxtPUBWm67zeAfFC+HrdoE2GanKeocly/VxeLvIqwvCdk7qScg==",
  "site/js/vendor/ScrollTrigger.min.js": "onMTRKJBKz8M1TnqqDuGBlowlH0ohFzMXYRNebz+yOcc5TQr/zAKsthzhuv0hiyUKEiQEQXEynnXCvNTOk50dg==",
};
for (const [f, sri] of Object.entries(pinned)) {
  const got = createHash("sha512").update(await readFile(f)).digest("base64");
  check(got === sri, `${f.split("/").pop()} matches its pinned SHA-512`);
}

// 5. Accessibility basics.
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
check(dupes.length === 0, "no duplicate ids" + (dupes.length ? `: ${[...new Set(dupes)]}` : ""));
const refs = [...html.matchAll(/aria-(?:controls|labelledby)="([^"]+)"/g)].flatMap((m) => m[1].split(" "));
const missing = refs.filter((r) => !ids.includes(r));
check(missing.length === 0, "every aria-controls / aria-labelledby target exists" + (missing.length ? `: ${missing}` : ""));
const imgs = [...html.matchAll(/<img\s[^>]*>/gi)].map((m) => m[0]);
check(imgs.every((i) => /\salt="/.test(i)), `all ${imgs.length} <img> have alt text`);
check(/<html lang="en">/.test(html), "document language set");
const h1 = (html.match(/<h1[\s>]/g) || []).length;
check(h1 === 1, "exactly one <h1>");
const iframesInHtml = (html.match(/<iframe/g) || []).length;
check(iframesInHtml === 0, "no iframes load until the visitor presses Play");

// 6. No secrets or private files in the repo or the build.
const SECRET = /(AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}|-----BEGIN [A-Z ]*PRIVATE KEY-----|gsk_[A-Za-z0-9]{20,})/;
const TEXT = new Set([".js", ".mjs", ".css", ".html", ".md", ".json", ".toml", ".txt", ".svg", ""]);
async function walk(dir, out = []) {
  for (const name of await readdir(dir)) {
    if (["node_modules", ".git", "vendor"].includes(name)) continue;
    const p = join(dir, name);
    if ((await stat(p)).isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}
const files = [...(await walk(".")).filter((f) => !f.startsWith("dist"))];
const leaky = [];
for (const f of files) {
  if (/(^|[\\/])\.env(\.|$)|\.pem$|\.key$|id_rsa/.test(f)) leaky.push(f);
  if (TEXT.has(extname(f)) && SECRET.test(await readFile(f, "utf8"))) leaky.push(f);
}
check(leaky.length === 0, "no API keys, tokens, private keys or .env files" + (leaky.length ? `: ${leaky}` : ""));

// 7. Things to know about, not failures.
if (html.includes("mailto:")) warn.push("Your email is public in mailto: links (it was on your old site too). Expect some spam; use a separate inbox if that matters.");
if (!/cv/i.test(html.match(/href="[^"]*\.pdf"/)?.[0] || "")) warn.push("No CV link yet (links.cv in content.js).");

console.log(ok.map((m) => "  ✓ " + m).join("\n"));
if (warn.length) console.log("\n" + warn.map((m) => "  ! " + m).join("\n"));
if (fails.length) {
  console.log("\n" + fails.map((m) => "  ✗ " + m).join("\n"));
  process.exit(1);
}
console.log(`\nAll ${ok.length} checks passed.`);
