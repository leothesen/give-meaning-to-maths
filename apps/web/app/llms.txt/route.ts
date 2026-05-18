import { BOOK } from "@/content/book";

export const dynamic = "force-static";

export function GET() {
  const lines: string[] = [];
  lines.push(`# ${BOOK.title}`);
  lines.push("");
  lines.push(`> ${BOOK.subtitle} — a book by ${BOOK.author}`);
  lines.push("");
  lines.push("## About");
  lines.push(`- Title: ${BOOK.title}`);
  lines.push(`- Author: ${BOOK.author}`);
  lines.push(`- Year: ${BOOK.year}`);
  lines.push("- Format: Web edition; every chapter is readable as a page.");
  lines.push("");
  lines.push("## Pages");
  lines.push("- [Home](/): overview");
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
