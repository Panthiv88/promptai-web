"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Step = "email" | "otp" | "reset" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email.trim()) { setError("Please enter your email address"); return; }
    setLoading(true);
    try {
      await api.forgotPassword(email.trim().toLowerCase());
      setMessage("If this email exists, you will receive a password reset code.");
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset code");
    } finally { setLoading(false); }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!otp.trim() || otp.length !== 6) { setError("Please enter a valid 6-digit code"); return; }
    setLoading(true);
    try {
      await api.verifyOtp(email, otp.trim());
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code");
    } finally { setLoading(false); }
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!newPassword || newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await api.resetPassword(email, otp, newPassword);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally { setLoading(false); }
  }

  function handleResendCode() {
    setStep("email");
    setOtp("");
    setError("");
    setMessage("");
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-[--text-muted] focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all text-sm disabled:opacity-50";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white">
            {step === "email" && "Forgot Password"}
            {step === "otp" && "Enter Code"}
            {step === "reset" && "Reset Password"}
            {step === "success" && "Password Reset!"}
          </h1>
          <p className="mt-2 text-[--text-secondary]">
            {step === "email" && "Enter your email to receive a reset code"}
            {step === "otp" && `We sent a 6-digit code to ${email}`}
            {step === "reset" && "Create your new password"}
            {step === "success" && "Your password has been reset successfully"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
            {error}
          </div>
        )}

        {message && step === "otp" && (
          <div className="mb-4 p-3 rounded-xl border border-teal-500/20 bg-teal-500/5 text-teal-400 text-sm">
            {message}
          </div>
        )}

        <div className="glass-card rounded-2xl p-8">
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} disabled={loading} />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 text-white rounded-xl font-medium transition-all hover:brightness-110 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}>
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">6-Digit Code</label>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" className={`${inputClass} text-center text-2xl tracking-widest font-mono`} maxLength={6} disabled={loading} />
              </div>
              <button type="submit" disabled={loading || otp.length !== 6} className="w-full py-3 text-white rounded-xl font-medium transition-all hover:brightness-110 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}>
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              <button type="button" onClick={handleResendCode} className="w-full py-3 text-[--text-muted] hover:text-[--text-secondary] text-sm transition-colors">
                Didn&apos;t receive the code? Resend
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" className={inputClass} disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-1.5">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" className={inputClass} disabled={loading} />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 text-white rounded-xl font-medium transition-all hover:brightness-110 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          {step === "success" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <Link href="/login" className="inline-block w-full py-3 text-white rounded-xl font-medium transition-all hover:brightness-110 text-center" style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}>
                Go to Login
              </Link>
            </div>
          )}
        </div>

        {step !== "success" && (
          <p className="mt-6 text-center text-sm text-[--text-muted]">
            Remember your password?{" "}
            <Link href="/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
