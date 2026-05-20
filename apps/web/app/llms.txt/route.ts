import { BOOK } from "@/content/book";

export const dynamic = "force-static";

export function GET() {
  const lines: string[] = [];
  lines.push(`# ${BOOK.title}`);
  lines.push("");
  lines.push(`> ${BOOK.subtitle}`);
  lines.push("");
  lines.push("## About");
  lines.push(`- Title: ${BOOK.title}`);
  lines.push(`- Author: ${BOOK.authorFull}`);
  lines.push(`- ISBN: ${BOOK.isbn}`);
  lines.push(`- Copyright: © ${BOOK.year} Peter Bishop`);
  lines.push(`- Edition: ${BOOK.edition}`);
  lines.push(`- Print length: ${BOOK.pages} pages`);
  lines.push(`- Structure: ${BOOK.sections} sections, ${BOOK.topics} topics`);
  lines.push(
    "- Format: web edition; every topic is a static HTML page intended to be readable by humans and language models alike.",
  );
  lines.push(
    "- Permissions: students may freely receive a copy of any topic, provided no payment is required for copies handed out by a tutor or institute.",
  );
  lines.push("");
  lines.push("## Pages");
  lines.push("- [Home](/): overview and invitation");
  lines.push("- [Read](/read): chapter reader");
  lines.push("- [About](/about): the author");
  lines.push("");
  lines.push("## Chapters");
  for (const c of BOOK.chapters) {
    lines.push(`- [${c.number} — ${c.title}](/read/${c.slug}): ${c.blurb}`);
  }
  lines.push("");
  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
