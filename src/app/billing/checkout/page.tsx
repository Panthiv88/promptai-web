"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import Link from "next/link";

const PLAN_DETAILS = {
  BASIC: {
    name: "Basic",
    prices: {
      MONTHLY: { amount: 10, period: "month" },
      QUARTERLY: { amount: 28, period: "quarter" },
      ANNUAL: { amount: 109, period: "year" },
    },
  },
  PRO: {
    name: "Pro",
    prices: {
      MONTHLY: { amount: 20, period: "month" },
      QUARTERLY: { amount: 58, period: "quarter" },
      ANNUAL: { amount: 228, period: "year" },
    },
  },
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const plan = (searchParams.get("plan") || "BASIC").toUpperCase() as "BASIC" | "PRO";
  const frequency = (searchParams.get("frequency") || "MONTHLY").toUpperCase() as "MONTHLY" | "QUARTERLY" | "ANNUAL";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push(`/login?redirect=/billing/checkout?plan=${plan}&frequency=${frequency}`);
    }
  }, [router, plan, frequency]);

  const planInfo = PLAN_DETAILS[plan] || PLAN_DETAILS.BASIC;
  const priceInfo = planInfo.prices[frequency] || planInfo.prices.MONTHLY;

  async function handleCheckout() {
    setLoading(true);
    setError("");
    try {
      const result = await api.createCheckoutSession(plan, frequency);
      const checkoutUrl = result.checkoutUrl as string | undefined;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setError("Failed to create checkout session");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      if (message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("invalid token") || message.toLowerCase().includes("missing") || message.toLowerCase().includes("401")) {
        router.push(`/login?redirect=/billing/checkout?plan=${plan}&frequency=${frequency}`);
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-card rounded-2xl p-7">
        <Link href="/pricing" className="text-xs text-[--text-muted] hover:text-[--text-secondary] transition-colors">
          &larr; Back to pricing
        </Link>

        <h1 className="font-display text-xl font-bold text-white mt-4">Complete Your Purchase</h1>

        <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-white text-sm">{planInfo.name} Plan</p>
              <p className="text-xs text-[--text-muted] capitalize">{frequency.toLowerCase()} billing</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-display font-bold text-white">${priceInfo.amount}</p>
              <p className="text-xs text-[--text-muted]">per {priceInfo.period}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2.5 text-sm text-[--text-secondary]">
          {["Secure payment via Stripe", "Cancel anytime", "Instant activation"].map((text) => (
            <div key={text} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs">{text}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full mt-6 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:brightness-110"
          style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
        >
          {loading ? "Redirecting to Stripe..." : `Pay $${priceInfo.amount}`}
        </button>

        <p className="mt-4 text-[10px] text-[--text-muted] text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[--text-muted]">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
