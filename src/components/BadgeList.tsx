interface Badge {
  id: string;
  label: string;
  emoji: string;
}

export default function BadgeList({ badges, size = "md" }: { badges: Badge[]; size?: "sm" | "md" }) {
  if (!badges || badges.length === 0) return null;
  const sizeCls = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <span
          key={b.id}
          className={`${sizeCls} rounded-full bg-white/[0.06] border border-white/[0.08] text-[var(--text-primary)] inline-flex items-center gap-1`}
          title={b.label}
        >
          <span>{b.emoji}</span>
          <span>{b.label}</span>
        </span>
      ))}
    </div>
  );
}
