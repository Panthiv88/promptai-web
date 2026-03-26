"use client";

import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="font-display text-2xl font-bold text-white">Payment Cancelled</h1>
        <p className="mt-2 text-[--text-secondary]">Your payment was not processed. No charges were made.</p>

        <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left">
          <h2 className="font-medium text-white text-sm mb-2">What happened?</h2>
          <p className="text-sm text-[--text-secondary]">
            You cancelled the checkout process before completing payment.
            Your account has not been charged and no subscription was created.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/pricing" className="w-full py-3 rounded-xl font-medium text-white text-sm transition-all hover:brightness-110" style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}>
            Try Again
          </Link>
          <Link href="/dashboard" className="w-full py-3 rounded-xl font-medium text-sm border border-white/[0.08] text-[--text-secondary] hover:text-white hover:bg-white/[0.03] transition-all">
            Go to Dashboard
          </Link>
          <Link href="/" className="w-full py-3 rounded-xl font-medium text-sm text-[--text-muted] hover:text-[--text-secondary] transition-colors">
            Back to Home
          </Link>
        </div>

        <div className="mt-8 text-sm text-[--text-muted]">
          <p>Questions? Contact us at <a href="mailto:support@promptai360.com" className="text-teal-400 hover:text-teal-300">support@promptai360.com</a></p>
        </div>
      </div>
    </main>
  );
}
