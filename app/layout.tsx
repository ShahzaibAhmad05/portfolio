import type { Metadata } from "next";
import { Be_Vietnam_Pro, Bayon } from "next/font/google";
import LenisProvider from "@/components/LenisProvider";
import "lenis/dist/lenis.css";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const bayon = Bayon({
  variable: "--font-bayon",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Shahzaib Ahmad Shahid | Software Engineer",
  description:
    "Helping Founders Build High-Quality Software Free of AI slop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${beVietnamPro.variable} ${bayon.variable} h-full antialiased`}
    >
      <body className={`${beVietnamPro.className} min-h-full`}>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
