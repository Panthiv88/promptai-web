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
      } catch { /* User might not be logged in */ }
      finally { setLoading(false); }
    }
    loadUser();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}>
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-display text-2xl font-bold text-white">Payment Successful!</h1>
        <p className="mt-2 text-[--text-secondary]">Thank you for subscribing to PromptAI.</p>

        {loading ? (
          <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-sm text-[--text-muted]">Loading your account info...</p>
          </div>
        ) : userInfo ? (
          <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left">
            <h2 className="font-medium text-white text-sm mb-2">Your Subscription</h2>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-[--text-muted]">Email:</dt>
                <dd className="text-white">{userInfo.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[--text-muted]">Plan:</dt>
                <dd className="text-white capitalize">{userInfo.plan_id?.toLowerCase() || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[--text-muted]">Status:</dt>
                <dd className="text-teal-400 capitalize">{userInfo.subscription_status?.toLowerCase() || "Active"}</dd>
              </div>
            </dl>
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          <p className="text-sm text-[--text-secondary]">Your license is now active. You can start using the Chrome extension right away.</p>
          {sessionId && <p className="text-xs text-[--text-muted]">Session: {sessionId.slice(0, 20)}...</p>}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/dashboard" className="w-full py-3 rounded-xl font-medium text-white text-sm transition-all hover:brightness-110" style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}>
            Go to Dashboard
          </Link>
          <Link href="/" className="w-full py-3 rounded-xl font-medium text-sm border border-white/[0.08] text-[--text-secondary] hover:text-white hover:bg-white/[0.03] transition-all">
            Back to Home
          </Link>
        </div>

        <div className="mt-8 p-4 rounded-xl border border-teal-500/15 bg-teal-500/5">
          <h3 className="font-medium text-teal-400 text-sm">Next Steps</h3>
          <ol className="mt-2 text-sm text-teal-300/80 text-left list-decimal list-inside space-y-1">
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[--text-muted]">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
