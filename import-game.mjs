// Copies a Unity Web build into games/<id>/ with fixed names, so the site can host it.
//   node import-game.mjs "D:/Mygames/Haunted House/Builds/Web" haunted-house
// games/ is git-ignored (the builds are large); build.mjs copies it into dist/ when present.
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const [src, id] = process.argv.slice(2);
if (!src || !/^[a-z0-9-]+$/.test(id || "")) {
  console.error('usage: node import-game.mjs "<Unity build folder>" <id, e.g. haunted-house>');
  process.exit(1);
}

const buildDir = join(src, "Build");
const files = await readdir(buildDir);
const pick = (re) => files.find((f) => re.test(f));
const parts = {
  loader: pick(/\.loader\.js$/),
  framework: pick(/\.framework\.js(\.(gz|br|unityweb))?$/),
  code: pick(/\.wasm(\.(gz|br|unityweb))?$/),
  data: pick(/\.data(\.(gz|br|unityweb))?$/),
};
for (const [k, v] of Object.entries(parts)) if (!v) throw new Error(`No ${k} file in ${buildDir}`);

// Read product details from Unity's index.html (company/product/version).
const html = await readFile(join(src, "index.html"), "utf8").catch(() => "");
const field = (name) => new RegExp(`${name}:\\s*"([^"]*)"`).exec(html)?.[1] ?? "";

const out = join("games", id);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const manifest = { company: field("companyName"), product: field("productName"), version: field("productVersion"), files: {}, bytes: 0 };
for (const [k, name] of Object.entries(parts)) {
  const target = name.replace(/^[^.]+/, "game"); // Web.data → game.data, Builds.wasm.br → game.wasm.br
  await cp(join(buildDir, name), join(out, target));
  manifest.files[k] = target;
  if (k !== "loader") manifest.bytes += (await stat(join(out, target))).size;
}
manifest.bytes += (await stat(join(out, manifest.files.loader))).size;
if (files.some((f) => f.endsWith(".unityweb"))) console.warn("! .unityweb files need Unity's Decompression Fallback to be on.");

await writeFile(join(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`imported ${manifest.product || id} ${manifest.version} → ${out} (${(manifest.bytes / 1048576).toFixed(0)} MB)`);
