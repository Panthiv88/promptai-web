"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { setToken, setRefreshToken } from "@/lib/auth";
import Link from "next/link";
import GoogleSignIn from "@/components/GoogleSignIn";

// If an existing user with MFA signs in via Google on signup page,
// redirect them to login for the MFA flow.

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPlan = searchParams.get("plan");
  const redirectFrequency = searchParams.get("frequency");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleGoogleSuccess() {
    if (redirectPlan && redirectFrequency) {
      router.push(`/billing/checkout?plan=${redirectPlan}&frequency=${redirectFrequency}`);
    } else {
      router.push("/dashboard");
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
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-[--text-secondary]">Start transforming your prompts today</p>
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
              <label htmlFor="password" className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                className="w-full rounded-xl px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[--text-muted] focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="w-full rounded-xl px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[--text-muted] focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Creating account..." : "Create account"}
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
            onMfaRequired={() => router.push("/login")}
            buttonText="signup_with"
          />

          <p className="mt-6 text-center text-sm text-[--text-muted]">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
              Log in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-[--text-muted]">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-teal-400/70 hover:text-teal-400 transition-colors">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-teal-400/70 hover:text-teal-400 transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[--text-muted]">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
