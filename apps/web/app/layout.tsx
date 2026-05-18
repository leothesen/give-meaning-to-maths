import type { Metadata } from "next";
import { EB_Garamond, Courier_Prime } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import "katex/dist/katex.min.css";

const serif = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});
const mono = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Give Meaning to Maths — by P. B.",
  description:
    "An essay collection on the meaning of mathematics, by a teacher of more than thirty years.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${serif.variable} ${mono.variable}`}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
