import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "../components/Navigation";
import BottomNav from "../components/BottomNav";

const inter = Inter({ subsets: ["latin"] });
const instrumentSerif = localFont({
  src: "../../public/instrument-serif/instrumentserif-regular.ttf",
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Product & Design-First Software Engineer | Abhijith",
    template: "%s | Abhijith"
  },
  description: "Product-focused software engineer who builds apps, systems, and experiences with strong UX and creative intent. Uses AI to accelerate execution, not replace originality. Drawn to early-stage startups and people who care about craft.",
  keywords: ["product engineer", "design first software engineer", "creative technologist", "UX focused developer", "startup engineer", "full stack builder", "systems thinker"],
  authors: [{ name: "Abhijith" }],
  robots: "index, follow",
  openGraph: {
    title: "Product & Design-First Software Engineer | Abhijith",
    description: "I build software, music, films, and products with taste. UX-first, systems-minded, and obsessed with making things that feel right. Looking to work with founders and creative builders.",
    url: "https://abhijithjinnu.in",
    siteName: "Abhijith",
    images: [
      {
        url: "/twittercard.png",
        width: 1200,
        height: 630,
        alt: "Abhijith - Product & Design-First Software Engineer",
      },
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Abhijith Logo",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Product & Design-First Software Engineer | Abhijith",
    description: "Product-focused software engineer who builds apps, systems, and experiences with strong UX and creative intent.",
    images: ["/twittercard.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${instrumentSerif.variable}`}>
        <Navigation />

        <main className="content-area">
          {children}
        </main>

        <div className="bottom-vignette"></div>
        <BottomNav />
      </body>
    </html>
  );
}
