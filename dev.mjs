// Local preview: rebuilds, then serves dist/ with the same headers as production (from site/_headers).
// `node dev.mjs` → http://localhost:5173
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { execFileSync } from "node:child_process";

execFileSync(process.execPath, ["build.mjs"], { stdio: "inherit" });

const ROOT = resolve("dist");
const PORT = Number(process.env.PORT) || 5173;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".txt": "text/plain", ".pdf": "application/pdf", ".json": "application/json", ".wasm": "application/wasm" };

// Minimal _headers parser: "/path/*" blocks followed by indented "Name: value" lines.
const rules = [];
for (const line of (await readFile(join(ROOT, "_headers"), "utf8")).split(/\r?\n/)) {
  if (!line.trim() || line.trim().startsWith("#")) continue;
  if (!/^\s/.test(line)) rules.push({ re: new RegExp("^" + line.trim().replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$"), headers: {} });
  else {
    const i = line.indexOf(":");
    rules.at(-1).headers[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    let file = join(ROOT, normalize(decodeURIComponent(url.pathname)));
    if (!file.startsWith(ROOT)) return res.writeHead(403).end();
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    const body = await readFile(file);
    const headers = { "Content-Type": TYPES[extname(file)] || "application/octet-stream" };
    for (const r of rules) if (r.re.test(url.pathname)) Object.assign(headers, r.headers);
    delete headers["Strict-Transport-Security"];
    if (headers["Content-Security-Policy"]) headers["Content-Security-Policy"] = headers["Content-Security-Policy"].replace("; upgrade-insecure-requests", "");
    res.writeHead(200, headers).end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
