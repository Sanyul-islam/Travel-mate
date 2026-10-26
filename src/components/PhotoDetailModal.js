"use client";

import React from "react";
import { X, MapPin, Sparkles, Calendar, Pencil, Trash2 } from "lucide-react";

export default function PhotoDetailModal({ photo, isOpen, onClose, onEdit, onDelete }) {
  if (!isOpen || !photo) return null;

  const formattedDate = photo.createdAt
    ? new Date(photo.createdAt).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all max-h-[90vh] flex flex-col">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {photo.location}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(photo);
              }}
              title="Edit Photo"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this memory?")) {
                  onDelete(photo._id);
                  onClose();
                }
              }}
              title="Delete Photo"
              className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Main Photo Image */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-inner">
            <img
              src={photo.photoUrl}
              alt={photo.name}
              className="h-full w-full object-contain bg-slate-950"
            />
          </div>

          {/* Title and metadata */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {photo.name}
            </h1>
            {formattedDate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Captured on {formattedDate}</span>
              </div>
            )}
          </div>

          {/* AI Wander Brief Section */}
          {photo.wander_brief && (
            <div className="rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 border border-blue-100 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 dark:border-blue-900/50">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  AI Wander Brief
                </span>
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic leading-relaxed">
                &ldquo;{photo.wander_brief}&rdquo;
              </p>
            </div>
          )}

          {/* Full description */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Memory Description
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {photo.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
