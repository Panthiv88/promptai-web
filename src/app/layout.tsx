import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PromptAI - Transform Text into Powerful AI Prompts",
  description: "AI-powered prompt enhancement for ChatGPT, Claude, and other LLMs. Turn simple ideas into structured, effective prompts instantly.",
  keywords: ["AI", "prompts", "ChatGPT", "Claude", "prompt engineering", "LLM"],
  authors: [{ name: "PromptAI" }],
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
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
