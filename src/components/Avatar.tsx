"use client";

import Image from "next/image";
import { getPreset, initialsFor } from "@/lib/avatars";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<Size, number> = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 };
const SIZE_CLASS: Record<Size, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
};
const SHAPE: Record<Size, string> = {
  xs: "rounded-md",
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  xl: "rounded-2xl",
};

interface AvatarProps {
  name: string | null | undefined;
  avatarUrl?: string | null;
  avatarPreset?: string | null;
  size?: Size;
  className?: string;
}

export default function Avatar({
  name,
  avatarUrl,
  avatarPreset,
  size = "md",
  className = "",
}: AvatarProps) {
  const px = SIZE_PX[size];
  const initials = initialsFor(name);

  // Uploaded photo wins over preset — this is the server's invariant and the UI
  // should mirror it. If someone has both set in the DB (shouldn't happen), we
  // prefer the photo so switching preset after upload has a clear "remove photo" step.
  if (avatarUrl) {
    return (
      <div
        className={`${SIZE_CLASS[size]} ${SHAPE[size]} overflow-hidden shrink-0 bg-[var(--bg-elevated)] ${className}`}
        aria-label={name ? `${name}'s avatar` : "avatar"}
      >
        <Image
          src={avatarUrl}
          alt=""
          width={px}
          height={px}
          className="w-full h-full object-cover"
          unoptimized={avatarUrl.endsWith(".gif")}
        />
      </div>
    );
  }

  const preset = getPreset(avatarPreset);
  const ink = preset.ink === "white" ? "text-white" : "text-black";

  return (
    <div
      className={`${SIZE_CLASS[size]} ${SHAPE[size]} flex items-center justify-center font-bold shrink-0 ${ink} ${className}`}
      style={{ background: preset.gradient }}
      aria-label={name ? `${name}'s avatar` : "avatar"}
    >
      {initials}
    </div>
  );
}
