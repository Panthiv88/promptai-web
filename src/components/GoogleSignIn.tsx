"use client";

import { useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { setToken, setRefreshToken } from "@/lib/auth";

interface GoogleSignInProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onMfaRequired?: (mfaToken: string) => void;
  buttonText?: "signin_with" | "signup_with" | "continue_with";
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with";
              width?: number;
            }
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function GoogleSignIn({ onSuccess, onError, onMfaRequired, buttonText = "continue_with" }: GoogleSignInProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn("Google Client ID not configured");
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  async function handleCredentialResponse(response: { credential: string }) {
    try {
      const data = await api.googleAuth(response.credential);
      if (data.mfa_required) {
        onMfaRequired?.(data.mfa_token as string);
        return;
      }
      setToken(data.access_token as string);
      if (data.refresh_token) setRefreshToken(data.refresh_token as string);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign in failed";
      onError?.(message);
    }
  }

  function initializeGoogle() {
    if (!window.google || !buttonRef.current || initializedRef.current) return;

    initializedRef.current = true;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID!,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      text: buttonText,
      width: 400,
    });
  }

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <div ref={buttonRef} />
    </div>
  );
}
