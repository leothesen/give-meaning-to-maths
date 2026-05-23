#!/usr/bin/env node
// Ingest one chapter .docx straight into a rendered chapter, via pandoc.
//
// Pandoc is the only converter that turns Word's native equations (OMML) into
// LaTeX, which the site renders with KaTeX. We run:
//
//     pandoc <src.docx> -f docx
//            -t markdown-grid_tables-multiline_tables-simple_tables
//            --extract-media=<tmp>
//
// Why that target:
//   - `markdown` (pandoc's own flavour) emits plain `$...$` / `$$...$$` math.
//   - Disabling grid/multiline/simple tables stops pandoc emitting `+---+`
//     ASCII-art tables that remark-gfm can't parse. Simple tables fall back to
//     pipe tables (handled by remark-gfm); complex multi-row layouts fall back
//     to raw HTML <table> (handled downstream by rehype-raw).
//
// After conversion we:
//   1. extract images to apps/web/public/assets/<slug>-<name>.<ext>, rewriting
//      both markdown image links AND HTML <img src="…"> attributes to point at
//      the public path (by basename);
//   2. strip pandoc image-size attribute blocks `{width=… height=…}` (these
//      can wrap across two lines) WITHOUT touching the braces inside LaTeX
//      math (anchored to ![]() so it can't match `$...$`);
//   3. unwrap pandoc spans like `[text]{.underline}` to plain `text`;
//   4. blank out leaked Mac-path alt text in both markdown and HTML images.
//
// Usage:
//   node scripts/ingest-chapter.mjs \
//     --source "/abs/path/to/8. Pythagoras and Extention to Fermat.docx" \
//     --slug pythagoras-fermat --number 08 --title "Pythagoras and Extension to Fermat"
//
// Re-running is idempotent: existing extracted images for this slug are
// removed first, then re-written from the current source.

import { promises as fs } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import os from "node:os";

const args = parseArgs(process.argv.slice(2));
const need = (k) => {
  if (!args[k]) {
    console.error(`Missing required --${k}`);
    process.exit(2);
  }
  return args[k];
};
const source = expandHome(need("source"));
const slug = need("slug");
const number = need("number");
const title = need("title");

const WEB = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const ASSETS_DIR = path.join(WEB, "public", "assets");
const CHAPTERS_DIR = path.join(WEB, "content", "chapters");
const PUBLIC_PREFIX = "/assets"; // URL prefix matching apps/web/public/assets

