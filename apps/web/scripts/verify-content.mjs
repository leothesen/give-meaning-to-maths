#!/usr/bin/env node
// PR-level content sanity check. Does NOT require .docx files (those are
// gitignored and not in CI). Verifies what we CAN see in the repo:
//
//   1. Every chapter slug declared in content/book.ts has a corresponding
//      content/chapters/<slug>.md file.
//   2. Every image reference inside every chapter .md points at an actual
//      file under public/assets/.
//   3. No orphaned chapter files (a .md whose slug isn't in book.ts).
//
// Prints a short, copy-pasteable report. Exits non-zero on any failure.
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(SCRIPTS, "..");
const CHAPTERS_DIR = path.join(WEB, "content", "chapters");
const ASSETS_DIR = path.join(WEB, "public", "assets");
const BOOK_TS = path.join(WEB, "content", "book.ts");

const bookSrc = await fs.readFile(BOOK_TS, "utf8");
const declaredSlugs = [...bookSrc.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
if (!declaredSlugs.length) {
  console.error("verify-content: could not extract any slugs from book.ts");
  process.exit(2);
}

const errors = [];
const warnings = [];

// 1. every declared slug has a .md
for (const slug of declaredSlugs) {
  // Accept either .html (new HTML pipeline) or .md (legacy markdown).
  let ok = false;
  try { await fs.stat(path.join(CHAPTERS_DIR, `${slug}.html`)); ok = true; } catch {}
  if (!ok) {
    try { await fs.stat(path.join(CHAPTERS_DIR, `${slug}.md`)); ok = true; } catch {}
  }
  if (!ok) {
    errors.push(`missing chapter file: content/chapters/${slug}.{html,md} (declared in book.ts)`);
  }
}

// 3. no orphan .md files
const chapterFiles = (await fs.readdir(CHAPTERS_DIR)).filter((f) => /\.(html|md)$/.test(f));
const declaredSet = new Set(declaredSlugs);
for (const f of chapterFiles) {
  const slug = f.replace(/\.(html|md)$/, "");
  if (!declaredSet.has(slug)) {
    warnings.push(`orphan chapter file: content/chapters/${f} (not declared in book.ts)`);
  }
}

// 2. every image reference in every .md points at an existing asset
const ASSET_REF = /\/assets\/([^\/\s")<>]+\.(?:png|jpe?g|gif|webp|svg|bmp|tiff?))/gi;
let assetRefsChecked = 0;
let assetRefsMissing = 0;
for (const f of chapterFiles) {
  const body = await fs.readFile(path.join(CHAPTERS_DIR, f), "utf8");
  for (const m of body.matchAll(ASSET_REF)) {
    assetRefsChecked++;
    try {
      await fs.stat(path.join(ASSETS_DIR, m[1]));
    } catch {
      assetRefsMissing++;
      errors.push(`broken image ref in ${f}: /assets/${m[1]}`);
    }
  }
}

// Report
console.log(`verify-content:`);
console.log(`  declared chapter slugs:   ${declaredSlugs.length}`);
console.log(`  chapter files found:      ${chapterFiles.length}`);
console.log(`  image refs checked:       ${assetRefsChecked}`);
console.log(`  image refs broken:        ${assetRefsMissing}`);
if (warnings.length) {
  console.log(`\nwarnings (${warnings.length}):`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
}
if (errors.length) {
  console.log(`\nerrors (${errors.length}):`);
  for (const e of errors.slice(0, 20)) console.log(`  ✗ ${e}`);
  if (errors.length > 20) console.log(`  …and ${errors.length - 20} more`);
  process.exit(1);
}
console.log(`\n✓ all checks passed`);
