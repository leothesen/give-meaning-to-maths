export type Chapter = {
  slug: string;
  number: string;
  title: string;
  blurb: string;
  pages: string;
  readingTime: string;
};

export const BOOK = {
  title: "Give Meaning to Maths",
  author: "P. B.",
  authorFull: "Peter Bishop — known to a generation of pupils as “PeeBee”",
  subtitle:
    "An invitation to look for the meaning behind what you are investigating.",
  year: 2021,
  edition: "Revised Edition 2026",
  isbn: "978-0-620-98225-2",
  sections: 20,
  topics: 181,
  pages: 550,
  chapters: [
    { slug: "preface", number: "00", title: "Preface", blurb: "Why this book exists, and who it is for.", pages: "iii–viii", readingTime: "6 min" },
    { slug: "what-is-maths-for", number: "01", title: "What is mathematics for?", blurb: "Beyond the exam paper: a working answer for sceptical teenagers.", pages: "1–18", readingTime: "22 min" },
    { slug: "the-trouble-with-numbers", number: "02", title: "The trouble with numbers", blurb: "How abstraction trips us up — and how to make it click.", pages: "19–38", readingTime: "25 min" },
    { slug: "shapes-that-think", number: "03", title: "Shapes that think", blurb: "Geometry as the original visual language.", pages: "39–62", readingTime: "30 min" },
    { slug: "patterns-and-proof", number: "04", title: "Patterns and proof", blurb: "From a hunch to a watertight argument.", pages: "63–88", readingTime: "32 min" },
    { slug: "the-classroom-as-workshop", number: "05", title: "The classroom as workshop", blurb: "Notes for teachers — thirty-odd years' worth.", pages: "89–112", readingTime: "28 min" },
    { slug: "the-grammar-of-algebra", number: "06", title: "The grammar of algebra", blurb: "Why x is not a mystery.", pages: "113–138", readingTime: "34 min" },
    { slug: "calculus-without-tears", number: "07", title: "Calculus without tears", blurb: "An old teacher's gentlest possible introduction.", pages: "139–168", readingTime: "38 min" },
    { slug: "problems-worth-doing", number: "08", title: "Problems worth doing", blurb: "Forty problems collected over a lifetime.", pages: "169–198", readingTime: "varies" },
    { slug: "afterword", number: "09", title: "Afterword", blurb: "A letter to the next teacher.", pages: "199–208", readingTime: "10 min" },
    { slug: "notes-and-sources", number: "10", title: "Notes & sources", blurb: "Where the ideas came from.", pages: "209–224", readingTime: "8 min" },
  ] satisfies Chapter[],
} as const;

export function getChapter(slug: string): Chapter | undefined {
  return BOOK.chapters.find((c) => c.slug === slug);
}

export function chapterNeighbours(slug: string): {
  prev: Chapter | null;
  next: Chapter | null;
} {
  const i = BOOK.chapters.findIndex((c) => c.slug === slug);
  return {
    prev: i > 0 ? BOOK.chapters[i - 1]! : null,
    next: i >= 0 && i < BOOK.chapters.length - 1 ? BOOK.chapters[i + 1]! : null,
  };
}
