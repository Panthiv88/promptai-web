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
  const frequency = (searchParams.get("frequency") || "MONTHLY").toUpperCase() as
    | "MONTHLY"
    | "QUARTERLY"
    | "ANNUAL";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check auth on mount
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
        // Redirect to Stripe Checkout
        window.location.href = checkoutUrl;
      } else {
        setError("Failed to create checkout session");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-xl p-6">
        <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to pricing
        </Link>

        <h1 className="text-2xl font-semibold mt-4">Complete Your Purchase</h1>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{planInfo.name} Plan</p>
              <p className="text-sm text-gray-600 capitalize">
                {frequency.toLowerCase()} billing
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${priceInfo.amount}</p>
              <p className="text-sm text-gray-600">per {priceInfo.period}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3 text-sm text-gray-600">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
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
            Secure payment via Stripe
          </div>
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
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
            Cancel anytime
          </div>
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
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
            Instant activation
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full mt-6 py-3 px-4 rounded-lg font-medium bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Redirecting to Stripe..." : `Pay $${priceInfo.amount}`}
        </button>

        <p className="mt-4 text-xs text-gray-500 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
