// Hand-built SVG artwork. Everything here is original to this site.
// Colours are presentation attributes (not inline style) so the CSP can stay strict.

const INK = "#151515";
const PAPER = "#F6F1E6";
const RED = "#D61F1F";
const BLUE = "#1F3FBF";
const YOLK = "#F2B705";

// Deterministic PRNG so every build produces the same "random" edges.
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => Math.round(n * 10) / 10;

/** A circle with a rough, ink-printed edge. */
export function roughCircle(cx, cy, r, seed = 7, wobble = 0.035, points = 90) {
  const rand = rng(seed);
  let d = "";
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const rr = r * (1 + (rand() - 0.5) * wobble * 2);
    d += `${i ? "L" : "M"}${f(cx + Math.cos(a) * rr)} ${f(cy + Math.sin(a) * rr)}`;
  }
  return d + "Z";
}

/** objectBoundingBox clip paths for torn paper; referenced from CSS as url(#torn-N). */
export function tornClipDefs() {
  const out = [];
  for (let s = 1; s <= 4; s++) {
    const rand = rng(s * 31);
    const pts = [];
    const steps = 26;
    const j = () => 0.012 + rand() * 0.022;
    for (let i = 0; i <= steps; i++) pts.push([i / steps, j()]);
    for (let i = 0; i <= steps; i++) pts.push([1 - j(), i / steps]);
    for (let i = steps; i >= 0; i--) pts.push([i / steps, 1 - j()]);
    for (let i = steps; i >= 0; i--) pts.push([j(), i / steps]);
    out.push(
      `<clipPath id="torn-${s}" clipPathUnits="objectBoundingBox"><polygon points="${pts
        .map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`)
        .join(" ")}"/></clipPath>`
    );
  }
  return out.join("");
}

export const defs = () => `
<svg class="svg-defs" width="0" height="0" aria-hidden="true" focusable="false">
  <defs>
    ${tornClipDefs()}
    <filter id="rough" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="3"/>
      <feDisplacementMap in="SourceGraphic" scale="9"/>
    </filter>
    <filter id="wobble" x="-5%" y="-60%" width="110%" height="220%">
      <feTurbulence type="fractalNoise" baseFrequency="0.08 0.4" numOctaves="1" seed="5"/>
      <feDisplacementMap in="SourceGraphic" scale="2.5"/>
    </filter>
    <filter id="ink-bleed" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="8" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.6" result="speckle"/>
      <feComposite in="SourceGraphic" in2="speckle" operator="in"/>
    </filter>
  </defs>
</svg>`;

// ── Hand-drawn strokes ─────────────────────────────────────
export const underline = (cls = "") =>
  `<svg class="scribble ${cls}" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true"><path class="draw" d="M4 15 C 60 8, 120 6, 176 9 S 262 15, 296 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`;

export const underlineArrow = (cls = "") =>
  `<svg class="scribble ${cls}" viewBox="0 0 320 36" preserveAspectRatio="none" aria-hidden="true"><path class="draw" d="M3 20 C 80 14, 170 12, 300 19 M284 8 L304 19 L282 30" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const arrowCurve = (cls = "") =>
  `<svg class="scribble ${cls}" viewBox="0 0 160 70" aria-hidden="true"><path class="draw" d="M6 20 C 40 60, 100 66, 148 40 M132 30 L150 39 L136 54" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const arrowDown = (cls = "") =>
  `<svg class="scribble ${cls}" viewBox="0 0 70 90" aria-hidden="true"><path class="draw" d="M10 6 C 48 14, 60 40, 44 80 M30 68 L44 82 L54 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const ellipse = (cls = "") =>
  `<svg class="scribble ${cls}" viewBox="0 0 140 56" preserveAspectRatio="none" aria-hidden="true"><path class="draw" d="M104 7 C 70 1, 14 8, 7 28 C 1 46, 60 54, 102 48 C 140 42, 142 14, 96 6 L 88 3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;

