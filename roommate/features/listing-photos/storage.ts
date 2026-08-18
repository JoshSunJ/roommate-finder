import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export class PhotoValidationError extends Error {}

const extensionByType: Record<(typeof ALLOWED_PHOTO_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const uploadDirectory = path.join(process.cwd(), "public", "uploads", "listings");

function hasMatchingSignature(bytes: Uint8Array, type: string): boolean {
  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (type === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
      .every((value, index) => bytes[index] === value);
  }
  if (type === "image/webp") {
    return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  }
  return false;
}

export async function storeListingPhoto(file: File) {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_TYPES)[number])) {
    throw new PhotoValidationError("Upload JPEG, PNG, or WebP images only.");
  }
  if (file.size === 0 || file.size > MAX_PHOTO_BYTES) {
    throw new PhotoValidationError("Each photo must be between 1 byte and 5 MB.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasMatchingSignature(bytes, file.type)) {
    throw new PhotoValidationError("A file's contents do not match its image type.");
  }

  const storageKey = `${randomUUID()}.${extensionByType[file.type as keyof typeof extensionByType]}`;
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, storageKey), bytes, { flag: "wx" });

  return { storageKey, url: `/uploads/listings/${storageKey}` };
}

export async function removeStoredListingPhoto(storageKey: string): Promise<void> {
  if (path.basename(storageKey) !== storageKey || !/^[a-f0-9-]+\.(jpg|png|webp)$/.test(storageKey)) {
    throw new Error("Refusing to remove an invalid storage key.");
  }

  try {
    await unlink(path.join(uploadDirectory, storageKey));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
