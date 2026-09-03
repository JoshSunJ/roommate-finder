import "dotenv/config";

import {
  removeStoredListingPhoto,
  storeListingPhoto,
} from "../features/listing-photos/storage";

Reflect.set(process.env, "NODE_ENV", "production");

const ONE_PIXEL_PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
  0x89, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x44, 0x41,
  0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0xf0, 0x1f,
  0x00, 0x05, 0x00, 0x01, 0xff, 0x89, 0x99, 0x3d, 0x1d,
  0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
  0x42, 0x60, 0x82,
]);

async function validateProductionPhotoStorage() {
  let storageKey: string | undefined;

  try {
    const probe = new File([ONE_PIXEL_PNG], "unitern-storage-probe.png", {
      type: "image/png",
    });
    const stored = await storeListingPhoto(probe);
    storageKey = stored.storageKey;

    const response = await fetch(stored.url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`The uploaded photo was not publicly readable (HTTP ${response.status}).`);
    }
    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.startsWith("image/png")) {
      throw new Error("The public photo URL returned an unexpected content type.");
    }

    console.log("Production photo storage is operational.");
    console.log(`Public delivery origin: ${new URL(stored.url).origin}`);
  } catch (error: unknown) {
    console.error(error instanceof Error
      ? error.message
      : "Production photo storage validation failed unexpectedly.");
    process.exitCode = 1;
  } finally {
    if (storageKey) {
      try {
        await removeStoredListingPhoto(storageKey);
      } catch {
        console.error("The storage probe could not be removed; delete it from the bucket manually.");
        process.exitCode = 1;
      }
    }
  }
}

void validateProductionPhotoStorage();
