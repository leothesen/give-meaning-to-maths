import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata, Viewport } from "next";
import { BOOK, getChapter, chapterNeighbours } from "@/content/book";
import { renderChapter } from "@/content/markdown";
import { ChapterToc } from "@/components/chapter-toc";
import { MobileGate } from "@/components/mobile-gate";

export function generateStaticParams() {
  return BOOK.chapters.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

// Chapter pages are laid out at a fixed 1080-px width to preserve Peter's
// print-style formatting (large titles, side-by-side photo+text layouts,
// custom paragraph positioning). On narrow screens mobile browsers will
// auto-scale this viewport to fit — shrinking the book — and the MobileGate
// component overlays a one-time dismissable "best viewed on desktop" notice.
export const viewport: Viewport = {
  width: 1080,
  initialScale: 1,
};

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
    <>
      <MobileGate />
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
              <span className="font-serif text-[16px] italic">
                {prev.title}
              </span>
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
              <span className="font-serif text-[16px] italic">
                {next.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </div>
    </>
  );
}
