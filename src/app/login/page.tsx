"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { setToken, setRefreshToken } from "@/lib/auth";
import Link from "next/link";
import GoogleSignIn from "@/components/GoogleSignIn";
import posthog from "posthog-js";
import { AuthShell, GlassInputWrapper, type Testimonial } from "@/components/ui/auth-shell";

const TESTIMONIALS: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahwrites",
    text: "PromptAI turned my one-line ideas into polished briefs. My output doubled in a week.",
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Marcus Johnson",
    handle: "@marcusbuilds",
    text: "It is the fastest prompt-polisher I have used. Ships straight into ChatGPT and Claude.",
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "David Martinez",
    handle: "@davidcreates",
    text: "The community page alone is worth it — I borrow a new prompt every single day.",
  },
];

const HERO_IMAGE = "https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  function safeRedirect(url: string | null): string {
    if (!url) return "/dashboard";
    if (url.startsWith("/") && !url.startsWith("//")) return url;
    return "/dashboard";
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);

  function handleGoogleSuccess() {
    router.push(safeRedirect(redirect));
  }

  function handleGoogleError(errorMsg: string) {
    setError(errorMsg);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login(email, password);
      if (data.mfa_required) {
        setMfaRequired(true);
        setMfaToken(data.mfa_token as string);
        return;
      }
      setToken(data.access_token as string);
      if (data.refresh_token) setRefreshToken(data.refresh_token as string);
      posthog.identify(email, { email });
      router.push(safeRedirect(redirect));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function onMfaSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMfaLoading(true);
    try {
      const data = await api.mfaVerify(mfaToken, mfaCode);
      setToken(data.access_token as string);
      if (data.refresh_token) setRefreshToken(data.refresh_token as string);
      posthog.identify(email, { email });
      router.push(safeRedirect(redirect));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "MFA verification failed");
    } finally {
      setMfaLoading(false);
    }
  }

  if (mfaRequired) {
    return (
      <AuthShell
        title={<span className="font-light tracking-tighter">Two-factor check</span>}
        description="Enter the 6-digit code from your authenticator app (or a recovery code)."
        heroImageSrc={HERO_IMAGE}
        testimonials={TESTIMONIALS}
      >
        <form className="space-y-5" onSubmit={onMfaSubmit}>
          <div className="animate-element animate-delay-300">
            <label htmlFor="mfaCode" className="text-sm font-medium text-[var(--text-secondary)]">
              Authentication code
            </label>
            <GlassInputWrapper>
              <input
                id="mfaCode"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={8}
                className="w-full bg-transparent text-lg text-center tracking-[0.3em] p-4 rounded-2xl focus:outline-none"
                placeholder="000000"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\s/g, ""))}
              />
            </GlassInputWrapper>
          </div>

          {error && (
            <div className="animate-element animate-delay-400 p-3 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={mfaLoading}
            className="animate-element animate-delay-500 cursor-pointer w-full rounded-2xl py-4 font-medium text-black disabled:opacity-50 transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #22d3ee, #14b8a6)" }}
          >
            {mfaLoading ? "Verifying…" : "Verify"}
          </button>
        </form>

        <button
          onClick={() => { setMfaRequired(false); setMfaCode(""); setError(""); }}
          className="animate-element animate-delay-600 cursor-pointer text-center text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          ← Back to login
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={<span className="font-light tracking-tighter">Welcome back</span>}
      description="Sign in to access your saved prompts, community, and enhancement history."
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
                autoComplete="current-password"
                required
                className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                placeholder="Enter your password"
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

        <div className="animate-element animate-delay-500 flex items-center justify-end text-sm">
          <Link href="/forgot-password" className="text-[var(--brand-cyan)] hover:text-[var(--brand-teal)] transition-colors">
            Forgot password?
          </Link>
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
          {loading ? "Signing in…" : "Sign in"}
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
          onMfaRequired={(token) => { setMfaRequired(true); setMfaToken(token); }}
          buttonText="signin_with"
        />
      </div>

      <p className="animate-element animate-delay-900 text-center text-sm text-[var(--text-muted)]">
        New to PromptAI?{" "}
        <Link href="/signup" className="text-[var(--brand-cyan)] hover:text-[var(--brand-teal)] font-medium transition-colors">
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[var(--text-muted)]">Loading…</div>}>
      <LoginContent />
    </Suspense>
  );
}
