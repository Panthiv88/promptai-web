"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";
import Link from "next/link";
import GoogleSignIn from "@/components/GoogleSignIn";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleGoogleSuccess() {
    if (redirect) {
      router.push(redirect);
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
    setLoading(true);

    try {
      const data = await api.login(email, password);
      setToken(data.access_token as string);

      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-gray-600">
            Log in to your PromptAI account
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
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm hover:underline" style={{ color: "#14B8A6" }}>
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Logging in..." : "Log in"}
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
            buttonText="signin_with"
          />

          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium hover:underline" style={{ color: "#14B8A6" }}>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
