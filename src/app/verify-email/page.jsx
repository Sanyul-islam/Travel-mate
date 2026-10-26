"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Compass, CheckCircle2, XCircle, Loader2, ArrowRight, MailCheck } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token");

  const [token, setToken] = useState(tokenParam || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const verifyToken = async (tokenToVerify) => {
    if (!tokenToVerify) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v7-otb/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenToVerify.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed. Token may be invalid or expired.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenParam) {
      verifyToken(tokenParam);
    }
  }, [tokenParam]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Please enter your verification token.");
      return;
    }
    verifyToken(token.trim());
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-center">
      {loading ? (
        <div className="py-8 space-y-4">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Verifying your email address...
          </h3>
          <p className="text-xs text-slate-500">
            Please wait while we confirm your OrbitTrail token.
          </p>
        </div>
      ) : success ? (
        <div className="space-y-5 animate-fade-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Email Verified Successfully!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Your OrbitTrail account is now active. You can log in and start logging your travel photos.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-colors"
            >
              <span>Sign In Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <MailCheck className="h-6 w-6" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Confirm Email Address
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter the token sent to your email to activate your account.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2 text-left">
              <XCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-black font-medium outline-none focus:border-blue-600 focus:bg-slate-50 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 transition-all text-center font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !token.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              <span>Verify & Activate</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="pt-2 text-xs text-slate-500">
            Need to sign in?{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Go to Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Compass className="h-6 w-6" />
          </div>
        </Link>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Account Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
