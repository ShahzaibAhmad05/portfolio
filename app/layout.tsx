import type { Metadata } from "next";
import { Be_Vietnam_Pro, Bayon } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
  description: "3+ Years Of Building Software Faster Than AI At 0.1X the API Costs.",
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
        {children}
      </body>
    </html>
  );
}
