import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";

const CHAPTERS_DIR = path.join(process.cwd(), "content", "chapters");

// Chapters are pandoc-converted from Peter's .docx files. Pandoc emits complex
// Word tables (multi-row, image-grid layouts) as raw HTML <table>, which a
// plain remark-rehype pipeline strips. rehype-raw parses those HTML islands
// into proper hast nodes so they render alongside the markdown.
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  // errorColor: render KaTeX parse failures in the surrounding text colour
  // rather than alarm-red. strict: 'ignore' tolerates Word's quirky OMML
  // (e.g. `Radians` treated as an unknown function) instead of throwing.
  .use(rehypeKatex, { errorColor: "currentColor", strict: "ignore" })
  .use(rehypeStringify);

export async function renderChapter(slug: string): Promise<string> {
  // Prefer pre-rendered .html (richer formatting fidelity) when present;
  // fall back to the .md + remark pipeline for chapters still on the old
  // path. Lets us migrate one chapter at a time.
  const htmlFile = path.join(CHAPTERS_DIR, `${slug}.html`);
  try {
    return await fs.readFile(htmlFile, "utf8");
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  const file = path.join(CHAPTERS_DIR, `${slug}.md`);
  const raw = await fs.readFile(file, "utf8");
  const { content } = matter(raw);
  const html = await processor.process(content);
  return String(html);
}
