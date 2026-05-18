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
                <Link
                  href="/read"
                  className="text-ink2 no-underline hover:bg-ink hover:text-paper"
                >
                  Read
                </Link>
              </li>
              <li className="py-[3px]">
                <Link
                  href="/about"
                  className="text-ink2 no-underline hover:bg-ink hover:text-paper"
                >
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
                <a
                  href="/llms.txt"
                  className="text-ink2 no-underline hover:bg-ink hover:text-paper"
                >
                  llms.txt
                </a>
              </li>
              <li className="py-[3px]">
                <a
                  href="/sitemap.xml"
                  className="text-ink2 no-underline hover:bg-ink hover:text-paper"
                >
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
