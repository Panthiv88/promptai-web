import type { Metadata } from "next";
import { Outfit, Syne, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CursorEffects from "@/components/CursorEffects";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-dm-serif",
  weight: "400",
});

export const metadata: Metadata = {
  title: "PromptAI - Transform Text into Powerful AI Prompts",
  description:
    "AI-powered prompt enhancement for ChatGPT, Claude, and other LLMs. Turn simple ideas into structured, effective prompts instantly.",
  keywords: ["AI", "prompts", "ChatGPT", "Claude", "prompt engineering", "LLM"],
  authors: [{ name: "PromptAI" }],
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "PromptAI - Transform Text into Powerful AI Prompts",
    description: "AI-powered prompt enhancement for ChatGPT, Claude, and other LLMs.",
    url: "https://www.promptai360.com",
    siteName: "PromptAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptAI - Transform Text into Powerful AI Prompts",
    description: "AI-powered prompt enhancement for ChatGPT, Claude, and other LLMs.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} ${syne.variable} ${dmSerif.variable} font-sans antialiased`}>
        <div className="relative min-h-screen flex flex-col">
          <CursorEffects />
          <Header />
          <main className="relative z-10 flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