export const star4 = (cls = "", fill = RED) =>
  `<svg class="${cls}" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0 C 22 14, 26 18, 40 20 C 26 22, 22 26, 20 40 C 18 26, 14 22, 0 20 C 14 18, 18 14, 20 0Z" fill="${fill}"/></svg>`;

export const tape = (cls = "") => `<span class="tape ${cls}" aria-hidden="true"></span>`;

// ── Circular rubber stamp: one <text> per letter, placed at build time ──
// (avoids textPath, which Chrome sometimes paints only partly inside rotated layers)
function ringText(text, r) {
  const chars = [...text];
  const step = 360 / chars.length;
  return chars
    .map((ch, i) => {
      if (ch === " ") return "";
      const deg = -180 + i * step;
      const rad = (deg * Math.PI) / 180;
      const x = f(100 + Math.cos(rad) * r), y = f(100 + Math.sin(rad) * r);
      return `<text x="${x}" y="${y}" dy=".35em" transform="rotate(${f(deg + 90)} ${x} ${y})">${ch}</text>`;
    })
    .join("");
}
export function circleStamp(text, id, cls = "", color = INK, tilt = 0) {
  return `<svg class="stamp-circle ${cls}" viewBox="0 0 200 200" role="img" aria-label="${text.replace(/ ★ /g, ", ").replace(/★/g, "").trim()}">
  <g fill="none" stroke="${color}" opacity=".9" transform="rotate(${tilt} 100 100)">
    <circle cx="100" cy="100" r="94" stroke-width="5"/>
    <circle cx="100" cy="100" r="62" stroke-width="3"/>
    <g fill="${color}" stroke="none" font-family="Anton, Impact, sans-serif" font-size="17" text-anchor="middle">${ringText(text, 76)}</g>
    <path d="M100 66 l9.4 19 21 3 -15.2 14.8 3.6 20.9 -18.8 -9.9 -18.8 9.9 3.6 -20.9 -15.2 -14.8 21 -3z" fill="${RED}" stroke="none"/>
  </g>
</svg>`;
}

