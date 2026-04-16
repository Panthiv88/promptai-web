"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUp, Copy, Check, Eye, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import SignupGateModal from "@/components/SignupGateModal";
import CommentsSection from "@/components/CommentsSection";
import { Skeleton } from "@/components/Skeleton";
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
  author_name: string;
  comment_count: number;
}

export default function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<CommunityPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [gateOpen, setGateOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard may be blocked */ }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-10 w-3/4" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </main>
    );
  }
  if (!post) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-12">
        <div className="glass-card p-10 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Post not found</h2>
          <p className="text-[var(--text-secondary)] mb-6">This prompt may have been removed or doesn&apos;t exist.</p>
          <Link
            href="/community"
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-teal)] text-black font-medium text-sm transition-all duration-200 hover:brightness-110"
          >
            <ArrowLeft className="w-4 h-4" /> Back to community
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/community"
          className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" /> Community
        </Link>

        <header className="mt-6 mb-8">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-3 flex-wrap">
            <span className="px-2.5 py-1 rounded-md bg-[var(--brand-cyan)]/10 text-[var(--brand-cyan)] border border-[var(--brand-cyan)]/20 font-medium">
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {post.view_count} {post.view_count === 1 ? "view" : "views"}
            </span>
            <span>·</span>
            <Link
              href={`/u/${post.author_id}`}
              className="cursor-pointer hover:text-[var(--text-primary)] hover:underline transition-colors"
            >
              {post.author_name}
            </Link>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
        </header>

        <div className="flex flex-wrap gap-3 mb-10">
          <button
            onClick={handleUpvote}
            className={`cursor-pointer px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              post.has_upvoted
                ? "bg-[var(--brand-teal)] text-black shadow-lg shadow-[var(--brand-teal)]/30 hover:brightness-110"
                : "glass-card hover:bg-white/[0.06] hover:border-white/[0.12]"
            }`}
            aria-pressed={post.has_upvoted}
          >
            <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
            <span className="tabular-nums">{post.upvote_count}</span>
          </button>
          <button
            onClick={handleCopy}
            className="cursor-pointer px-4 py-2.5 rounded-lg text-sm font-medium glass-card hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200 flex items-center gap-2"
          >
            {copied ? (
              <><Check className="w-4 h-4 text-[var(--brand-teal)]" /> Copied</>
            ) : (
              <><Copy className="w-4 h-4" /> Copy prompt</>
            )}
          </button>
          <Link
            href="/"
            className="cursor-pointer px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--brand-teal)]/15 border border-[var(--brand-teal)]/30 text-[var(--brand-teal)] hover:bg-[var(--brand-teal)]/25 transition-all duration-200 flex items-center gap-2"
          >
            Try with PromptAI <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {post.original_text && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Original</h2>
            <div className="glass-card p-5 text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
              {post.original_text}
            </div>
          </section>
        )}

        <section className="mb-10">
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Enhanced prompt</h2>
          <div className="glass-card p-5 text-sm whitespace-pre-wrap leading-relaxed border-[var(--brand-teal)]/10">
            {post.prompt_text}
          </div>
        </section>

        <CommentsSection postId={post.id} />
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
