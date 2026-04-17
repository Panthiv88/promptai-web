// Handcrafted gradient avatar tiles. Each id is an opaque string the backend stores
// verbatim — adding/removing tiles here does not require a migration, but new ids
// must be added to VALID_AVATAR_PRESETS in promptai-backend/main.py.
//
// The 12 gradients span five hue families (teal, cyan, aurora, ember, violet) plus
// two neutral monos, so users can pick a vibe rather than a label.

export interface AvatarPreset {
  id: string;
  label: string;         // short name shown under the tile in the picker
  gradient: string;      // CSS background — used on the avatar tile + on the picker preview
  ink: "black" | "white"; // initials color that reads against this gradient
}

export const AVATAR_PRESETS: readonly AvatarPreset[] = [
  { id: "teal-01",   label: "Tidewater",   gradient: "linear-gradient(135deg, #22d3ee 0%, #14b8a6 100%)",                        ink: "black" },
  { id: "teal-02",   label: "Lagoon",      gradient: "linear-gradient(135deg, #2dd4bf 0%, #0f766e 100%)",                        ink: "black" },
  { id: "cyan-01",   label: "Frost",       gradient: "linear-gradient(135deg, #67e8f9 0%, #0891b2 100%)",                        ink: "black" },
  { id: "cyan-02",   label: "Deep Sky",    gradient: "linear-gradient(135deg, #0ea5e9 0%, #0c4a6e 100%)",                        ink: "white" },
  { id: "aurora-01", label: "Aurora",      gradient: "linear-gradient(135deg, #22d3ee 0%, #a78bfa 55%, #f472b6 100%)",           ink: "white" },
  { id: "aurora-02", label: "Opalite",     gradient: "linear-gradient(135deg, #86efac 0%, #22d3ee 55%, #818cf8 100%)",           ink: "black" },
  { id: "ember-01",  label: "Ember",       gradient: "linear-gradient(135deg, #fb923c 0%, #dc2626 100%)",                        ink: "white" },
  { id: "ember-02",  label: "Sunset",      gradient: "linear-gradient(135deg, #fde68a 0%, #f97316 55%, #be185d 100%)",           ink: "black" },
  { id: "violet-01", label: "Nightfall",   gradient: "linear-gradient(135deg, #6366f1 0%, #1e1b4b 100%)",                        ink: "white" },
  { id: "violet-02", label: "Orchid",      gradient: "linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)",                        ink: "white" },
  { id: "mono-01",   label: "Graphite",    gradient: "linear-gradient(135deg, #3f3f46 0%, #09090b 100%)",                        ink: "white" },
  { id: "mono-02",   label: "Bone",        gradient: "linear-gradient(135deg, #e4e4e7 0%, #71717a 100%)",                        ink: "black" },
];

export const DEFAULT_PRESET_ID = "teal-01";

export function getPreset(id: string | null | undefined): AvatarPreset {
  if (!id) return AVATAR_PRESETS[0];
  return AVATAR_PRESETS.find(p => p.id === id) ?? AVATAR_PRESETS[0];
}

export function initialsFor(name: string | null | undefined): string {
  const n = (name || "").trim();
  if (!n) return "?";
  const parts = n.split(/\s+/).slice(0, 2);
  const initials = parts.map(s => s[0] || "").join("");
  return initials.toUpperCase() || "?";
}
