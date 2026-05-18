import type { MetadataRoute } from "next";

const BASE = "https://give-meaning-to-maths.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
