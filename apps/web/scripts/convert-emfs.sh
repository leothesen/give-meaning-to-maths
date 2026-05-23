#!/usr/bin/env bash
# Convert every .emf in public/assets to .png via headless LibreOffice, resize
# the resulting PNG with sips, delete the .emf, and rewrite every reference in
# the chapter markdown from `<file>.emf` to `<file>.png`.
set -euo pipefail
WEB="$HOME/Development/Personal/give-meaning-to-maths/apps/web"
ASSETS="$WEB/public/assets"
CHAPTERS="$WEB/content/chapters"
SOFFICE="/Applications/LibreOffice.app/Contents/MacOS/soffice"
MAX_DIM=1400

[ -x "$SOFFICE" ] || { echo "LibreOffice soffice not found at $SOFFICE"; exit 1; }

cd "$ASSETS"
shopt -s nullglob
EMFS=( *.emf )
shopt -u nullglob
total=${#EMFS[@]}
echo "EMFs to convert: $total"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# Convert each EMF individually so one bad file doesn't blow the batch.
# Use a hidden user profile so concurrent runs don't lock each other out.
ok=0
fail=0
for f in "${EMFS[@]}"; do
  base="${f%.emf}"
  if "$SOFFICE" --headless \
        -env:UserInstallation="file://$TMP/profile" \
        --convert-to png --outdir "$TMP" "$f" >/dev/null 2>&1 \
     && [ -f "$TMP/$base.png" ]; then
    # Resize the output PNG to max MAX_DIM before placing in assets/
    sips -Z "$MAX_DIM" "$TMP/$base.png" >/dev/null 2>&1 || true
    mv "$TMP/$base.png" "$ASSETS/$base.png"
    rm -f "$f"
    # rewrite every reference in every chapter md
    for md in "$CHAPTERS"/*.md; do
      if grep -q "/assets/$f" "$md" 2>/dev/null; then
        sed "s|/assets/$f|/assets/$base.png|g" "$md" > "$md.tmp" && mv "$md.tmp" "$md"
      fi
    done
    ok=$((ok+1))
  else
    fail=$((fail+1))
    echo "  FAIL: $f"
  fi
  # Progress every 10
  if (( (ok + fail) % 10 == 0 )); then
    echo "  ... $((ok + fail))/$total (ok=$ok fail=$fail)"
  fi
done

echo "done: ok=$ok fail=$fail"
echo "remaining .emf files: $(ls *.emf 2>/dev/null | wc -l | tr -d ' ')"
echo "assets size now: $(du -sh . | awk '{print $1}')"
