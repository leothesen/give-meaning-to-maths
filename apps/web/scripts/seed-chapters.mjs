// One-off: seed 11 placeholder chapter markdown files.
// Uses the design bundle's real placeholder prose where available,
// otherwise generates a uniform tagged placeholder from book metadata.
import { promises as fs } from "node:fs";
import path from "node:path";

const BUNDLE =
  "/Users/leothesen/.claude/jobs/2603a000/design/pb-website/project/chapters";
const OUT = path.join(process.cwd(), "content", "chapters");

const chapters = [
  ["preface", "00", "Preface", "Why this book exists, and who it is for."],
  ["what-is-maths-for", "01", "What is mathematics for?", "Beyond the exam paper: a working answer for sceptical teenagers."],
  ["the-trouble-with-numbers", "02", "The trouble with numbers", "How abstraction trips us up — and how to make it click."],
  ["shapes-that-think", "03", "Shapes that think", "Geometry as the original visual language."],
  ["patterns-and-proof", "04", "Patterns and proof", "From a hunch to a watertight argument."],
  ["the-classroom-as-workshop", "05", "The classroom as workshop", "Notes for teachers — thirty-odd years' worth."],
  ["the-grammar-of-algebra", "06", "The grammar of algebra", "Why x is not a mystery."],
  ["calculus-without-tears", "07", "Calculus without tears", "An old teacher's gentlest possible introduction."],
  ["problems-worth-doing", "08", "Problems worth doing", "Forty problems collected over a lifetime."],
  ["afterword", "09", "Afterword", "A letter to the next teacher."],
  ["notes-and-sources", "10", "Notes & sources", "Where the ideas came from."],
];

await fs.mkdir(OUT, { recursive: true });

for (const [slug, number, title, blurb] of chapters) {
  let body = "";
  try {
    const fromBundle = await fs.readFile(
      path.join(BUNDLE, `${slug}.md`),
      "utf8",
    );
    // Strip the bundle's leading "# Title" / byline lines; keep prose.
    body = fromBundle
      .replace(/^#.*$/m, "")
      .replace(/^\*Give Meaning to Maths.*$/m, "")
      .trim();
  } catch {
    body = "";
  }
  if (!body) {
    body = `> _Placeholder — replace with the converted book text for this chapter._

${blurb}

This chapter's text will be filled in from the book PDF. Until then this
page exists so the site is fully browsable and the structure is final.`;
  } else {
    body = `> _Placeholder — sample prose from the design mock-up; replace with the final book text._\n\n${body}`;
  }
  const frontmatter = `---\ntitle: "${title.replace(/"/g, '\\"')}"\nnumber: "${number}"\nslug: "${slug}"\n---\n\n`;
  await fs.writeFile(
    path.join(OUT, `${slug}.md`),
    frontmatter + body + "\n",
    "utf8",
  );
  console.log("wrote", slug);
}
