#!/usr/bin/env bash
set -euo pipefail
WEB="$HOME/Development/Personal/give-meaning-to-maths/apps/web"
DIR="$HOME/Development/Personal/give-meaning-to-maths/book-chapters"
cd "$WEB"

# num | slug | title   (num maps to the leading number on the .docx filename)
META=(
"00|preface|Title Page & Foreword"
"01|developing-perception|Developing Perception through Strategic Plans"
"02|prime-numbers|Seeking the Formula for Prime Numbers"
"03|palindromic-dates|Palindromic and ‘Missing’ Dates"
"04|patterns-in-numbers|Patterns Emerging in Numbers"
"05|golden-ratio|The Golden Ratio in Numbers and in Shapes"
"06|circle-and-pi|The Circle and the Story of Pi"
"07|trigonometry|A Peek at Trigonometric Discoveries"
"08|pythagoras-fermat|Pythagoras and Extension to Fermat"
"09|extending-fibonacci|Patterns and More Patterns — Extending Fibonacci"
"10|seeking-the-impossible|Seeking What Could Be Impossible"
"11|logical-thinking|The Art of Logical Thinking"
"12|dancing-decimals|Bits and Pieces, Fun and Dancing Decimals"
"13|thinking-deeper|Thinking Deeper As We Advance"
"14|models-and-architecture|Models, Measures and Architecture"
"15|new-dimensions-in-shape|New Dimensions in Shape"
"16|playing-by-the-rules|Playing By The Rules"
"17|three-d-solids|3-D Solids — Testing our Ideas"
"18|facing-tomorrow|Facing Tomorrow’s Tomorrow Today"
"19|the-contributors|The Contributors"
"20|graphics-acknowledgements|Acknowledgements for the Graphics"
)

for entry in "${META[@]}"; do
  IFS='|' read -r num slug title <<< "$entry"
  n=$((10#$num))
  # match the .docx whose filename begins with this number + a dot
  file=$(ls "$DIR/$n."*.docx 2>/dev/null | head -1 || true)
  if [[ -z "$file" ]]; then
    echo "!! NO FILE for section $num ($slug)"; continue
  fi
  node scripts/ingest-chapter.mjs --source "$file" --slug "$slug" --number "$num" --title "$title"
done
