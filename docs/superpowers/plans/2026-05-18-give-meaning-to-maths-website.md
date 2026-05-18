# Give Meaning to Maths Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, machine-indexable website for the book *Give Meaning to Maths* with a "Google-Doc bordered table" aesthetic, as a fresh minimal Turborepo monorepo.

**Architecture:** Turborepo + pnpm workspace, one Next.js 16 App-Router app (`apps/web`), all pages statically rendered (SSG). Book text comes from per-chapter Markdown files rendered to HTML at build time. The table aesthetic is a tiny reusable component kit driven by CSS-variable color tokens that `next-themes` flips for System/Light/Dark.

**Tech Stack:** Next.js 16.2.3, React 19.2, TypeScript 5.5, Tailwind 3.4, next-themes, remark/rehype + KaTeX, Vitest, Playwright, Turbo, pnpm 8.

**Working directory:** the active git worktree (`.claude/worktrees/give-meaning-to-maths-impl`, branch `worktree-give-meaning-to-maths-impl`), which holds the initial spec commit. All paths below are relative to that worktree root unless absolute.

**Design bundle (source of placeholder text + portrait asset), available during this job:** `/Users/leothesen/.claude/jobs/2603a000/design/pb-website/project`

---

## File Structure

```
package.json                         root workspace + turbo scripts
pnpm-workspace.yaml
turbo.json
.gitignore
.nvmrc
packages/typescript-config/           shared tsconfig presets
  package.json
  base.json
  nextjs.json
packages/eslint-config/               shared eslint preset
  package.json
  index.mjs
apps/web/
  package.json                        @repo/web
  next.config.mjs
  tsconfig.json
  tailwind.config.ts
  postcss.config.mjs
  eslint.config.mjs
  vitest.config.ts
  playwright.config.ts
  app/
    globals.css                       tailwind + color-token block
    layout.tsx                        html/body, fonts, ThemeProvider, header/footer
    page.tsx                          "/" landing
    about/page.tsx                    "/about"
    read/page.tsx                     "/read" (renders preface)
    read/[slug]/page.tsx              "/read/<slug>" reader (SSG)
    not-found.tsx
    llms.txt/route.ts                 force-static llms.txt
    sitemap.ts
    robots.ts
  components/
    doc-table.tsx                     DocTable / DocRow / DocCell
    cell-link.tsx                     CellLink
    placeholder.tsx                   Placeholder
    site-header.tsx
    site-footer.tsx
    theme-provider.tsx                next-themes wrapper (client)
    theme-toggle.tsx                  System->Light->Dark (client)
    chapter-toc.tsx                   sticky TOC + keyboard nav (client)
  content/
    book.ts                           single source of truth
    markdown.ts                       build-time md -> html
    chapters/<slug>.md                11 seeded files
  lib/cn.ts                           clsx + tailwind-merge
  public/assets/peebee-portrait.jpg
  scripts/seed-chapters.mjs           one-off seeding helper
  test/book.test.ts                   Vitest
  e2e/smoke.spec.ts                   Playwright
```

---

## Task 1: Monorepo skeleton + shared config packages

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`, `.nvmrc`
- Create: `packages/typescript-config/{package.json,base.json,nextjs.json}`
- Create: `packages/eslint-config/{package.json,index.mjs}`

- [ ] **Step 1: Create `.gitignore`**

```
node_modules
.next
.turbo
out
dist
coverage
playwright-report
test-results
*.log
.DS_Store
.env*
!.env.example
```

- [ ] **Step 2: Create `.nvmrc`**

```
20
```

- [ ] **Step 3: Create root `package.json`**

```json
{
  "name": "give-meaning-to-maths",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "pnpm -F @repo/web test:run",
    "test:e2e": "pnpm -F @repo/web test:e2e",
    "format": "prettier --write \"**/*.{ts,tsx,md,css,json}\""
  },
  "devDependencies": {
    "prettier": "3.3.3",
    "turbo": "^2.8.20",
    "typescript": "5.5.4"
  },
  "packageManager": "pnpm@8.15.6",
  "engines": { "node": ">=18" }
}
```

- [ ] **Step 4: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 5: Create `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "stream",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": { "dependsOn": ["^lint"] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

- [ ] **Step 6: Create `packages/typescript-config/package.json`**

```json
{
  "name": "@repo/typescript-config",
  "version": "0.0.0",
  "private": true,
  "files": ["base.json", "nextjs.json"]
}
```

- [ ] **Step 7: Create `packages/typescript-config/base.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true,
    "noUncheckedIndexedAccess": true,
    "incremental": true
  },
  "exclude": ["node_modules"]
}
```

- [ ] **Step 8: Create `packages/typescript-config/nextjs.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "allowJs": true,
    "jsx": "preserve",
    "noEmit": true
  }
}
```

- [ ] **Step 9: Create `packages/eslint-config/package.json`**

```json
{
  "name": "@repo/eslint-config",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "index.mjs",
  "dependencies": {
    "eslint-config-next": "16.2.3"
  }
}
```

- [ ] **Step 10: Create `packages/eslint-config/index.mjs`**

```js
import next from "eslint-config-next";

/** Shared flat ESLint config for the monorepo. */
export default [
  ...next(),
  { ignores: [".next/**", "out/**", "node_modules/**", "playwright-report/**"] },
];
```

- [ ] **Step 11: Commit**

```bash
git add .gitignore .nvmrc package.json pnpm-workspace.yaml turbo.json packages
git commit -m "chore: monorepo skeleton + shared ts/eslint config"
```

---

## Task 2: `apps/web` Next.js app scaffold (config, tokens, fonts, layout)

