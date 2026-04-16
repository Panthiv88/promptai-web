"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import SignupGateModal from "@/components/SignupGateModal";
import { getToken } from "@/lib/auth";

interface CommunityPostDetail {
  id: number;
  title: string;
  prompt_text: string;
  original_text: string | null;
  category: string;
  upvote_count: number;
  view_count: number;
  has_upvoted: boolean;
  published_at: string | null;
  author_id: number;
}

export default function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<CommunityPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getCommunityPost(Number(id));
        setPost(data as unknown as CommunityPostDetail);
      } catch {
        /* post missing or network error — leave post null */
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleUpvote() {
    if (!getToken()) {
      setGateOpen(true);
      return;
    }
    if (!post) return;
    try {
      if (post.has_upvoted) {
        await api.removeCommunityUpvote(post.id);
        setPost({ ...post, has_upvoted: false, upvote_count: Math.max(0, post.upvote_count - 1) });
      } else {
        await api.upvoteCommunityPost(post.id);
        setPost({ ...post, has_upvoted: true, upvote_count: post.upvote_count + 1 });
      }
    } catch { /* swallow — stale session or network */ }
  }

  async function handleCopy() {
    if (!post) return;
    try {
      await navigator.clipboard.writeText(post.prompt_text);
    } catch { /* clipboard may be blocked */ }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] p-12 text-[var(--text-secondary)]">
        Loading…
      </main>
    );
  }
  if (!post) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] p-12 text-[var(--text-secondary)]">
        Post not found. <Link href="/community" className="text-[var(--brand-cyan)]">Back to community</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/community" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">← Community</Link>

        <header className="mt-4 mb-8">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-2">
            <span className="px-2 py-0.5 rounded bg-white/5">{post.category}</span>
            <span>{post.view_count} views</span>
          </div>
          <h1 className="text-3xl font-bold">{post.title}</h1>
        </header>

        <div className="flex gap-3 mb-8">
          <button
            onClick={handleUpvote}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${post.has_upvoted ? "bg-[var(--brand-teal)] text-black" : "glass-card hover:bg-white/5"}`}
          >
            ▲ {post.upvote_count}
          </button>
          <button onClick={handleCopy} className="px-4 py-2 rounded-lg text-sm glass-card hover:bg-white/5">
            Copy prompt
          </button>
          <Link href="/" className="px-4 py-2 rounded-lg text-sm bg-[var(--brand-teal)]/20 hover:bg-[var(--brand-teal)]/30 transition-colors">
            Try with PromptAI →
          </Link>
        </div>

        {post.original_text && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Original</h2>
            <div className="glass-card p-4 text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{post.original_text}</div>
          </section>
        )}

        <section>
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Enhanced Prompt</h2>
          <div className="glass-card p-4 text-sm whitespace-pre-wrap">{post.prompt_text}</div>
        </section>
      </div>

      <SignupGateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        action="upvote"
        redirect={`/community/${id}`}
      />
    </main>
  );
}
