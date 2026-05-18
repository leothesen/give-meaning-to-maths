import { describe, it, expect } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import { BOOK, getChapter, chapterNeighbours } from "@/content/book";
import { renderChapter } from "@/content/markdown";

describe("book data", () => {
  it("has unique, non-empty slugs", () => {
    const slugs = BOOK.chapters.map((c) => c.slug);
    expect(slugs.every(Boolean)).toBe(true);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("getChapter resolves known and unknown slugs", () => {
    expect(getChapter("preface")?.title).toBe("Preface");
    expect(getChapter("nope")).toBeUndefined();
  });

  it("neighbours are correct at the edges", () => {
    expect(chapterNeighbours("preface").prev).toBeNull();
    expect(chapterNeighbours("preface").next?.slug).toBe("what-is-maths-for");
    expect(chapterNeighbours("notes-and-sources").next).toBeNull();
  });

  it("every chapter has a markdown file", async () => {
    for (const c of BOOK.chapters) {
      const p = path.join(process.cwd(), "content", "chapters", `${c.slug}.md`);
      await expect(fs.access(p)).resolves.toBeUndefined();
    }
  });

  it("renders every chapter to non-empty HTML", async () => {
    for (const c of BOOK.chapters) {
      const html = await renderChapter(c.slug);
      expect(html.length).toBeGreaterThan(20);
    }
  });
});
