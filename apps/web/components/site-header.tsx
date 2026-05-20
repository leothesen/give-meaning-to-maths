import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { BOOK } from "@/content/book";

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
            A book by {BOOK.author} · {BOOK.edition}
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
