import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload an image buffer or base64 data to storage (Cloudinary or local public/uploads)
 * @param {Buffer|string} fileBuffer
 * @param {string} originalName
 * @param {string} mimeType
 * @returns {Promise<{ photoUrl: string, photoPublicId: string }>}
 */
export async function uploadPhotoFile(fileBuffer, originalName = "photo.jpg", mimeType = "image/jpeg") {
  // If Cloudinary is configured, use it
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "orbit_trail_photos",
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            photoUrl: result.secure_url,
            photoPublicId: result.public_id,
          });
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  // Fallback to local storage in public/uploads/
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch {
    // directory exists
  }

  const ext = path.extname(originalName) || (mimeType.includes("png") ? ".png" : ".jpg");
  const randomName = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(uploadsDir, randomName);

  await fs.writeFile(filePath, fileBuffer);

  return {
    photoUrl: `/uploads/${randomName}`,
    photoPublicId: randomName,
  };
}

/**
 * Delete a photo file from storage
 */
export async function deletePhotoFile(photoUrl, photoPublicId) {
  try {
    if (isCloudinaryConfigured && photoPublicId && !photoPublicId.includes(".")) {
      await cloudinary.uploader.destroy(photoPublicId);
      return;
    }

    if (photoPublicId && photoPublicId.includes(".")) {
      const filePath = path.join(process.cwd(), "public", "uploads", photoPublicId);
      await fs.unlink(filePath).catch(() => {});
    } else if (photoUrl && photoUrl.startsWith("/uploads/")) {
      const filename = path.basename(photoUrl);
      const filePath = path.join(process.cwd(), "public", "uploads", filename);
      await fs.unlink(filePath).catch(() => {});
    }
  } catch (err) {
    console.warn("Could not delete photo file from storage:", err.message);
  }
}
