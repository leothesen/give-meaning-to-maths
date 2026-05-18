import type { ReactNode } from "react";

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
      <div className="font-serif italic text-ink3">{children}</div>
    </div>
  );
}
