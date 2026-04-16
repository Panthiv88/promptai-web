"use client";

import Link from "next/link";

export default function SignupGateModal({
  open,
  onClose,
  action,
  redirect,
}: {
  open: boolean;
  onClose: () => void;
  action: string;
  redirect: string;
}) {
  if (!open) return null;

  const encoded = encodeURIComponent(redirect);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-2">Sign up to {action}</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Free forever. Get 5 enhancements a day, build your prompt library, and share with the community.
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href={`/signup?redirect=${encoded}`}
            className="w-full text-center px-4 py-2.5 rounded-lg bg-[var(--brand-teal)] text-black font-semibold hover:opacity-90 transition-opacity"
          >
            Create free account
          </Link>
          <Link
            href={`/login?redirect=${encoded}`}
            className="w-full text-center px-4 py-2.5 rounded-lg glass-card hover:bg-white/5 transition-colors"
          >
            I already have an account
          </Link>
          <button onClick={onClose} className="text-xs text-[var(--text-secondary)] mt-2 hover:text-[var(--text-primary)]">Close</button>
        </div>
      </div>
    </div>
  );
}