// ── The mascot: an original horned imp in a hoodie (a nod to the "Lucifer" alias) ──
export const mascot = () => `
<svg class="mascot" viewBox="0 0 360 450" role="img" aria-label="Original mascot: a small horned imp in a hoodie, grinning and holding a game controller">
  <!-- torn white paper behind the cut-out -->
  <g filter="url(#rough)" fill="#fff" stroke="#fff" stroke-width="26" stroke-linejoin="round">
    <path d="M98 132 C 72 104, 58 66, 72 22 C 88 62, 116 88, 146 104Z"/><path d="M262 132 C 288 104, 302 66, 288 22 C 272 62, 244 88, 214 104Z"/>
    <ellipse cx="180" cy="205" rx="126" ry="122"/>
    <path d="M56 450 C 60 380, 80 330, 120 312 L240 312 C 280 330, 300 380, 304 450Z"/>
    <path d="M290 400 C 330 390, 342 350, 326 322 L350 300 L344 336Z"/>
  </g>
  <!-- tail -->
  <path d="M286 402 C 326 392, 338 358, 324 330" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
  <path d="M324 330 L312 300 L344 318 Z" fill="${RED}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <!-- horns -->
  <path d="M98 132 C 72 104, 58 66, 72 22 C 88 62, 116 88, 146 104Z" fill="#262626" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M262 132 C 288 104, 302 66, 288 22 C 272 62, 244 88, 214 104Z" fill="#262626" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M84 96 C 76 80, 72 62, 73 44 M276 96 C 284 80, 288 62, 287 44" fill="none" stroke="#6a6a6a" stroke-width="3.5" stroke-linecap="round"/>
  <!-- body / hoodie -->
  <path d="M58 450 C 62 384, 82 334, 122 314 L238 314 C 278 334, 298 384, 302 450Z" fill="#2c2c2c" stroke="${INK}" stroke-width="5"/>
  <path d="M120 430 C 150 412, 210 412, 240 430" fill="none" stroke="#555" stroke-width="4" stroke-linecap="round"/>
  <!-- hood -->
  <ellipse cx="180" cy="205" rx="122" ry="118" fill="#2c2c2c" stroke="${INK}" stroke-width="5"/>
  <path d="M86 178 C 96 120, 140 98, 180 98 C 220 98, 264 120, 274 178" fill="none" stroke="#4a4a4a" stroke-width="7" stroke-linecap="round"/>
  <!-- face -->
  <ellipse cx="180" cy="218" rx="94" ry="86" fill="${PAPER}" stroke="${INK}" stroke-width="5"/>
  <path d="M98 196 C 104 160, 136 140, 180 138 C 224 140, 256 160, 262 196" fill="none" stroke="${INK}" stroke-width="4" stroke-dasharray="1 9" stroke-linecap="round"/>
  <!-- brows -->
  <path d="M124 180 L162 192" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
  <path d="M236 180 L198 192" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
  <!-- eyes -->
  <ellipse cx="148" cy="214" rx="14" ry="19" fill="${INK}"/>
  <ellipse cx="212" cy="214" rx="14" ry="19" fill="${INK}"/>
  <circle cx="143" cy="206" r="5" fill="#fff"/><circle cx="207" cy="206" r="5" fill="#fff"/>
  <!-- cheeks -->
  <ellipse cx="118" cy="246" rx="15" ry="9" fill="${RED}" opacity=".35"/>
  <ellipse cx="242" cy="246" rx="15" ry="9" fill="${RED}" opacity=".35"/>
  <!-- grin + fang -->
  <path d="M146 254 C 162 276, 204 278, 220 250" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
  <path d="M196 268 L201 284 L208 265Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <!-- hood strings -->
  <path d="M150 314 L144 360 M210 314 L216 360" stroke="${PAPER}" stroke-width="5" stroke-linecap="round"/>
  <rect x="139" y="358" width="10" height="16" rx="3" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
  <rect x="211" y="358" width="10" height="16" rx="3" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
  <!-- controller -->
  <path d="M96 382 C 96 360, 120 352, 150 360 L210 360 C 240 352, 264 360, 264 382 C 266 416, 248 436, 226 424 L206 408 L154 408 L134 424 C 112 436, 94 416, 96 382Z" fill="${INK}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M128 378 h8 v-8 h8 v8 h8 v8 h-8 v8 h-8 v-8 h-8z" fill="${PAPER}"/>
  <circle cx="222" cy="374" r="7" fill="${RED}"/><circle cx="238" cy="388" r="7" fill="${BLUE}"/>
  <circle cx="206" cy="388" r="5" fill="#666"/>
  <!-- thumbs -->
  <ellipse cx="108" cy="368" rx="16" ry="13" fill="${PAPER}" stroke="${INK}" stroke-width="4"/>
  <ellipse cx="252" cy="368" rx="16" ry="13" fill="${PAPER}" stroke="${INK}" stroke-width="4"/>
</svg>`;

// ── Boarding pass printed onto the red circle ──────────────
export const ticket = () => `
<svg class="ticket" viewBox="0 0 300 170" aria-hidden="true">
  <g fill="none" stroke="${INK}" stroke-width="3" opacity=".82">
    <rect x="4" y="4" width="292" height="162" rx="8"/>
    <path d="M206 4 v162" stroke-dasharray="6 6"/>
  </g>
  <g fill="${INK}" opacity=".82" font-family="'JetBrains Mono', monospace" font-weight="700">
    <text x="18" y="28" font-size="11" letter-spacing="2">BOARDING PASS</text>
    <text x="16" y="100" font-family="Anton, Impact, sans-serif" font-size="66">GZB</text>
    <path d="M136 72 l34 0 -8 -8 M170 72 l-8 8" stroke="${INK}" stroke-width="4" fill="none"/>
    <text x="134" y="104" font-size="12">TO: NEXT</text><text x="134" y="120" font-size="12">LEVEL</text>
    <text x="18" y="146" font-size="11" letter-spacing="1">CLASS: CSE '28   SEAT: P1</text>
    <text x="220" y="34" font-size="11">GATE</text>
    <text x="218" y="84" font-family="Anton, Impact, sans-serif" font-size="46">06</text>
    ${Array.from({ length: 16 }, (_, i) => `<rect x="${220 + i * 4.4}" y="104" width="${i % 3 ? 2 : 3.2}" height="46"/>`).join("")}
  </g>
</svg>`;

