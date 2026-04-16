"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import SignupGateModal from "@/components/SignupGateModal";
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

export default function CommunityPage() {
  const [tab, setTab] = useState<"hot" | "new" | "top">("hot");
  const [category, setCategory] = useState<string | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateIntent, setGateIntent] = useState<{ action: string; redirect: string }>({ action: "upvote", redirect: "/community" });

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

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold gradient-text">Community</h1>
          <p className="text-[var(--text-secondary)] mt-2">Discover and upvote the best prompts.</p>
        </header>

        <div className="flex flex-wrap gap-2 mb-6">
          {(["hot", "new", "top"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-[var(--brand-teal)] text-black" : "glass-card hover:bg-white/5"}`}
            >
              {t === "hot" ? "Hot" : t === "new" ? "New" : "Top"}
            </button>
          ))}
          <div className="w-px bg-white/10 mx-2" />
          <button
            onClick={() => setCategory(null)}
            className={`px-3 py-2 rounded-lg text-sm ${category === null ? "bg-white/10" : "hover:bg-white/5"}`}
          >
            All
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-2 rounded-lg text-sm ${category === c ? "bg-white/10" : "hover:bg-white/5"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-[var(--text-secondary)]">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="glass-card p-8 text-center text-[var(--text-secondary)]">
            No prompts yet. <Link href="/saved-prompts" className="text-[var(--brand-cyan)]">Be the first to publish.</Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {posts.map((p, idx) => (
              <li key={p.id} className="glass-card p-4 flex gap-4">
                <div className="flex flex-col items-center justify-center w-12">
                  <button
                    onClick={() => handleUpvote(p)}
                    className="text-[var(--text-secondary)] hover:text-[var(--brand-teal)] transition-colors"
                    aria-label="Upvote"
                  >▲</button>
                  <span className="text-sm font-semibold tabular-nums">{p.upvote_count}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
                    <span className="px-2 py-0.5 rounded bg-white/5">{p.category}</span>
                    <span>#{idx + 1}</span>
                    <Link href={`/u/${p.author_id}`} className="hover:text-[var(--text-primary)] transition-colors">{p.author_name}</Link>
                    <span>💬 {p.comment_count}</span>
                  </div>
                  <Link href={`/community/${p.id}`} className="block font-semibold text-lg hover:text-[var(--brand-cyan)] transition-colors">
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
