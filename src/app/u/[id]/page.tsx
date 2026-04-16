"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import BadgeList from "@/components/BadgeList";

interface ProfilePost {
  id: number;
  title: string;
  category: string;
  upvote_count: number;
  comment_count: number;
  published_at: string | null;
}

interface Profile {
  id: number;
  display_name: string;
  joined_at: string | null;
  badges: { id: string; label: string; emoji: string }[];
  stats: { total_posts: number; total_upvotes: number; total_comments: number };
  posts: ProfilePost[];
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = (await api.getUserProfile(Number(id))) as unknown as Profile;
        setProfile(data);
      } catch { /* leave null */ }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) {
    return <main className="min-h-screen bg-[var(--bg-primary)] p-12 text-[var(--text-secondary)]">Loading…</main>;
  }
  if (!profile) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] p-12 text-[var(--text-secondary)]">
        User not found. <Link href="/community" className="text-[var(--brand-cyan)]">Back to community</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/community" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">← Community</Link>

        <header className="mt-4 mb-8">
          <h1 className="text-3xl font-bold">{profile.display_name}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Joined {profile.joined_at ? new Date(profile.joined_at).toLocaleDateString() : "—"}
          </p>
        </header>

        <section className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-4">
            <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Posts</div>
            <div className="text-2xl font-bold mt-1">{profile.stats.total_posts}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Upvotes</div>
            <div className="text-2xl font-bold mt-1">{profile.stats.total_upvotes}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Comments</div>
            <div className="text-2xl font-bold mt-1">{profile.stats.total_comments}</div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Badges</h2>
          {profile.badges.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No badges earned yet.</p>
          ) : (
            <BadgeList badges={profile.badges} />
          )}
        </section>

        <section>
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Posts ({profile.posts.length})
          </h2>
          {profile.posts.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No posts yet.</p>
          ) : (
            <ul className="space-y-3">
              {profile.posts.map((p) => (
                <li key={p.id}>
                  <Link href={`/community/${p.id}`} className="glass-card p-4 block hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1">
                      <span className="px-2 py-0.5 rounded bg-white/5">{p.category}</span>
                      <span>▲ {p.upvote_count}</span>
                      <span>💬 {p.comment_count}</span>
                    </div>
                    <div className="text-sm font-medium">{p.title}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