// ── Editor selection box with cursor ───────────────────────
export const selectionBox = () => `
<svg class="selection" viewBox="0 0 90 80" aria-hidden="true">
  <rect x="6" y="6" width="64" height="52" fill="none" stroke="${BLUE}" stroke-width="1.6" stroke-dasharray="4 3"/>
  ${[[6, 6], [70, 6], [6, 58], [70, 58]].map(([x, y]) => `<rect x="${x - 3.5}" y="${y - 3.5}" width="7" height="7" fill="#fff" stroke="${BLUE}" stroke-width="1.6"/>`).join("")}
  <path d="M66 54 L66 78 L72 72 L78 82 L82 80 L76 70 L84 70Z" fill="${BLUE}" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>
</svg>`;

// ── Black & white "photo" of Haunted House (placeholder until a real screenshot) ──
export const hauntedScene = (cls = "") => `
<svg class="${cls}" viewBox="0 0 320 220" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Drawing of Haunted House: an isometric room where a ghost's vision cone sweeps the floor near the player">
  <rect width="320" height="220" fill="#1d1d1d"/>
  <path d="M160 40 L300 110 L160 180 L20 110Z" fill="#4a4a4a"/>
  <path d="M160 40 L20 110 L20 70 L160 0Z" fill="#2e2e2e"/><path d="M160 40 L300 110 L300 70 L160 0Z" fill="#383838"/>
  ${Array.from({ length: 6 }, (_, i) => `<path d="M${20 + i * 23.3} ${110 - i * 11.7} L${160 + i * 23.3} ${180 - i * 11.7}" stroke="#555" stroke-width="1"/>`).join("")}
  <path d="M206 92 L120 118 L150 150Z" fill="#e9e3d6" opacity=".22"/>
  <path d="M196 60 C 196 46, 222 46, 222 60 L222 96 L216 90 L210 96 L204 90 L196 96Z" fill="#e9e3d6"/>
  <circle cx="204" cy="66" r="3" fill="#1d1d1d"/><circle cx="214" cy="66" r="3" fill="#1d1d1d"/>
  <ellipse cx="96" cy="140" rx="9" ry="4" fill="#111"/>
  <path d="M90 138 L90 122 C 90 114, 102 114, 102 122 L102 138Z" fill="#cfc8b8"/>
  <rect x="236" y="120" width="26" height="16" fill="#2a2a2a" stroke="#666"/>
  <path d="M258 96 L274 104 L274 84 L258 76Z" fill="#888"/>
</svg>`;

