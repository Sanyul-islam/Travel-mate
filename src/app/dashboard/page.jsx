"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PhotoCard from "@/components/PhotoCard";
import PhotoModal from "@/components/PhotoModal";
import PhotoDetailModal from "@/components/PhotoDetailModal";
import TwoFactorModal from "@/components/TwoFactorModal";
import { useAuth } from "@/context/AuthContext";
import {
  Camera,
  Plus,
  Search,
  MapPin,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  FolderOpen,
  RefreshCw,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, isAuthenticated, refreshUser } = useAuth();

  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch photos
  const fetchPhotos = useCallback(async () => {
    const activeToken = token || localStorage.getItem("accessToken");
    if (!activeToken) return;

    setLoadingPhotos(true);
    setError("");

    try {
      const res = await fetch("/api/v7-otb/photos", {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load travel photos");
      }

      setPhotos(data.photos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPhotos(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPhotos();
    }
  }, [isAuthenticated, fetchPhotos]);

  // Handle Add / Edit
  const handleSavePhoto = async (payload) => {
    const activeToken = token || localStorage.getItem("accessToken");
    if (!activeToken) throw new Error("Authentication required");

    if (payload instanceof FormData) {
      // POST new photo
      const res = await fetch("/api/v7-otb/photos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
        body: payload,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload photo");
      }

      await fetchPhotos();
    } else {
      // PUT edit photo
      const { id, ...updateFields } = payload;
      const res = await fetch(`/api/v7-otb/photos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify(updateFields),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update photo");
      }

      await fetchPhotos();
    }
  };

  // Handle Delete
  const handleDeletePhoto = async (id) => {
    const activeToken = token || localStorage.getItem("accessToken");
    if (!activeToken) return;

    try {
      const res = await fetch(`/api/v7-otb/photos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete photo");
      }

      setPhotos((prev) => prev.filter((p) => p._id !== id));
      if (viewingPhoto?._id === id) {
        setViewingPhoto(null);
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Filter photos by search
  const filteredPhotos = photos.filter((photo) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      photo.name?.toLowerCase().includes(query) ||
      photo.location?.toLowerCase().includes(query) ||
      photo.description?.toLowerCase().includes(query) ||
      photo.wander_brief?.toLowerCase().includes(query)
    );
  });

  // Calculate unique locations
  const uniqueLocations = new Set(photos.map((p) => p.location)).size;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar onOpenAddModal={() => setIsAddModalOpen(true)} />

      <main className="flex-1 pb-16">
        {/* Dashboard Banner & Stats */}
        <section className="border-b border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/60 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Welcome back, {user?.name || "Traveler"}
                  </h1>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Manage your personal travel photos and AI-distilled wander briefs.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {/* 2FA Prompt if inactive */}
                {!user?.twoFactorEnabled && (
                  <button
                    onClick={() => setIs2FAModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 transition-colors"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>Setup 2FA Protection</span>
                  </button>
                )}

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Log New Photo</span>
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {photos.length}
                  </div>
                  <div className="text-xs text-slate-400">Memories Stored</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {uniqueLocations}
                  </div>
                  <div className="text-xs text-slate-400">Unique Destinations</div>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {photos.filter((p) => p.wander_brief).length}
                  </div>
                  <div className="text-xs text-slate-400">AI Wander Briefs</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Content Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
          {/* Search & Filter Header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by memory, destination, or brief..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchPhotos}
                title="Refresh gallery"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-sm"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingPhotos ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-4 text-xs text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Photos Grid or Empty State */}
          {loadingPhotos ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
              <p className="text-xs text-slate-400">Loading your travel photos...</p>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-12 text-center max-w-lg mx-auto">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-4">
                <FolderOpen className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {searchQuery ? "No matching photos found" : "No travel memories logged yet"}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? "Try searching with a different destination name or title."
                  : "Start documenting your journeys! Upload a photo, write a story, and watch AI generate your wander brief."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Upload Your First Photo</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {filteredPhotos.map((photo) => (
                <PhotoCard
                  key={photo._id}
                  photo={photo}
                  onView={(p) => setViewingPhoto(p)}
                  onEdit={(p) => setEditingPhoto(p)}
                  onDelete={handleDeletePhoto}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Add / Edit Photo Modal */}
      <PhotoModal
        isOpen={isAddModalOpen || Boolean(editingPhoto)}
        initialData={editingPhoto}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPhoto(null);
        }}
        onSave={handleSavePhoto}
      />

      {/* Photo Detail Modal */}
      <PhotoDetailModal
        photo={viewingPhoto}
        isOpen={Boolean(viewingPhoto)}
        onClose={() => setViewingPhoto(null)}
        onEdit={(p) => setEditingPhoto(p)}
        onDelete={handleDeletePhoto}
      />

      {/* 2FA Setup Modal */}
      <TwoFactorModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        onSuccess={() => {
          refreshUser();
          alert("2FA successfully enabled! Your account is now secured with TOTP.");
        }}
      />
    </div>
  );
}
