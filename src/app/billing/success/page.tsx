"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface UserInfo {
  email?: string;
  plan_id?: string;
  subscription_status?: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await api.me();
        setUserInfo(data as unknown as UserInfo);
      } catch {
        // User might not be logged in, that's okay
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* Success icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
        <p className="mt-2 text-gray-600">
          Thank you for subscribing to PromptAI.
        </p>

        {loading ? (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Loading your account info...</p>
          </div>
        ) : userInfo ? (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
            <h2 className="font-medium text-gray-900 mb-2">Your Subscription</h2>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Email:</dt>
                <dd className="text-gray-900">{userInfo.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Plan:</dt>
                <dd className="text-gray-900 capitalize">
                  {userInfo.plan_id?.toLowerCase() || "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Status:</dt>
                <dd className="text-green-600 capitalize">
                  {userInfo.subscription_status?.toLowerCase() || "Active"}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          <p className="text-sm text-gray-600">
            Your license is now active. You can start using the Chrome extension right away.
          </p>

          {sessionId && (
            <p className="text-xs text-gray-400">
              Session: {sessionId.slice(0, 20)}...
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full py-3 px-4 rounded-lg font-medium bg-teal-500 text-white hover:bg-teal-600 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-lg font-medium border text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-8 p-4 border border-teal-200 bg-teal-50 rounded-lg">
          <h3 className="font-medium text-teal-900">Next Steps</h3>
          <ol className="mt-2 text-sm text-teal-800 text-left list-decimal list-inside space-y-1">
            <li>Install the PromptAI Chrome extension</li>
            <li>Log in with your email and password</li>
            <li>Select any text and click &quot;Perfect&quot; to enhance</li>
          </ol>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
