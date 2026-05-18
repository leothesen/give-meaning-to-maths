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
                c.slug === currentSlug
                  ? "font-semibold text-ink"
                  : "text-ink2"
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