export const kitchenScene = (cls = "") => `
<svg class="${cls}" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Drawing of Kitchen Chaos: a top-down kitchen with counters, a stove with a pan, a cutting board and an order ticket">
  <rect width="320" height="180" fill="#2b2a28"/>
  <rect x="0" y="0" width="320" height="38" fill="#7a6a55"/>
  ${Array.from({ length: 7 }, (_, i) => `<rect x="${6 + i * 45}" y="6" width="40" height="26" fill="#a38f72" stroke="#5c4f3d"/>`).join("")}
  <circle cx="51" cy="19" r="9" fill="#333"/><circle cx="51" cy="19" r="5" fill="#d6551f"/>
  <rect x="104" y="10" width="26" height="18" rx="2" fill="#e9dcc2"/><circle cx="117" cy="19" r="5" fill="${RED}"/>
  <rect x="0" y="142" width="320" height="38" fill="#7a6a55"/>
  ${Array.from({ length: 7 }, (_, i) => `<rect x="${6 + i * 45}" y="148" width="40" height="26" fill="#a38f72" stroke="#5c4f3d"/>`).join("")}
  <rect x="236" y="150" width="30" height="20" fill="#cfd9e0"/>
  <rect x="270" y="56" width="40" height="52" fill="#f6f1e6"/><path d="M276 66 h28 M276 76 h20 M276 86 h24" stroke="#151515" stroke-width="3"/>
  <circle cx="150" cy="96" r="13" fill="#3d7bd6"/><circle cx="150" cy="96" r="6" fill="#f6f1e6"/>
  <path d="M150 112 l-8 16 h16z" fill="#3d7bd6"/>
  <ellipse cx="96" cy="98" rx="10" ry="6" fill="${YOLK}"/><ellipse cx="200" cy="80" rx="7" ry="7" fill="#7bc41f"/>
</svg>`;

// ── FitVision: pose skeleton (joints animate in CSS) ───────
export const skeleton = () => `
<svg class="pose" viewBox="0 0 220 300" aria-hidden="true">
  <g class="pose-body" fill="none" stroke="#7BC41F" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <path class="pose-upper" d="M110 60 L110 140 M110 80 L70 120 L60 150 M110 80 L150 120 L160 150"/>
    <path class="pose-legs" d="M110 140 L84 200 L92 262 M110 140 L136 200 L128 262"/>
  </g>
  <g class="pose-joints" fill="#f6f1e6" stroke="#151515" stroke-width="2">
    <circle cx="110" cy="44" r="16" fill="none" stroke="#7BC41F" stroke-width="4"/>
    ${[[110, 80], [70, 120], [150, 120], [60, 150], [160, 150], [110, 140], [84, 200], [136, 200], [92, 262], [128, 262]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join("")}
  </g>
  <path class="pose-angle" d="M96 186 A 20 20 0 0 1 116 194" fill="none" stroke="#F2B705" stroke-width="3"/>
</svg>`;

// ── Little sun + controller sticker ───────────────────────
export const sunController = () => `
<svg class="sun-sticker" viewBox="0 0 160 160" aria-hidden="true">
  <g stroke="${YOLK}" stroke-width="6" stroke-linecap="round">
    ${Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return `<path d="M${f(80 + Math.cos(a) * 58)} ${f(80 + Math.sin(a) * 58)} L${f(80 + Math.cos(a) * 74)} ${f(80 + Math.sin(a) * 74)}"/>`;
    }).join("")}
  </g>
  <path d="${roughCircle(80, 80, 50, 11, 0.04, 40)}" fill="${YOLK}"/>
  <path d="M46 84 C 46 70, 60 66, 70 70 L90 70 C 100 66, 114 70, 114 84 C 116 102, 104 108, 96 100 L88 94 L72 94 L64 100 C 56 108, 44 102, 46 84Z" fill="${INK}"/>
  <path d="M56 82 h5 v-5 h5 v5 h5 v5 h-5 v5 h-5 v-5 h-5z" fill="${YOLK}"/>
  <circle cx="96" cy="80" r="4" fill="${RED}"/><circle cx="105" cy="88" r="4" fill="${BLUE}"/>
</svg>`;

// ── Social icons (simple line icons) ───────────────────────
export const icons = {
  github: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.3-1.69-1.3-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11.5H3V9.75Zm6.5 0h3.83v1.57h.06c.53-1 1.84-2.07 3.8-2.07 4.06 0 4.81 2.67 4.81 6.15v5.85h-4v-5.19c0-1.24-.02-2.83-1.73-2.83-1.73 0-2 1.35-2 2.74v5.28h-4V9.75Z"/></svg>`,
  email: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M3 5.5h18v13H3z M3.5 6l8.5 7 8.5-7"/></svg>`,
};
