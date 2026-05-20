#!/usr/bin/env node
// Ingest one Google-Doc -> .docx -> pandoc-Markdown export into a chapter.
//
// Pandoc-from-.docx uses reference-style images with inline base64 definitions
// at the bottom:
//
//     ![alt text][image3]
//     ...
//     [image3]: <data:image/png;base64,iVBORw0KGgo...>
//
// We extract each base64 blob into apps/web/public/assets/<slug>-<n>.<ext>
// and rewrite the reference definitions to point at file paths. Body refs
// (`![alt][imageN]`) are left untouched so markdown stays diffable.
//
// Usage:
//   node scripts/ingest-chapter.mjs \
//     --source "~/Downloads/0. Title Page and Foreword .docx.md" \
//     --slug preface --number 00 --title "Title Page & Foreword"
//
// Re-running is idempotent: existing extracted PNGs for this slug are removed
// first, then re-written from the current source.

import { promises as fs } from "node:fs";
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

const REF_DEF = /^\[(image\d+)\]:\s*<data:image\/([a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)>\s*$/gm;
const EXPORT_ARTIFACT_FIRST_LINES = [/^I've '\s*$/];
// Pandoc-from-Word leaks local Mac paths into image alt text; strip them so
// rendered <img alt> is human-readable rather than "Macintosh HD:Users:…".
const MAC_PATH_IN_ALT = /!\[Macintosh HD:[^\]]*\]/g;

const raw = await fs.readFile(source, "utf8");
const lines = raw.split("\n");

// 1. Strip known export-artifact lines from the very top.
let bodyStart = 0;
for (const re of EXPORT_ARTIFACT_FIRST_LINES) {
  if (re.test(lines[bodyStart] ?? "")) bodyStart++;
}
let body = lines.slice(bodyStart).join("\n");

// 2. Walk every `[imageN]: <data:…>` definition, decode the base64 to a file
//    under public/assets/, and rewrite the definition to a file path.
await fs.mkdir(ASSETS_DIR, { recursive: true });

// Remove any pre-existing extracted assets for this slug so re-runs don't pile up.
for (const entry of await fs.readdir(ASSETS_DIR)) {
  if (entry.startsWith(`${slug}-`) && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(entry)) {
    await fs.unlink(path.join(ASSETS_DIR, entry));
  }
}

let extracted = 0;
body = body.replace(REF_DEF, (_full, name, ext, b64) => {
  extracted++;
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const filename = `${slug}-${name}.${safeExt}`;
  const filepath = path.join(ASSETS_DIR, filename);
  // base64 may include line breaks; Buffer handles them.
  fs.writeFile(filepath, Buffer.from(b64, "base64")).catch((err) => {
    console.error(`failed writing ${filepath}: ${err.message}`);
    process.exit(1);
  });
  return `[${name}]: ${PUBLIC_PREFIX}/${filename}`;
});

// 3. Scrub the Mac-path noise out of alt text.
body = body.replace(MAC_PATH_IN_ALT, "![]");

// 4. Prepend frontmatter and write.
const frontmatter =
  `---\n` +
  `title: ${JSON.stringify(title)}\n` +
  `number: ${JSON.stringify(number)}\n` +
  `slug: ${JSON.stringify(slug)}\n` +
  `---\n\n`;
const out = frontmatter + body.trimStart();

await fs.mkdir(CHAPTERS_DIR, { recursive: true });
const dest = path.join(CHAPTERS_DIR, `${slug}.md`);
await fs.writeFile(dest, out, "utf8");

console.log(
  `ingested ${path.basename(source)} -> ${path.relative(WEB, dest)} ` +
    `(${extracted} image${extracted === 1 ? "" : "s"} extracted to ${path.relative(WEB, ASSETS_DIR)}/)`,
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