**Files:**
- Create: `apps/web/package.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`
- Create: `apps/web/lib/cn.ts`
- Create: `apps/web/app/globals.css`
- Create: `apps/web/components/theme-provider.tsx`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/page.tsx` (temporary placeholder, replaced in Task 5)

- [ ] **Step 1: Create `apps/web/package.json`**

```json
{
  "name": "@repo/web",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo --port 3210",
    "build": "next build",
    "start": "next start --port 3210",
    "lint": "next lint",
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "gray-matter": "^4.0.3",
    "katex": "^0.16.11",
    "next": "16.2.3",
    "next-themes": "^0.3.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "rehype-katex": "^7.0.1",
    "rehype-stringify": "^10.0.1",
    "remark-gfm": "^4.0.0",
    "remark-math": "^6.0.0",
    "remark-parse": "^11.0.0",
    "remark-rehype": "^11.1.1",
    "tailwind-merge": "^2.6.0",
    "unified": "^11.0.5"
  },
  "devDependencies": {
    "@playwright/test": "^1.57.0",
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/node": "20.14.0",
    "@types/react": "19.2.7",
    "@types/react-dom": "19.2.3",
    "autoprefixer": "10.4.19",
    "eslint": "^9.39.1",
    "postcss": "8.4.38",
    "tailwindcss": "3.4.13",
    "typescript": "5.5.4",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 2: Create `apps/web/next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
```

- [ ] **Step 3: Create `apps/web/tsconfig.json`**

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create `apps/web/postcss.config.mjs`**

```js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

- [ ] **Step 5: Create `apps/web/tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        paper2: "var(--paper-2)",
        ink: "var(--ink)",
        ink2: "var(--ink-2)",
        ink3: "var(--ink-3)",
        rule: "var(--rule)",
        hover: "var(--hover)",
        field: "var(--field)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Create `apps/web/eslint.config.mjs`**

```js
import config from "@repo/eslint-config";

export default config;
```

- [ ] **Step 7: Create `apps/web/lib/cn.ts`**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 8: Create `apps/web/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ---- Color tokens: the single source of truth for light/dark ---- */
:root {
  --paper: #ffffff;
  --paper-2: #fafafa;
  --ink: #000000;
  --ink-2: #222222;
  --ink-3: #555555;
  --rule: #000000;
  --hover: #f3f3f3;
  --field: #f8f8f8;
}
:root[data-theme="dark"] {
  --paper: #0c0c0d;
  --paper-2: #131314;
  --ink: #f1efe9;
  --ink-2: #d8d4c9;
  --ink-3: #9a958a;
  --rule: #f1efe9;
  --hover: #1a1a1c;
  --field: #1a1a1c;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --paper: #0c0c0d;
    --paper-2: #131314;
    --ink: #f1efe9;
    --ink-2: #d8d4c9;
    --ink-3: #9a958a;
    --rule: #f1efe9;
    --hover: #1a1a1c;
    --field: #1a1a1c;
  }
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: linear-gradient(to bottom, var(--paper), var(--paper-2));
  background-attachment: fixed;
  color: var(--ink);
  font-family: var(--font-serif), Georgia, serif;
  font-size: 18px;
  line-height: 1.5;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
/* Discourage trivial image saving (deterrent only, not protection) */
img.book-img { user-select: none; -webkit-user-drag: none; pointer-events: none; }

/* Rendered-markdown chapter typography */
.chapter-prose p { font-size: 19px; line-height: 1.62; margin: 0 0 1em; }
.chapter-prose p + p { text-indent: 1.4em; }
.chapter-prose h2, .chapter-prose h3 {
  font-family: var(--font-mono), ui-monospace, monospace;
  font-size: 13px; letter-spacing: .18em; text-transform: uppercase;
  border-top: 1px solid var(--rule); padding-top: 18px; margin: 28px 0 8px;
}
.chapter-prose blockquote {
  border-left: 3px solid var(--rule); padding-left: 22px;
  margin: 22px 0; font-style: italic;
}
.chapter-prose em { font-style: italic; }
.chapter-prose strong { font-weight: 600; }
.chapter-prose code {
  font-family: var(--font-mono), ui-monospace, monospace; font-size: .9em;
}
.katex-display { overflow-x: auto; overflow-y: hidden; }
```

- [ ] **Step 9: Create `apps/web/components/theme-provider.tsx`**

```tsx
"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}
```

- [ ] **Step 10: Create `apps/web/app/layout.tsx`** (header/footer imports added in Task 5; minimal now)

```tsx
import type { Metadata } from "next";
import { EB_Garamond, Courier_Prime } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import "katex/dist/katex.min.css";

const serif = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});
const mono = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Give Meaning to Maths — by P. B.",
  description:
    "An essay collection on the meaning of mathematics, by a teacher of more than thirty years.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${serif.variable} ${mono.variable}`}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 11: Create temporary `apps/web/app/page.tsx`** (replaced in Task 5)

```tsx
export default function Home() {
  return <main>scaffold ok</main>;
}
```

- [ ] **Step 12: Install deps and verify the app builds**

Run:
```bash
cd /Users/leothesen/Development/Personal/give-meaning-to-maths/.claude/worktrees/give-meaning-to-maths-impl
pnpm install
pnpm -F @repo/web build
```
Expected: pnpm resolves workspace deps; `next build` completes with a route for `/`. If `next/font` requires network and is unavailable, it still builds (fonts fall back); note any warning but PASS on a successful build.

- [ ] **Step 13: Commit**

```bash
git add apps/web pnpm-lock.yaml
git commit -m "chore(web): next app scaffold, color tokens, fonts, theme provider"
```

---

## Task 3: Component kit (DocTable / CellLink / Placeholder / chrome / toggle)

**Files:**
- Create: `apps/web/components/doc-table.tsx`
- Create: `apps/web/components/cell-link.tsx`
- Create: `apps/web/components/placeholder.tsx`
- Create: `apps/web/components/theme-toggle.tsx`
- Create: `apps/web/components/site-header.tsx`
- Create: `apps/web/components/site-footer.tsx`

No unit tests here — these are pure presentation; they are exercised by the Playwright smoke test in Task 7 (per spec testing scope).

- [ ] **Step 1: Create `apps/web/components/doc-table.tsx`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Bordered "Google-Doc" grid. Outer edge borders are trimmed by the
 *  container border so cells read as an inset grid. */
export function DocTable({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <table
      className={cn(
        "w-full border-collapse border-y border-rule bg-paper",
        className,
      )}
    >
      <tbody>{children}</tbody>
    </table>
  );
}

export function DocRow({ children }: { children: ReactNode }) {
  return <tr>{children}</tr>;
}

type CellVariant = "default" | "header" | "invert" | "tight";

const cellBase =
  "border border-rule align-top text-left p-[18px_22px] [&:first-child]:border-l-0 [&:last-child]:border-r-0";

const cellVariants: Record<CellVariant, string> = {
  default: "bg-paper text-ink",
  header:
    "bg-ink text-paper font-mono text-[11px] font-semibold tracking-[.18em] uppercase p-[10px_22px]",
  invert: "bg-ink text-paper",
  tight: "bg-paper text-ink p-[12px_22px]",
};

