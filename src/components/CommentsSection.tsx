"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Send } from "lucide-react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import SignupGateModal from "@/components/SignupGateModal";
import { Skeleton } from "@/components/Skeleton";
import Avatar from "@/components/Avatar";

interface Comment {
  id: number;
  body: string;
  author_id: number;
  author_name: string;
  author_display_name?: string;
  author_avatar_url?: string | null;
  author_avatar_preset?: string | null;
  created_at: string | null;
}

const MAX_LEN = 2000;

export default function CommentsSection({ postId }: { postId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = (await api.listComments(postId)) as unknown as { comments: Comment[] };
        setComments(res.comments || []);
      } catch { /* leave empty */ }
      finally { setLoading(false); }
    })();
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    if (!getToken()) {
      setGateOpen(true);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = (await api.createComment(postId, text)) as unknown as Comment;
      setComments((prev) => [...prev, created]);
      setDraft("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to post comment";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const remaining = MAX_LEN - draft.length;
  const nearLimit = remaining < 200;

  return (
    <section className="mt-12 pt-8 border-t border-white/[0.06]">
      <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-[var(--brand-cyan)]" />
        Discussion
        <span className="text-[var(--text-secondary)] font-normal">({comments.length})</span>
      </h2>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="glass-card p-1 rounded-xl focus-within:border-[var(--brand-teal)]/40 transition-colors duration-200">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={MAX_LEN}
            placeholder="Share your thoughts on this prompt…"
            className="w-full bg-transparent p-3 text-sm rounded-lg resize-none focus:outline-none placeholder:text-[var(--text-secondary)]/60"
            rows={3}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs">
            {error ? (
              <span className="text-red-400">{error}</span>
            ) : draft.length > 0 ? (
              <span className={nearLimit ? "text-amber-400" : "text-[var(--text-secondary)]"}>
                {remaining} characters left
              </span>
            ) : (
              <span className="text-[var(--text-secondary)]/60">Max 2,000 characters</span>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting || !draft.trim()}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm bg-[var(--brand-teal)] text-black rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all duration-200"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? "Posting…" : "Post"}
          </button>
        </div>
      </form>

      {loading ? (
        <ul className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <li key={i} className="glass-card p-4 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </li>
          ))}
        </ul>
      ) : comments.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <MessageSquare className="w-8 h-8 text-[var(--text-secondary)]/50 mx-auto mb-2" />
          <p className="text-sm text-[var(--text-secondary)]">No comments yet. Start the conversation.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="glass-card p-4 transition-all duration-200 hover:border-white/[0.1]">
              <div className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)] mb-2">
                <Link href={`/u/${c.author_id}`} className="cursor-pointer shrink-0" aria-label={`View ${c.author_display_name || c.author_name}'s profile`}>
                  <Avatar
                    name={c.author_display_name || c.author_name}
                    avatarUrl={c.author_avatar_url}
                    avatarPreset={c.author_avatar_preset}
                    size="sm"
                  />
                </Link>
                <Link
                  href={`/u/${c.author_id}`}
                  className="cursor-pointer hover:text-[var(--text-primary)] hover:underline transition-colors font-medium"
                >
                  {c.author_display_name || c.author_name}
                </Link>
                {c.created_at && (
                  <>
                    <span>·</span>
                    <span>{new Date(c.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                  </>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed text-[var(--text-primary)]/90 pl-10">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <SignupGateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        action="comment"
        redirect={`/community/${postId}`}
      />
    </section>
  );
}
