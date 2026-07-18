import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://dscinema.github.io"),
  title: "DS Cinema — Your camera operator. In the air.",
  description: "A privacy-first autonomous indoor camera for solo creators.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "DS Cinema — Your camera operator. In the air.",
    description: "A privacy-first autonomous indoor camera for solo creators.",
    images: [{ url: "/og.png", width: 1728, height: 909, alt: "DS Cinema autonomous flying camera" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DS Cinema — Your camera operator. In the air.",
    description: "A privacy-first autonomous indoor camera for solo creators.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
