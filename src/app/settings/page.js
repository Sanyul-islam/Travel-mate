"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import TwoFactorModal from "@/components/TwoFactorModal";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  ShieldAlert,
  User,
  Mail,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, isAuthenticated, refreshUser } = useAuth();

  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disabling, setDisabling] = useState(false);
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    if (!disablePassword) {
      setStatusMessage({ text: "Password is required to disable 2FA.", type: "error" });
      return;
    }

    setDisabling(true);
    setStatusMessage({ text: "", type: "" });

    try {
      const activeToken = token || localStorage.getItem("accessToken");
      const res = await fetch("/api/v7-otb/auth/2fa/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ password: disablePassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to disable 2FA");
      }

      await refreshUser();
      setShowDisableForm(false);
      setDisablePassword("");
      setStatusMessage({ text: "Two-factor authentication has been disabled.", type: "success" });
    } catch (err) {
      setStatusMessage({ text: err.message, type: "error" });
    } finally {
      setDisabling(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Security & Account Settings
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your OrbitTrail credentials, session security, and two-factor authentication.
            </p>
          </div>

          {statusMessage.text && (
            <div
              className={`rounded-xl p-4 text-xs font-medium border flex items-center gap-2 ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Account Profile Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Profile Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <User className="h-5 w-5 text-slate-400" />
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Name
                  </div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {user?.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <Mail className="h-5 w-5 text-slate-400" />
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two-Factor Authentication Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ${
                    user?.twoFactorEnabled
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                      : "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                  }`}
                >
                  {user?.twoFactorEnabled ? (
                    <ShieldCheck className="h-6 w-6" />
                  ) : (
                    <ShieldAlert className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Two-Factor Authentication (TOTP)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Issuer: <span className="font-semibold text-blue-600">OrbitTrail</span> &bull; Scan with Google Authenticator or Authy
                  </p>
                </div>
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${
                    user?.twoFactorEnabled
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                  }`}
                >
                  {user?.twoFactorEnabled ? "Active & Enforced" : "Disabled"}
                </span>
              </div>
            </div>

            <div className="pt-6 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Two-factor authentication adds an extra layer of defense to your travel photo vault.
                When enabled, you will be prompted for a 6-digit TOTP code generated by your
                authenticator app whenever you log in.
              </p>

              {user?.twoFactorEnabled ? (
                <div>
                  {!showDisableForm ? (
                    <button
                      onClick={() => setShowDisableForm(true)}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition-colors"
                    >
                      Disable 2FA Protection
                    </button>
                  ) : (
                    <form onSubmit={handleDisable2FA} className="space-y-3 pt-2 max-w-sm">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Confirm Account Password to Disable 2FA:
                      </div>
                      <input
                        type="password"
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                        placeholder="Your password"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={disabling}
                          className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
                        >
                          {disabling ? "Disabling..." : "Confirm Disable"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDisableForm(false)}
                          className="rounded-xl px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setIs2FAModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    <KeyRound className="h-4 w-4" />
                    <span>Setup 2FA with QR Code</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 2FA Setup Modal */}
      <TwoFactorModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        onSuccess={() => {
          refreshUser();
          setStatusMessage({
            text: "Two-factor authentication successfully enabled!",
            type: "success",
          });
        }}
      />
    </div>
  );
}
