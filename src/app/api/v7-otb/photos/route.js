import { authenticateRequest } from "@/lib/auth-middleware";
import { apiError, apiSuccess } from "@/lib/api-response";
import VoyageLog from "@/models/VoyageLog";
import { uploadPhotoFile } from "@/lib/storage";
import { generateWanderBrief } from "@/lib/ai-summary";

/**
 * GET /api/v7-otb/photos
 * List all travel photos belonging exclusively to the authenticated user.
 */
export async function GET(request) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error) return error;

    // Strict ownership: user can ONLY see their own photos
    const photos = await VoyageLog.find({ userId: user._id }).sort({ createdAt: -1 });

    return apiSuccess(
      {
        photos,
        count: photos.length,
      },
      "Photos retrieved successfully"
    );
  } catch (err) {
    console.error("GET /photos error:", err);
    return apiError("Failed to fetch photos.", 500);
  }
}

/**
 * POST /api/v7-otb/photos
 * Upload a travel photo with name, location, and description.
 * Automatically generates the AI summary (wander_brief) and stores in voyage_log.
 */
export async function POST(request) {
  try {
    const { user, error } = await authenticateRequest(request);
    if (error) return error;

    let name = "";
    let location = "";
    let description = "";
    let photoBuffer = null;
    let originalName = "photo.jpg";
    let mimeType = "image/jpeg";
    let directPhotoUrl = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      name = formData.get("name")?.toString()?.trim() || "";
      location = formData.get("location")?.toString()?.trim() || "";
      description = formData.get("description")?.toString()?.trim() || "";
      const file = formData.get("photo");

      if (file && typeof file === "object" && typeof file.arrayBuffer === "function") {
        const arrayBuffer = await file.arrayBuffer();
        photoBuffer = Buffer.from(arrayBuffer);
        originalName = file.name || "photo.jpg";
        mimeType = file.type || "image/jpeg";
      } else if (typeof file === "string" && file.startsWith("http")) {
        directPhotoUrl = file;
      }
    } else {
      const body = await request.json().catch(() => ({}));
      name = body.name?.trim() || "";
      location = body.location?.trim() || "";
      description = body.description?.trim() || "";

      if (body.photo && typeof body.photo === "string") {
        if (body.photo.startsWith("data:image")) {
          const matches = body.photo.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            mimeType = matches[1];
            photoBuffer = Buffer.from(matches[2], "base64");
          }
        } else if (body.photo.startsWith("http") || body.photo.startsWith("/")) {
          directPhotoUrl = body.photo;
        }
      }
    }

    // Input validation
    if (!name) return apiError("Photo name/title is required.", 400);
    if (!location) return apiError("Location is required.", 400);
    if (!description) return apiError("Description is required.", 400);
    if (!photoBuffer && !directPhotoUrl) {
      return apiError("A photo image is required.", 400);
    }

    // Handle photo storage
    let photoUrl = directPhotoUrl;
    let photoPublicId = null;

    if (photoBuffer) {
      const uploadResult = await uploadPhotoFile(photoBuffer, originalName, mimeType);
      photoUrl = uploadResult.photoUrl;
      photoPublicId = uploadResult.photoPublicId;
    }

    // CRITICAL: Automatically generate the AI summary for the description
    // Field name must be: wander_brief
    const wander_brief = await generateWanderBrief({
      name,
      location,
      description,
    });

    // Save to voyage_log collection
    const newVoyageLog = await VoyageLog.create({
      userId: user._id,
      name,
      location,
      description,
      photoUrl,
      photoPublicId,
      wander_brief,
    });

    return apiSuccess(
      { photo: newVoyageLog },
      "Travel photo uploaded and AI wander brief generated successfully!",
      201
    );
  } catch (err) {
    console.error("POST /photos error:", err);
    return apiError("Failed to upload photo.", 500);
  }
}
