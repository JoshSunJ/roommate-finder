import assert from "node:assert/strict";
import test from "node:test";

import {
  PhotoStorageConfigurationError,
  PhotoValidationError,
  removeStoredListingPhoto,
  storeListingPhoto,
} from "../features/listing-photos/storage";

test("photo uploads reject a declared image type with the wrong file signature", async () => {
  const fakePng = new File([new Uint8Array([1, 2, 3, 4])], "fake.png", {
    type: "image/png",
  });

  await assert.rejects(
    () => storeListingPhoto(fakePng),
    (error: unknown) => error instanceof PhotoValidationError &&
      error.message === "A file's contents do not match its image type.",
  );
});

test("photo deletion rejects keys that could escape the configured namespace", async () => {
  await assert.rejects(
    () => removeStoredListingPhoto("../../private-key.pem"),
    /invalid storage key/,
  );
});

test("the local development adapter stores and removes a valid image", async () => {
  const pngSignature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const photo = new File([pngSignature], "valid.png", { type: "image/png" });

  const stored = await storeListingPhoto(photo);
  assert.match(stored.storageKey, /^[a-f0-9-]+\.png$/);
  assert.equal(stored.url, `/uploads/listings/${stored.storageKey}`);

  await removeStoredListingPhoto(stored.storageKey);
});

test("production fails closed instead of silently using ephemeral local storage", async () => {
  const originalNodeEnvironment = process.env.NODE_ENV;
  const originalDriver = process.env.PHOTO_STORAGE_DRIVER;
  Reflect.set(process.env, "NODE_ENV", "production");
  process.env.PHOTO_STORAGE_DRIVER = "local";

  try {
    const pngSignature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const photo = new File([pngSignature], "valid.png", { type: "image/png" });

    await assert.rejects(
      () => storeListingPhoto(photo),
      (error: unknown) => error instanceof PhotoStorageConfigurationError &&
        /disabled in production/.test(error.message),
    );
  } finally {
    if (originalNodeEnvironment === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
    else Reflect.set(process.env, "NODE_ENV", originalNodeEnvironment);
    if (originalDriver === undefined) delete process.env.PHOTO_STORAGE_DRIVER;
    else process.env.PHOTO_STORAGE_DRIVER = originalDriver;
  }
});
