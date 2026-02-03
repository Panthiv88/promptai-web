"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn } from "@/lib/auth";
import { ScrollAnimation, StaggeredAnimation } from "@/components/ScrollAnimation";

type BillingFrequency = "MONTHLY" | "QUARTERLY" | "ANNUAL";

interface PriceInfo {
  amount: number;
  label: string;
  savings?: string;
}

interface Plan {
  name: string;
  description: string;
  features: string[];
  prices: Record<BillingFrequency, PriceInfo>;
}

const PLANS: Record<"BASIC" | "PRO", Plan> = {
  BASIC: {
    name: "Basic",
    description: "For individual users",
    features: [
      "Unlimited prompt enhancements",
      "5 follow-ups per thread",
      "Priority support",
    ],
    prices: {
      MONTHLY: { amount: 10, label: "$10/month" },
      QUARTERLY: { amount: 28, label: "$28/quarter", savings: "Save 7%" },
      ANNUAL: { amount: 109, label: "$109/year", savings: "Save 9%" },
    },
  },
  PRO: {
    name: "Pro",
    description: "For power users",
    features: [
      "Unlimited prompt enhancements",
      "Unlimited follow-ups",
      "Priority support",
      "Early access to new features",
    ],
    prices: {
      MONTHLY: { amount: 20, label: "$20/month" },
      QUARTERLY: { amount: 58, label: "$58/quarter", savings: "Save 3%" },
      ANNUAL: { amount: 228, label: "$228/year", savings: "Save 5%" },
    },
  },
};

export default function PricingPage() {
  const router = useRouter();
  const [frequency, setFrequency] = useState<BillingFrequency>("MONTHLY");

  function handleSelectPlan(plan: "BASIC" | "PRO") {
    if (!isLoggedIn()) {
      // Redirect to signup with plan info
      router.push(`/signup?plan=${plan}&frequency=${frequency}`);
    } else {
      // Redirect to checkout
      router.push(`/billing/checkout?plan=${plan}&frequency=${frequency}`);
    }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <ScrollAnimation animation="fade-up">
          <div className="text-center mb-8">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              &larr; Back to home
            </Link>
            <h1 className="text-3xl font-bold mt-4">Choose Your Plan</h1>
            <p className="text-gray-600 mt-2">
              Start with a 5-day free trial. 1 prompt per day, no credit card required.
            </p>
          </div>
        </ScrollAnimation>

        {/* Billing frequency toggle */}
        <ScrollAnimation animation="fade-up" delay={100}>
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg border p-1 bg-gray-50">
              {(["MONTHLY", "QUARTERLY", "ANNUAL"] as BillingFrequency[]).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFrequency(freq)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    frequency === freq
                      ? "bg-white shadow text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {freq.charAt(0) + freq.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </ScrollAnimation>

        {/* Plans grid */}
        <StaggeredAnimation animation="fade-up" staggerDelay={150} className="grid md:grid-cols-2 gap-6">
          {(["BASIC", "PRO"] as const).map((planKey) => {
            const plan = PLANS[planKey];
            const price = plan.prices[frequency];
            const isPro = planKey === "PRO";

            return (
              <div
                key={planKey}
                className={`border rounded-xl p-6 transition-all hover:shadow-lg ${
                  isPro ? "ring-2" : ""
                }`}
                style={isPro ? { borderColor: "#14B8A6", boxShadow: "0 0 0 2px #14B8A6" } : {}}
              >
                {isPro && (
                  <span
                    className="inline-block text-white text-xs font-semibold px-2 py-1 rounded mb-4"
                    style={{ backgroundColor: "#14B8A6" }}
                  >
                    Most Popular
                  </span>
                )}

                <h2 className="text-xl font-semibold">{plan.name}</h2>
                <p className="text-gray-600 text-sm mt-1">{plan.description}</p>

                <div className="mt-4">
                  <span className="text-3xl font-bold">${price.amount}</span>
                  <span className="text-gray-500 text-sm">
                    /{frequency === "MONTHLY" ? "mo" : frequency === "QUARTERLY" ? "qtr" : "yr"}
                  </span>
                  {price.savings && (
                    <span className="ml-2 text-green-600 text-sm font-medium">
                      {price.savings}
                    </span>
                  )}
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-sm">
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
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(planKey)}
                  className="w-full mt-6 py-3 px-4 rounded-lg font-medium transition-all hover:opacity-90 text-white"
                  style={{
                    backgroundImage: isPro
                      ? "linear-gradient(180deg, #22D3EE, #14B8A6)"
                      : "linear-gradient(180deg, #374151, #1f2937)"
                  }}
                >
                  Get Started
                </button>
              </div>
            );
          })}
        </StaggeredAnimation>

        {/* Trial info */}
        <ScrollAnimation animation="fade-up" delay={300}>
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>All plans include a 5-day free trial with 1 prompt per day.</p>
            <p className="mt-1">Cancel anytime. No questions asked.</p>
          </div>
        </ScrollAnimation>
      </div>
    </main>
  );
}
