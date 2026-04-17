export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`skeleton-shimmer rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function CommunityPostSkeleton() {
  return (
    <li className="glass-card p-4 flex gap-4">
      <div className="flex flex-col items-center justify-center w-12 gap-2">
        <Skeleton className="w-6 h-6 rounded-md" />
        <Skeleton className="w-8 h-3" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-10 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </li>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-5">
        <Skeleton className="w-20 h-20 rounded-2xl" />
        <div className="flex-1 space-y-3 pt-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
        <Skeleton className="h-36 rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  );
}
