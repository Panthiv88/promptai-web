"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const CATEGORIES = ["Writing", "Code", "Marketing", "Business", "Research", "Creative"] as const;

export default function ShareToCommunityModal({
  open,
  onClose,
  savedPromptId,
  defaultTitle,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  savedPromptId: number;
  defaultTitle: string;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Writing");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.publishToCommunity(savedPromptId, { category, title });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <form onSubmit={handleSubmit} className="glass-card max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Share to Community</h2>

        <label className="block text-xs text-[var(--text-secondary)] mb-1">Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 mb-4 text-sm"
          required
          maxLength={255}
        />

        <label className="block text-xs text-[var(--text-secondary)] mb-1">Category</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value as (typeof CATEGORIES)[number])}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 mb-4 text-sm"
        >
          {CATEGORIES.map(c => <option key={c} value={c} className="bg-[var(--bg-surface)]">{c}</option>)}
        </select>

        <p className="text-xs text-[var(--text-secondary)] mb-4">
          Your prompt will be reviewed before going live (usually within 24h).
        </p>

        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg glass-card hover:bg-white/5 text-sm">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-[var(--brand-teal)] text-black font-semibold text-sm disabled:opacity-50">
            {submitting ? "Publishing…" : "Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}
