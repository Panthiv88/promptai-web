interface Badge {
  id: string;
  label: string;
  emoji: string;
}

const BADGE_STYLES: Record<string, string> = {
  first_publish: "from-cyan-400/15 to-teal-400/15 border-cyan-400/25 text-cyan-200",
  trending: "from-orange-400/15 to-red-400/15 border-orange-400/25 text-orange-200",
  top_creator: "from-yellow-300/15 to-amber-400/15 border-yellow-300/25 text-yellow-100",
  conversationalist: "from-purple-400/15 to-pink-400/15 border-purple-400/25 text-purple-200",
  early_adopter: "from-emerald-400/15 to-teal-400/15 border-emerald-400/25 text-emerald-200",
};

const DEFAULT_STYLE = "from-white/[0.06] to-white/[0.04] border-white/[0.1] text-[var(--text-primary)]";

export default function BadgeList({ badges, size = "md" }: { badges: Badge[]; size?: "sm" | "md" }) {
  if (!badges || badges.length === 0) return null;
  const sizeCls = size === "sm" ? "text-xs px-2.5 py-1" : "text-sm px-3.5 py-1.5";
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => {
        const style = BADGE_STYLES[b.id] ?? DEFAULT_STYLE;
        return (
          <span
            key={b.id}
            className={`${sizeCls} rounded-full bg-gradient-to-br ${style} border inline-flex items-center gap-1.5 font-medium transition-transform duration-200 hover:-translate-y-0.5`}
            title={b.label}
          >
            <span className="text-base leading-none">{b.emoji}</span>
            <span>{b.label}</span>
          </span>
        );
      })}
    </div>
  );
}
