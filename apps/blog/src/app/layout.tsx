import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import Link from "next/link";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";

import "./globals.css";

const SITE = "https://blog.jungwoonkwon.com";
const SITE_NAME = "Kwon Jung Woon Blog";
const DESCRIPTION = "권중운의 개발 노트와 기술 회고.";
const COPYRIGHT_YEAR = 2026;

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
      <body className="bg-background mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-12 font-sans antialiased sm:py-24">
        <ThemeProvider attribute="class" defaultTheme="light">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <footer className="text-muted-foreground mt-20 border-t pt-8 text-sm leading-6">
            <p>읽어주셔서 감사합니다.</p>
            <nav aria-label="Footer" className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link href="/" className="hover:text-foreground transition-colors">
                Writing
              </Link>
              <a href="/rss.xml" className="hover:text-foreground transition-colors">
                RSS
              </a>
              <a
                href="https://jungwoonkwon.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Portfolio
              </a>
            </nav>
            <p className="mt-4 text-xs leading-5">
              © {COPYRIGHT_YEAR} Kwon Jung Woon. All rights reserved.
            </p>
          </footer>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
