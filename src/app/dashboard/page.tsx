"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import Link from "next/link";

interface UserData {
  email: string;
  subscription_status: string;
  plan_id: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
}

interface AnalyticsData {
  total_prompts_enhanced: number;
  total_followups_used: number;
  account_created: string | null;
  has_license: boolean;
}

const PLAN_FEATURES = {
  BASIC: {
    name: "Basic",
    followUps: "5 per thread",
    prompts: "Unlimited",
  },
  PRO: {
    name: "Pro",
    followUps: "Unlimited",
    prompts: "Unlimited",
  },
};

// Map Stripe price IDs to plan names
function getPlanFromPriceId(priceId: string | null): { name: string; key: "BASIC" | "PRO" | null } {
  if (!priceId) return { name: "Free Trial", key: null };

  const id = priceId.toLowerCase();

  // Check if it's already a plan name
  if (id === "basic" || id === "pro") {
    return { name: id.charAt(0).toUpperCase() + id.slice(1), key: id.toUpperCase() as "BASIC" | "PRO" };
  }

  // For price IDs, we need to determine the plan from the price
  // This is a temporary solution - ideally the backend should store the plan name
  // For now, we'll fetch from environment or use a reasonable default

  // Check environment variables for price ID mapping
  const basicPrices = [
    process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_QUARTERLY,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_ANNUAL,
  ].filter(Boolean);

  const proPrices = [
    process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_QUARTERLY,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL,
  ].filter(Boolean);

  if (basicPrices.includes(priceId)) {
    return { name: "Basic", key: "BASIC" };
  }
  if (proPrices.includes(priceId)) {
    return { name: "Pro", key: "PRO" };
  }

  // Default: assume Basic if we can't determine
  return { name: "Basic", key: "BASIC" };
}

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<UserData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    async function load() {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const data = await api.me();
        setMe(data as unknown as UserData);

        // Fetch analytics data
        try {
          const analyticsData = await api.getAnalytics();
          setAnalytics(analyticsData as unknown as AnalyticsData);
        } catch {
          // Analytics fetch failed - not critical, continue without it
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load user";
        setError(message);
        clearToken();
        router.push("/login");
      }
    }
    load();
  }, [router]);

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const result = await api.getPortalSession();
      const portalUrl = result.portalUrl as string | undefined;
      if (portalUrl) {
        window.location.href = portalUrl;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to open billing portal";
      setError(message);
    } finally {
      setPortalLoading(false);
    }
  }

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  async function handleCancelSubscription() {
    setCancelLoading(true);
    setError("");
    try {
      const result = await api.cancelSubscription();
      setSuccessMessage(result.message as string || "Subscription cancelled successfully");
      // Update local state
      if (me) {
        setMe({
          ...me,
          cancel_at_period_end: true,
        });
      }
      setShowCancelModal(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to cancel subscription";
      setError(message);
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleReactivateSubscription() {
    setCancelLoading(true);
    setError("");
    try {
      const result = await api.reactivateSubscription();
      setSuccessMessage(result.message as string || "Subscription reactivated!");
      // Update local state
      if (me) {
        setMe({
          ...me,
          cancel_at_period_end: false,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reactivate subscription";
      setError(message);
    } finally {
      setCancelLoading(false);
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  function getStatusBadge(status: string | null, cancelAtPeriodEnd: boolean) {
    const normalizedStatus = (status || "").toLowerCase();

    if (cancelAtPeriodEnd) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
          Cancelling
        </span>
      );
    }

    switch (normalizedStatus) {
      case "active":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
            Active
          </span>
        );
      case "trialing":
      case "trial":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
            Trial
          </span>
        );
      case "past_due":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
            Past Due
          </span>
        );
      case "canceled":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
            {status || "Unknown"}
          </span>
        );
    }
  }

  const { name: planDisplayName, key: planKey } = getPlanFromPriceId(me?.plan_id || null);
  const planInfo = planKey ? PLAN_FEATURES[planKey] : null;
  // User has subscription if they have a stripe_customer_id OR an active/trialing status with a plan
  const hasSubscription = (me?.stripe_customer_id || (me?.subscription_status === "active" && me?.plan_id)) && me?.subscription_status !== "canceled";
  const isTrialOrNoPlan = !me?.plan_id || me?.subscription_status === "trialing" || me?.subscription_status === "trial";

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-600">Manage your PromptAI account</p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex justify-between items-center">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage("")} className="text-green-500 hover:text-green-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {!me ? (
          <div className="border rounded-xl p-6">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Account Info */}
            <div className="border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Account</h2>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Email</dt>
                  <dd className="text-gray-900">{me.email}</dd>
                </div>
              </dl>
            </div>

            {/* Usage Analytics */}
            <div className="border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Usage Analytics</h2>
              {analytics ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-100">
                    <div className="text-3xl font-bold text-teal-600">
                      {analytics.total_prompts_enhanced}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Prompts Enhanced</div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-100">
                    <div className="text-3xl font-bold text-cyan-600">
                      {analytics.total_followups_used}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Follow-ups Used</div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">Loading analytics...</div>
              )}
              {analytics?.account_created && (
                <p className="mt-4 text-xs text-gray-500">
                  Member since {formatDate(analytics.account_created)}
                </p>
              )}
            </div>

            {/* Subscription Info */}
            <div className="border rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">Subscription</h2>
                {getStatusBadge(me.subscription_status, me.cancel_at_period_end)}
              </div>

              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Plan</dt>
                  <dd className="text-gray-900">{planDisplayName}</dd>
                </div>

                {me.trial_ends_at && isTrialOrNoPlan && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Trial Ends</dt>
                    <dd className="text-gray-900">{formatDate(me.trial_ends_at)}</dd>
                  </div>
                )}

                {me.current_period_end && !isTrialOrNoPlan && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">
                      {me.cancel_at_period_end ? "Access Until" : "Next Billing"}
                    </dt>
                    <dd className="text-gray-900">{formatDate(me.current_period_end)}</dd>
                  </div>
                )}

                {me.cancel_at_period_end && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Your subscription will end on {formatDate(me.current_period_end)}.
                      You can reactivate anytime before then.
                    </p>
                  </div>
                )}
              </dl>

              <div className="mt-6 flex flex-wrap gap-3">
                {hasSubscription ? (
                  <>
                    <button
                      onClick={handleManageSubscription}
                      disabled={portalLoading}
                      className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      {portalLoading ? "Loading..." : "Manage Billing"}
                    </button>

                    {me.cancel_at_period_end ? (
                      <button
                        onClick={handleReactivateSubscription}
                        disabled={cancelLoading}
                        className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition-colors"
                      >
                        {cancelLoading ? "Processing..." : "Reactivate Subscription"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </>
                ) : (
                  <Link
                    href="/pricing"
                    className="px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors"
                  >
                    Upgrade Now
                  </Link>
                )}

                {planKey === "BASIC" && hasSubscription && !me.cancel_at_period_end && (
                  <Link
                    href="/pricing"
                    className="px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors"
                  >
                    Upgrade to Pro
                  </Link>
                )}
              </div>
            </div>

            {/* Plan Features */}
            {planInfo && (
              <div className="border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Your Plan Features</h2>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Prompt Enhancements</dt>
                    <dd className="text-gray-900">{planInfo.prompts}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Follow-ups</dt>
                    <dd className="text-gray-900">{planInfo.followUps}</dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Quick Links */}
            <div className="border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://chrome.google.com/webstore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Get Chrome Extension
                </a>
                <a
                  href="mailto:support@promptai.com"
                  className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cancel Subscription</h3>
            </div>

            <p className="text-gray-600 mb-2">
              Are you sure you want to cancel your subscription?
            </p>

            <ul className="text-sm text-gray-500 mb-6 space-y-1">
              <li>• You&apos;ll keep access until {formatDate(me?.current_period_end || null)}</li>
              <li>• You can reactivate anytime before then</li>
              <li>• Your data will be preserved</li>
            </ul>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
