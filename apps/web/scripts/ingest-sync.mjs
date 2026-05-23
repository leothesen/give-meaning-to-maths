#!/usr/bin/env node
// Incremental sync from book-chapters/*.docx into the rendered site.
//
// Scans every .docx listed in chapter-manifest.mjs, hashes it, and compares
// against the cache in book-chapters/.ingest-manifest.json. For every .docx
// whose hash has changed (or whose slug isn't yet in the cache), this script
// runs the full conversion chain:
//
//     1. ingest-chapter.mjs  — pandoc → markdown + extracted images
//     2. convert-emfs.sh     — LibreOffice convert any Windows-vector figures
//     3. convert-photo-pngs.sh — sips convert photographic PNGs to JPEG
//     4. dedupe-assets.sh    — collapse identical files across all chapters
//
// Each post-processing script is naturally idempotent (operates only on files
// that haven't already been processed), so running them globally after a
// single-chapter ingest is cheap.
//
// Usage:
//   pnpm ingest:sync           # ingest only the chapters whose .docx changed
//   pnpm ingest:sync --all     # ingest every chapter (ignores the manifest)
//   pnpm ingest:sync --dry-run # show what would happen, don't run
//
// After ingestion the script prints a `git status` hint; you commit & push
// when you've reviewed the diff.
import { promises as fs } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { CHAPTERS } from "./chapter-manifest.mjs";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(SCRIPTS, "..");
const ROOT = path.resolve(WEB, "../..");
const BOOK = path.join(ROOT, "book-chapters");
const MANIFEST_PATH = path.join(BOOK, ".ingest-manifest.json");

const flags = new Set(process.argv.slice(2));
const FORCE_ALL = flags.has("--all") || flags.has("--force");
const DRY_RUN = flags.has("--dry-run");
// --ci behaves like --dry-run but exits non-zero when re-ingestion is needed,
// so a pre-push hook or GitHub Action can fail the push/check on stale state.
const CI_MODE = flags.has("--ci");

async function sha256(file) {
  const buf = await fs.readFile(file);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

async function loadManifest() {
  try {
    return JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8"));
  } catch (e) {
    if (e.code === "ENOENT") return { version: 1, chapters: {} };
    throw e;
  }
}

const manifest = await loadManifest();

// Hash every present .docx, decide which need ingestion.
const planned = [];
const missing = [];
for (const c of CHAPTERS) {
  const docxPath = path.join(BOOK, c.file);
  try {
    await fs.stat(docxPath);
  } catch {
    missing.push(c);
    continue;
  }
  const hash = await sha256(docxPath);
  const prev = manifest.chapters[c.slug]?.docxSha256;
  if (FORCE_ALL || hash !== prev) {
    planned.push({ ...c, docxPath, hash, prevHash: prev });
  }
}

if (missing.length) {
  console.warn(`note: ${missing.length} .docx file(s) not found in ${BOOK}:`);
  for (const m of missing) console.warn(`  - ${m.file}  (${m.slug})`);
}

if (!planned.length) {
  console.log("all chapters already up to date.");
  process.exit(0);
}

console.log(
  `${FORCE_ALL ? "force-ingesting" : "re-ingesting"} ${planned.length} chapter(s):`,
);
for (const p of planned) {
  const reason = !p.prevHash ? "new" : "changed";
  console.log(`  - ${p.num} ${p.slug.padEnd(28)} (${reason})`);
}

if (DRY_RUN || CI_MODE) {
  if (CI_MODE && planned.length) {
    console.error("\n❌ stale: re-run `pnpm ingest:sync` before pushing.");
    process.exit(1);
  }
  console.log(DRY_RUN ? "\n--dry-run: nothing was changed" : "\n--ci: check passed");
  process.exit(0);
}

// Run the per-chapter ingest. This deletes the slug's old assets and rewrites
// content/chapters/<slug>.md from the .docx.
for (const p of planned) {
  console.log(`\n=== ingest ${p.slug} ===`);
  execFileSync(
    "node",
    [
      path.join(SCRIPTS, "ingest-chapter.mjs"),
      "--source", p.docxPath,
      "--slug", p.slug,
      "--number", p.num,
      "--title", p.title,
    ],
    { stdio: "inherit" },
  );
}

// Post-processing: each step only acts on files matching its filter (.emf
// for the EMF converter; photographic PNGs above 80 KB for the JPEG step;
// identical-hash files for the deduper). On a stable repo all three are no-ops
// for chapters that didn't change.
console.log("\n=== convert EMFs (if any new ones) ===");
execFileSync("bash", [path.join(SCRIPTS, "convert-emfs.sh")], { stdio: "inherit" });

console.log("\n=== convert photographic PNGs to JPEG ===");
execFileSync("bash", [path.join(SCRIPTS, "convert-photo-pngs.sh")], { stdio: "inherit" });

console.log("\n=== dedupe identical assets ===");
execFileSync("bash", [path.join(SCRIPTS, "dedupe-assets.sh")], { stdio: "inherit" });

// Update the manifest with the hashes of everything we just ingested.
for (const p of planned) {
  manifest.chapters[p.slug] = {
    docxName: p.file,
    docxSha256: p.hash,
    ingestedAt: new Date().toISOString(),
  };
}
await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");

console.log(`\n✓ ingested ${planned.length} chapter(s). manifest updated.`);
console.log("\nnext steps:");
console.log("  git status                    # review what changed");
console.log("  git diff apps/web/content/    # spot-check the markdown");
console.log("  git add -A && git commit -m 'content: re-ingest revised chapter X' && git push");
