# Give Meaning to Maths — Website Design Spec

_Date: 2026-05-18_
_Status: approved (user said "go for it"); end-to-end implementation authorised_

## 1. Purpose

Publish a book — _Give Meaning to Maths_ by "P. B." (Peter Bruce, "PeeBee"), a
maths teacher of 30+ years — as a free, readable, machine-indexable website. The
full text must be readable on the site (not offered as a bulk download). The
visual language is a deliberately plain "typed Google-Doc / Word document":
white paper, black ink, text composed inside **bordered table grids**.

Source design: a Claude Design handoff bundle (HTML/CSS/JS prototype). It is a
**reference for intent, not a contract**. We recreate the *concept* (paper +
black rules + text-in-cells + hover-inverts + System/Light/Dark), not the exact
pixels. Maintainability of the resulting code is the top priority.

## 2. Goals / Non-goals

**Goals**
- 3-page browsable site: landing (`/`), chapter reader (`/read/<slug>`),
  about (`/about`).
- Book text served as **static HTML rendered from per-chapter Markdown** —
  LLM- and search-indexable. No 67 MB PDF asset shipped; no download link.
- Machine-readability surface: `/llms.txt`, `sitemap.xml`, `robots.txt`, and
  stable Markdown chapter URLs.
- System/Light/Dark theme, defaulting to system, no flash on load.
- Fresh minimal Turborepo + pnpm monorepo mirroring `lazy-surf-report`
  conventions, with **none** of its bloat (no Supabase, auth, billing,
  analytics, maps).
- Deployable as a static site to the user's Vercel Pro team at ~$0 runtime.
- Code easy to maintain: the "doc table" aesthetic lives in a small component
  kit + a ~15-line token block, not scattered utility classes or an 830-line
  stylesheet.

**Non-goals (YAGNI)**
- Forum (future; would be a new route backed by Upstash Redis — out of scope).
- Contact page (deleted in the design iteration).
- Authentication, Supabase, any database, analytics.
- Real DRM / download prevention (we only discourage casual saving).
- Pixel-perfect fidelity to the prototype (drift is acceptable).
- Real book content (placeholder until the user supplies the PDF).

## 3. Architecture

```
give-meaning-to-maths/
  package.json                 # root, pnpm workspaces + turbo scripts
  pnpm-workspace.yaml          # apps/*, packages/*
  turbo.json                   # build / lint / dev / test pipelines
  .nvmrc / engines             # Node >=18
  apps/
    web/
      package.json             # @repo/web
      next.config.mjs
      tailwind.config.ts
      postcss.config.mjs
      tsconfig.json            # extends @repo/typescript-config
      .eslintrc / eslint.config # uses @repo/eslint-config
      app/
        layout.tsx             # <html data-theme>, fonts, ThemeProvider, header/footer
        globals.css            # @tailwind + ~15-line token block (light/dark)
        page.tsx               # "/"            landing
        read/page.tsx          # "/read"        renders the first chapter (static alias)
        read/[slug]/page.tsx   # "/read/<slug>" chapter reader (SSG)
        about/page.tsx         # "/about"
        llms.txt/route.ts      # generated from book.ts
        sitemap.ts             # all pages + chapter URLs
        robots.ts
        not-found.tsx
      components/
        doc-table.tsx          # <DocTable> <DocRow> <DocCell> (bordered grid)
        cell-link.tsx          # <CellLink> button-as-a-cell
        placeholder.tsx        # <Placeholder> dashed-tag + italic muted block
        site-header.tsx        # brand + nav + <ThemeToggle>
        site-footer.tsx
        theme-toggle.tsx       # System -> Light -> Dark cell button (client)
        theme-provider.tsx     # next-themes wrapper (client)
        chapter-toc.tsx        # sticky TOC + ArrowLeft/Right nav (client)
      content/
        book.ts                # typed metadata + ordered chapter list
        chapters/<slug>.md     # 11 files, frontmatter + body (placeholder now)
        markdown.ts            # build-time loader: read file, parse, render HTML
      lib/
        cn.ts                  # clsx/tailwind-merge helper
      public/
        assets/peebee-portrait.jpg
      test/
        book.test.ts           # data + markdown integrity (Vitest)
      e2e/
        smoke.spec.ts          # Playwright: pages render, TOC nav, theme cycle
  packages/
    typescript-config/         # base tsconfig preset
    eslint-config/             # shared eslint preset
  docs/superpowers/specs/      # this spec
```

