#!/usr/bin/env bash
# Dedupe identical files in public/assets by content hash. For each group of
# duplicates, keep one canonical name (the alphabetically-first) and rewrite all
# chapter markdown references to point at it.
set -euo pipefail
WEB="$HOME/Development/Personal/give-meaning-to-maths/apps/web"
ASSETS="$WEB/public/assets"
CHAPTERS="$WEB/content/chapters"

cd "$ASSETS"
echo "before: $(du -sm . | awk '{print $1}') MB"

tmp=$(mktemp -d)
# Hash every file, group by hash
for f in *; do
  [ -f "$f" ] || continue
  shasum -a 256 "$f" >> "$tmp/hashes.txt"
done
awk '{print $1}' "$tmp/hashes.txt" | sort | uniq -c | awk '$1 > 1 {print $2}' > "$tmp/dup-hashes.txt"

removed=0
freed=0
while read -r h; do
  # All files with this hash, sorted; keep first, redirect others to it
  files=$(grep "^$h " "$tmp/hashes.txt" | awk '{print $2}' | sort)
  keep=$(echo "$files" | head -1)
  rest=$(echo "$files" | tail -n +2)
  while read -r dup; do
    [ -z "$dup" ] && continue
    sz=$(stat -f %z "$dup")
    freed=$((freed + sz))
    rm "$dup"
    # Rewrite every /assets/<dup> reference in chapter md files to /assets/<keep>
    # Use a portable in-place sed (no -i '' macOS quirks via temp file).
    for md in "$CHAPTERS"/*.md; do
      if grep -q "/assets/$dup" "$md"; then
        sed "s|/assets/$dup|/assets/$keep|g" "$md" > "$md.tmp" && mv "$md.tmp" "$md"
      fi
    done
    removed=$((removed + 1))
  done <<< "$rest"
done < "$tmp/dup-hashes.txt"

rm -rf "$tmp"
echo "removed: $removed duplicate files, freed $((freed / 1048576)) MB"
echo "after:  $(du -sm . | awk '{print $1}') MB"
echo "remaining files: $(ls | wc -l | tr -d ' ')"
