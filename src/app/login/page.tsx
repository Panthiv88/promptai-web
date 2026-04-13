"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { setToken, setRefreshToken } from "@/lib/auth";
import Link from "next/link";
import GoogleSignIn from "@/components/GoogleSignIn";
import posthog from "posthog-js";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  function safeRedirect(url: string | null): string {
    if (!url) return "/dashboard";
    // Only allow relative paths — must start with / but not // (protocol-relative = external)
    if (url.startsWith("/") && !url.startsWith("//")) return url;
    return "/dashboard";
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // MFA state
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
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-white">Two-Factor Authentication</h1>
            <p className="mt-2 text-[--text-secondary]">Enter the 6-digit code from your authenticator app</p>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <form className="space-y-5" onSubmit={onMfaSubmit}>
              <div>
                <label htmlFor="mfaCode" className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                  Authentication code
                </label>
                <input
                  id="mfaCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={8}
                  className="w-full rounded-xl px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[--text-muted] focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm text-center tracking-[0.3em] text-lg"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\s/g, ""))}
                />
                <p className="mt-2 text-xs text-[--text-muted]">You can also use a recovery code</p>
              </div>

              {error && (
                <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={mfaLoading}
                className="w-full py-3 px-4 text-white rounded-xl font-medium transition-all hover:brightness-110 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
              >
                {mfaLoading ? "Verifying..." : "Verify"}
              </button>
            </form>

            <button
              onClick={() => { setMfaRequired(false); setMfaCode(""); setError(""); }}
              className="mt-4 w-full text-center text-sm text-[--text-muted] hover:text-[--text-secondary] transition-colors"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-[--text-secondary]">Log in to your PromptAI account</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full rounded-xl px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[--text-muted] focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-[--text-secondary]">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full rounded-xl px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[--text-muted] focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-white rounded-xl font-medium transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-[--bg-surface] text-[--text-muted] text-xs">or</span>
              </div>
            </div>
          </div>

          <GoogleSignIn
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            onMfaRequired={(token) => { setMfaRequired(true); setMfaToken(token); }}
            buttonText="signin_with"
          />

          <p className="mt-6 text-center text-sm text-[--text-muted]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[--text-muted]">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
