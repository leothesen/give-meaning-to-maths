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
