import { cn } from "@repo/ui/utils";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={cn(
          "bg-background mx-auto min-h-screen max-w-2xl px-6 py-12 font-sans antialiased sm:py-24",
          fontSans.variable,
        )}
      >
        {children}
      </body>
    </html>
  );
}
