// Source of truth for the chapter list. Maps each section number to its slug,
// its source .docx filename (exactly as Peter sent it — note the typos and
// weird spacing are real and required to match the files), and the cleaned
// title used on the site.
//
// Used by:
//   - scripts/ingest-sync.mjs  (incremental hash-based re-ingestion)
//   - scripts/batch-ingest.sh  (force-all bootstrap)
//
// Add a new chapter here and `pnpm ingest:sync --all` will pick it up.
export const CHAPTERS = [
  { num: "00", slug: "preface",                   file: "0. Title Page and Foreword .docx",                     title: "Title Page & Foreword" },
  { num: "01", slug: "developing-perception",     file: "1. Developing Perception through Strategic Plans.docx", title: "Developing Perception through Strategic Plans" },
  { num: "02", slug: "prime-numbers",             file: "2. Seeking the Formula for Prime Numbers.docx",         title: "Seeking the Formula for Prime Numbers" },
  { num: "03", slug: "palindromic-dates",         file: "3. Palidromic and _Missing_ Dates .docx",               title: "Palindromic and ‘Missing’ Dates" },
  { num: "04", slug: "patterns-in-numbers",       file: "4. Patterns Emerging in Numbers.docx",                  title: "Patterns Emerging in Numbers" },
  { num: "05", slug: "golden-ratio",              file: "5. The Golden Ratio in Numbers and in Shapes.docx",     title: "The Golden Ratio in Numbers and in Shapes" },
  { num: "06", slug: "circle-and-pi",             file: "6. The Circle and the Story of Pi .docx",               title: "The Circle and the Story of Pi" },
  { num: "07", slug: "trigonometry",              file: "7. A Peek at Trigonometric Discoveries.docx",           title: "A Peek at Trigonometric Discoveries" },
  { num: "08", slug: "pythagoras-fermat",         file: "8. Pythagoras and Extention to Fermat.docx",            title: "Pythagoras and Extension to Fermat" },
  { num: "09", slug: "extending-fibonacci",       file: "9. Patterns and More Patterns - Extending Fibonacci.docx", title: "Patterns and More Patterns — Extending Fibonacci" },
  { num: "10", slug: "seeking-the-impossible",    file: "10.Seeking What Could Be Impossible.docx",              title: "Seeking What Could Be Impossible" },
  { num: "11", slug: "logical-thinking",          file: "11. The Art of Logical Thinking .docx",                 title: "The Art of Logical Thinking" },
  { num: "12", slug: "dancing-decimals",          file: "12. Bits and Pieces, Fun and Dancing Decimals.docx",    title: "Bits and Pieces, Fun and Dancing Decimals" },
  { num: "13", slug: "thinking-deeper",           file: "13. Thinking Deeper As We Advance.docx",                title: "Thinking Deeper As We Advance" },
  { num: "14", slug: "models-and-architecture",   file: "14. Models, Measures and Architecture.docx",            title: "Models, Measures and Architecture" },
  { num: "15", slug: "new-dimensions-in-shape",   file: "15. New Dimensions in Shape.docx",                      title: "New Dimensions in Shape" },
  { num: "16", slug: "playing-by-the-rules",      file: "16. Playing By The Rules.docx",                         title: "Playing By The Rules" },
  { num: "17", slug: "three-d-solids",            file: "17.  3-D Solids - Testing our Ideas.docx",              title: "3-D Solids — Testing our Ideas" },
  { num: "18", slug: "facing-tomorrow",           file: "18. Facing Tomorrow_s Tomorrow Today.docx",             title: "Facing Tomorrow’s Tomorrow Today" },
  { num: "19", slug: "the-contributors",          file: "19. The Contibutors .docx",                             title: "The Contributors" },
  { num: "20", slug: "graphics-acknowledgements", file: "20. Acknowledgements For The Graphics  .docx",          title: "Acknowledgements for the Graphics" },
];
