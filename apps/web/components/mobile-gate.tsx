"use client";

import { useEffect, useState } from "react";

/**
 * Chapter pages are laid out at a fixed 1080-px desktop width to preserve
 * Peter's intentional print-style formatting (giant title type, side-by-side
 * photo+text tables, custom paragraph positioning). On mobile, this is
 * shrunk-to-fit via a per-route `viewport: { width: 1080 }` meta tag, which
 * produces a legible-if-you-zoom miniature.
 *
 * This component layers an informational modal on top: "Best viewed on
 * desktop". One-time per device — once dismissed, it stays dismissed.
 */
const STORAGE_KEY = "gmtm-mobile-gate-dismissed";

export function MobileGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isSmall = window.matchMedia("(max-width: 900px)").matches;
    const dismissed = window.localStorage.getItem(STORAGE_KEY) === "1";
    setShow(isSmall && !dismissed);
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private-mode etc — non-fatal */
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="mobile-gate">
      <div className="mobile-gate-card">
        <h2>Best viewed on desktop</h2>
        <p>
          This book is laid out at a fixed page width to preserve the original
          typography. On mobile you&apos;ll see a shrunken version that&apos;s
          functional but harder to read. Open it on a laptop or larger screen
          for the intended experience.
        </p>
        <button type="button" onClick={dismiss}>
          Continue anyway
        </button>
      </div>
    </div>
  );
}
