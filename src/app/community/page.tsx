"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUp, MessageCircle, Flame, Sparkles, TrendingUp, Users, Inbox } from "lucide-react";
import { api } from "@/lib/api";
import SignupGateModal from "@/components/SignupGateModal";
import { CommunityPostSkeleton } from "@/components/Skeleton";
import { getToken } from "@/lib/auth";

interface CommunityPost {
  id: number;
  title: string;
  prompt_text: string;
  original_text: string | null;
  category: string;
  upvote_count: number;
  view_count: number;
  published_at: string | null;
  author_id: number;
  author_name: string;
  comment_count: number;
}

const CATEGORIES = ["Writing", "Code", "Marketing", "Business", "Research", "Creative"] as const;

const TAB_META: Record<"hot" | "new" | "top", { label: string; Icon: typeof Flame }> = {
  hot: { label: "Hot", Icon: Flame },
  new: { label: "New", Icon: Sparkles },
  top: { label: "Top", Icon: TrendingUp },
};

function CommunityPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = (searchParams.get("tab") as "hot" | "new" | "top") || "hot";
  const initialCategory = searchParams.get("category");

  const [tab, setTab] = useState<"hot" | "new" | "top">(
    ["hot", "new", "top"].includes(initialTab) ? initialTab : "hot"
  );
  const [category, setCategory] = useState<string | null>(
    initialCategory && CATEGORIES.includes(initialCategory as typeof CATEGORIES[number]) ? initialCategory : null
  );
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateIntent, setGateIntent] = useState<{ action: string; redirect: string }>({ action: "upvote", redirect: "/community" });

  const updateUrl = useCallback((nextTab: string, nextCategory: string | null) => {
    const params = new URLSearchParams();
    if (nextTab !== "hot") params.set("tab", nextTab);
    if (nextCategory) params.set("category", nextCategory);
    const qs = params.toString();
    router.replace(`/community${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listCommunityPosts({
        tab,
        category: category ?? undefined,
        per_page: 30,
      });
      setPosts((data as { posts: CommunityPost[] }).posts || []);
    } catch { /* silent — show empty state */ }
    finally { setLoading(false); }
  }, [tab, category]);

  useEffect(() => { load(); }, [load]);

  function handleTabChange(t: "hot" | "new" | "top") {
    setTab(t);
    updateUrl(t, category);
  }

  function handleCategoryChange(c: string | null) {
    setCategory(c);
    updateUrl(tab, c);
  }

  async function handleUpvote(post: CommunityPost) {
    if (!getToken()) {
      setGateIntent({ action: "upvote", redirect: `/community/${post.id}` });
      setGateOpen(true);
      return;
    }
    try {
      await api.upvoteCommunityPost(post.id);
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, upvote_count: p.upvote_count + 1 } : p));
    } catch { /* ignore — e.g. network or expired session */ }
  }

  const totalPosts = posts.length;
  const totalUpvotes = posts.reduce((sum, p) => sum + p.upvote_count, 0);
  const uniqueAuthors = new Set(posts.map(p => p.author_id)).size;

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero section */}
        <header className="mb-10 relative">
          <div className="absolute -top-8 -left-8 w-64 h-64 rounded-full bg-[var(--brand-teal)]/10 blur-3xl pointer-events-none" aria-hidden />
          <div className="relative">
            <h1 className="text-5xl font-bold gradient-text tracking-tight">Community</h1>
            <p className="text-[var(--text-secondary)] mt-3 text-lg max-w-2xl">
              Discover prompts crafted by the community. Upvote the ones that spark ideas, comment to riff, publish your own.
            </p>
            {!loading && totalPosts > 0 && (
              <div className="flex flex-wrap gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Sparkles className="w-4 h-4 text-[var(--brand-cyan)]" />
                  <span><span className="text-[var(--text-primary)] font-semibold">{totalPosts}</span> prompts</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <ArrowUp className="w-4 h-4 text-[var(--brand-teal)]" />
                  <span><span className="text-[var(--text-primary)] font-semibold">{totalUpvotes}</span> upvotes</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Users className="w-4 h-4 text-[var(--brand-cyan)]" />
                  <span><span className="text-[var(--text-primary)] font-semibold">{uniqueAuthors}</span> creators</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Tabs + filter */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {(["hot", "new", "top"] as const).map(t => {
              const { label, Icon } = TAB_META[t];
              const active = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => handleTabChange(t)}
                  className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    active
                      ? "bg-[var(--brand-teal)] text-black shadow-lg shadow-[var(--brand-teal)]/20"
                      : "text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04]"
                  }`}
                  aria-pressed={active}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>

          <div className="w-px h-8 bg-white/10 mx-2" />

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                category === null
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              All
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => handleCategoryChange(c)}
                className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  category === c
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <ul className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CommunityPostSkeleton key={i} />
            ))}
          </ul>
        ) : posts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.04] mb-4">
              <Inbox className="w-8 h-8 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No prompts here yet</h3>
            <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
              {category ? `Nothing in ${category} yet — try another filter, or be the first to publish.` : "Be the first to share a great prompt with the community."}
            </p>
            <Link
              href="/saved-prompts"
              className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--brand-teal)] text-black font-medium text-sm transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-[var(--brand-teal)]/30"
            >
              Publish a prompt →
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {posts.map((p, idx) => (
              <li
                key={p.id}
                className="group glass-card p-4 flex gap-4 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.035] hover:shadow-xl hover:shadow-black/20"
              >
                <div className="flex flex-col items-center justify-center w-12 gap-1">
                  <button
                    onClick={() => handleUpvote(p)}
                    className="cursor-pointer p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--brand-teal)] hover:bg-[var(--brand-teal)]/10 transition-all duration-200"
                    aria-label={`Upvote ${p.title}`}
                  >
                    <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                  <span className="text-sm font-semibold tabular-nums">{p.upvote_count}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-[var(--brand-cyan)]/10 text-[var(--brand-cyan)] border border-[var(--brand-cyan)]/20 font-medium">
                      {p.category}
                    </span>
                    <span className="text-[var(--text-secondary)]/60">#{idx + 1}</span>
                    <span>·</span>
                    <Link
                      href={`/u/${p.author_id}`}
                      className="cursor-pointer hover:text-[var(--text-primary)] hover:underline transition-colors"
                    >
                      {p.author_name}
                    </Link>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {p.comment_count}
                    </span>
                  </div>
                  <Link
                    href={`/community/${p.id}`}
                    className="cursor-pointer block font-semibold text-lg text-[var(--text-primary)] group-hover:text-[var(--brand-cyan)] transition-colors duration-200"
                  >
                    {p.title}
                  </Link>
                  <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">{p.prompt_text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <SignupGateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        action={gateIntent.action}
        redirect={gateIntent.redirect}
      />
    </main>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[var(--bg-primary)]" />}>
      <CommunityPageInner />
    </Suspense>
  );
}
