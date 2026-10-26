import mongoose from "mongoose";
import { authenticateRequest } from "@/lib/auth-middleware";
import { apiError, apiSuccess } from "@/lib/api-response";
import VoyageLog from "@/models/VoyageLog";
import { deletePhotoFile } from "@/lib/storage";
import { generateWanderBrief } from "@/lib/ai-summary";

/**
 * GET /api/v7-otb/photos/[id]
 * Return one photo belonging to the current user.
 */
export async function GET(request, { params }) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error) return error;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError("Invalid photo ID format.", 400);
    }

    const photo = await VoyageLog.findById(id);

    if (!photo) {
      return apiError("Photo not found.", 404);
    }

    // Strict ownership verification:
    // A user must never be able to read another user's photos
    if (photo.userId.toString() !== user._id.toString()) {
      return apiError("Access denied. You do not have permission to view this photo.", 403);
    }

    return apiSuccess({ photo });
  } catch (err) {
    console.error("GET /photos/:id error:", err);
    return apiError("Failed to fetch photo details.", 500);
  }
}

/**
 * PUT /api/v7-otb/photos/[id]
 * Edit name, location, or description of a photo.
 */
export async function PUT(request, { params }) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error) return error;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError("Invalid photo ID format.", 400);
    }

    const photo = await VoyageLog.findById(id);

    if (!photo) {
      return apiError("Photo not found.", 404);
    }

    // Strict ownership verification:
    // A user must never be able to change another user's photos
    if (photo.userId.toString() !== user._id.toString()) {
      return apiError("Access denied. You do not have permission to edit this photo.", 403);
    }

    const body = await request.json().catch(() => ({}));
    const { name, location, description } = body;

    let descriptionChanged = false;

    if (name !== undefined && name.trim()) {
      photo.name = name.trim();
    }
    if (location !== undefined && location.trim()) {
      photo.location = location.trim();
    }
    if (description !== undefined && description.trim()) {
      if (photo.description !== description.trim()) {
        descriptionChanged = true;
      }
      photo.description = description.trim();
    }

    // Refresh wander_brief AI summary if description changed
    if (descriptionChanged) {
      photo.wander_brief = await generateWanderBrief({
        name: photo.name,
        location: photo.location,
        description: photo.description,
      });
    }

    await photo.save();

    return apiSuccess({ photo }, "Travel photo updated successfully!");
  } catch (err) {
    console.error("PUT /photos/:id error:", err);
    return apiError("Failed to update photo.", 500);
  }
}

/**
 * DELETE /api/v7-otb/photos/[id]
 * Delete a photo and its stored file.
 */
export async function DELETE(request, { params }) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error) return error;

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiError("Invalid photo ID format.", 400);
    }

    const photo = await VoyageLog.findById(id);

    if (!photo) {
      return apiError("Photo not found.", 404);
    }

    // Strict ownership verification:
    // A user must never be able to delete another user's photos
    if (photo.userId.toString() !== user._id.toString()) {
      return apiError("Access denied. You do not have permission to delete this photo.", 403);
    }

    // Remove stored photo file
    await deletePhotoFile(photo.photoUrl, photo.photoPublicId);

    // Remove from voyage_log collection
    await VoyageLog.findByIdAndDelete(id);

    return apiSuccess({ id }, "Photo and associated file deleted successfully.");
  } catch (err) {
    console.error("DELETE /photos/:id error:", err);
    return apiError("Failed to delete photo.", 500);
  }
}
