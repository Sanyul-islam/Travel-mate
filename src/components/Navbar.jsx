"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Compass,
  Camera,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  Plus,
  User as UserIcon,
  Menu,
  X,
} from "lucide-react";

export default function Navbar({ onOpenAddModal }) {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Compass className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Orbit<span className="text-blue-600 dark:text-blue-400">Trail</span>
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400 -mt-1">
              Travel Memory Vault
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-4">
          {isAuthenticated ? (
            <>
              {/* Dashboard Link */}
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  pathname === "/dashboard"
                    ? "text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                My Photos
              </Link>

              {/* 2FA Status Pill / Link */}
              <Link
                href="/settings"
                title="Manage 2FA Security"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                  user?.twoFactorEnabled
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100"
                    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100"
                }`}
              >
                {user?.twoFactorEnabled ? (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>2FA Protected</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Enable 2FA</span>
                  </>
                )}
              </Link>

              {/* Add Photo Button */}
              {onOpenAddModal && (
                <button
                  onClick={onOpenAddModal}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Post Photo</span>
                </button>
              )}

              {/* User badge */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 text-xs font-bold">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-medium text-slate-900 dark:text-white leading-tight">
                    {user?.name || "Traveler"}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight truncate max-w-[120px]">
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Log out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="p-2 rounded-lg bg-blue-600 text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {user?.name}
                  </div>
                  <div className="text-xs text-slate-400">{user?.email}</div>
                </div>
              </div>

              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                My Photos
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                <span>Security & 2FA</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    user?.twoFactorEnabled
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {user?.twoFactorEnabled ? "2FA Enabled" : "2FA Inactive"}
                </span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 py-2 text-sm font-medium text-rose-600"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
