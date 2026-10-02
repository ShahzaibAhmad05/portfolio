import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import localFont from "next/font/local";
import FaviconCycle from "@/components/FaviconCycle";
import LenisProvider from "@/components/LenisProvider";
import Preloader from "@/components/Preloader";
import SiteAgent from "@/components/SiteAgent";
import "lenis/dist/lenis.css";
import "./globals.css";

// Satoshi (Fontshare, self-hosted) stands in for Area Normal, Source Serif 4 for HAL
// Timezone. Satoshi has no 600, so semibold text resolves to its 700.
const sans = localFont({
  variable: "--font-sans-face",
  src: [
    { path: "./fonts/Satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Satoshi-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
});

const serif = Source_Serif_4({
  variable: "--font-serif-face",
  subsets: ["latin"],
  weight: ["200", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Fraunces (Google Fonts, OFL) for the wordmark in the header: its italic, set extra light,
// with the soft and "wonky" axes the wordmark turns up (see .font-logo in globals.css)
const logo = Fraunces({
  variable: "--font-logo-face",
  subsets: ["latin"],
  style: ["italic"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  // the resting icon, for bookmarks and before FaviconCycle starts swapping
  icons: { icon: "/favicons/5.png" },
  title: "Shahzaib's Portfolio",
  description:
    "A Software Engineer converting AI-generated prototypes into straight-up ART. Get Top 1% quality in your Web products and mobile apps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${mono.variable} ${logo.variable} h-full antialiased`}
    >
      <body className={`${sans.className} min-h-full`}>
        <LenisProvider>
          {children}
          <SiteAgent />
          <FaviconCycle />
          <Preloader />
        </LenisProvider>
      </body>
    </html>
  );
}
