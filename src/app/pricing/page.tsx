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
      router.push(`/signup?plan=${plan}&frequency=${frequency}`);
    } else {
      router.push(`/billing/checkout?plan=${plan}&frequency=${frequency}`);
    }
  }

  return (
    <main className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollAnimation animation="fade-up">
          <div className="text-center mb-10">
            <Link href="/" className="text-sm text-[--text-muted] hover:text-[--text-secondary] transition-colors">
              &larr; Back to home
            </Link>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mt-6">Choose your plan</h1>
            <p className="text-[--text-secondary] mt-3">
              Start with a 5-day free trial. 1 prompt per day, no credit card required.
            </p>
          </div>
        </ScrollAnimation>

        {/* Billing frequency toggle */}
        <ScrollAnimation animation="fade-up" delay={100}>
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-xl border border-white/[0.06] p-1 bg-white/[0.02]">
              {(["MONTHLY", "QUARTERLY", "ANNUAL"] as BillingFrequency[]).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFrequency(freq)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    frequency === freq
                      ? "bg-white/[0.08] text-white shadow-sm"
                      : "text-[--text-muted] hover:text-[--text-secondary]"
                  }`}
                >
                  {freq.charAt(0) + freq.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </ScrollAnimation>

        {/* Plans grid */}
        <StaggeredAnimation animation="fade-up" staggerDelay={150} className="grid md:grid-cols-2 gap-5">
          {(["BASIC", "PRO"] as const).map((planKey) => {
            const plan = PLANS[planKey];
            const price = plan.prices[frequency];
            const isPro = planKey === "PRO";

            return (
              <div
                key={planKey}
                className={`glass-card rounded-2xl p-7 relative transition-all ${
                  isPro ? "border-teal-500/30" : ""
                }`}
                style={isPro ? { boxShadow: "0 0 50px rgba(20,184,166,0.08)" } : {}}
              >
                {isPro && (
                  <span
                    className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
                  >
                    Most Popular
                  </span>
                )}

                <h2 className="text-xl font-display font-bold text-white">{plan.name}</h2>
                <p className="text-sm text-[--text-muted] mt-1">{plan.description}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold text-white">${price.amount}</span>
                  <span className="text-[--text-muted] text-sm">
                    /{frequency === "MONTHLY" ? "mo" : frequency === "QUARTERLY" ? "qtr" : "yr"}
                  </span>
                  {price.savings && (
                    <span className="ml-2 text-xs font-medium text-teal-400">{price.savings}</span>
                  )}
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-[--text-secondary]">
                      <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(planKey)}
                  className={`w-full mt-7 py-3 rounded-xl text-sm font-semibold transition-all hover:brightness-110 ${
                    isPro
                      ? "text-white"
                      : "text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08]"
                  }`}
                  style={isPro ? { background: "linear-gradient(135deg, #14b8a6, #0d9488)" } : {}}
                >
                  Get Started
                </button>
              </div>
            );
          })}
        </StaggeredAnimation>

        {/* Trial info */}
        <ScrollAnimation animation="fade-up" delay={300}>
          <div className="mt-10 text-center text-sm text-[--text-muted]">
            <p>All plans include a 5-day free trial with 1 prompt per day.</p>
            <p className="mt-1">Cancel anytime. No questions asked.</p>
          </div>
        </ScrollAnimation>
      </div>
    </main>
  );
}
