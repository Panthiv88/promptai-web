const AUTH_FLAG_KEY = "promptai_logged_in";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_FLAG_KEY);
}

export function setToken(_token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_FLAG_KEY, "1");
}

export function getRefreshToken(): string | null {
  return null; // Refresh token is in httpOnly cookie — cannot be read from JS
}

export function setRefreshToken(_token: string): void {
  // Refresh token is in httpOnly cookie — nothing to store client-side
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_FLAG_KEY);
  // Clean up legacy keys
  localStorage.removeItem("promptai_token");
  localStorage.removeItem("promptai_refresh_token");
  // Reset PostHog identity — dynamic import avoids static browser-only module at SSR scope
  import("posthog-js").then((mod) => mod.default.reset()).catch(() => {});
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
