import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Aeon Prompt Enhancer",
  description: "Luxury dark prompt enhancement workspace",
  applicationName: "Aeon Prompt Enhancer",
  keywords: ["Aeon Prompt Enhancer", "prompt enhancer", "AI prompts", "prompt optimization"],
  authors: [{ name: "Aeon Prompt Enhancer" }],
  creator: "Aeon Prompt Enhancer",
  publisher: "Aeon Prompt Enhancer",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Aeon Prompt Enhancer",
    description: "Luxury dark prompt enhancement workspace",
    url: "/",
    siteName: "Aeon Prompt Enhancer",
    images: [
      {
        url: "/favicon_robofox/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Aeon Prompt Enhancer"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Aeon Prompt Enhancer",
    description: "Luxury dark prompt enhancement workspace",
    images: ["/favicon_robofox/android-chrome-512x512.png"]
  },
  icons: {
    icon: [
      { url: "/favicon_robofox/favicon.ico" },
      { url: "/favicon_robofox/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_robofox/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: [{ url: "/favicon_robofox/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon_robofox/favicon.ico"]
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
