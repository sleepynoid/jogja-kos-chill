import { supabase } from "./supabase";

const BUCKET_NAME = "kosjewish";

/**
 * Convert image file to WebP format using Canvas API.
 * Runs client-side only (browser).
 *
 * @param file - Original image file
 * @param quality - WebP quality (0-1), default 0.8
 * @param maxWidth - Max width in px, will resize proportionally. Default 1600.
 * @returns WebP Blob
 */
export async function convertToWebp(
  file: File,
  quality = 0.8,
  maxWidth = 1600,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate dimensions (resize if larger than maxWidth)
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert image to WebP"));
          }
        },
        "image/webp",
        quality,
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload a kos image to Supabase Storage.
 * Converts to WebP before uploading for smaller file size.
 *
 * @param file - Original image file from input
 * @param mitraUuid - UUID of the mitra (used as folder prefix)
 * @returns Public URL of the uploaded image
 */
export async function uploadKosImage(file: File, mitraUuid: string): Promise<string> {
  // Convert to WebP
  const webpBlob = await convertToWebp(file);

  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const fileName = `${mitraUuid}/${timestamp}-${random}.webp`;

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, webpBlob, {
      contentType: "image/webp",
      cacheControl: "31536000", // 1 year cache (immutable filename)
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload gagal: ${error.message}`);
  }

  // Get public URL
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

  return data.publicUrl;
}

/**
 * Upload multiple kos images.
 * Returns array of public URLs in the same order.
 */
export async function uploadKosImages(files: File[], mitraUuid: string): Promise<string[]> {
  const results = await Promise.all(
    files.map((file) => uploadKosImage(file, mitraUuid)),
  );
  return results;
}

/**
 * Delete a kos image from Supabase Storage.
 *
 * @param publicUrl - The full public URL of the image
 */
export async function deleteKosImage(publicUrl: string): Promise<void> {
  // Extract path from public URL
  // URL format: https://xxx.supabase.co/storage/v1/object/public/kosjewish/path/to/file.webp
  const match = publicUrl.match(/\/kosjewish\/(.+)$/);
  if (!match) return;

  const filePath = match[1];
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

  if (error) {
    console.error("Failed to delete image:", error.message);
  }
}
