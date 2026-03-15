import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "../components/Navigation";
import BottomNav from "../components/BottomNav";
import LoadingScreen from "../components/LoadingScreen";
import { getSiteMetadata } from "../sanity/lib/metadata";

const inter = Inter({ subsets: ["latin"] });
const instrumentSerif = localFont({
  src: "../../public/instrument-serif/instrumentserif-regular.ttf",
  variable: "--font-instrument-serif",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSiteMetadata();
  const ogImageUrl = meta.defaultOgImageUrl.startsWith("http")
    ? meta.defaultOgImageUrl
    : `${meta.siteUrl.replace(/\/$/, "")}${meta.defaultOgImageUrl.startsWith("/") ? "" : "/"}${meta.defaultOgImageUrl}`;

  return {
    title: {
      default: meta.siteTitle,
      template: "%s | Abhijith",
    },
    description: meta.siteDescription,
    keywords: meta.keywords.length > 0 ? meta.keywords : undefined,
    authors: [{ name: "Abhijith" }],
    robots: "index, follow",
    openGraph: {
      title: meta.openGraphTitle,
      description: meta.openGraphDescription,
      url: meta.siteUrl,
      siteName: "Abhijith",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: meta.defaultOgImageAlt,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.openGraphTitle,
      description: meta.openGraphDescription,
      images: [ogImageUrl],
      ...(meta.twitterHandle && { creator: `@${meta.twitterHandle.replace(/^@/, "")}` }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${instrumentSerif.variable}`}>
        <LoadingScreen />
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
