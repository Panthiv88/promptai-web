"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getToken, clearToken } from "@/lib/auth";
import Link from "next/link";

interface SavedPrompt {
  id: number;
  title: string;
  prompt_text: string;
  original_text: string | null;
  tags: string | null;
  is_favorite: boolean;
  source: string | null;
  thread_id: string | null;
  created_at: string;
  updated_at: string;
}

export default function SavedPromptsPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTags, setEditTags] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getSavedPrompts({
        page,
        per_page: perPage,
        search: search || undefined,
        tag: tagFilter || undefined,
        favorites: favoritesOnly || undefined,
      });
      const result = data as unknown as { prompts: SavedPrompt[]; total: number };
      setPrompts(result.prompts || []);
      setTotal(result.total || 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load";
      if (message.includes("Not authenticated") || message.includes("401")) {
        clearToken();
        router.push("/login");
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, tagFilter, favoritesOnly, router]);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }
    loadPrompts();
  }, [loadPrompts, router]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  async function handleToggleFavorite(id: number) {
    try {
      const result = await api.toggleFavorite(id) as unknown as { is_favorite: boolean };
      setPrompts(prev => prev.map(p => p.id === id ? { ...p, is_favorite: result.is_favorite } : p));
    } catch { /* ignore */ }
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteSavedPrompt(id);
      setDeleteConfirmId(null);
      setPrompts(prev => prev.filter(p => p.id !== id));
      setTotal(prev => prev - 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function handleSaveEdit(id: number) {
    try {
      const result = await api.updateSavedPrompt(id, {
        title: editTitle,
        tags: editTags,
      }) as unknown as SavedPrompt;
      setPrompts(prev => prev.map(p => p.id === id ? { ...p, title: result.title, tags: result.tags } : p));
      setEditingId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function copyToClipboard(text: string, id: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* ignore */ }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch { return dateStr; }
  }

  const totalPages = Math.ceil(total / perPage);

  // Collect unique tags for filter
  const allTags = Array.from(new Set(
    prompts
      .filter(p => p.tags)
      .flatMap(p => p.tags!.split(",").map(t => t.trim()).filter(Boolean))
  ));

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Saved Prompts</h1>
            <p className="text-sm text-[--text-muted] mt-1">
              {total} prompt{total !== 1 ? "s" : ""} saved
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl text-sm border border-white/[0.08] text-[--text-secondary] hover:text-white hover:border-white/[0.14] hover:bg-white/[0.03] transition-all"
            >
              Dashboard
            </Link>
            <Link
              href="/demo"
              className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
            >
              + New Prompt
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-500/60 hover:text-red-400 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Search & Filters */}
        <div className="glass-card rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search prompts..."
                className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[--text-muted] outline-none focus:border-teal-500/40 transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
              >
                Search
              </button>
            </form>
            <div className="flex gap-2">
              {allTags.length > 0 && (
                <select
                  value={tagFilter}
                  onChange={e => { setTagFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08] text-[--text-secondary] outline-none"
                >
                  <option value="">All Tags</option>
                  {allTags.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
              <button
                onClick={() => { setFavoritesOnly(!favoritesOnly); setPage(1); }}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  favoritesOnly
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                    : "border-white/[0.08] text-[--text-secondary] hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <svg className="w-4 h-4 inline mr-1" fill={favoritesOnly ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Favorites
              </button>
            </div>
          </div>
          {(search || tagFilter) && (
            <div className="mt-3 flex items-center gap-2 text-xs text-[--text-muted]">
              <span>Filters:</span>
              {search && (
                <span className="px-2 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/15 rounded-lg flex items-center gap-1">
                  &quot;{search}&quot;
                  <button onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }} className="hover:text-white">x</button>
                </span>
              )}
              {tagFilter && (
                <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 rounded-lg flex items-center gap-1">
                  {tagFilter}
                  <button onClick={() => { setTagFilter(""); setPage(1); }} className="hover:text-white">x</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-white/[0.04] rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && prompts.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-display font-semibold text-white mb-2">No saved prompts yet</h3>
            <p className="text-sm text-[--text-muted] mb-4">
              {search || tagFilter ? "No prompts match your filters." : "Save your enhanced prompts to reuse them anytime."}
            </p>
            {!search && !tagFilter && (
              <Link
                href="/demo"
                className="inline-flex px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
              >
                Enhance a Prompt
              </Link>
            )}
          </div>
        )}

        {/* Prompts Grid */}
        {!loading && prompts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prompts.map(prompt => (
              <div
                key={prompt.id}
                className={`glass-card rounded-2xl p-5 flex flex-col transition-all ${
                  expandedId === prompt.id ? "md:col-span-2 lg:col-span-3" : ""
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    {editingId === prompt.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg text-sm bg-white/[0.04] border border-white/[0.12] text-white outline-none focus:border-teal-500/40"
                        autoFocus
                      />
                    ) : (
                      <h3 className="text-sm font-semibold text-white truncate">{prompt.title}</h3>
                    )}
                    <p className="text-xs text-[--text-muted] mt-1">{formatDate(prompt.created_at)}</p>
                  </div>
                  <button
                    onClick={() => handleToggleFavorite(prompt.id)}
                    className="flex-shrink-0 p-1 rounded-lg hover:bg-white/[0.04] transition-colors"
                  >
                    <svg className={`w-4 h-4 ${prompt.is_favorite ? "text-yellow-400" : "text-[--text-muted]"}`} fill={prompt.is_favorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                </div>

                {/* Preview / Expanded Content */}
                <div className="flex-1 mb-3">
                  <p className={`text-xs text-[--text-secondary] leading-relaxed ${
                    expandedId === prompt.id ? "whitespace-pre-wrap" : "line-clamp-4"
                  }`}>
                    {prompt.prompt_text}
                  </p>
                </div>

                {/* Tags */}
                {prompt.tags && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {prompt.tags.split(",").map(tag => tag.trim()).filter(Boolean).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
                        onClick={() => { setTagFilter(tag); setPage(1); }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Edit Tags Input */}
                {editingId === prompt.id && (
                  <div className="mb-3">
                    <input
                      type="text"
                      value={editTags}
                      onChange={e => setEditTags(e.target.value)}
                      placeholder="Tags (comma-separated)"
                      className="w-full px-2 py-1 rounded-lg text-xs bg-white/[0.04] border border-white/[0.12] text-white outline-none focus:border-teal-500/40"
                    />
                  </div>
                )}

                {/* Source Badge */}
                {prompt.source && (
                  <div className="mb-3">
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-white/[0.04] text-[--text-muted] border border-white/[0.06] rounded-lg">
                      {prompt.source}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.06]">
                  <button
                    onClick={() => setExpandedId(expandedId === prompt.id ? null : prompt.id)}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[--text-secondary] hover:text-white hover:bg-white/[0.04] transition-all"
                  >
                    {expandedId === prompt.id ? "Collapse" : "Expand"}
                  </button>
                  <button
                    onClick={() => copyToClipboard(prompt.prompt_text, prompt.id)}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-teal-400 hover:bg-teal-500/10 transition-all"
                  >
                    {copiedId === prompt.id ? "Copied!" : "Copy"}
                  </button>
                  {editingId === prompt.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(prompt.id)}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[--text-muted] hover:text-white hover:bg-white/[0.04] transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setEditingId(prompt.id); setEditTitle(prompt.title); setEditTags(prompt.tags || ""); }}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[--text-secondary] hover:text-white hover:bg-white/[0.04] transition-all"
                    >
                      Edit
                    </button>
                  )}
                  {deleteConfirmId === prompt.id ? (
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-[10px] text-red-400">Delete?</span>
                      <button
                        onClick={() => handleDelete(prompt.id)}
                        className="px-2 py-1 rounded-lg text-[11px] font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 rounded-lg text-[11px] font-medium text-[--text-muted] hover:text-white transition-all"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(prompt.id)}
                      className="ml-auto px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-xl text-sm border border-white/[0.08] text-[--text-secondary] hover:text-white hover:bg-white/[0.03] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="text-sm text-[--text-muted] px-3">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded-xl text-sm border border-white/[0.08] text-[--text-secondary] hover:text-white hover:bg-white/[0.03] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
