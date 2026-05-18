import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";

const CHAPTERS_DIR = path.join(process.cwd(), "content", "chapters");

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype)
  .use(rehypeKatex)
  .use(rehypeStringify);

export async function renderChapter(slug: string): Promise<string> {
  const file = path.join(CHAPTERS_DIR, `${slug}.md`);
  const raw = await fs.readFile(file, "utf8");
  const { content } = matter(raw);
  const html = await processor.process(content);
  return String(html);
}
