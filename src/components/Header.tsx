"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { isLoggedIn, clearToken } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [logged, setLogged] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setLogged(isLoggedIn());
  }, [pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  function handleLogout() {
    clearToken();
    setLogged(false);
    router.push("/");
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0b10]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="w-full px-6 sm:px-10 lg:px-20 xl:px-28 2xl:px-36">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <Image
              src="/logo.png"
              alt="PromptAI"
              width={52}
              height={52}
              className="rounded-xl transition-transform group-hover:scale-105"
            />
            <span className="font-display font-bold text-2xl text-white tracking-tight">
              PromptAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/demo"
              className="px-4 py-2.5 text-[15px] text-[--text-secondary] hover:text-white rounded-lg hover:bg-white/[0.04] transition-all"
            >
              Demo
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-2.5 text-[15px] text-[--text-secondary] hover:text-white rounded-lg hover:bg-white/[0.04] transition-all"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="px-4 py-2.5 text-[15px] text-[--text-secondary] hover:text-white rounded-lg hover:bg-white/[0.04] transition-all"
            >
              Blog
            </Link>
            {logged ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2.5 text-[15px] text-[--text-secondary] hover:text-white rounded-lg hover:bg-white/[0.04] transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  href="/saved-prompts"
                  className="px-4 py-2.5 text-[15px] text-[--text-secondary] hover:text-white rounded-lg hover:bg-white/[0.04] transition-all"
                >
                  Saved
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 text-[15px] text-[--text-secondary] hover:text-white rounded-lg hover:bg-white/[0.04] transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2.5 text-[15px] text-[--text-secondary] hover:text-white rounded-lg hover:bg-white/[0.04] transition-all"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="ml-2 px-5 py-2.5 text-[15px] font-semibold text-white rounded-lg transition-all hover:brightness-110"
                  style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-[--text-secondary] hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/[0.06]">
            <div className="flex flex-col gap-1">
              <Link
                href="/demo"
                className="px-3 py-2.5 text-sm text-[--text-secondary] hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Demo
              </Link>
              <Link
                href="/pricing"
                className="px-3 py-2.5 text-sm text-[--text-secondary] hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/blog"
                className="px-3 py-2.5 text-sm text-[--text-secondary] hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              {logged ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-3 py-2.5 text-sm text-[--text-secondary] hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/saved-prompts"
                    className="px-3 py-2.5 text-sm text-[--text-secondary] hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Saved Prompts
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="px-3 py-2.5 text-sm text-[--text-secondary] hover:text-white hover:bg-white/[0.04] rounded-lg transition-all text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-2.5 text-sm text-[--text-secondary] hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="mt-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg text-center transition-all hover:brightness-110"
                    style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
