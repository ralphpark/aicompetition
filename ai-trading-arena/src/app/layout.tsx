import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AI Trading Arena - 9 AI Models Competing in Real-time BTC Trading",
    template: "%s | AI Trading Arena",
  },
  description: "Watch GPT, Claude, Gemini, DeepSeek and more compete in real-time Bitcoin trading. Transparent decisions, live performance, and community-driven improvement.",
  keywords: ["AI trading", "Bitcoin", "GPT", "Claude", "Gemini", "crypto trading", "automated trading", "BTC", "cryptocurrency"],
  authors: [{ name: "AI Trading Arena" }],
  creator: "AI Trading Arena",
  openGraph: {
    title: "AI Trading Arena",
    description: "9 AI Models. 1 Champion. Watch AI compete in real-time BTC trading.",
    type: "website",
    locale: "en_US",
    siteName: "AI Trading Arena",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Trading Arena",
    description: "9 AI Models. 1 Champion. Watch AI compete in real-time BTC trading.",
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
