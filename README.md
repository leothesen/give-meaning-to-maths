# Give Meaning to Maths

Static website for the book *Give Meaning to Maths* by P. B.
Turborepo + pnpm monorepo. One Next.js app (`apps/web`), fully static.

## Develop

    pnpm install
    pnpm dev          # http://localhost:3210

## Check

    pnpm lint
    pnpm test         # vitest
    pnpm test:e2e     # playwright
    pnpm build

## Content

Chapter text lives in `apps/web/content/chapters/<slug>.md` (currently
placeholder). Replace each file with the converted book text — no code
change needed. Chapter list/metadata is in `apps/web/content/book.ts`.

The site intentionally ships no downloadable PDF; the per-chapter
Markdown is the canonical, machine-indexable source (see `/llms.txt`).