export function DocCell({
  children,
  variant = "default",
  colSpan,
  className,
  style,
}: {
  children: ReactNode;
  variant?: CellVariant;
  colSpan?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Tag = variant === "header" ? "th" : "td";
  return (
    <Tag
      colSpan={colSpan}
      style={style}
      className={cn(cellBase, cellVariants[variant], className)}
    >
      {children}
    </Tag>
  );
}
```

- [ ] **Step 2: Create `apps/web/components/cell-link.tsx`**

```tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** A full-cell link/button. Inverts ink/paper on hover. */
export function CellLink({
  href,
  children,
  invert = false,
  className,
}: {
  href: string;
  children: ReactNode;
  invert?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block w-full p-[22px] text-center no-underline font-mono text-[11px] font-semibold tracking-[.18em] uppercase transition-colors",
        invert
          ? "bg-ink text-paper hover:bg-paper hover:text-ink"
          : "bg-paper text-ink hover:bg-ink hover:text-paper",
        className,
      )}
    >
      {children}
    </Link>
  );
}
```

- [ ] **Step 3: Create `apps/web/components/placeholder.tsx`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Marks "to be filled in" content: a dashed mono tag + italic muted body. */
export function Placeholder({
  tag = "Placeholder",
  children,
  className,
}: {
  tag?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="mb-[10px] inline-block border border-dashed border-ink3 px-2 py-[2px] font-mono text-[10.5px] tracking-[.18em] uppercase text-ink3">
        {tag}
      </span>
      <div className={cn("font-serif italic text-ink3")}>{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Create `apps/web/components/theme-toggle.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const ORDER = ["system", "light", "dark"] as const;
