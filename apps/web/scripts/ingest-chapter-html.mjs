#!/usr/bin/env node
// PROTOTYPE: ingest a chapter .docx straight to pre-rendered HTML (not markdown).
//
// Compared to ingest-chapter.mjs, this preserves more visual fidelity:
//   - <table><colgroup> with per-column widths from the .docx
//   - <img> with width/height attributes from the .docx
//   - cell-level <strong>/<em>/styling preserved
//   - no remark round-trip (markdown → hast → html) that drops attributes
//
// Math: pandoc emits `<span class="math inline">TEX</span>` etc; we render
// each one to its final KaTeX HTML at ingest time (server-side). The same
// OMML repairs (degree symbol, trailing backslash) run before KaTeX.
//
// Output: apps/web/content/chapters/<slug>.html  (just body content; no
// <html> wrapper, no frontmatter — title/number/slug come from book.ts).
//
// Usage (identical to the .md variant):
//   node scripts/ingest-chapter-html.mjs \
//     --source "/abs/path/to/X.docx" --slug Y --number ZZ --title "..."

import { promises as fs } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import katex from "katex";

const args = parseArgs(process.argv.slice(2));
const need = (k) => { if (!args[k]) { console.error(`Missing --${k}`); process.exit(2); } return args[k]; };
const source = expandHome(need("source"));
const slug = need("slug");

const WEB = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const ASSETS_DIR = path.join(WEB, "public", "assets");
const CHAPTERS_DIR = path.join(WEB, "content", "chapters");
const PUBLIC_PREFIX = "/assets";

const IMG_EXT = "png|jpe?g|gif|webp|svg|bmp|tiff?|emf|wmf";
const ANY_MEDIA_PATH = new RegExp(`[^\\s"'()<>]*media\\/(image\\d+\\.(?:${IMG_EXT}))`, "gi");
const HTML_IMG_MAC_ALT = /alt="[^"]*(?:Macintosh HD|:Users:|:Desktop:)[^"]*"/g;

// 0. Pre-extract paragraph-level formatting from the .docx OOXML that pandoc
// drops: text alignment (<w:jc>) and font color (<w:color>). We index by a
// fingerprint of the paragraph's plain text, then re-apply as inline style on
// matching <p> tags in pandoc's HTML output.
function fp(text) {
  return text.replace(/\s+/g, " ").trim().toLowerCase().slice(0, 60);
}
// Parse a single <w:r>...</w:r> run and extract its formatting + text.
// Returns null if the run has no rendered text.
function parseRun(rXml) {
  const text = [...rXml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join("");
  if (!text) return null;
  const props = {};
  const rPr = rXml.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/);
  const pr = rPr ? rPr[1] : "";
  const color = pr.match(/<w:color\s+w:val="([0-9A-Fa-f]{6})"/);
  if (color && color[1].toUpperCase() !== "AUTO" && color[1] !== "000000") {
    props.color = "#" + color[1].toLowerCase();
  }
  const sz = pr.match(/<w:sz\s+w:val="(\d+)"/);
  if (sz) props.sizePt = parseInt(sz[1], 10) / 2;
  const face = pr.match(/<w:rFonts\b[^>]*\bw:ascii="([^"]+)"/);
  if (face) props.face = face[1];
  const hl = pr.match(/<w:highlight\s+w:val="([a-zA-Z-]+)"/);
  if (hl) props.highlightName = hl[1];
  if (/<w:strike\b/.test(pr)) props.strike = true;
  if (/<w:b\b\s*\/>/.test(pr) || /<w:b\b[^>]*w:val="(true|1)"/.test(pr)) props.bold = true;
  if (/<w:i\b\s*\/>/.test(pr) || /<w:i\b[^>]*w:val="(true|1)"/.test(pr)) props.italic = true;
  if (/<w:u\b/.test(pr) && !/w:val="none"/.test(pr.match(/<w:u\b[^>]*>/)?.[0] || "")) props.underline = true;
  return { text, props };
}

