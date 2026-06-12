import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import Link from "next/link";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";

import "./globals.css";

const SITE = "https://blog.jungwoonkwon.com";
const SITE_NAME = "Kwon Jung Woon Blog";
const DESCRIPTION = "권중운의 개발 노트와 기술 회고.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  applicationName: SITE_NAME,
  authors: [{ name: "Kwon Jung Woon", url: "https://jungwoonkwon.com" }],
  creator: "Kwon Jung Woon",
  publisher: "Kwon Jung Woon",
  keywords: ["권중운", "개발 블로그", "기술 블로그", "프론트엔드", "백엔드", "TypeScript", "Next.js"],
  title: {
    default: "Blog | Kwon Jung Woon",
    template: "%s | Kwon Jung Woon",
  },
  description: DESCRIPTION,
  openGraph: {
    title: "Blog | Kwon Jung Woon",
    description: DESCRIPTION,
    url: SITE,
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Kwon Jung Woon",
    description: DESCRIPTION,
  },
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/rss.xml" },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-background mx-auto min-h-screen max-w-2xl px-6 py-12 font-sans antialiased sm:py-24">
        <ThemeProvider attribute="class" defaultTheme="light">
          <header className="mb-12 flex items-center justify-between">
            <Link href="/" className="text-sm font-medium">
              권중운
            </Link>
            <div className="flex items-center gap-1">
              <a
                href="https://jungwoonkwon.com"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground inline-flex h-9 items-center rounded-md px-2 text-sm transition-colors"
              >
                Portfolio
              </a>
              <ThemeToggle />
            </div>
          </header>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
