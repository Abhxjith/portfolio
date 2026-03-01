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
  title: "Portfolio",
  description: "Personal Portfolio",
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