function extractDocxStyles(docxPath) {
  const xml = execFileSync("unzip", ["-p", docxPath, "word/document.xml"], {
    encoding: "utf8",
    maxBuffer: 100 * 1024 * 1024,
  });
  const ALIGN = { center: "center", right: "right", both: "justify", left: "left" };
  // Word's named highlight colours -> hex (closest CSS web-safe equivalents)
  const HIGHLIGHT = {
    yellow: "#fff3a3", green: "#9dff8c", cyan: "#9dffff", magenta: "#ff9dff",
    blue: "#9dc7ff", red: "#ffb0b0", "dark-yellow": "#c5a700",
    "dark-green": "#1f8400", "dark-cyan": "#008f8f", "dark-magenta": "#8f008f",
    "dark-blue": "#003fa3", "dark-red": "#a00000",
    black: "#222", white: "#fff", "light-gray": "#dadada", "dark-gray": "#666",
    none: null,
  };
  // Map Word font families to CSS generic families (we don't ship web fonts;
  // we preserve the sans/serif/cursive/monospace distinction Peter intended).
  const FONT_CLASS = (face) => {
    const f = (face || "").toLowerCase();
    if (/arial|calibri|helvetica|verdana|tahoma|segoe|trebuchet/.test(f)) return "sans-serif";
    if (/times|cambria|garamond|georgia|book antiqua|palatino|baskerville/.test(f)) return "serif";
    if (/script|brush|monotype corsiva|lucida handwriting|comic sans|chalkboard/.test(f)) return "cursive";
    if (/courier|consolas|monaco|mono/.test(f)) return "monospace";
    return null;
  };
  const styles = new Map();
  const pRe = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g;
  const emptyGaps = [];
  // Track how many consecutive empty paragraphs preceded each non-empty one.
  let pendingEmpties = 0;
  let m;
  while ((m = pRe.exec(xml)) !== null) {
    const body = m[1];
    const text = [...body.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((x) => x[1]).join("");
    if (!text.trim()) {
      emptyGaps.push(true);
      pendingEmpties++;
      continue;
    }
    emptyGaps.push(false);
    const key = fp(text);
    const props = {};
    // Paragraph alignment (including justify)
    const align = body.match(/<w:jc\s+w:val="([^"]+)"/);
    if (align && ALIGN[align[1]] && align[1] !== "left") props.align = ALIGN[align[1]];
    // First run's font color (paragraph-uniform colors — most common case)
    const color = body.match(/<w:color\s+w:val="([0-9A-Fa-f]{6})"/);
    if (color && color[1].toUpperCase() !== "AUTO" && color[1] !== "000000") {
      props.color = "#" + color[1].toLowerCase();
    }
    // Highlight (named colour)
    const hl = body.match(/<w:highlight\s+w:val="([a-zA-Z-]+)"/);
    if (hl && HIGHLIGHT[hl[1]]) props.highlight = HIGHLIGHT[hl[1]];
    // Font size: <w:sz w:val="N"/> where N = half-points. Take the dominant
    // size from runs (count occurrences, pick the modal value).
    const sizes = [...body.matchAll(/<w:sz\s+w:val="(\d+)"/g)].map((x) => parseInt(x[1], 10));
    if (sizes.length) {
      const counts = new Map();
      for (const z of sizes) counts.set(z, (counts.get(z) || 0) + 1);
      const dominant = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
      props.sizePt = dominant / 2; // half-points -> pt
    }
    // Font family: take the ascii face from rFonts on the first run with one.
    const face = body.match(/<w:rFonts\b[^>]*\bw:ascii="([^"]+)"/);
    if (face) {
      const cls = FONT_CLASS(face[1]);
      if (cls) props.fontClass = cls;
    }
    // Also collect every run with non-default formatting so we can inject
    // <span style="…"> around the matching text after pandoc.
    const runs = [];
    const rRe = /<w:r\b[^>]*>[\s\S]*?<\/w:r>/g;
    let r;
    while ((r = rRe.exec(body)) !== null) {
      const run = parseRun(r[0]);
      if (run) runs.push(run);
    }
    // Capture the visual gap Peter created with blank paragraphs before this one.
    if (pendingEmpties > 0) {
      props.gapBefore = pendingEmpties;
      pendingEmpties = 0;
    }
    if (Object.keys(props).length > 0 || runs.length > 0) {
      const list = styles.get(key) || [];
      list.push({ ...props, runs });
      styles.set(key, list);
    }
  }
  return { styles, emptyGaps };
}
const { styles: docxStyles } = extractDocxStyles(source); // emptyGaps reserved for future use

// 1. pandoc docx -> html with math as <span class="math …">…</span>
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "gmtm-html-"));
const htmlPath = path.join(tmp, "out.html");
try {
  execFileSync("pandoc", [
    source, "-f", "docx", "-t", "html", "--katex",
    `--extract-media=${tmp}`, "-o", htmlPath,
  ], { stdio: ["ignore", "ignore", "inherit"] });
} catch (err) {
  console.error(`pandoc failed: ${err.message}`); process.exit(1);
}
let html = await fs.readFile(htmlPath, "utf8");

