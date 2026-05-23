#!/usr/bin/env bash
# Convert "photographic" PNGs to JPEG to shrink the asset pile.
# Heuristic: a PNG without an alpha channel and bigger than 80 KB is almost
# certainly a photo/scan, not a UI graphic or diagram needing transparency.
# Diagrams with transparency, screenshots with sharp edges, and small files
# stay as PNG.
set -euo pipefail
WEB="$HOME/Development/Personal/give-meaning-to-maths/apps/web"
ASSETS="$WEB/public/assets"
CHAPTERS="$WEB/content/chapters"
JPEG_Q=78
MIN_BYTES=80000

cd "$ASSETS"
shopt -s nullglob
PNGS=( *.png )
shopt -u nullglob
total=${#PNGS[@]}
echo "PNGs to consider: $total"

converted=0
kept=0
for f in "${PNGS[@]}"; do
  sz=$(stat -f %z "$f")
  if [ "$sz" -lt "$MIN_BYTES" ]; then
    kept=$((kept+1)); continue
  fi
  hasAlpha=$(sips -g hasAlpha "$f" 2>/dev/null | awk '/hasAlpha/ {print $2}')
  if [ "$hasAlpha" = "yes" ]; then
    kept=$((kept+1)); continue
  fi
  base="${f%.png}"
  out="$base.jpeg"
  if sips -s format jpeg -s formatOptions "$JPEG_Q" "$f" --out "$out" >/dev/null 2>&1; then
    rm "$f"
    for md in "$CHAPTERS"/*.md; do
      if grep -q "/assets/$f" "$md" 2>/dev/null; then
        sed "s|/assets/$f|/assets/$out|g" "$md" > "$md.tmp" && mv "$md.tmp" "$md"
      fi
    done
    converted=$((converted+1))
  else
    kept=$((kept+1))
  fi
done

echo "converted: $converted PNG -> JPEG"
echo "kept as PNG: $kept"
echo "assets size now: $(du -sh . | awk '{print $1}')"
