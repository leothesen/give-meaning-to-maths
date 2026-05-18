import type { CSSProperties, ReactNode } from "react";
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
  style?: CSSProperties;
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