**Rendering model:** everything is static. `read/[slug]` uses
`generateStaticParams()` over `book.chapters`, reads the matching Markdown file
at build time, and renders it to HTML server-side. The only client components
are `theme-provider`, `theme-toggle`, and `chapter-toc` (keyboard nav). No data
fetching, no runtime backend.

**Data flow:** `content/book.ts` is the single source of truth — `title`,
`author`, `authorFull`, `year`, `pages`, `edition`, and an ordered
`chapters[]` (`slug`, `number`, `title`, `blurb`, `pages`, `readingTime`). The
reader, TOC, prev/next links, sitemap, and `llms.txt` all derive from it.
Chapter bodies are Markdown files keyed by `slug`.

## 4. Styling system

- **Tokens (one source of truth).** `globals.css` defines CSS custom
  properties under `:root`, `:root[data-theme="dark"]`, and
  `@media (prefers-color-scheme: dark)` (so "system" works with no JS):
  `--paper`, `--paper-2`, `--ink`, `--ink-2`, `--ink-3`, `--rule`, `--hover`,
  `--field`. Values taken from the prototype's palette
  (light: `#fff` / `#000`; dark: `#0c0c0d` / `#f1efe9`).
- **Tailwind mapping.** `tailwind.config.ts` exposes them as semantic colors:
  `paper`, `paper2`, `ink`, `ink2`, `ink3`, `rule`, `hover`, `field`. Pages use
  utilities like `bg-paper text-ink border-rule`. Dark mode is automatic via
  the variables — no `dark:` variants needed, `next-themes` only flips
  `data-theme`.
- **Component kit (the maintainability win).** The bordered-table aesthetic is
  encapsulated, not repeated:
  - `<DocTable>` / `<DocRow>` / `<DocCell>` — collapsed-border grid, trims
    outer edge borders, supports `variant="header" | "invert" | "tight"` and
    `colSpan`.
  - `<CellLink href>` — full-cell link/button, inverts ink/paper on hover.
  - `<Placeholder tag>` — dashed-outline mono tag + italic muted body, marking
    "to be filled in" content.
  - `<SiteHeader>` (brand + nav + theme toggle), `<SiteFooter>` (grid +
    colophon + machine links).
- **Type.** `next/font/google` self-hosts **EB Garamond** (serif body/headings)
  and **Courier Prime** (mono labels/nav/meta). Exposed as
  `font-serif` / `font-mono` via the Tailwind theme. No CDN `<link>`.
- **Interaction grammar:** hover anywhere meaningful inverts to
  ink-background / paper-text; nav/labels are uppercase mono with wide
  letter-spacing; book images get `pointer-events:none` + `user-drag:none`
  (casual-save deterrent only).
- Pixel drift from the prototype is acceptable as long as the "Google-Doc
  table of text" concept holds.

## 5. Theming

`next-themes` with `attribute="data-theme"`, `defaultTheme="system"`,
`enableSystem`, `disableTransitionOnChange`. `<html suppressHydrationWarning>`.
The toggle is a header cell that cycles **System → Light → Dark**, label and a
small glyph reflecting current mode, persisted by the library. No-FOUC handled
by `next-themes`' injected script.

## 6. Content / Markdown pipeline

- `content/chapters/<slug>.md`: YAML frontmatter (`title`, `number`, `slug`)
  + Markdown body.
- `content/markdown.ts`: `gray-matter` (frontmatter) →
  `remark-parse` → `remark-math` → `remark-gfm` → `remark-rehype` →
  `rehype-katex` → `rehype-stringify`. Returns sanitized HTML string, rendered
  via `dangerouslySetInnerHTML` inside a `prose`-like scoped wrapper styled to
  the doc aesthetic. KaTeX CSS imported once in `layout.tsx`.
- **Math is on by default** (book is about mathematics). Reversible: drop
  `remark-math`/`rehype-katex` if the real text is prose-only.
- **Placeholder seeding (now):** all 11 chapters from `book.ts` get a Markdown
  file. The 3 with clean prototype Markdown (`preface`,
  `what-is-maths-for`, `the-trouble-with-numbers`) use that text; the
  remaining 8 are converted from the prototype's `chapter-content.js`
  placeholder HTML into Markdown. Each file carries a visible
  `> _Placeholder — replace with converted book text._` banner.
- **Real content (later, separate task):** user supplies the 67 MB PDF; we
  convert chapter-by-chapter to Markdown and replace files one-for-one. No code
  changes needed — purely a content swap. No PDF is ever shipped to the client.

