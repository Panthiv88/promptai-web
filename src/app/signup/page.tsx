"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";
import Link from "next/link";
import GoogleSignIn from "@/components/GoogleSignIn";

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

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const data = await api.signup(email, password);
      setToken(data.access_token as string);

      // If there's a plan redirect, go to checkout
      if (redirectPlan && redirectFrequency) {
        router.push(`/billing/checkout?plan=${redirectPlan}&frequency=${redirectFrequency}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-gray-600">
            Start transforming your prompts today
          </p>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-8">
          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              style={{ backgroundImage: "linear-gradient(180deg, #22D3EE, #14B8A6)" }}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
          </div>

          <GoogleSignIn
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            buttonText="signup_with"
          />

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium hover:underline" style={{ color: "#14B8A6" }}>
              Log in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="hover:underline" style={{ color: "#14B8A6" }}>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="hover:underline" style={{ color: "#14B8A6" }}>
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
