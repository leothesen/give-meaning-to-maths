export type Chapter = {
  slug: string;
  number: string;
  title: string;
  blurb: string;
  /** Print page range, e.g. "200–222". */
  pages: string;
  /** Topic-number range within the book, e.g. "78–89". */
  topics: string;
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
    { slug: "preface", number: "00", title: "Title Page & Foreword", blurb: "How to read this book, and the invitation behind it.", pages: "1–13", topics: "—" },
    { slug: "developing-perception", number: "01", title: "Developing Perception through Strategic Plans", blurb: "Creating strategies — spotting symmetry and pattern in number and shape, with trial and error as a tactic.", pages: "14–40", topics: "1–10" },
    { slug: "prime-numbers", number: "02", title: "Seeking the Formula for Prime Numbers", blurb: "A Grade-9 investigation into whether a formula for the primes could ever exist.", pages: "41–65", topics: "11–18" },
    { slug: "palindromic-dates", number: "03", title: "Palindromic and ‘Missing’ Dates", blurb: "An investigation into unique dates, stretching toward the ideas of Newton and Leibniz.", pages: "66–92", topics: "19–31" },
    { slug: "patterns-in-numbers", number: "04", title: "Patterns Emerging in Numbers", blurb: "Great patterns by great minds — Gauss, Pascal, Mandelbrot and fractals.", pages: "93–116", topics: "32–43" },
    { slug: "golden-ratio", number: "05", title: "The Golden Ratio in Numbers and in Shapes", blurb: "The ratio in nature, in the human body, in the pentagon, and in architecture.", pages: "117–148", topics: "44–57" },
    { slug: "circle-and-pi", number: "06", title: "The Circle and the Story of Pi", blurb: "Investigating the circle and the long story of π.", pages: "149–173", topics: "58–68" },
    { slug: "trigonometry", number: "07", title: "A Peek at Trigonometric Discoveries", blurb: "A first look at trigonometry and where it came from.", pages: "174–199", topics: "69–77" },
    { slug: "pythagoras-fermat", number: "08", title: "Pythagoras and Extension to Fermat", blurb: "Pythagoras and his theorem, extended through to Fermat.", pages: "200–222", topics: "78–89" },
    { slug: "extending-fibonacci", number: "09", title: "Patterns and More Patterns — Extending Fibonacci", blurb: "Extending and inter-relating Pascal and Fibonacci.", pages: "223–235", topics: "90–98" },
    { slug: "seeking-the-impossible", number: "10", title: "Seeking What Could Be Impossible", blurb: "An intense investigation into the seemingly impossible.", pages: "236–263", topics: "99–109" },
    { slug: "logical-thinking", number: "11", title: "The Art of Logical Thinking", blurb: "Extending Euclidean thinking — the logic of “if … then”.", pages: "264–282", topics: "110–119" },
    { slug: "dancing-decimals", number: "12", title: "Bits and Pieces, Fun and Dancing Decimals", blurb: "Fractions, decimals and the surprises hiding inside them.", pages: "283–316", topics: "120–129" },
    { slug: "thinking-deeper", number: "13", title: "Thinking Deeper As We Advance", blurb: "Deeper thinking as the mathematics advances.", pages: "317–338", topics: "130–137" },
    { slug: "models-and-architecture", number: "14", title: "Models, Measures and Architecture", blurb: "Modelling and meaning — measure and architecture.", pages: "339–378", topics: "138–146" },
    { slug: "new-dimensions-in-shape", number: "15", title: "New Dimensions in Shape", blurb: "New dimensions in two-dimensional shapes.", pages: "379–405", topics: "147–153" },
    { slug: "playing-by-the-rules", number: "16", title: "Playing By The Rules", blurb: "Games, competition, gambling, computerisation and quantum theory.", pages: "406–435", topics: "154–162" },
    { slug: "three-d-solids", number: "17", title: "3-D Solids — Testing our Ideas", blurb: "Testing our ideas against three-dimensional solids.", pages: "436–499", topics: "163–173" },
    { slug: "facing-tomorrow", number: "18", title: "Facing Tomorrow’s Tomorrow Today", blurb: "Looking ahead — facing tomorrow’s world today.", pages: "500–517", topics: "174–181" },
    { slug: "the-contributors", number: "19", title: "The Contributors", blurb: "Thanks to the pupils, artists and proofreaders who shaped the book.", pages: "518–524", topics: "—" },
    { slug: "graphics-acknowledgements", number: "20", title: "Acknowledgements for the Graphics", blurb: "List of graphics and their attributions.", pages: "525–543", topics: "—" },
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