const LABEL: Record<string, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = mounted ? (theme ?? "system") : "system";

  function cycle() {
    const i = ORDER.indexOf(current as (typeof ORDER)[number]);
    setTheme(ORDER[(i + 1) % ORDER.length]);
  }

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label="Toggle colour theme"
      className="flex min-w-[96px] items-center justify-center gap-2 border-l border-rule bg-paper px-[18px] font-mono text-[11.5px] tracking-[.14em] uppercase text-ink transition-colors hover:bg-ink hover:text-paper"
    >
      <span
        aria-hidden
        className="inline-block h-3 w-3 rounded-full bg-ink shadow-[inset_-3px_-3px_0_0_var(--paper)]"
      />
      <span suppressHydrationWarning>{LABEL[current]}</span>
    </button>
  );
}
```

- [ ] **Step 5: Create `apps/web/components/site-header.tsx`**

```tsx
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/read", label: "Read" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b-2 border-rule bg-paper">
      <div className="mx-auto grid max-w-[1080px] grid-cols-[1fr_auto] items-stretch border-x border-rule">
        <Link
          href="/"
          className="flex flex-col gap-[2px] border-r border-rule px-[22px] py-[13px] no-underline text-ink"
        >
          <span className="font-serif text-[22px] font-semibold leading-[1.05]">
            Give Meaning to <em className="font-medium italic">Maths</em>
          </span>
          <span className="font-mono text-[10.5px] tracking-[.18em] uppercase text-ink3">
            A book by P. B. · 2025
          </span>
        </Link>
        <nav className="flex font-mono text-[11.5px] tracking-[.14em] uppercase">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center border-l border-rule px-[18px] no-underline text-ink transition-colors first:border-l-0 hover:bg-ink hover:text-paper"
            >
              {n.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 6: Create `apps/web/components/site-footer.tsx`**

```tsx
import Link from "next/link";
import { BOOK } from "@/content/book";

export function SiteFooter() {
  return (
    <footer className="mt-0 border-t-2 border-rule bg-paper">
      <div className="mx-auto max-w-[1080px] border-x border-rule">
        <div className="grid grid-cols-2 border-b border-rule max-[900px]:grid-cols-1">
          <div className="border-r border-rule p-[18px_22px] text-[14px] max-[900px]:border-b max-[900px]:border-r-0">
            <h4 className="mb-[10px] font-mono text-[11px] font-semibold tracking-[.18em] uppercase">
              The book
            </h4>
            <ul className="m-0 list-none p-0">
              <li className="py-[3px]">
                <Link href="/read" className="text-ink2 no-underline hover:bg-ink hover:text-paper">
                  Read
                </Link>
              </li>
              <li className="py-[3px]">
                <Link href="/about" className="text-ink2 no-underline hover:bg-ink hover:text-paper">
                  About the author
                </Link>
              </li>
            </ul>
          </div>
          <div className="p-[18px_22px] text-[14px]">
            <h4 className="mb-[10px] font-mono text-[11px] font-semibold tracking-[.18em] uppercase">
              For machines
            </h4>
            <ul className="m-0 list-none p-0">
              <li className="py-[3px]">
                <a href="/llms.txt" className="text-ink2 no-underline hover:bg-ink hover:text-paper">
                  llms.txt
                </a>
              </li>
              <li className="py-[3px]">
                <a href="/sitemap.xml" className="text-ink2 no-underline hover:bg-ink hover:text-paper">
                  Sitemap
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="p-[10px_22px] font-mono text-[10.5px] tracking-[.14em] uppercase text-ink3">
          © {BOOK.year} {BOOK.author} · {BOOK.edition}
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 7: Commit** (will not typecheck until Task 4 adds `content/book.ts`; commit anyway as a checkpoint, typecheck happens in Task 8)

```bash
git add apps/web/components
git commit -m "feat(web): doc-table component kit, header/footer, theme toggle"
```

---

## Task 4: Content layer — book data, markdown pipeline, seeded chapters (TDD)

**Files:**
- Create: `apps/web/content/book.ts`
- Create: `apps/web/content/markdown.ts`
- Create: `apps/web/scripts/seed-chapters.mjs`
- Create: `apps/web/content/chapters/<slug>.md` (11 files, via script)
- Create: `apps/web/public/assets/peebee-portrait.jpg` (copied from bundle)
- Create: `apps/web/vitest.config.ts`
- Test: `apps/web/test/book.test.ts`

- [ ] **Step 1: Create `apps/web/content/book.ts`**

```ts
export type Chapter = {
  slug: string;
  number: string;
  title: string;
  blurb: string;
  pages: string;
  readingTime: string;
};

export const BOOK = {
  title: "Give Meaning to Maths",
  author: "P. B.",
  authorFull: "Peter Bruce — known to a generation of pupils as “PeeBee”",
  subtitle: "Essays, problems, and a teacher's case for the beauty of numbers",
  year: 2025,
  pages: 224,
  edition: "First edition",
  chapters: [
    { slug: "preface", number: "00", title: "Preface", blurb: "Why this book exists, and who it is for.", pages: "iii–viii", readingTime: "6 min" },
    { slug: "what-is-maths-for", number: "01", title: "What is mathematics for?", blurb: "Beyond the exam paper: a working answer for sceptical teenagers.", pages: "1–18", readingTime: "22 min" },
    { slug: "the-trouble-with-numbers", number: "02", title: "The trouble with numbers", blurb: "How abstraction trips us up — and how to make it click.", pages: "19–38", readingTime: "25 min" },
    { slug: "shapes-that-think", number: "03", title: "Shapes that think", blurb: "Geometry as the original visual language.", pages: "39–62", readingTime: "30 min" },
    { slug: "patterns-and-proof", number: "04", title: "Patterns and proof", blurb: "From a hunch to a watertight argument.", pages: "63–88", readingTime: "32 min" },
    { slug: "the-classroom-as-workshop", number: "05", title: "The classroom as workshop", blurb: "Notes for teachers — thirty-odd years' worth.", pages: "89–112", readingTime: "28 min" },
    { slug: "the-grammar-of-algebra", number: "06", title: "The grammar of algebra", blurb: "Why x is not a mystery.", pages: "113–138", readingTime: "34 min" },
    { slug: "calculus-without-tears", number: "07", title: "Calculus without tears", blurb: "An old teacher's gentlest possible introduction.", pages: "139–168", readingTime: "38 min" },
    { slug: "problems-worth-doing", number: "08", title: "Problems worth doing", blurb: "Forty problems collected over a lifetime.", pages: "169–198", readingTime: "varies" },
    { slug: "afterword", number: "09", title: "Afterword", blurb: "A letter to the next teacher.", pages: "199–208", readingTime: "10 min" },
    { slug: "notes-and-sources", number: "10", title: "Notes & sources", blurb: "Where the ideas came from.", pages: "209–224", readingTime: "8 min" },
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
```

- [ ] **Step 2: Create `apps/web/content/markdown.ts`**

```ts
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";

const CHAPTERS_DIR = path.join(process.cwd(), "content", "chapters");

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype)
  .use(rehypeKatex)
  .use(rehypeStringify);

export async function renderChapter(slug: string): Promise<string> {
  const file = path.join(CHAPTERS_DIR, `${slug}.md`);
  const raw = await fs.readFile(file, "utf8");
  const { content } = matter(raw);
  const html = await processor.process(content);
  return String(html);
}
```

- [ ] **Step 3: Create `apps/web/scripts/seed-chapters.mjs`**

```js
// One-off: seed 11 placeholder chapter markdown files.
// Uses the design bundle's real placeholder prose where available,
// otherwise generates a uniform tagged placeholder from book metadata.
import { promises as fs } from "node:fs";
import path from "node:path";

const BUNDLE = "/Users/leothesen/.claude/jobs/2603a000/design/pb-website/project/chapters";
const OUT = path.join(process.cwd(), "content", "chapters");

const chapters = [
  ["preface", "00", "Preface", "Why this book exists, and who it is for."],
  ["what-is-maths-for", "01", "What is mathematics for?", "Beyond the exam paper: a working answer for sceptical teenagers."],
  ["the-trouble-with-numbers", "02", "The trouble with numbers", "How abstraction trips us up — and how to make it click."],
  ["shapes-that-think", "03", "Shapes that think", "Geometry as the original visual language."],
  ["patterns-and-proof", "04", "Patterns and proof", "From a hunch to a watertight argument."],
  ["the-classroom-as-workshop", "05", "The classroom as workshop", "Notes for teachers — thirty-odd years' worth."],
  ["the-grammar-of-algebra", "06", "The grammar of algebra", "Why x is not a mystery."],
  ["calculus-without-tears", "07", "Calculus without tears", "An old teacher's gentlest possible introduction."],
  ["problems-worth-doing", "08", "Problems worth doing", "Forty problems collected over a lifetime."],
  ["afterword", "09", "Afterword", "A letter to the next teacher."],
  ["notes-and-sources", "10", "Notes & sources", "Where the ideas came from."],
];

await fs.mkdir(OUT, { recursive: true });

for (const [slug, number, title, blurb] of chapters) {
  let body = "";
  try {
    const fromBundle = await fs.readFile(path.join(BUNDLE, `${slug}.md`), "utf8");
    // Strip the bundle's leading "# Title" / byline lines; keep prose.
    body = fromBundle
      .replace(/^#.*$/m, "")
      .replace(/^\*Give Meaning to Maths.*$/m, "")
      .trim();
  } catch {
    body = "";
  }
  if (!body) {
    body = `> _Placeholder — replace with the converted book text for this chapter._

${blurb}

This chapter's text will be filled in from the book PDF. Until then this
page exists so the site is fully browsable and the structure is final.`;
  } else {
    body = `> _Placeholder — sample prose from the design mock-up; replace with the final book text._\n\n${body}`;
  }
  const frontmatter = `---\ntitle: "${title.replace(/"/g, '\\"')}"\nnumber: "${number}"\nslug: "${slug}"\n---\n\n`;
  await fs.writeFile(path.join(OUT, `${slug}.md`), frontmatter + body + "\n", "utf8");
  console.log("wrote", slug);
}
```

- [ ] **Step 4: Run the seed script and copy the portrait asset**

Run:
```bash
cd /Users/leothesen/Development/Personal/give-meaning-to-maths/.claude/worktrees/give-meaning-to-maths-impl/apps/web
mkdir -p public/assets content/chapters
cp "/Users/leothesen/.claude/jobs/2603a000/design/pb-website/project/assets/peebee-portrait.jpg" public/assets/peebee-portrait.jpg
node scripts/seed-chapters.mjs
ls content/chapters
```
Expected: 11 `.md` files printed; portrait copied. If the bundle path is gone, the script still produces all 11 with the uniform placeholder body (no failure).

- [ ] **Step 5: Create `apps/web/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
```

- [ ] **Step 6: Write the test `apps/web/test/book.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import { BOOK, getChapter, chapterNeighbours } from "@/content/book";
import { renderChapter } from "@/content/markdown";

describe("book data", () => {
  it("has unique, non-empty slugs", () => {
    const slugs = BOOK.chapters.map((c) => c.slug);
    expect(slugs.every(Boolean)).toBe(true);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("getChapter resolves known and unknown slugs", () => {
    expect(getChapter("preface")?.title).toBe("Preface");
    expect(getChapter("nope")).toBeUndefined();
  });

  it("neighbours are correct at the edges", () => {
    expect(chapterNeighbours("preface").prev).toBeNull();
    expect(chapterNeighbours("preface").next?.slug).toBe("what-is-maths-for");
    expect(chapterNeighbours("notes-and-sources").next).toBeNull();
  });

  it("every chapter has a markdown file", async () => {
    for (const c of BOOK.chapters) {
      const p = path.join(process.cwd(), "content", "chapters", `${c.slug}.md`);
      await expect(fs.access(p)).resolves.toBeUndefined();
    }
  });

  it("renders every chapter to non-empty HTML", async () => {
    for (const c of BOOK.chapters) {
      const html = await renderChapter(c.slug);
      expect(html.length).toBeGreaterThan(20);
    }
  });
});
```

- [ ] **Step 7: Run the test to verify it passes** (data + files already exist from prior steps)

Run:
```bash
cd /Users/leothesen/Development/Personal/give-meaning-to-maths/.claude/worktrees/give-meaning-to-maths-impl/apps/web
pnpm vitest run
```
Expected: 5 tests PASS. If a remark/rehype ESM import fails under Vitest, add `test.server.deps.inline: [/^(remark|rehype|unified|mdast|micromark|vfile|bail|trough|devlop|hast|property-information|space-separated-tokens|comma-separated-tokens|zwitch|html-void-elements|web-namespaces)/]` to `vitest.config.ts` and re-run.

- [ ] **Step 8: Commit**

```bash
cd /Users/leothesen/Development/Personal/give-meaning-to-maths/.claude/worktrees/give-meaning-to-maths-impl
git add apps/web/content apps/web/scripts apps/web/public apps/web/vitest.config.ts apps/web/test
git commit -m "feat(web): book data, markdown pipeline, seeded chapters + tests"
```

---

## Task 5: Pages — layout chrome, landing, about, reader

**Files:**
- Modify: `apps/web/app/layout.tsx` (add header/footer)
- Replace: `apps/web/app/page.tsx`
- Create: `apps/web/app/about/page.tsx`
- Create: `apps/web/app/read/page.tsx`
- Create: `apps/web/app/read/[slug]/page.tsx`
- Create: `apps/web/components/chapter-toc.tsx`
- Create: `apps/web/app/not-found.tsx`

- [ ] **Step 1: Update `apps/web/app/layout.tsx`** — add imports after the existing `ThemeProvider` import:

```tsx
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
```
Replace the body block:
```tsx
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
```
with:
```tsx
      <body>
        <ThemeProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </ThemeProvider>
      </body>
```

- [ ] **Step 2: Replace `apps/web/app/page.tsx`** (landing)

```tsx
import Image from "next/image";
import { DocTable, DocRow, DocCell } from "@/components/doc-table";
import { CellLink } from "@/components/cell-link";
import { Placeholder } from "@/components/placeholder";

const VOICE_COLS = ["For readers", "For teachers", "For former pupils"] as const;
const VOICE_ROWS = [
  [
    ["01 · Reader quote", "A short reader endorsement — two or three sentences on what the book did for a general reader.", "— Name, location"],
    ["01 · Teacher quote", "A teacher’s note on how they have used the book in their classroom or staff-room.", "— Name, school / role"],
    ["01 · Former pupil quote", "A memory or reflection from someone PB taught. Specific, short, and signed.", "— Name, years taught"],
  ],
  [
    ["02 · Reader quote", "Second reader quote. Pick voices that differ in age, background, or relationship to maths.", "— Name, location"],
    ["02 · Teacher quote", "Second teacher quote — ideally from a different teaching level.", "— Name, school / role"],
    ["02 · Former pupil quote", "Second former-pupil quote — from a different decade if possible.", "— Name, years taught"],
  ],
  [
    ["03 · Reader quote", "Third reader quote.", "— Name, location"],
    ["03 · Teacher quote", "Third teacher quote.", "— Name, school / role"],
    ["03 · Former pupil quote", "Third former-pupil quote.", "— Name, years taught"],
  ],
];

export default function Home() {
  return (
    <main className="mx-auto max-w-[1080px] border-x border-rule pb-[60px]">
      {/* HERO */}
      <section className="border-b border-rule">
        <DocTable>
          <DocRow>
            <DocCell className="p-[36px_30px] align-middle">
              <span className="mb-[6px] block font-mono text-[10px] font-semibold tracking-[.18em] uppercase">
                A book of essays
              </span>
              <h1 className="m-0 font-serif text-[clamp(46px,6.6vw,84px)] font-semibold leading-[.98] tracking-[-.018em]">
                Give Meaning
                <br />
                to <em className="font-medium italic">Maths</em>.
              </h1>
              <Placeholder tag="Placeholder · Blurb" className="mt-[18px] max-w-[32em]">
                <p className="m-0">
                  A short blurb for the book — one or two sentences describing
                  what it is and who it is for.
                </p>
              </Placeholder>
            </DocCell>
            <DocCell className="w-[360px] border-l border-rule p-0 align-middle">
              <div className="p-[22px_22px_14px]">
                <Image
                  src="/assets/peebee-portrait.jpg"
                  alt="Pen-and-ink drawing of the author"
                  width={360}
                  height={440}
                  className="book-img block w-full grayscale contrast-[1.05]"
                  priority
                />
              </div>
              <div className="border-t border-rule p-[10px_22px] text-center font-mono text-[10.5px] tracking-[.14em] uppercase text-ink3">
                P. B. — drawn from life, 2024
              </div>
            </DocCell>
          </DocRow>
          <DocRow>
            <DocCell colSpan={2} className="p-0">
              <CellLink href="/read/preface" invert>
                Begin reading &nbsp;→
              </CellLink>
            </DocCell>
          </DocRow>
        </DocTable>
      </section>

      {/* OVERVIEW */}
      <section>
        <DocTable>
          <DocRow>
            <DocCell variant="header" colSpan={2}>
              An overview
            </DocCell>
          </DocRow>
          <DocRow>
            <DocCell className="w-[60%]">
              <Placeholder>
                <p>
                  A short overview of the book goes here — two or three
                  paragraphs. What it is, who it is for, what to expect.
                </p>
                <p className="mt-3">
                  This is also where a defining line from the book can live, set
                  off as a lead paragraph.
                </p>
              </Placeholder>
            </DocCell>
            <DocCell className="w-[40%] p-0">
              <table className="w-full border-collapse">
                <tbody className="font-mono text-ink3">
                  {["Chapters", "Pages", "Reading time", "Problems", "Published"].map(
                    (k) => (
                      <tr key={k}>
                        <td className="border-b border-rule p-[12px_22px]">
                          <span className="font-mono text-[10px] tracking-[.18em] uppercase text-ink">
                            {k}
                          </span>
                        </td>
                        <td className="border-b border-rule p-[12px_22px] text-right">
                          —
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </DocCell>
          </DocRow>
        </DocTable>
      </section>

      {/* VOICES */}
      <section>
        <table className="w-full border-collapse border-y border-rule">
          <thead>
            <tr>
              {VOICE_COLS.map((c) => (
                <th
                  key={c}
                  className="border border-rule bg-ink p-[12px_22px] text-left font-mono text-[11px] font-semibold tracking-[.18em] uppercase text-paper first:border-l-0 last:border-r-0"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VOICE_ROWS.map((row, ri) => (
              <tr key={ri}>
                {row.map(([num, body, by], ci) => (
                  <td
                    key={ci}
                    className="w-1/3 border border-rule p-[26px] align-top first:border-l-0 last:border-r-0"
                  >
                    <div className="mb-[10px] font-mono text-[10.5px] tracking-[.18em] uppercase text-ink3">
                      {num}
                    </div>
                    <p className="m-0 text-[17px] italic leading-[1.5] text-ink3">
                      {body}
                    </p>
                    <div className="mt-[14px] font-mono text-[10.5px] tracking-[.18em] uppercase text-ink3">
                      {by}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Create `apps/web/app/about/page.tsx`**

```tsx
import Image from "next/image";
import { Placeholder } from "@/components/placeholder";

export default function About() {
  return (
    <main className="mx-auto max-w-[1080px] border-x border-rule pb-[60px]">
      <div className="grid grid-cols-[220px_1fr] border-b border-rule max-[900px]:grid-cols-1">
        <div className="border-r border-rule p-[26px_28px] max-[900px]:border-b max-[900px]:border-r-0">
          <span className="font-mono text-[10px] font-semibold tracking-[.18em] uppercase">
            Section
          </span>
          <div className="mt-1 font-mono text-[12px] tracking-[.14em] uppercase">
            About the author
          </div>
        </div>
        <div className="p-[26px_28px]">
          <h1 className="m-0 font-serif text-[48px] font-semibold leading-[1.1]">
            The teacher his pupils called <em className="italic">PeeBee</em>.
          </h1>
        </div>
      </div>

      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className="border border-rule p-[26px_28px] align-top first:border-l-0">
              <Placeholder tag="Placeholder · Biography">
                <p>
                  Opening paragraph — one or two sentences placing P. B. (where
                  he taught, for how long).
                </p>
                <p className="mt-3">
                  Second paragraph — the nickname, the kind of teacher he is.
                </p>
                <p className="mt-3">
                  Third paragraph — the range of his teaching, tied back to the
                  book.
                </p>
              </Placeholder>
            </td>
            <td className="w-[320px] border border-rule p-0 align-top last:border-r-0">
              <div className="p-[22px_22px_12px]">
                <Image
                  src="/assets/peebee-portrait.jpg"
                  alt="Pen-and-ink drawing of P. B."
                  width={320}
                  height={390}
                  className="book-img block w-full grayscale contrast-[1.05]"
                />
              </div>
              <div className="border-t border-rule p-[10px_22px] font-mono text-[10.5px] tracking-[.12em] uppercase text-ink3">
                P. B. — drawn from life
              </div>
            </td>
          </tr>
          <tr>
            <td
              colSpan={2}
              className="border border-rule p-[26px_28px] align-top first:border-l-0 last:border-r-0"
            >
              <h3 className="mb-[10px] font-mono text-[11px] tracking-[.18em] uppercase">
                A note on the teaching
              </h3>
              <Placeholder>
                <p>
                  A short paragraph capturing PB’s philosophy of teaching in his
                  own voice. Concrete details work better than abstractions.
                </p>
              </Placeholder>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
```

- [ ] **Step 4: Create `apps/web/components/chapter-toc.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BOOK } from "@/content/book";

export function ChapterToc({ currentSlug }: { currentSlug: string }) {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      const i = BOOK.chapters.findIndex((c) => c.slug === currentSlug);
      if (e.key === "ArrowRight" && i < BOOK.chapters.length - 1) {
        router.push(`/read/${BOOK.chapters[i + 1]!.slug}`);
      } else if (e.key === "ArrowLeft" && i > 0) {
        router.push(`/read/${BOOK.chapters[i - 1]!.slug}`);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentSlug, router]);

  return (
    <aside className="sticky top-[56px] max-h-[calc(100vh-56px)] overflow-y-auto border-r border-rule p-[24px_22px] text-[14px] max-[900px]:static max-[900px]:max-h-none max-[900px]:border-b max-[900px]:border-r-0">
      <h4 className="mb-3 font-mono text-[11px] font-semibold tracking-[.18em] uppercase">
        Contents
      </h4>
      <ol className="m-0 list-none p-0">
        {BOOK.chapters.map((c) => (
          <li
            key={c.slug}
            className="flex items-baseline gap-[10px] border-b border-rule py-[6px] last:border-b-0"
          >
            <span className="shrink-0 font-mono text-[10.5px] tracking-[.1em] text-ink3">
              {c.number}
            </span>
            <Link
              href={`/read/${c.slug}`}
              className={`flex-1 leading-[1.3] no-underline hover:bg-ink hover:text-paper ${
                c.slug === currentSlug ? "font-semibold text-ink" : "text-ink2"
              }`}
            >
              {c.title}
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-[22px] font-mono text-[10.5px] tracking-[.14em] uppercase leading-[1.6] text-ink3">
        Use ← / → to move between chapters.
      </p>
    </aside>
  );
}
```

- [ ] **Step 5: Create `apps/web/app/read/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { BOOK, getChapter, chapterNeighbours } from "@/content/book";
import { renderChapter } from "@/content/markdown";
import { ChapterToc } from "@/components/chapter-toc";

export function generateStaticParams() {
  return BOOK.chapters.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ch = getChapter(slug);
  return { title: ch ? `${ch.title} — Give Meaning to Maths` : "Not found" };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ch = getChapter(slug);
  if (!ch) notFound();

  const html = await renderChapter(ch.slug);
  const { prev, next } = chapterNeighbours(ch.slug);

  return (
    <div className="mx-auto grid max-w-[1080px] grid-cols-[280px_1fr] items-start border-x border-rule max-[900px]:grid-cols-1">
      <ChapterToc currentSlug={ch.slug} />
      <article className="max-w-[760px] p-[36px_40px_60px] max-[900px]:p-[30px_22px_50px]">
        <p className="m-0 mb-[18px] flex justify-between border-b border-rule pb-[10px] font-mono text-[11px] tracking-[.18em] uppercase">
          <span>Chapter {ch.number}</span>
          <span>{ch.title}</span>
        </p>
        <h1 className="mb-6 mt-[6px] font-serif text-[40px] font-semibold leading-[1.15]">
          {ch.title}
        </h1>
        <div
          className="chapter-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <nav className="mt-[50px] grid grid-cols-2 border border-rule max-[900px]:grid-cols-1">
          {prev ? (
            <Link
              href={`/read/${prev.slug}`}
              className="block border-r border-rule p-[16px_20px] no-underline hover:bg-ink hover:text-paper max-[900px]:border-b max-[900px]:border-r-0"
            >
              <span className="mb-1 block font-mono text-[10px] tracking-[.18em] uppercase text-ink3">
                ← Previous
              </span>
              <span className="font-serif text-[16px] italic">{prev.title}</span>
            </Link>
          ) : (
            <span className="border-r border-rule max-[900px]:hidden" />
          )}
          {next ? (
            <Link
              href={`/read/${next.slug}`}
              className="block p-[16px_20px] text-right no-underline hover:bg-ink hover:text-paper"
            >
              <span className="mb-1 block font-mono text-[10px] tracking-[.18em] uppercase text-ink3">
                Next →
              </span>
              <span className="font-serif text-[16px] italic">{next.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </div>
  );
}
```

- [ ] **Step 6: Create `apps/web/app/read/page.tsx`** (static alias for first chapter)

```tsx
import ChapterPage from "./[slug]/page";

export const metadata = { title: "Read — Give Meaning to Maths" };

export default function ReadIndex() {
  return ChapterPage({ params: Promise.resolve({ slug: "preface" }) });
}
```

- [ ] **Step 7: Create `apps/web/app/not-found.tsx`**

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[1080px] border-x border-rule p-[60px_30px]">
      <h1 className="font-serif text-[40px] font-semibold">Not found</h1>
      <p className="mt-4">
        That page does not exist.{" "}
        <Link href="/" className="underline hover:bg-ink hover:text-paper">
          Return home
        </Link>
        .
      </p>
    </main>
  );
}
```

- [ ] **Step 8: Verify build and pages render**

Run:
```bash
cd /Users/leothesen/Development/Personal/give-meaning-to-maths/.claude/worktrees/give-meaning-to-maths-impl
pnpm -F @repo/web build
```
Expected: build succeeds; output lists static routes `/`, `/about`, `/read`, `/read/[slug]` (11 params), `/_not-found`.

- [ ] **Step 9: Commit**

```bash
git add apps/web/app apps/web/components/chapter-toc.tsx
git commit -m "feat(web): landing, about, chapter reader, TOC + keyboard nav"
```

---

## Task 6: Machine-readability surface

**Files:**
- Create: `apps/web/app/llms.txt/route.ts`
- Create: `apps/web/app/sitemap.ts`
- Create: `apps/web/app/robots.ts`

- [ ] **Step 1: Create `apps/web/app/llms.txt/route.ts`**

```ts
import { BOOK } from "@/content/book";

export const dynamic = "force-static";

export function GET() {
  const lines: string[] = [];
  lines.push(`# ${BOOK.title}`);
  lines.push("");
  lines.push(`> ${BOOK.subtitle} — a book by ${BOOK.author}.`);
  lines.push("");
  lines.push("## About");
  lines.push(`- Title: ${BOOK.title}`);
  lines.push(`- Author: ${BOOK.author}`);
  lines.push(`- Year: ${BOOK.year}`);
  lines.push("- Format: Web edition; every chapter is readable as a page.");
  lines.push("");
  lines.push("## Pages");
  lines.push("- [Home](/): overview");
  lines.push("- [Read](/read): chapter reader");
  lines.push("- [About](/about): the author");
  lines.push("");
  lines.push("## Chapters");
  for (const c of BOOK.chapters) {
    lines.push(`- [${c.number} — ${c.title}](/read/${c.slug}): ${c.blurb}`);
  }
  lines.push("");
  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
```

- [ ] **Step 2: Create `apps/web/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { BOOK } from "@/content/book";

const BASE = "https://give-meaning-to-maths.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/read", "/about"].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
  }));
  const chapters = BOOK.chapters.map((c) => ({
    url: `${BASE}/read/${c.slug}`,
    lastModified: new Date(),
  }));
  return [...staticPages, ...chapters];
}
```

- [ ] **Step 3: Create `apps/web/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";

const BASE = "https://give-meaning-to-maths.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
```

- [ ] **Step 4: Verify build emits the machine routes**

Run:
```bash
cd /Users/leothesen/Development/Personal/give-meaning-to-maths/.claude/worktrees/give-meaning-to-maths-impl
pnpm -F @repo/web build
```
Expected: build succeeds; routes include `/llms.txt`, `/sitemap.xml`, `/robots.txt`.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/llms.txt apps/web/app/sitemap.ts apps/web/app/robots.ts
git commit -m "feat(web): llms.txt, sitemap, robots"
```

---

## Task 7: Playwright smoke test

**Files:**
- Create: `apps/web/playwright.config.ts`
- Create: `apps/web/e2e/smoke.spec.ts`

- [ ] **Step 1: Create `apps/web/playwright.config.ts`**

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  webServer: {
    command: "pnpm build && pnpm start",
    port: 3210,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  use: { baseURL: "http://localhost:3210" },
});
```

- [ ] **Step 2: Write `apps/web/e2e/smoke.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("landing renders hero + voices", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Give Meaning");
  await expect(page.getByText("For former pupils")).toBeVisible();
});

test("about renders", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("PeeBee");
});

test("/read shows preface; TOC and keyboard nav move chapters", async ({ page }) => {
  await page.goto("/read");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Preface");
  await page.getByRole("link", { name: "What is mathematics for?" }).click();
  await expect(page).toHaveURL(/\/read\/what-is-maths-for/);
  await page.keyboard.press("ArrowLeft");
  await expect(page).toHaveURL(/\/read\/preface/);
});

test("unknown chapter 404s", async ({ page }) => {
  const res = await page.goto("/read/does-not-exist");
  expect(res?.status()).toBe(404);
});

test("theme toggle cycles System -> Light -> Dark", async ({ page }) => {
  await page.goto("/");
  const btn = page.getByRole("button", { name: "Toggle colour theme" });
  await expect(btn).toContainText("System");
  await btn.click();
  await expect(btn).toContainText("Light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await btn.click();
  await expect(btn).toContainText("Dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("llms.txt is served as text and lists chapters", async ({ page }) => {
  const res = await page.goto("/llms.txt");
  expect(res?.ok()).toBeTruthy();
  expect(await res!.text()).toContain("## Chapters");
});
```

- [ ] **Step 3: Install browsers and run the smoke suite**

Run:
```bash
cd /Users/leothesen/Development/Personal/give-meaning-to-maths/.claude/worktrees/give-meaning-to-maths-impl/apps/web
pnpm exec playwright install chromium
pnpm exec playwright test
```
Expected: all 6 tests PASS. If the dev port is busy, stop other servers first.

- [ ] **Step 4: Commit**

```bash
cd /Users/leothesen/Development/Personal/give-meaning-to-maths/.claude/worktrees/give-meaning-to-maths-impl
git add apps/web/playwright.config.ts apps/web/e2e
git commit -m "test(web): playwright smoke (pages, nav, theme, llms.txt)"
```

---

## Task 8: Full validation + browser walkthrough + finalize

**Files:** `README.md`

- [ ] **Step 1: Create `README.md`** (use a heredoc so backticks are literal)

```bash
cd /Users/leothesen/Development/Personal/give-meaning-to-maths/.claude/worktrees/give-meaning-to-maths-impl
cat > README.md <<'EOF'
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
EOF
```

- [ ] **Step 2: Full gates green**

Run:
```bash
cd /Users/leothesen/Development/Personal/give-meaning-to-maths/.claude/worktrees/give-meaning-to-maths-impl
pnpm install
pnpm lint
pnpm test
pnpm -F @repo/web build
```
Expected: lint clean, vitest 5 passing, build succeeds with all static routes. Fix any failure before continuing.

- [ ] **Step 3: Start the dev server in the background for browser validation**

Run (background): `cd /Users/leothesen/Development/Personal/give-meaning-to-maths/.claude/worktrees/give-meaning-to-maths-impl && pnpm dev`
Wait until it logs `Ready` on `http://localhost:3210`.

- [ ] **Step 4: Claude-in-Chrome walkthrough**

Load `mcp__claude-in-chrome__*` tools via ToolSearch, call `tabs_context_mcp`, open a new tab, and verify visually:
- `/` — hero table, portrait, "Begin reading" inverted cell, overview stats em-dashes, Voices 3-column grid; bordered "Google-Doc" look holds.
- Click "Begin reading" → `/read/preface`; TOC visible; click another chapter; press → / ← to move.
- `/about` — heading + portrait + placeholder bio.
- Cycle the theme toggle System → Light → Dark; confirm colors invert and `html[data-theme]` changes; reload keeps choice.
- Narrow the window (~600px) and confirm the grids stack instead of overflowing.
- `/llms.txt` renders as plain text listing chapters.
Capture a GIF of the theme cycle + reader nav for the report.

- [ ] **Step 5: Stop the dev server, final commit**

```bash
cd /Users/leothesen/Development/Personal/give-meaning-to-maths/.claude/worktrees/give-meaning-to-maths-impl
git add README.md
git commit -m "docs: project README"
git log --oneline
```

- [ ] **Step 6: Report** — summarize what was built, gate results, branch name, that content is placeholder pending the PDF, and surface the merge/PR decision to the user (the worktree branch is `worktree-give-meaning-to-maths-impl`).

---

## Self-Review

**Spec coverage:**
- 3-page site → Task 5 (`/`, `/about`, `/read`, `/read/[slug]`). ✓
- PDF→Markdown static pages → Task 4 (markdown pipeline, seeded chapters), Task 5 (reader). ✓
- Machine surface (llms.txt/sitemap/robots) → Task 6. ✓
- System/Light/Dark, no flash → Task 2 (tokens + `next-themes`), Task 3 (toggle). ✓
- Fresh minimal Turborepo, no Supabase/auth → Task 1, Task 2. ✓
- Tailwind token block + component kit (maintainability) → Task 2 (tokens), Task 3 (kit). ✓
- Self-hosted fonts → Task 2 (`next/font/google`). ✓
- Math rendering on → Task 2 (KaTeX CSS), Task 4 (remark-math/rehype-katex). ✓
- Tests: Vitest data/markdown + Playwright smoke → Task 4, Task 7. ✓
- Vercel-static / no env to build → Task 2 (`build` is plain `next build`). ✓
- No download link; image deterrent → Task 2 (`.book-img` css), Task 5 (`book-img` class). ✓
- Forum out of scope → not built. ✓
- End-to-end validation via dev server + Claude-in-Chrome → Task 8. ✓

**Placeholder scan:** No "TBD/implement later/handle edge cases" steps; product "Placeholder" UI content is intentional and specified. ✓

**Type consistency:** `BOOK`, `Chapter`, `getChapter`, `chapterNeighbours` defined Task 4 Step 1, consumed with identical signatures in Tasks 5/6/7. `renderChapter(slug)` defined Task 4 Step 2, used Task 5 Step 5. `DocTable/DocRow/DocCell` (variants `default|header|invert|tight`) defined Task 3 Step 1, used Task 5. `cn` defined Task 2 Step 7, used in kit. `ThemeProvider` defined Task 2 Step 9, used Task 2 Step 10 / updated Task 5 Step 1. Port 3210 consistent across `package.json`, `playwright.config.ts`, README, Task 8. ✓
