import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
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
        url: "/icon-512.png",
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
    images: ["/icon-512.png"]
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"]
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