const IMG_EXT = "png|jpe?g|gif|webp|svg|bmp|tiff?|emf|wmf";
// Rewrites any path ending in `/media/imageN.ext` (regardless of leading
// directory) — catches both `](tmp/media/image2.png)` in markdown image
// links and `src="tmp/media/image2.png"` inside pandoc-emitted <img> tags.
const ANY_MEDIA_PATH = new RegExp(
  `[^\\s"'()<>]*media\\/(image\\d+\\.(?:${IMG_EXT}))`,
  "gi",
);
// `![alt](path){width=… height=…}` — attribute block may span newlines.
const MD_IMG_ATTR = /(!\[[^\]]*\]\([^)]*\))\{[^}]*\}/g;
// Pandoc spans `[text]{.underline}` / `[text]{.smallcaps}` -> plain text.
const SPAN_ATTR = /\[([^\]]*)\]\{[^}]*\}/g;
// Blank markdown image alt text (Word leaks local paths like "Macintosh HD:…").
const MD_IMG_ALT = /!\[[^\]]*\]\(/g;
// Blank Mac-path alt attributes in HTML <img> tags emitted by pandoc.
const HTML_IMG_MAC_ALT = /alt="[^"]*(?:Macintosh HD|:Users:|:Desktop:)[^"]*"/g;

// 1. Convert the .docx to pandoc-markdown with images extracted to a temp dir.
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "gmtm-ingest-"));
const mdPath = path.join(tmp, "out.md");
try {
  execFileSync(
    "pandoc",
    [
      source,
      "-f",
      "docx",
      "-t",
      "markdown-grid_tables-multiline_tables-simple_tables",
      `--extract-media=${tmp}`,
      "-o",
      mdPath,
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );
} catch (err) {
  console.error(`pandoc failed: ${err.message}`);
  process.exit(1);
}
let body = await fs.readFile(mdPath, "utf8");

// 2. Reset this slug's assets so re-runs don't pile up, then copy extracted media.
await fs.mkdir(ASSETS_DIR, { recursive: true });
for (const entry of await fs.readdir(ASSETS_DIR)) {
  if (entry.startsWith(`${slug}-`)) await fs.unlink(path.join(ASSETS_DIR, entry));
}
const mediaDir = path.join(tmp, "media");
let copied = 0;
let mediaFiles = [];
try {
  mediaFiles = await fs.readdir(mediaDir);
} catch {
  /* a chapter with no images is fine */
}
for (const name of mediaFiles) {
  await fs.copyFile(path.join(mediaDir, name), path.join(ASSETS_DIR, `${slug}-${name}`));
  copied++;
}

// 3. Strip image-size attributes and unwrap pandoc spans. Order matters:
//    handle image `{…}` blocks before span `[…]{…}` so the two can't overlap.
//    Neither touches `$…$` math (those anchor on `]`/`)` characters, not `$`).
//    Word allows nested span attrs like `[[QUALITATIVE]{.mark}]{.underline}`,
//    so loop the span replacement to a fixed point — one pass would only peel
//    the outer layer.
body = body.replace(MD_IMG_ATTR, "$1");
let _prev;
do {
  _prev = body;
  body = body.replace(SPAN_ATTR, "$1");
} while (body !== _prev);

// 3b. Repair common pandoc OMML→LaTeX malformations. Word documents often
// store a bare degree symbol as a superscript with no base, which pandoc
// renders as the standalone math expression `${^\circ}$` (or as the literal
// `{^\circ}` outside math). KaTeX can't render a superscript without a base
// either way — substitute the real Unicode degree character instead.
body = body.replace(/\$\{\^\\circ\}\$/g, "°");
body = body.replace(/\{\^\\circ\}/g, "°");
// Orphan `\` immediately after `°` (left behind when {^\circ} was stripped
// from patterns like `{^\circ}\`).
body = body.replace(/°\\/g, "°");
// Math expression ending with a stray backslash before its closing `$`
// (pandoc artifact, e.g. `$400^{g}.\$` or `$\pi\ \ Radians.\ \$`). KaTeX
// rejects the trailing `\`; strip it (preserve any whitespace between).
body = body.replace(/\$([^$\n]*?)\\(\s*)\$/g, (_, c, ws) => "$" + c + ws + "$");

// 4. Rewrite every `…/media/imageN.ext` to `/assets/<slug>-imageN.ext`,
//    whether in markdown `](…)` or HTML `src="…"`.
let rewritten = 0;
body = body.replace(ANY_MEDIA_PATH, (_full, file) => {
  rewritten++;
  return `${PUBLIC_PREFIX}/${slug}-${file}`;
});

// 5. Blank alt text in both markdown and HTML images (Word leaks local paths).
body = body.replace(MD_IMG_ALT, "![](");
body = body.replace(HTML_IMG_MAC_ALT, 'alt=""');

// 6. Prepend frontmatter and write.
const frontmatter =
  `---\n` +
  `title: ${JSON.stringify(title)}\n` +
  `number: ${JSON.stringify(number)}\n` +
  `slug: ${JSON.stringify(slug)}\n` +
  `---\n\n`;
const out = frontmatter + body.trimStart() + "\n";

await fs.mkdir(CHAPTERS_DIR, { recursive: true });
const dest = path.join(CHAPTERS_DIR, `${slug}.md`);
await fs.writeFile(dest, out, "utf8");
await fs.rm(tmp, { recursive: true, force: true });

console.log(
  `ingested ${path.basename(source)} -> ${path.relative(WEB, dest)} ` +
    `(${copied} image${copied === 1 ? "" : "s"} -> ${path.relative(WEB, ASSETS_DIR)}/, ` +
    `${rewritten} link${rewritten === 1 ? "" : "s"} rewritten)`,
);

// --- helpers ---

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = argv[i + 1];
      if (val === undefined || val.startsWith("--")) out[key] = true;
      else {
        out[key] = val;
        i++;
      }
    }
  }
  return out;
}

function expandHome(p) {
  return p.startsWith("~/") ? path.join(os.homedir(), p.slice(2)) : p;
}