Chapter slugs (from `book.ts`): `preface`, `what-is-maths-for`,
`the-trouble-with-numbers`, `shapes-that-think`, `patterns-and-proof`,
`the-classroom-as-workshop`, `the-grammar-of-algebra`,
`calculus-without-tears`, `problems-worth-doing`, `afterword`,
`notes-and-sources`.

## 7. Pages

- **`/` landing:** header; hero `DocTable` (eyebrow, `Give Meaning to Maths`
  title, placeholder blurb, framed portrait cell, full-width "Begin reading →"
  `CellLink` to `/read/preface`); "An overview" `DocTable` (placeholder prose +
  stats mini-table with em-dashes); "Voices" 3-column table (For readers / For
  teachers / For former pupils, placeholder entries); footer.
- **`/read`:** statically renders the first chapter (preface) — same
  component as `/read/[slug]` with `slug="preface"`, no runtime redirect.
- **`/read/<slug>`:** two-column reader — sticky `<ChapterTOC>` (numbered list
  from `book.ts`, current highlighted, ←/→ keyboard nav) + article (chapter
  meta line, rendered Markdown, prev/next pager). 404 for unknown slug.
- **`/about`:** page-strip header, bio `DocTable` with portrait + meta,
  "A note on the teaching" cell — all `<Placeholder>` content.
- **Machine:** `/llms.txt` (route handler generated from `book.ts`, marked
  `export const dynamic = "force-static"` so it is prerendered at build, not
  served at runtime), `sitemap.ts` (all routes + chapters), `robots.ts`
  (allow all, point to sitemap). Markdown chapter sources referenced from
  `llms.txt`.

## 8. Testing (proportional to a static content site)

- **Vitest** `test/book.test.ts`: every `book.ts` slug has a Markdown file;
  frontmatter parses; slugs unique; ordered; markdown renderer returns
  non-empty HTML for each chapter.
- **Playwright** `e2e/smoke.spec.ts`: `/`, `/read/preface`, `/about` render
  with expected landmark text; `/read` redirects; TOC link + ArrowRight move
  chapters; theme toggle cycles System→Light→Dark and sets `data-theme`.
- Wired into Turbo `test` / `lint`; runnable via root `pnpm test` / `pnpm lint`.

## 9. Hosting & cost

Static Next.js on the user's **Vercel Pro team**. No server runtime, no DB →
effectively $0 marginal cost. Fonts self-hosted (no third-party calls). No
environment variables required to build or run (unlike the template, which
hard-fails without `NEXT_PUBLIC_SUPABASE_URL` — that gate is removed).

## 10. Future (not built now)

- **Forum:** ex-pupils / readers posting reviews and memories. When built: a
  new route group, persistence via **Upstash Redis** (serverless, free tier),
  no auth or a lightweight display-name identity. Explicitly deferred.

## 11. Risks / assumptions

- Math rendering assumed needed; reversible.
- Prototype placeholder text is filler — real bio, quotes, blurb, publication
  facts come from the user later; all such spots are visibly tagged
  `Placeholder`.
- `pointer-events:none` is a deterrent, not protection — stated, accepted.
- Real chapter content depends on the user delivering the PDF; site is fully
  functional with placeholders until then.
- Next 16 / React 19 / Tailwind 3 versions mirror the known-good
  `lazy-surf-report` template to avoid bleeding-edge surprises.

## 12. Build sequence

1. Monorepo skeleton: root `package.json`, `pnpm-workspace.yaml`, `turbo.json`,
   `packages/typescript-config`, `packages/eslint-config`.
2. `apps/web` Next.js app: config, Tailwind + token block, fonts, layout,
   `theme-provider`.
3. Component kit: `DocTable`/`DocRow`/`DocCell`, `CellLink`, `Placeholder`,
   `SiteHeader`/`SiteFooter`, `ThemeToggle`.
4. `content/book.ts` + `content/markdown.ts` + 11 seeded chapter `.md` files
   + portrait asset.
5. Pages: `/`, `/about`, `/read`, `/read/[slug]`, `not-found`.
6. Machine surface: `llms.txt`, `sitemap.ts`, `robots.ts`.
7. Tests: Vitest + Playwright; pass `pnpm lint` + `pnpm test` + `pnpm build`.
8. Run local dev server; validate end-to-end with Claude-in-Chrome
   (all pages, theme cycle, TOC keyboard nav, responsive).
9. Commit.
