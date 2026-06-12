import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@repo/ui/utils";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import Link from "next/link";

import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blog.jungwoonkwon.com"),
  title: {
    default: "Blog | Kwon Jung Woon",
    template: "%s | Kwon Jung Woon",
  },
  description: "Kwon Jung Woon's technical writing and notes.",
  openGraph: {
    title: "Blog | Kwon Jung Woon",
    description: "Kwon Jung Woon's technical writing and notes.",
    url: "https://blog.jungwoonkwon.com",
    siteName: "Kwon Jung Woon Blog",
    locale: "ko_KR",
    type: "website",
  },
  alternates: {
    types: { "application/rss+xml": "/rss.xml" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background mx-auto min-h-screen max-w-2xl px-6 py-12 font-sans antialiased sm:py-24",
          fontSans.variable,
        )}
      >
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
      </body>
    </html>
  );
}
