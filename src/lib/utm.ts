/**
 * UTM parameter utilities for marketing link tracking.
 *
 * Usage:
 *   import { buildUtmUrl, captureUtmParams, getStoredUtm } from "@/lib/utm";
 *
 *   // Build a trackable link
 *   buildUtmUrl("https://promptai360.com", {
 *     source: "twitter",
 *     medium: "social",
 *     campaign: "launch-week",
 *   });
 *   // → "https://promptai360.com?utm_source=twitter&utm_medium=social&utm_campaign=launch-week"
 *
 *   // Capture on page load (call once in PostHogProvider or layout)
 *   captureUtmParams();
 *
 *   // Read stored UTM for attribution
 *   const utm = getStoredUtm();
 */

export interface UtmParams {
  source?: string;  // utm_source — where traffic comes from (twitter, producthunt, google)
  medium?: string;  // utm_medium — marketing medium (social, email, affiliate, cpc)
  campaign?: string; // utm_campaign — campaign name (launch-week, promptperfect-capture)
  term?: string;    // utm_term — paid keyword
  content?: string; // utm_content — A/B test variant or ad creative
}

const UTM_STORAGE_KEY = "promptai_utm";

/** Build a URL with UTM parameters appended. */
export function buildUtmUrl(base: string, params: UtmParams): string {
  const url = new URL(base);
  if (params.source) url.searchParams.set("utm_source", params.source);
  if (params.medium) url.searchParams.set("utm_medium", params.medium);
  if (params.campaign) url.searchParams.set("utm_campaign", params.campaign);
  if (params.term) url.searchParams.set("utm_term", params.term);
  if (params.content) url.searchParams.set("utm_content", params.content);
  return url.toString();
}

/**
 * Read UTM params from the current URL and persist to sessionStorage.
 * Call this once at page load (e.g. in your PostHog or analytics provider).
 * Only overwrites stored UTM if new params are present — first-touch attribution.
 */
export function captureUtmParams(): UtmParams | null {
  if (typeof window === "undefined") return null;

  const sp = new URLSearchParams(window.location.search);
  const source = sp.get("utm_source");
  if (!source) return null; // no UTM on this visit

  const params: UtmParams = {
    source: source || undefined,
    medium: sp.get("utm_medium") || undefined,
    campaign: sp.get("utm_campaign") || undefined,
    term: sp.get("utm_term") || undefined,
    content: sp.get("utm_content") || undefined,
  };

  // First-touch: only store if none exist yet
  if (!sessionStorage.getItem(UTM_STORAGE_KEY)) {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params));
  }

  return params;
}

/** Retrieve stored UTM params (first-touch for this session). */
export function getStoredUtm(): UtmParams | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as UtmParams) : null;
}

/* ── Pre-built marketing URLs ── */

const BASE = "https://promptai360.com";

export const MARKETING_URLS = {
  // Social
  twitterBio: buildUtmUrl(BASE, { source: "twitter", medium: "social", campaign: "bio-link" }),
  twitterPost: (campaign: string) =>
    buildUtmUrl(BASE, { source: "twitter", medium: "social", campaign }),
  reddit: (campaign: string) =>
    buildUtmUrl(BASE, { source: "reddit", medium: "social", campaign }),
  linkedin: (campaign: string) =>
    buildUtmUrl(BASE, { source: "linkedin", medium: "social", campaign }),

  // Launch
  productHunt: buildUtmUrl(BASE, { source: "producthunt", medium: "launch", campaign: "ph-launch" }),

  // Content
  youtubeDesc: (video: string) =>
    buildUtmUrl(BASE, { source: "youtube", medium: "video", campaign: video }),
  tiktokBio: buildUtmUrl(BASE, { source: "tiktok", medium: "social", campaign: "bio-link" }),
  blogCta: (slug: string) =>
    buildUtmUrl(BASE, { source: "blog", medium: "content", campaign: slug }),

  // Email
  onboardingEmail: (emailNum: number) =>
    buildUtmUrl(BASE, { source: "email", medium: "drip", campaign: `onboarding-${emailNum}` }),
  newsletter: (issue: string) =>
    buildUtmUrl(BASE, { source: "email", medium: "newsletter", campaign: issue }),

  // Affiliates
  affiliate: (name: string) =>
    buildUtmUrl(BASE, { source: "affiliate", medium: "referral", campaign: name }),

  // PromptPerfect capture
  promptPerfectCapture: buildUtmUrl(`${BASE}/alternatives/promptperfect`, {
    source: "google",
    medium: "organic",
    campaign: "promptperfect-capture",
  }),

  // Directories
  directory: (name: string) =>
    buildUtmUrl(BASE, { source: name, medium: "directory", campaign: "listing" }),

  // Newsletter sponsorship
  newsletterAd: (newsletter: string) =>
    buildUtmUrl(BASE, { source: newsletter, medium: "sponsorship", campaign: "newsletter-ad" }),
} as const;
