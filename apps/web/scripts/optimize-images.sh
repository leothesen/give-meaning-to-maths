#!/usr/bin/env bash
# Downscale + recompress raster images in apps/web/public/assets using macOS sips.
# - JPEG/JPG: resize to max 1400px longest side, recompress to quality 78.
# - PNG:      resize to max 1400px longest side (sips can't change PNG quality,
#             but the resize alone is the dominant size win).
# - GIF/EMF:  left untouched (sips can't handle).
set -euo pipefail
DIR="$HOME/Development/Personal/give-meaning-to-maths/apps/web/public/assets"
cd "$DIR"
before=$(du -sm . | awk '{print $1}')
echo "before: ${before} MB"

# Use a temp file per op so a sips failure can't leave a half-written file.
# macOS default bash is 3.2 — avoid bash-4 features like ${var,,}.
proc() {
  local f="$1"
  local ext_lower
  ext_lower=$(echo "${f##*.}" | tr 'A-Z' 'a-z')
  local tmp=".sipstmp.$$.$RANDOM.$ext_lower"
  cp "$f" "$tmp"
  case "$ext_lower" in
    jpg|jpeg) sips -Z 1400 -s formatOptions 78 "$tmp" >/dev/null 2>&1 ;;
    png)      sips -Z 1400 "$tmp" >/dev/null 2>&1 ;;
    *)        rm -f "$tmp"; return 0 ;;
  esac
  mv "$tmp" "$f"
}

export -f proc
find . -maxdepth 1 -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) \
  -print0 | xargs -0 -n1 -P8 bash -c 'proc "$0"'

after=$(du -sm . | awk '{print $1}')
echo "after:  ${after} MB  (raster savings ≈ $((before - after)) MB)"
