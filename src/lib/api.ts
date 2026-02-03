import { getToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

interface RequestOptions {
  method?: string;
  body?: Record<string, unknown>;
}

async function request(path: string, { method = "GET", body }: RequestOptions = {}): Promise<Record<string, unknown>> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_BASE is not set");

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // ignore parse errors
  }

  if (!res.ok) {
    const msg =
      (data && (data.detail || data.message)) ||
      text ||
      `Request failed (${res.status})`;
    throw new Error(String(msg));
  }

  return data || {};
}

export const api = {
  // Auth
  signup: (email: string, password: string) =>
    request("/auth/signup", { method: "POST", body: { email, password } }),
  login: (email: string, password: string) =>
    request("/auth/login", { method: "POST", body: { email, password } }),
  googleAuth: (credential: string) =>
    request("/auth/google", { method: "POST", body: { credential } }),
  me: () => request("/auth/me"),

  // Billing
  createCheckoutSession: (plan: string, billingFrequency: string) =>
    request("/billing/create-checkout-session", {
      method: "POST",
      body: { plan, billingFrequency },
    }),
  getPortalSession: () => request("/billing/portal-session"),
  cancelSubscription: () =>
    request("/billing/cancel-subscription", { method: "POST" }),
  reactivateSubscription: () =>
    request("/billing/reactivate-subscription", { method: "POST" }),

  // Analytics
  getAnalytics: () => request("/auth/analytics"),

  // Demo / Enhancement
  demoEnhance: (rawText: string) =>
    request("/api/demo/enhance", {
      method: "POST",
      body: { rawText },
    }),

  enhance: (rawText: string, licenseKey?: string) =>
    request("/api/enhance", {
      method: "POST",
      body: { text: rawText, license_key: licenseKey, mode: "enhance" },
    }),

  followup: (rawText: string, threadId: string, licenseKey?: string) =>
    request("/api/enhance", {
      method: "POST",
      body: { text: rawText, license_key: licenseKey, mode: "followup", thread_id: threadId },
    }),
};
