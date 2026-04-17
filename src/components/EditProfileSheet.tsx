"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Check, Loader2, Trash2 } from "lucide-react";
import Avatar from "./Avatar";
import { AVATAR_PRESETS, DEFAULT_PRESET_ID } from "@/lib/avatars";
import { api } from "@/lib/api";

export interface EditProfileInitial {
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  avatar_preset: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  initial: EditProfileInitial;
  onSaved: (next: {
    display_name: string;
    bio: string | null;
    avatar_url: string | null;
    avatar_preset: string | null;
  }) => void;
}

type AvatarChoice =
  | { kind: "preset"; preset: string }
  | { kind: "photo"; url: string }
  | { kind: "initials" };  // no photo, no preset — fall back to a default preset on save

// Derive the initial avatar choice from whatever the server handed us.
function deriveChoice(init: EditProfileInitial): AvatarChoice {
  if (init.avatar_url) return { kind: "photo", url: init.avatar_url };
  if (init.avatar_preset) return { kind: "preset", preset: init.avatar_preset };
  // Neither set — default-select the first preset so the preview is never blank.
  return { kind: "preset", preset: DEFAULT_PRESET_ID };
}

export default function EditProfileSheet({ open, onClose, initial, onSaved }: Props) {
  const [name, setName] = useState(initial.display_name);
  const [bio, setBio] = useState(initial.bio ?? "");
  const [choice, setChoice] = useState<AvatarChoice>(deriveChoice(initial));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset on open so the sheet always reflects fresh server state.
  useEffect(() => {
    if (open) {
      setName(initial.display_name);
      setBio(initial.bio ?? "");
      setChoice(deriveChoice(initial));
      setError(null);
    }
  }, [open, initial]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const trimmedName = name.trim();
  const nameValid = trimmedName.length >= 2 && trimmedName.length <= 32;
  const bioOverflow = bio.length > 160;
  const canSave = nameValid && !bioOverflow && !saving && !uploading;

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";  // allow picking the same file twice in a row
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      setError("Image must be 2MB or smaller");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const url = await api.uploadAvatar(f);
      setChoice({ kind: "photo", url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      // Persist the avatar first (the PATCH below may clear avatar_preset, and we
      // want that to be consistent server-side if the photo upload actually succeeds).
      if (choice.kind === "photo") {
        await api.setMyAvatarUrl(choice.url);
      }
      const patch: {
        display_name: string;
        bio: string | null;
        avatar_preset?: string | null;
      } = {
        display_name: trimmedName,
        bio: bio.trim() ? bio.trim() : null,
      };
      // For preset choices, set the preset (backend clears avatar_url automatically).
      // For photo choices, don't touch preset — we already cleared it via setMyAvatarUrl.
      if (choice.kind === "preset") {
        patch.avatar_preset = choice.preset;
      }
      await api.updateMyProfile(patch);

      onSaved({
        display_name: trimmedName,
        bio: patch.bio,
        avatar_url: choice.kind === "photo" ? choice.url : null,
        avatar_preset: choice.kind === "preset" ? choice.preset : null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  }

  // Preview always reflects the pending choice — makes the picker feel alive.
  const previewAvatarUrl = choice.kind === "photo" ? choice.url : null;
  const previewPreset = choice.kind === "preset" ? choice.preset : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/65 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-card w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header with live preview — drives the "this is you" feeling */}
            <div className="flex items-start justify-between p-6 pb-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-4 min-w-0">
                <motion.div
                  layoutId="profile-avatar"
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                >
                  <Avatar
                    name={trimmedName || initial.display_name}
                    avatarUrl={previewAvatarUrl}
                    avatarPreset={previewPreset}
                    size="xl"
                  />
                </motion.div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold tracking-tight truncate">
                    {trimmedName || "Your name"}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    How the community sees you
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="cursor-pointer p-2 -m-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-7">
              {/* Display name */}
              <div className="space-y-2">
                <label htmlFor="edit-display-name" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Display name
                </label>
                <input
                  id="edit-display-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value.slice(0, 32))}
                  placeholder="e.g. Mira Delacroix"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-[var(--brand-teal)]/60 focus:bg-white/[0.05] focus:outline-none transition-colors text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className={nameValid || trimmedName.length === 0 ? "text-[var(--text-secondary)]/70" : "text-red-400"}>
                    {trimmedName.length < 2
                      ? "2–32 characters"
                      : `${trimmedName.length}/32`}
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label htmlFor="edit-bio" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Bio <span className="text-[var(--text-secondary)]/50 font-normal normal-case tracking-normal">— optional</span>
                </label>
                <textarea
                  id="edit-bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="One line on what you build with prompts…"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] focus:border-[var(--brand-teal)]/60 focus:bg-white/[0.05] focus:outline-none transition-colors text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 resize-none leading-relaxed"
                />
                <div className="flex items-center justify-end text-xs">
                  <span className={bioOverflow ? "text-red-400" : "text-[var(--text-secondary)]/70"}>
                    {bio.length}/160
                  </span>
                </div>
              </div>

              {/* Avatar picker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    Avatar
                  </label>
                  {choice.kind === "photo" && (
                    <button
                      onClick={() => setChoice({ kind: "preset", preset: DEFAULT_PRESET_ID })}
                      className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove photo
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                  {/* Upload tile — first, because it's the most personal option */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className={`relative cursor-pointer aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-all duration-200 active:scale-[0.94] ${
                      choice.kind === "photo"
                        ? "border-[var(--brand-teal)] bg-[var(--brand-teal)]/10"
                        : "border-white/[0.12] hover:border-white/[0.22] hover:bg-white/[0.03]"
                    } ${uploading ? "opacity-60 cursor-wait" : ""}`}
                    aria-label="Upload photo"
                  >
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[var(--text-secondary)]" />
                    ) : choice.kind === "photo" ? (
                      <div className="w-full h-full overflow-hidden rounded-[10px]">
                        {/* Inline img for smooth pending-upload preview; Next/Image is used elsewhere. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={choice.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <Camera className="w-5 h-5 text-[var(--text-secondary)]" />
                    )}
                    {choice.kind === "photo" && !uploading && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--brand-teal)] flex items-center justify-center shadow-lg shadow-[var(--brand-teal)]/40">
                        <Check className="w-3 h-3 text-black" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleFilePick}
                    className="hidden"
                  />

                  {/* 12 preset tiles */}
                  {AVATAR_PRESETS.map(p => {
                    const selected = choice.kind === "preset" && choice.preset === p.id;
                    return (
                      <motion.button
                        key={p.id}
                        onClick={() => setChoice({ kind: "preset", preset: p.id })}
                        whileTap={{ scale: 0.92 }}
                        className={`relative cursor-pointer aspect-square rounded-xl transition-[transform,box-shadow] duration-200 ${
                          selected
                            ? "ring-2 ring-offset-2 ring-offset-[var(--bg-primary)] ring-[var(--brand-teal)] shadow-lg shadow-[var(--brand-teal)]/20"
                            : "hover:scale-[1.04]"
                        }`}
                        style={{ background: p.gradient }}
                        aria-label={p.label}
                        aria-pressed={selected}
                      >
                        {selected && (
                          <motion.div
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--brand-teal)] flex items-center justify-center shadow-lg shadow-[var(--brand-teal)]/40"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 22 }}
                          >
                            <Check className="w-3 h-3 text-black" strokeWidth={3} />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {/* Footer actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="cursor-pointer px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-colors disabled:opacity-50 active:scale-[0.97]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!canSave}
                  className="cursor-pointer px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--brand-teal)] text-black transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-[var(--brand-teal)]/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] inline-flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {saving ? "Saving…" : "Save profile"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
