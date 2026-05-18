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
  // next-themes can only resolve the active theme on the client; we render a
  // stable label until mounted to avoid an SSR/client hydration mismatch.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const current = mounted ? (theme ?? "system") : "system";

  function cycle() {
    const i = ORDER.indexOf(current as (typeof ORDER)[number]);
    setTheme(ORDER[(i + 1) % ORDER.length]!);
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