// 2. Copy extracted media into public/assets/ with slug prefix
await fs.mkdir(ASSETS_DIR, { recursive: true });
for (const entry of await fs.readdir(ASSETS_DIR)) {
  if (entry.startsWith(`${slug}-`)) await fs.unlink(path.join(ASSETS_DIR, entry));
}
const mediaDir = path.join(tmp, "media");
let copied = 0;
let mediaFiles = [];
try { mediaFiles = await fs.readdir(mediaDir); } catch { /* no images is fine */ }
for (const name of mediaFiles) {
  await fs.copyFile(path.join(mediaDir, name), path.join(ASSETS_DIR, `${slug}-${name}`));
  copied++;
}

// 3. Repair common OMML→TeX malformations BEFORE KaTeX runs (same set as the
//    markdown variant; just operates on the TeX inside math spans).
function repairTex(tex) {
  let t = tex;
  // unwrap KaTeX-unrenderable standalone {^\circ}
  t = t.replace(/\{\^\\circ\}/g, "\\circ");
  // strip trailing backslash + whitespace (pandoc artifact)
  t = t.replace(/\\\s*$/, "");
  return t;
}

// 4. Render every math span to its final KaTeX HTML server-side
let mathRendered = 0, mathFailed = 0;
// Allow arbitrary whitespace inside the opening <span> tag — pandoc wraps
  // long tags onto multiple lines, which the original regex didn't handle.
  const MATH_RE = /<span\s+class="math\s+(inline|display)">([\s\S]*?)<\/span>/g;
