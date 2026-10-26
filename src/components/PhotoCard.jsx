"use client";

import React, { useState } from "react";
import { MapPin, Sparkles, Pencil, Trash2, Calendar, Eye } from "lucide-react";

export default function PhotoCard({ photo, onEdit, onDelete, onView }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(photo._id);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  const formattedDate = photo.createdAt
    ? new Date(photo.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      onClick={() => onView && onView(photo)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-xl hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 cursor-pointer"
    >
      {/* Photo Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={photo.photoUrl}
          alt={photo.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Location Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-slate-900/75 backdrop-blur-md px-3 py-1 text-xs font-medium text-white shadow-sm">
          <MapPin className="h-3.5 w-3.5 text-cyan-400" />
          <span className="truncate max-w-[180px]">{photo.location}</span>
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(photo);
            }}
            title="Edit Photo"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-md hover:bg-white hover:text-blue-600 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            title={confirmDelete ? "Click again to confirm delete" : "Delete Photo"}
            className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md backdrop-blur-md transition-colors ${
              confirmDelete
                ? "bg-rose-600 text-white animate-pulse"
                : "bg-white/90 text-slate-700 hover:bg-rose-50 hover:text-rose-600"
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Title and Date */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {photo.name}
          </h3>
          {formattedDate && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0 mt-1">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
          )}
        </div>

        {/* AI Summary Highlight (wander_brief) */}
        {photo.wander_brief ? (
          <div className="mb-3 rounded-xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 p-3 border border-blue-100/70 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/30 dark:border-blue-900/40">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Wander Brief (AI)
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 italic leading-relaxed">
              &ldquo;{photo.wander_brief}&rdquo;
            </p>
          </div>
        ) : null}

        {/* User Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-auto">
          {photo.description}
        </p>

        {/* Card Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <Eye className="h-3.5 w-3.5" />
            <span>Click for full memory</span>
          </span>
          {confirmDelete && (
            <span className="text-xs font-semibold text-rose-500">
              Confirm delete?
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
