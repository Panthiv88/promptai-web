"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUp, MessageCircle, FileText, Calendar, Inbox, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import BadgeList from "@/components/BadgeList";
import { ProfileSkeleton } from "@/components/Skeleton";
import Avatar from "@/components/Avatar";
import EditProfileSheet from "@/components/EditProfileSheet";

const profileVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const profileItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 22 } },
};
const postListVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const postItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 140, damping: 22 } },
};

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
  bio: string | null;
  avatar_url: string | null;
  avatar_preset: string | null;
  joined_at: string | null;
  is_owner: boolean;
  badges: { id: string; label: string; emoji: string }[];
  stats: { total_posts: number; total_upvotes: number; total_comments: number };
  posts: ProfilePost[];
}

function StatCard({
  Icon,
  label,
  value,
  accent,
  size = "md",
}: {
  Icon: typeof ArrowUp;
  label: string;
  value: number;
  accent: string;
  size?: "md" | "lg";
}) {
  const isLarge = size === "lg";
  return (
    <div
      className={`glass-card transition-[background,border-color,box-shadow] duration-200 hover:border-white/[0.12] hover:bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${
        isLarge ? "p-6" : "p-4"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="w-4 h-4" strokeWidth={2.5} />
        </div>
        <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-medium">{label}</div>
      </div>
      <div className={`font-bold tabular-nums ${isLarge ? "text-5xl" : "text-2xl"}`}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

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

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <motion.div
        className="max-w-3xl mx-auto px-6 py-12"
        variants={profileVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={profileItem}>
          <Link
            href="/community"
            className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" /> Community
          </Link>
        </motion.div>

        {/* Profile header */}
        <motion.header variants={profileItem} className="mt-6 mb-10 flex items-start gap-5">
          <motion.div
            layoutId="profile-avatar"
            className="shrink-0 shadow-lg shadow-[var(--brand-teal)]/10"
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <Avatar
              name={profile.display_name}
              avatarUrl={profile.avatar_url}
              avatarPreset={profile.avatar_preset}
              size="xl"
            />
          </motion.div>
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-3xl font-bold tracking-tight truncate">{profile.display_name}</h1>
              {profile.is_owner && (
                <button
                  onClick={() => setEditOpen(true)}
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass-card hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200 active:scale-[0.97] shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
            </div>
            {profile.bio && (
              <p className="text-[15px] text-[var(--text-primary)]/90 mt-2 leading-relaxed max-w-[54ch]">
                {profile.bio}
              </p>
            )}
            <p className="text-sm text-[var(--text-secondary)] mt-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Joined {profile.joined_at
                ? new Date(profile.joined_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
                : "recently"}
            </p>
          </div>
        </motion.header>

        {/* Stats — asymmetric 2fr/1fr: primary Posts + stacked secondaries */}
        <motion.section
          variants={profileItem}
          className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 mb-10"
        >
          <StatCard
            Icon={FileText}
            label="Posts"
            value={profile.stats.total_posts}
            accent="bg-[var(--brand-cyan)]/15 text-[var(--brand-cyan)]"
            size="lg"
          />
          <div className="space-y-4">
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
              accent="bg-white/[0.06] text-[var(--text-primary)]"
            />
          </div>
        </motion.section>

        {/* Badges */}
        <motion.section variants={profileItem} className="mb-10">
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Badges</h2>
          {profile.badges.length === 0 ? (
            <div className="glass-card p-5 text-sm text-[var(--text-secondary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              No badges yet. Publish prompts and engage with the community to earn them.
            </div>
          ) : (
            <BadgeList badges={profile.badges} />
          )}
        </motion.section>

        {/* Posts */}
        <motion.section variants={profileItem}>
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Posts ({profile.posts.length})
          </h2>
          {profile.posts.length === 0 ? (
            <div className="glass-card p-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/[0.04] mb-3">
                <Inbox className="w-7 h-7 text-[var(--text-secondary)]" />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">No posts published yet.</p>
            </div>
          ) : (
            <motion.ul
              className="space-y-3"
              variants={postListVariants}
              initial="hidden"
              animate="show"
            >
              {profile.posts.map((p) => (
                <motion.li key={p.id} variants={postItem}>
                  <Link
                    href={`/community/${p.id}`}
                    className="cursor-pointer glass-card p-4 block transition-[background,border-color,box-shadow] duration-200 hover:border-white/[0.12] hover:bg-white/[0.035] hover:shadow-lg hover:shadow-[var(--bg-deep)]/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] group"
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
                </motion.li>
              ))}
            </motion.ul>
          )}
        </motion.section>
      </motion.div>

      {profile.is_owner && (
        <EditProfileSheet
          open={editOpen}
          onClose={() => setEditOpen(false)}
          initial={{
            display_name: profile.display_name,
            bio: profile.bio,
            avatar_url: profile.avatar_url,
            avatar_preset: profile.avatar_preset,
          }}
          onSaved={(next) => setProfile(p => p ? { ...p, ...next } : p)}
        />
      )}
    </main>
  );
}
