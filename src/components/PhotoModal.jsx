"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Sparkles, Image as ImageIcon, MapPin, Type, AlignLeft, Loader2 } from "lucide-react";

export default function PhotoModal({ isOpen, onClose, onSave, initialData = null }) {
  const isEditing = Boolean(initialData);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setLocation(initialData.location || "");
      setDescription(initialData.description || "");
      setPhotoPreview(initialData.photoUrl || "");
      setPhotoFile(null);
    } else {
      setName("");
      setLocation("");
      setDescription("");
      setPhotoPreview("");
      setPhotoFile(null);
    }
    setError("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file (JPEG, PNG, WebP).");
        return;
      }
      setPhotoFile(file);
      setError("");

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please provide a photo title.");
      return;
    }
    if (!location.trim()) {
      setError("Please specify the location.");
      return;
    }
    if (!description.trim()) {
      setError("Please write a short description.");
      return;
    }
    if (!isEditing && !photoFile && !photoPreview) {
      setError("Please choose a photo to upload.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        // Edit flow
        await onSave({
          id: initialData._id,
          name: name.trim(),
          location: location.trim(),
          description: description.trim(),
        });
      } else {
        // Create flow with FormData
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("location", location.trim());
        formData.append("description", description.trim());
        if (photoFile) {
          formData.append("photo", photoFile);
        } else if (photoPreview) {
          formData.append("photo", photoPreview);
        }

        await onSave(formData);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save travel photo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? "Edit Travel Photo" : "Log a New Travel Memory"}
            </h2>
            <p className="text-xs text-slate-400">
              {isEditing
                ? "Update your memory details and let AI refresh your wander brief"
                : "Upload a photo and our AI will automatically distill your wander brief"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Photo upload / Preview */}
          {!isEditing && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Photo Upload
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                  photoPreview
                    ? "border-blue-300 bg-blue-50/20 dark:border-blue-800"
                    : "border-slate-200 hover:border-blue-400 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50"
                }`}
              >
                {photoPreview ? (
                  <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
                    <img
                      src={photoPreview}
                      alt="Upload preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-xs font-medium text-white bg-black/60 px-3 py-1.5 rounded-full">
                        Change Photo
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-2">
                      <Upload className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      Click to upload an image
                    </span>
                    <span className="text-xs text-slate-400 mt-0.5">
                      JPG, PNG, WebP up to 10MB
                    </span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Photo Title */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              <Type className="h-3.5 w-3.5 text-blue-600" />
              <span>Title / Memory Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sunset over Santorini Caldera"
              maxLength={120}
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-black font-medium outline-none focus:border-blue-600 focus:bg-slate-50 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 transition-all"
            />
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              <span>Location</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Oia, Santorini, Greece"
              maxLength={150}
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-black font-medium outline-none focus:border-blue-600 focus:bg-slate-50 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              <AlignLeft className="h-3.5 w-3.5 text-blue-600" />
              <span>Description</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your journey, the atmosphere, emotions, and hidden details..."
              rows={4}
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-black font-medium outline-none focus:border-blue-600 focus:bg-slate-50 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 transition-all"
            />
          </div>

          {/* AI Wander Brief Informational Pill */}
          <div className="flex items-start gap-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-3 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-900/40">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0 animate-pulse" />
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                Automated AI Summarization:
              </span>{" "}
              The <code className="font-mono text-blue-600 dark:text-blue-400">wander_brief</code> will be automatically extracted from your description and saved into your <code className="font-mono text-blue-600 dark:text-blue-400">voyage_log</code>.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isEditing ? "Updating..." : "Processing & Summarizing..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{isEditing ? "Save Changes" : "Save Memory"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
