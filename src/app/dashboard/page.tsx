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
  total_saved_prompts: number;
  account_created: string | null;
  has_license: boolean;
}

interface SavedPromptItem {
  id: number;
  title: string;
  prompt_text: string;
  created_at: string;
  is_favorite: boolean;
}

const PLAN_FEATURES = {
  BASIC: { name: "Basic", followUps: "5 per thread", prompts: "Unlimited" },
  PRO: { name: "Pro", followUps: "Unlimited", prompts: "Unlimited" },
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
  if (basicPrices.includes(priceId)) return { name: "Basic", key: "BASIC" };
  if (proPrices.includes(priceId)) return { name: "Pro", key: "PRO" };
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
  const [recentSaved, setRecentSaved] = useState<SavedPromptItem[]>([]);

  useEffect(() => {
    async function load() {
      const token = getToken();
      if (!token) { router.push("/login"); return; }
      try {
        const data = await api.me();
        setMe(data as unknown as UserData);
        try {
          const analyticsData = await api.getAnalytics();
          setAnalytics(analyticsData as unknown as AnalyticsData);
        } catch { /* Analytics fetch failed - not critical */ }
        try {
          const savedData = await api.getSavedPrompts({ page: 1, per_page: 5 }) as unknown as { prompts: SavedPromptItem[] };
          setRecentSaved(savedData.prompts || []);
        } catch { /* Saved prompts fetch failed - not critical */ }
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
      if (portalUrl) window.location.href = portalUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to open billing portal");
    } finally { setPortalLoading(false); }
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
      if (me) setMe({ ...me, cancel_at_period_end: true });
      setShowCancelModal(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to cancel subscription");
    } finally { setCancelLoading(false); }
  }

  async function handleReactivateSubscription() {
    setCancelLoading(true);
    setError("");
    try {
      const result = await api.reactivateSubscription();
      setSuccessMessage(result.message as string || "Subscription reactivated!");
      if (me) setMe({ ...me, cancel_at_period_end: false });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reactivate subscription");
    } finally { setCancelLoading(false); }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch { return dateStr; }
  }

  const { name: planDisplayName, key: planKey } = getPlanFromPriceId(me?.plan_id || null);
  const planInfo = planKey ? PLAN_FEATURES[planKey] : null;
  const hasSubscription = (me?.stripe_customer_id || (me?.subscription_status === "active" && me?.plan_id)) && me?.subscription_status !== "canceled";
  const isTrialOrNoPlan = !me?.plan_id || me?.subscription_status === "trialing" || me?.subscription_status === "trial";
  const normalizedStatus = (me?.subscription_status || "").toLowerCase();

  /* ── Loading skeleton ── */
  if (!me) {
    return (
      <main className="min-h-screen p-6">
        <div className="w-full">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-white/[0.04] rounded-xl w-64" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-36 bg-white/[0.04] rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                <div className="h-40 bg-white/[0.04] rounded-2xl" />
                <div className="h-64 bg-white/[0.04] rounded-2xl" />
              </div>
              <div className="space-y-5">
                <div className="h-52 bg-white/[0.04] rounded-2xl" />
                <div className="h-44 bg-white/[0.04] rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const statusColor =
    me.cancel_at_period_end ? "bg-yellow-400" :
    normalizedStatus === "active" ? "bg-emerald-400" :
    normalizedStatus === "trialing" || normalizedStatus === "trial" ? "bg-blue-400" :
    "bg-gray-500";

  const statusLabel =
    me.cancel_at_period_end ? "Cancelling" :
    normalizedStatus === "active" ? "Active" :
    normalizedStatus === "trialing" || normalizedStatus === "trial" ? "Trial" :
    normalizedStatus || "Unknown";

  const statusBadgeClass =
    me.cancel_at_period_end ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
    normalizedStatus === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
    normalizedStatus === "trialing" || normalizedStatus === "trial" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
    "bg-white/[0.04] text-[--text-muted] border-white/[0.06]";

  return (
    <main className="min-h-screen">
      <div className="w-full px-4 sm:px-8 lg:px-12 py-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-sm text-[--text-muted] mt-0.5">
              Welcome back, <span className="text-[--text-secondary]">{me.email.split("@")[0]}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-teal-500/20 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              New Prompt
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-white/[0.08] text-[--text-secondary] hover:text-white hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ── Alerts ── */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] text-red-400 text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl border border-teal-500/20 bg-teal-500/[0.06] text-teal-400 text-sm flex justify-between items-center">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage("")} className="text-teal-500/60 hover:text-teal-400 transition-colors ml-4 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* Prompts Enhanced */}
          <div className="rounded-2xl p-5 text-white relative overflow-hidden cursor-default" style={{ background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)" }}>
            <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full bg-white/[0.07]" />
            <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-white/[0.04]" />
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-white/60 text-xs font-medium tracking-wide">Prompts Enhanced</p>
            <p className="text-3xl font-bold mt-1 tabular-nums">{analytics?.total_prompts_enhanced ?? 0}</p>
            <p className="text-white/50 text-xs mt-1">All time</p>
          </div>

          {/* Follow-ups */}
          <div className="glass-card rounded-2xl p-5 hover:border-cyan-500/20 transition-all duration-200 cursor-default">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-[--text-muted] text-xs font-medium tracking-wide">Follow-ups</p>
            <p className="text-2xl font-bold text-white mt-1 tabular-nums">{analytics?.total_followups_used ?? 0}</p>
            <p className="text-[--text-muted] text-xs mt-1">Refinements</p>
          </div>

          {/* Saved Prompts */}
          <Link href="/saved-prompts" className="glass-card rounded-2xl p-5 hover:border-purple-500/20 transition-all duration-200 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <p className="text-[--text-muted] text-xs font-medium tracking-wide">Saved Prompts</p>
            <p className="text-2xl font-bold text-white mt-1 tabular-nums">{analytics?.total_saved_prompts ?? 0}</p>
            <p className="text-[--text-muted] text-xs mt-1 group-hover:text-teal-400 transition-colors duration-200">View all →</p>
          </Link>

          {/* Plan + Status combined */}
          <div className="glass-card rounded-2xl p-5 hover:border-teal-500/20 transition-all duration-200 cursor-default">
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${statusColor} ${normalizedStatus === "active" ? "animate-pulse" : ""}`} />
                <span className="text-xs text-[--text-muted]">{statusLabel}</span>
              </div>
            </div>
            <p className="text-[--text-muted] text-xs font-medium tracking-wide">Current Plan</p>
            <p className="text-2xl font-bold text-white mt-1">{planDisplayName}</p>
            <p className="text-[--text-muted] text-xs mt-1">{planInfo ? planInfo.followUps : "Upgrade for more"}</p>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Account Card */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider mb-4">Account</h2>
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-lg shadow-teal-500/20"
                  style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
                >
                  {me.email.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-white truncate">{me.email}</p>
                  <p className="text-xs text-[--text-muted] mt-0.5">
                    Member since {analytics?.account_created ? formatDate(analytics.account_created) : "—"}
                  </p>
                </div>
                <Link
                  href="/dashboard/security"
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/[0.08] text-[--text-secondary] hover:text-white hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
                >
                  Security
                </Link>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider">Subscription</h2>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusBadgeClass}`}>
                  {statusLabel}
                </span>
              </div>

              {me.cancel_at_period_end && (
                <div className="mb-5 p-3.5 rounded-xl border border-yellow-500/15 bg-yellow-500/[0.06]">
                  <p className="text-xs text-yellow-400/90 leading-relaxed">
                    Your subscription ends on <span className="font-semibold">{formatDate(me.current_period_end)}</span>. Reactivate to keep access.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-[--text-muted] mb-1">Plan</p>
                  <p className="text-sm font-semibold text-white">{planDisplayName}</p>
                </div>
                {me.current_period_end && !isTrialOrNoPlan && (
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-xs text-[--text-muted] mb-1">{me.cancel_at_period_end ? "Access Until" : "Next Billing"}</p>
                    <p className="text-sm font-semibold text-white">{formatDate(me.current_period_end)}</p>
                  </div>
                )}
                {me.trial_ends_at && isTrialOrNoPlan && (
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-xs text-[--text-muted] mb-1">Trial Ends</p>
                    <p className="text-sm font-semibold text-white">{formatDate(me.trial_ends_at)}</p>
                  </div>
                )}
                {planInfo && (
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-xs text-[--text-muted] mb-1">Follow-ups</p>
                    <p className="text-sm font-semibold text-teal-400">{planInfo.followUps}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {hasSubscription ? (
                  <>
                    <button
                      onClick={handleManageSubscription}
                      disabled={portalLoading}
                      className="px-4 py-2 rounded-xl text-xs font-medium border border-white/[0.08] text-[--text-secondary] hover:text-white hover:bg-white/[0.04] disabled:opacity-50 transition-all duration-200 cursor-pointer"
                    >
                      {portalLoading ? "Loading..." : "Manage Billing"}
                    </button>
                    {me.cancel_at_period_end ? (
                      <button
                        onClick={handleReactivateSubscription}
                        disabled={cancelLoading}
                        className="px-4 py-2 rounded-xl text-xs font-medium text-white disabled:opacity-50 transition-all duration-200 hover:brightness-110 cursor-pointer"
                        style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
                      >
                        {cancelLoading ? "Processing..." : "Reactivate"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="px-4 py-2 rounded-xl text-xs font-medium border border-red-500/20 text-red-400 hover:bg-red-500/[0.06] transition-all duration-200 cursor-pointer"
                      >
                        Cancel Plan
                      </button>
                    )}
                  </>
                ) : (
                  <Link
                    href="/pricing"
                    className="px-4 py-2 rounded-xl text-xs font-medium text-white transition-all duration-200 hover:brightness-110 cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
                  >
                    Upgrade Now
                  </Link>
                )}
                {planKey === "BASIC" && hasSubscription && !me.cancel_at_period_end && (
                  <Link
                    href="/pricing"
                    className="px-4 py-2 rounded-xl text-xs font-medium text-teal-400 border border-teal-500/20 hover:bg-teal-500/[0.06] transition-all duration-200"
                  >
                    Upgrade to Pro
                  </Link>
                )}
              </div>
            </div>

            {/* Recent Saved Prompts */}
            {recentSaved.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider">Recent Saved Prompts</h2>
                  <Link href="/saved-prompts" className="text-xs text-teal-400 hover:text-teal-300 transition-colors duration-200">
                    View all →
                  </Link>
                </div>
                <div className="space-y-1">
                  {recentSaved.map(sp => (
                    <Link
                      key={sp.id}
                      href="/saved-prompts"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all duration-200 group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        {sp.is_favorite ? (
                          <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate group-hover:text-teal-400 transition-colors duration-200">{sp.title}</p>
                        <p className="text-xs text-[--text-muted] truncate mt-0.5">{sp.prompt_text.slice(0, 80)}{sp.prompt_text.length > 80 ? "..." : ""}</p>
                      </div>
                      <svg className="w-4 h-4 text-[--text-muted] group-hover:text-teal-400 transition-colors duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-5">

            {/* Quick Actions */}
            <div className="glass-card rounded-2xl p-5">
              <h2 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider mb-3">Quick Actions</h2>
              <div className="space-y-1">
                {[
                  {
                    href: "/demo",
                    icon: (
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    ),
                    label: "Enhance Prompt",
                    sub: "Transform your text",
                    isLink: true,
                  },
                  {
                    href: "/saved-prompts",
                    icon: (
                      <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </div>
                    ),
                    label: "Saved Prompts",
                    sub: "View your library",
                    isLink: true,
                  },
                  {
                    href: "/pricing",
                    icon: (
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ),
                    label: "View Pricing",
                    sub: "Explore plans",
                    isLink: true,
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all duration-200 group cursor-pointer"
                  >
                    {item.icon}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white group-hover:text-teal-400 transition-colors duration-200">{item.label}</p>
                      <p className="text-xs text-[--text-muted]">{item.sub}</p>
                    </div>
                    <svg className="w-4 h-4 text-[--text-muted] group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
                <a
                  href="mailto:support@promptai360.com"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all duration-200 group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[--text-secondary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white group-hover:text-teal-400 transition-colors duration-200">Contact Support</p>
                    <p className="text-xs text-[--text-muted]">Get help</p>
                  </div>
                  <svg className="w-4 h-4 text-[--text-muted] group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Chrome Extension Card */}
            <div className="rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)" }}>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-white/[0.06]" />
              <div className="absolute -right-10 -bottom-10 w-28 h-28 rounded-full bg-white/[0.04]" />
              <div className="relative">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-3.952 6.848a12.014 12.014 0 0 0 9.229-9.006zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold">Chrome Extension</span>
                </div>
                <p className="text-white/70 text-xs mb-4 leading-relaxed">
                  Enhance prompts anywhere on the web with one click.
                </p>
                <a
                  href="https://chromewebstore.google.com/detail/promptai-–-prompt-enhance/ibaoelckmaefmkiafoaaalbcjblnfjjd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-teal-700 rounded-xl font-semibold text-xs hover:bg-white/90 transition-all duration-200 cursor-pointer shadow-sm"
                >
                  Download Free
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Cancel Subscription Modal ── */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl max-w-sm w-full p-6 border border-white/[0.08]" style={{ background: "#111318", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Cancel Subscription</h3>
                <p className="text-xs text-[--text-muted]">This will end your current plan</p>
              </div>
            </div>
            <ul className="text-xs text-[--text-muted] mb-6 space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                You&apos;ll keep access until {formatDate(me?.current_period_end || null)}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                You can reactivate anytime before then
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                Your data will be preserved
              </li>
            </ul>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-white/[0.08] text-[--text-secondary] hover:text-white hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
              >
                Keep Plan
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500/25 disabled:opacity-50 transition-all duration-200 cursor-pointer"
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