html = html.replace(MATH_RE, (_full, kind, raw) => {
  // Pandoc's HTML output entity-encodes `<`, `>`, `&` inside spans but leaves
  // backslashes alone. Decode the few entities KaTeX cares about.
  const tex = repairTex(raw
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"'));
  try {
    mathRendered++;
    return katex.renderToString(tex, {
      throwOnError: false,
      strict: "ignore",
      displayMode: kind === "display",
      errorColor: "currentColor",
    });
  } catch {
    mathFailed++;
    return _full;
  }
});

// 5. Rewrite media paths and blank Mac-path alts
let rewritten = 0;
html = html.replace(ANY_MEDIA_PATH, (_, file) => { rewritten++; return `${PUBLIC_PREFIX}/${slug}-${file}`; });
html = html.replace(HTML_IMG_MAC_ALT, 'alt=""');

// Build a list of "run patches" — for each run that has formatting pandoc
// didn't carry, prepare {text, style} where style is the inline CSS to apply.
// Bold/italic/underline are deliberately omitted: pandoc already wraps these
// in <strong>/<em>/<u>, so re-wrapping would be redundant. We focus on the
// properties pandoc drops at the run level: color, font-size, font face.
function runPatchesFor(props, fontClassFn, highlightMap) {
  const out = [];
  const runs = props.runs || [];
  for (const r of runs) {
    const styleParts = [];
    if (r.props.color && r.props.color !== props.color) {
      styleParts.push(`color: ${r.props.color}`);
    }
    if (r.props.sizePt && r.props.sizePt !== props.sizePt) {
      styleParts.push(`font-size: ${r.props.sizePt}pt`);
    }
    if (r.props.face) {
      const cls = fontClassFn(r.props.face);
      if (cls && cls !== props.fontClass) styleParts.push(`font-family: ${cls}`);
    }
    if (r.props.highlightName && highlightMap[r.props.highlightName]) {
      styleParts.push(`background: ${highlightMap[r.props.highlightName]}`);
    }
    if (r.props.strike) styleParts.push("text-decoration: line-through");
    if (styleParts.length > 0 && r.text.trim().length > 0) {
      out.push({ text: r.text, style: styleParts.join("; ") });
    }
  }
  return out;
}

// 5b. Inject every paragraph-level style pandoc dropped, matched to the docx
//     by text fingerprint. Properties merged: alignment, font color, font
//     size (absolute pt), font-family class (sans/serif/cursive/mono),
//     highlight background colour.
//     If multiple docx paragraphs share a fingerprint (rare), we apply the
//     first matching set and consume it — preserves correct order when
//     duplicates exist.
// HIGHLIGHT constant shared with extractor — declared earlier inside the
// extractor closure; declare it here too for the run-patcher.
const HIGHLIGHT_LOCAL = {
  yellow: "#fff3a3", green: "#9dff8c", cyan: "#9dffff", magenta: "#ff9dff",
  blue: "#9dc7ff", red: "#ffb0b0", "dark-yellow": "#c5a700",
  "dark-green": "#1f8400", "dark-cyan": "#008f8f", "dark-magenta": "#8f008f",
  "dark-blue": "#003fa3", "dark-red": "#a00000",
};
const FONT_CLASS_LOCAL = (face) => {
  const f = (face || "").toLowerCase();
  if (/arial|calibri|helvetica|verdana|tahoma|segoe|trebuchet/.test(f)) return "sans-serif";
  if (/times|cambria|garamond|georgia|book antiqua|palatino|baskerville/.test(f)) return "serif";
  if (/script|brush|monotype corsiva|lucida handwriting|comic sans|chalkboard/.test(f)) return "cursive";
  if (/courier|consolas|monaco|mono/.test(f)) return "monospace";
  return null;
};

let stylesApplied = 0;
let runPatchesApplied = 0;
html = html.replace(/<p\b([^>]*)>([\s\S]*?)<\/p>/g, (full, attrs, inner) => {
  const plain = inner.replace(/<[^>]+>/g, "").replace(/&[a-z]+;|&#\d+;/g, " ");
  const key = fp(plain);
  if (!key) return full;
  const list = docxStyles.get(key);
  if (!list || !list.length) return full;
  const props = list.shift();
  const styleParts = [];
  if (props.gapBefore && props.gapBefore > 0) {
    // Each blank paragraph in source ≈ 1em of additional space.
    styleParts.push(`margin-top: ${Math.min(props.gapBefore, 6)}em`);
  }
  if (props.align) styleParts.push(`text-align: ${props.align}`);
  if (props.color) styleParts.push(`color: ${props.color}`);
  if (props.sizePt) styleParts.push(`font-size: ${props.sizePt}pt`);
  if (props.fontClass) styleParts.push(`font-family: ${props.fontClass}`);
  if (props.highlight) styleParts.push(`background: ${props.highlight}`);
  // Run-level patches: wrap matching text segments with inline-style spans
  let patchedInner = inner;
  const runPatches = runPatchesFor(props, FONT_CLASS_LOCAL, HIGHLIGHT_LOCAL);
  for (const patch of runPatches) {
    // Escape regex specials in patch.text
    const needle = patch.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Only wrap the FIRST occurrence (avoids re-wrapping if the same word
    // appears multiple times with different formatting elsewhere).
    const re = new RegExp(needle, "");
    const wrapped = `<span style="${patch.style}">${patch.text}</span>`;
    const before = patchedInner;
    patchedInner = patchedInner.replace(re, wrapped);
    if (patchedInner !== before) runPatchesApplied++;
  }
  if (!styleParts.length && patchedInner === inner) return full;
  if (styleParts.length) stylesApplied++;
  const existing = attrs.match(/\sstyle="([^"]*)"/);
  if (existing) {
    const merged = existing[1].replace(/;?\s*$/, "; ") + styleParts.join("; ");
    return `<p${attrs.replace(/\sstyle="[^"]*"/, ` style="${merged}"`)}>${patchedInner}</p>`;
  }
  if (styleParts.length) return `<p${attrs} style="${styleParts.join("; ")}">${patchedInner}</p>`;
  return `<p${attrs}>${patchedInner}</p>`;
});

// 6. Write
await fs.mkdir(CHAPTERS_DIR, { recursive: true });
const dest = path.join(CHAPTERS_DIR, `${slug}.html`);
await fs.writeFile(dest, html, "utf8");
await fs.rm(tmp, { recursive: true, force: true });

console.log(
  `ingested ${path.basename(source)} -> ${path.relative(WEB, dest)} ` +
    `(${copied} images, ${rewritten} link refs rewritten, ${mathRendered} math rendered, ${mathFailed} math failed, ${stylesApplied} para-styles, ${runPatchesApplied} run-patches)`,
);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2); const val = argv[i + 1];
      if (val === undefined || val.startsWith("--")) out[key] = true;
      else { out[key] = val; i++; }
    }
  }
  return out;
}
function expandHome(p) { return p.startsWith("~/") ? path.join(os.homedir(), p.slice(2)) : p; }
