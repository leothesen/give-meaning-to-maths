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
