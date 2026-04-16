"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { setToken, setRefreshToken } from "@/lib/auth";
import Link from "next/link";
import GoogleSignIn from "@/components/GoogleSignIn";
import { AuthShell, GlassInputWrapper, type Testimonial } from "@/components/ui/auth-shell";

const TESTIMONIALS: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Priya Patel",
    handle: "@priyabuilds",
    text: "Signed up in 20 seconds. Enhanced my first prompt and the output was night and day better.",
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/75.jpg",
    name: "Jordan Reyes",
    handle: "@jordan_dev",
    text: "The Chrome extension is what closed it for me — one click and my rough prompts get shipped.",
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/68.jpg",
    name: "Anya Volkov",
    handle: "@anya_ux",
    text: "Love the saved prompts library. It is my new second brain for every AI chat I run.",
  },
];

const HERO_IMAGE = "https://images.unsplash.com/photo-1676299081847-824916de030a?w=2160&q=80";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPlan = searchParams.get("plan");
  const redirectFrequency = searchParams.get("frequency");
  const redirect = searchParams.get("redirect");

  function safeRedirect(url: string | null): string {
    if (!url) return "/dashboard";
    if (url.startsWith("/") && !url.startsWith("//")) return url;
    return "/dashboard";
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleGoogleSuccess() {
    if (redirectPlan && redirectFrequency) {
      router.push(`/billing/checkout?plan=${redirectPlan}&frequency=${redirectFrequency}`);
    } else {
      router.push(safeRedirect(redirect));
    }
  }

  function handleGoogleError(errorMsg: string) {
    setError(errorMsg);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }

    setLoading(true);
    try {
      const data = await api.signup(email, password);
      setToken(data.access_token as string);
      if (data.refresh_token) setRefreshToken(data.refresh_token as string);
      if (redirectPlan && redirectFrequency) {
        router.push(`/billing/checkout?plan=${redirectPlan}&frequency=${redirectFrequency}`);
      } else {
        router.push(safeRedirect(redirect));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={<span className="font-light tracking-tighter">Create your account</span>}
      description="Join thousands of creators turning rough ideas into production-ready prompts."
      heroImageSrc={HERO_IMAGE}
      testimonials={TESTIMONIALS}
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="animate-element animate-delay-300">
          <label htmlFor="email" className="text-sm font-medium text-[var(--text-secondary)]">
            Email address
          </label>
          <GlassInputWrapper>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </GlassInputWrapper>
        </div>

        <div className="animate-element animate-delay-400">
          <label htmlFor="password" className="text-sm font-medium text-[var(--text-secondary)]">
            Password
          </label>
          <GlassInputWrapper>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer absolute inset-y-0 right-3 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </GlassInputWrapper>
        </div>

        <div className="animate-element animate-delay-500">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--text-secondary)]">
            Confirm password
          </label>
          <GlassInputWrapper>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </GlassInputWrapper>
        </div>

        {error && (
          <div className="animate-element animate-delay-500 p-3 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="animate-element animate-delay-600 cursor-pointer w-full rounded-2xl py-4 font-medium text-black disabled:opacity-50 transition-all hover:brightness-110"
          style={{ background: "linear-gradient(135deg, #22d3ee, #14b8a6)" }}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <div className="animate-element animate-delay-700 relative flex items-center justify-center">
        <span className="w-full border-t border-white/[0.08]" />
        <span className="px-4 text-sm text-[var(--text-muted)] bg-[var(--bg-deep)] absolute">
          Or continue with
        </span>
      </div>

      <div className="animate-element animate-delay-800">
        <GoogleSignIn
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          onMfaRequired={() => router.push("/login")}
          buttonText="signup_with"
        />
      </div>

      <p className="animate-element animate-delay-900 text-center text-sm text-[var(--text-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--brand-cyan)] hover:text-[var(--brand-teal)] font-medium transition-colors">
          Sign in
        </Link>
      </p>

      <p className="animate-element animate-delay-1000 text-center text-xs text-[var(--text-muted)]">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-[var(--brand-cyan)]/80 hover:text-[var(--brand-cyan)] transition-colors">Terms</Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-[var(--brand-cyan)]/80 hover:text-[var(--brand-cyan)] transition-colors">Privacy Policy</Link>.
      </p>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[var(--text-muted)]">Loading…</div>}>
      <SignupContent />
    </Suspense>
  );
}
