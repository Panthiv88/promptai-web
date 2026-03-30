const TOKEN_KEY = "promptai_token";
const REFRESH_TOKEN_KEY = "promptai_refresh_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(_token: string): void {
  // Token is now set as httpOnly cookie by the backend — no client-side storage needed
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(_token: string): void {
  // Refresh token is now set as httpOnly cookie by the backend
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
