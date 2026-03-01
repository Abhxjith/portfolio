import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "../components/Navigation";

const inter = Inter({ subsets: ["latin"] });
const instrumentSerif = localFont({
  src: "../../public/instrument-serif/instrumentserif-regular.ttf",
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal Portfolio",
  icons: {
    icon: '/logo.avif',
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
        <nav className="bottom-capsule">
          <a href="/dev" className="capsule-link">dev</a>
          <a href="/film" className="capsule-link">film</a>
          <a href="/uiux" className="capsule-link">ui/ux</a>
          <a href="/art" className="capsule-link">art</a>
          <a href="/blogs" className="capsule-link">blogs</a>
        </nav>
      </body>
    </html>
  );
}
