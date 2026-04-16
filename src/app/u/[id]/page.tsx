"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUp, MessageCircle, FileText, Calendar, Inbox } from "lucide-react";
import { api } from "@/lib/api";
import BadgeList from "@/components/BadgeList";
import { ProfileSkeleton } from "@/components/Skeleton";

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

function StatCard({
  Icon,
  label,
  value,
  accent,
}: {
  Icon: typeof ArrowUp;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="glass-card p-5 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.035]">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="w-4 h-4" strokeWidth={2.5} />
        </div>
        <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-medium">{label}</div>
      </div>
      <div className="text-3xl font-bold tabular-nums">{value.toLocaleString()}</div>
    </div>
  );
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
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <ProfileSkeleton />
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-12">
        <div className="glass-card p-10 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">User not found</h2>
          <p className="text-[var(--text-secondary)] mb-6">This profile doesn&apos;t exist or may have been removed.</p>
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

  const initials = profile.display_name
    .split(/\s+/)
    .map(s => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/community"
          className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" /> Community
        </Link>

        {/* Profile header */}
        <header className="mt-6 mb-10 flex items-start gap-5">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-black shrink-0 shadow-lg shadow-[var(--brand-teal)]/20"
            style={{ background: "linear-gradient(135deg, #22d3ee 0%, #14b8a6 100%)" }}
            aria-hidden
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-3xl font-bold tracking-tight truncate">{profile.display_name}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Joined {profile.joined_at
                ? new Date(profile.joined_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
                : "recently"}
            </p>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            Icon={FileText}
            label="Posts"
            value={profile.stats.total_posts}
            accent="bg-[var(--brand-cyan)]/15 text-[var(--brand-cyan)]"
          />
          <StatCard
            Icon={ArrowUp}
            label="Upvotes"
            value={profile.stats.total_upvotes}
            accent="bg-[var(--brand-teal)]/15 text-[var(--brand-teal)]"
          />
          <StatCard
            Icon={MessageCircle}
            label="Comments"
            value={profile.stats.total_comments}
            accent="bg-purple-400/15 text-purple-300"
          />
        </section>

        {/* Badges */}
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Badges</h2>
          {profile.badges.length === 0 ? (
            <div className="glass-card p-5 text-sm text-[var(--text-secondary)]">
              No badges yet. Publish prompts and engage with the community to earn them.
            </div>
          ) : (
            <BadgeList badges={profile.badges} />
          )}
        </section>

        {/* Posts */}
        <section>
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Posts ({profile.posts.length})
          </h2>
          {profile.posts.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/[0.04] mb-3">
                <Inbox className="w-7 h-7 text-[var(--text-secondary)]" />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">No posts published yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {profile.posts.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/community/${p.id}`}
                    className="cursor-pointer glass-card p-4 block transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.035] hover:shadow-lg hover:shadow-black/20 group"
                  >
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-[var(--brand-cyan)]/10 text-[var(--brand-cyan)] border border-[var(--brand-cyan)]/20 font-medium">
                        {p.category}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.5} />
                        {p.upvote_count}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {p.comment_count}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--brand-cyan)] transition-colors duration-200">
                      {p.title}
                    </div>
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
