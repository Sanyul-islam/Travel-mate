"use client";

import React, { useState, useEffect } from "react";
import { X, ShieldCheck, Copy, Check, Loader2, KeyRound } from "lucide-react";

export default function TwoFactorModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      initSetup();
    } else {
      setSetupData(null);
      setCode("");
      setError("");
      setCopied(false);
    }
  }, [isOpen]);

  const initSetup = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/v7-otb/auth/2fa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate 2FA setup");
      }

      setSetupData(data.data || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code || code.trim().length !== 6) {
      setError("Please enter the 6-digit verification code from your app.");
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/v7-otb/auth/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Enable 2FA (OrbitTrail)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="text-xs text-slate-500">Generating OrbitTrail security key...</span>
            </div>
          ) : setupData ? (
            <>
              {/* Step 1: Scan QR Code */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Step 1: Scan with Google Authenticator or Authy
                </div>
                <div className="flex justify-center p-3 bg-white rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  {setupData.qrCode && (
                    <img
                      src={setupData.qrCode}
                      alt="OrbitTrail 2FA QR Code"
                      className="h-48 w-48 rounded-lg"
                    />
                  )}
                </div>
              </div>

              {/* Secret key manual entry */}
              <div>
                <div className="text-xs font-medium text-slate-500 mb-1">
                  Or enter secret key manually:
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2">
                  <KeyRound className="h-4 w-4 text-slate-400 shrink-0" />
                  <code className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 flex-1 truncate">
                    {setupData.secret}
                  </code>
                  <button
                    onClick={handleCopySecret}
                    className="p-1 rounded text-slate-500 hover:text-blue-600 transition-colors"
                    title="Copy Secret"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Step 2: Enter 6 digit code */}
              <form onSubmit={handleVerify} className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Step 2: Enter the 6-digit code from your app
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-[0.5em] font-mono text-xl font-bold py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-black outline-none focus:border-blue-600 focus:bg-slate-50 focus:ring-2 focus:ring-blue-100"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={verifying || code.length !== 6}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition-all"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Confirm & Activate 2FA</span>
                  )}
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
