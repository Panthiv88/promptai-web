"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import Link from "next/link";

export default function SecurityPage() {
  const router = useRouter();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Setup flow state
  const [setupStep, setSetupStep] = useState<"idle" | "qr" | "recovery">("idle");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Disable flow
  const [disableCode, setDisableCode] = useState("");
  const [showDisable, setShowDisable] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login?redirect=/dashboard/security");
      return;
    }
    loadMfaStatus();
  }, []);

  async function loadMfaStatus() {
    try {
      const data = await api.me();
      setMfaEnabled(!!(data as Record<string, unknown>).mfa_enabled);
    } catch {
      setError("Failed to load account info");
    } finally {
      setLoading(false);
    }
  }

  async function startSetup() {
    setError("");
    setActionLoading(true);
    try {
      const data = await api.mfaSetup();
      setQrCode(data.qr_code as string);
      setSecret(data.secret as string);
      setSetupStep("qr");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function verifySetup() {
    setError("");
    setActionLoading(true);
    try {
      const data = await api.mfaVerifySetup(verifyCode);
      setRecoveryCodes(data.recovery_codes as string[]);
      setMfaEnabled(true);
      setSetupStep("recovery");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function disableMfa() {
    setError("");
    setActionLoading(true);
    try {
      await api.mfaDisable(disableCode);
      setMfaEnabled(false);
      setShowDisable(false);
      setDisableCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable MFA");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <p className="text-[--text-muted]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
            &larr; Back to Dashboard
          </Link>
        </div>

        <h1 className="font-display text-2xl font-bold text-white mb-2">Security</h1>
        <p className="text-[--text-secondary] mb-8">Manage two-factor authentication for your account</p>

        {error && (
          <div className="mb-6 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Two-Factor Authentication</h2>
              <p className="text-sm text-[--text-secondary] mt-1">
                {mfaEnabled ? "Your account is protected with 2FA" : "Add an extra layer of security"}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${mfaEnabled ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" : "bg-white/5 text-[--text-muted] border border-white/10"}`}>
              {mfaEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          {/* Setup flow */}
          {!mfaEnabled && setupStep === "idle" && (
            <button
              onClick={startSetup}
              disabled={actionLoading}
              className="w-full py-3 px-4 text-white rounded-xl font-medium transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
            >
              {actionLoading ? "Setting up..." : "Enable 2FA"}
            </button>
          )}

          {setupStep === "qr" && (
            <div className="space-y-4">
              <p className="text-sm text-[--text-secondary]">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              {qrCode && (
                <div className="flex justify-center p-4 bg-white rounded-xl">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              )}
              <details className="text-sm">
                <summary className="text-[--text-muted] cursor-pointer hover:text-[--text-secondary]">
                  Can&apos;t scan? Enter manually
                </summary>
                <code className="block mt-2 p-3 bg-white/5 rounded-lg text-teal-400 break-all text-xs">
                  {secret}
                </code>
              </details>

              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">
                  Enter the 6-digit code from your app
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full rounded-xl px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-white text-center tracking-[0.3em] text-lg focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all"
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setSetupStep("idle"); setVerifyCode(""); setError(""); }}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 text-[--text-secondary] hover:bg-white/5 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={verifySetup}
                  disabled={actionLoading || verifyCode.length < 6}
                  className="flex-1 py-2.5 px-4 text-white rounded-xl font-medium transition-all hover:brightness-110 disabled:opacity-50 text-sm"
                  style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
                >
                  {actionLoading ? "Verifying..." : "Verify & Enable"}
                </button>
              </div>
            </div>
          )}

          {setupStep === "recovery" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <p className="text-sm font-medium text-amber-400 mb-2">Save your recovery codes</p>
                <p className="text-xs text-[--text-secondary] mb-3">
                  Store these codes somewhere safe. Each code can only be used once to sign in if you lose access to your authenticator app.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {recoveryCodes.map((code, i) => (
                    <code key={i} className="p-2 bg-white/5 rounded text-center text-sm text-white font-mono">
                      {code}
                    </code>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { setSetupStep("idle"); setRecoveryCodes([]); setVerifyCode(""); }}
                className="w-full py-3 px-4 text-white rounded-xl font-medium transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
              >
                Done
              </button>
            </div>
          )}

          {/* Disable flow */}
          {mfaEnabled && !showDisable && setupStep === "idle" && (
            <button
              onClick={() => setShowDisable(true)}
              className="w-full py-3 px-4 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/5 transition-all text-sm"
            >
              Disable 2FA
            </button>
          )}

          {showDisable && (
            <div className="space-y-4">
              <p className="text-sm text-[--text-secondary]">Enter your authenticator code to disable 2FA</p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="w-full rounded-xl px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-white text-center tracking-[0.3em] text-lg focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all"
                placeholder="000000"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDisable(false); setDisableCode(""); setError(""); }}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 text-[--text-secondary] hover:bg-white/5 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={disableMfa}
                  disabled={actionLoading || disableCode.length < 6}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/5 transition-all text-sm disabled:opacity-50"
                >
                  {actionLoading ? "Disabling..." : "Confirm Disable"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
