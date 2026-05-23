#!/usr/bin/env bash
# Force-ingest every chapter listed in chapter-manifest.mjs.
# Equivalent to `pnpm ingest:all` from apps/web/.
# Use ingest-sync.mjs (no --all) for the incremental, hash-aware version.
set -euo pipefail
cd "$(dirname "$0")/.."
exec node scripts/ingest-sync.mjs --all "$@"
