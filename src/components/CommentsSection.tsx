"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import SignupGateModal from "@/components/SignupGateModal";

interface Comment {
  id: number;
  body: string;
  author_id: number;
  author_name: string;
  created_at: string | null;
}

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

  return (
    <section className="mt-12">
      <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
        Discussion ({comments.length})
      </h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
          placeholder="Leave a comment…"
          className="w-full glass-card p-3 text-sm bg-white/[0.02] rounded-lg resize-none focus:outline-none"
          rows={3}
        />
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={submitting || !draft.trim()}
            className="px-4 py-2 text-sm bg-[var(--brand-teal)] text-black rounded-lg font-medium disabled:opacity-50 hover:brightness-110 transition"
          >
            {submitting ? "Posting…" : "Post comment"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-[var(--text-secondary)]">Loading…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">No comments yet.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="glass-card p-4">
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
                <Link href={`/u/${c.author_id}`} className="hover:text-[var(--text-primary)] transition-colors font-medium">
                  {c.author_name}
                </Link>
                {c.created_at && <span>· {new Date(c.created_at).toLocaleDateString()}</span>}
              </div>
              <p className="text-sm whitespace-pre-wrap">{c.body}</p>
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
