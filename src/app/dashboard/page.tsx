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

function getPlanFromPriceId(priceId: string | null): { name: string; key: "BASIC" | "PRO" | null } {
  if (!priceId) return { name: "Free Trial", key: null };

  const id = priceId.toLowerCase();

  if (id === "basic" || id === "pro") {
    return { name: id.charAt(0).toUpperCase() + id.slice(1), key: id.toUpperCase() as "BASIC" | "PRO" };
  }

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

  return { name: "Basic", key: "BASIC" };
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  iconBg,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-lg"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
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

        try {
          const analyticsData = await api.getAnalytics();
          setAnalytics(analyticsData as unknown as AnalyticsData);
        } catch {
          // Analytics fetch failed - not critical
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
      if (me) {
        setMe({ ...me, cancel_at_period_end: true });
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
      if (me) {
        setMe({ ...me, cancel_at_period_end: false });
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
        <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
          Cancelling
        </span>
      );
    }

    switch (normalizedStatus) {
      case "active":
        return (
          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
            Active
          </span>
        );
      case "trialing":
      case "trial":
        return (
          <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
            Trial
          </span>
        );
      case "past_due":
        return (
          <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
            Past Due
          </span>
        );
      case "canceled":
        return (
          <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
            {status || "Unknown"}
          </span>
        );
    }
  }

  const { name: planDisplayName, key: planKey } = getPlanFromPriceId(me?.plan_id || null);
  const planInfo = planKey ? PLAN_FEATURES[planKey] : null;
  const hasSubscription = (me?.stripe_customer_id || (me?.subscription_status === "active" && me?.plan_id)) && me?.subscription_status !== "canceled";
  const isTrialOrNoPlan = !me?.plan_id || me?.subscription_status === "trialing" || me?.subscription_status === "trial";

  // Calculate days as member
  const daysSinceCreated = analytics?.account_created
    ? Math.floor((Date.now() - new Date(analytics.account_created).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Pages / Dashboard</p>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex justify-between items-center">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage("")} className="text-green-500 hover:text-green-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {!me ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Prompts Enhanced"
                value={analytics?.total_prompts_enhanced ?? 0}
                subtitle="Total all time"
                iconBg="linear-gradient(135deg, #14B8A6, #0D9488)"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              />
              <StatCard
                title="Follow-ups Used"
                value={analytics?.total_followups_used ?? 0}
                subtitle="Total all time"
                iconBg="linear-gradient(135deg, #22D3EE, #06B6D4)"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              />
              <StatCard
                title="Current Plan"
                value={planDisplayName}
                subtitle={hasSubscription ? "Active subscription" : "Upgrade for more"}
                iconBg="linear-gradient(135deg, #8B5CF6, #7C3AED)"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                }
              />
              <StatCard
                title="Days as Member"
                value={daysSinceCreated}
                subtitle={analytics?.account_created ? `Since ${formatDate(analytics.account_created)}` : "Welcome!"}
                iconBg="linear-gradient(135deg, #F59E0B, #D97706)"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Subscription Card - Takes 2 columns */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your plan and billing</p>
                  </div>
                  {getStatusBadge(me.subscription_status, me.cancel_at_period_end)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Plan</p>
                    <p className="text-lg font-semibold text-gray-900">{planDisplayName}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">
                      {me.cancel_at_period_end
                        ? "Access Until"
                        : me.current_period_end
                          ? "Next Billing"
                          : me.trial_ends_at
                            ? "Trial Ends"
                            : "Billing Date"}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(me.current_period_end || me.trial_ends_at)}
                    </p>
                  </div>
                </div>

                {me.cancel_at_period_end && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Your subscription will end on {formatDate(me.current_period_end)}.
                      You can reactivate anytime before then.
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {hasSubscription ? (
                    <>
                      <button
                        onClick={handleManageSubscription}
                        disabled={portalLoading}
                        className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm font-medium"
                      >
                        {portalLoading ? "Loading..." : "Manage Billing"}
                      </button>

                      {me.cancel_at_period_end ? (
                        <button
                          onClick={handleReactivateSubscription}
                          disabled={cancelLoading}
                          className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition-colors text-sm font-medium"
                        >
                          {cancelLoading ? "Processing..." : "Reactivate"}
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowCancelModal(true)}
                          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          Cancel Subscription
                        </button>
                      )}
                    </>
                  ) : (
                    <Link
                      href="/pricing"
                      className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
                      style={{ background: "linear-gradient(135deg, #14B8A6, #0D9488)" }}
                    >
                      Upgrade Now
                    </Link>
                  )}

                  {planKey === "BASIC" && hasSubscription && !me.cancel_at_period_end && (
                    <Link
                      href="/pricing"
                      className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
                      style={{ background: "linear-gradient(135deg, #8B5CF6, #7C3AED)" }}
                    >
                      Upgrade to Pro
                    </Link>
                  )}
                </div>
              </div>

              {/* Account Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Account</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{me.email}</p>
                  </div>
                  {planInfo && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Prompt Enhancements</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">{planInfo.prompts}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Follow-ups per Thread</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">{planInfo.followUps}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  href="/demo"
                  className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 group-hover:bg-teal-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Try Demo</p>
                    <p className="text-xs text-gray-500">Enhance a prompt</p>
                  </div>
                </Link>

                <a
                  href="https://chrome.google.com/webstore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Chrome Extension</p>
                    <p className="text-xs text-gray-500">Enhance anywhere</p>
                  </div>
                </a>

                <a
                  href="mailto:support@promptai.com"
                  className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Contact Support</p>
                    <p className="text-xs text-gray-500">Get help</p>
                  </div>
                </a>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cancel Subscription</h3>
                <p className="text-sm text-gray-500">This action can be undone</p>
              </div>
            </div>

            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel your subscription?
            </p>

            <ul className="text-sm text-gray-500 mb-6 space-y-2 bg-gray-50 rounded-lg p-4">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Keep access until {formatDate(me?.current_period_end || null)}
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Reactivate anytime before then
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Your data will be preserved
              </li>
            </ul>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors font-medium"
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
