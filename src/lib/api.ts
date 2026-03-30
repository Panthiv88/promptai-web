import { clearToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

interface RequestOptions {
  method?: string;
  body?: Record<string, unknown>;
}

// Mutex to prevent concurrent refresh races
let refreshPromise: Promise<boolean> | null = null;

async function attemptTokenRefresh(): Promise<boolean> {
  if (!API_BASE) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Backend reads refresh_token cookie, sets new access_token cookie
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function refreshTokenWithMutex(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = attemptTokenRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function request(path: string, { method = "GET", body }: RequestOptions = {}): Promise<Record<string, unknown>> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_BASE is not set");

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  let res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  // On 401, attempt token refresh before giving up
  if (res.status === 401) {
    const text401 = await res.text();
    let detail = "";
    try {
      const parsed = JSON.parse(text401);
      detail = parsed.detail || "";
    } catch { /* ignore */ }

    // "Session expired" means device mismatch — not refreshable
    if (detail.includes("Session expired")) {
      clearToken();
      throw new Error(detail);
    }

    // Try refreshing the access token
    const refreshed = await refreshTokenWithMutex();
    if (refreshed) {
      // Retry the original request — new access_token cookie is set by the backend
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
      });
    } else {
      clearToken();
      throw new Error(detail || "Session expired");
    }
  }

  const text = await res.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // ignore parse errors
  }

  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
    }
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
  forgotPassword: (email: string) =>
    request("/auth/forgot-password", { method: "POST", body: { email } }),
  verifyOtp: (email: string, otp: string) =>
    request("/auth/verify-otp", { method: "POST", body: { email, otp } }),
  resetPassword: (email: string, otp: string, new_password: string) =>
    request("/auth/reset-password", { method: "POST", body: { email, otp, new_password } }),

  // MFA
  mfaSetup: () =>
    request("/auth/mfa/setup", { method: "POST" }),
  mfaVerifySetup: (code: string) =>
    request("/auth/mfa/verify-setup", { method: "POST", body: { code } }),
  mfaDisable: (code: string) =>
    request("/auth/mfa/disable", { method: "POST", body: { code } }),
  mfaVerify: (mfaToken: string, code: string) =>
    request("/auth/mfa/verify", { method: "POST", body: { mfa_token: mfaToken, code } }),

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

  // Saved Prompts
  getSavedPrompts: (params?: { page?: number; per_page?: number; search?: string; tag?: string; favorites?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.per_page) q.set("per_page", String(params.per_page));
    if (params?.search) q.set("search", params.search);
    if (params?.tag) q.set("tag", params.tag);
    if (params?.favorites) q.set("favorites", "true");
    const qs = q.toString();
    return request(`/api/saved-prompts${qs ? `?${qs}` : ""}`);
  },
  savePrompt: (data: { title: string; prompt_text: string; original_text?: string; tags?: string; source?: string; thread_id?: string }) =>
    request("/api/saved-prompts", { method: "POST", body: data as unknown as Record<string, unknown> }),
  getSavedPrompt: (id: number) => request(`/api/saved-prompts/${id}`),
  updateSavedPrompt: (id: number, data: { title?: string; prompt_text?: string; tags?: string; is_favorite?: boolean }) =>
    request(`/api/saved-prompts/${id}`, { method: "PUT", body: data as unknown as Record<string, unknown> }),
  deleteSavedPrompt: (id: number) =>
    request(`/api/saved-prompts/${id}`, { method: "DELETE" }),
  toggleFavorite: (id: number) =>
    request(`/api/saved-prompts/${id}/toggle-favorite`, { method: "POST" }),
};
