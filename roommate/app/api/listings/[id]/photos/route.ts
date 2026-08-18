import {
  createListingPhotosForOwner,
  getPhotoUploadContext,
} from "@/features/listing-photos/service";
import {
  PhotoValidationError,
  removeStoredListingPhoto,
  storeListingPhoto,
} from "@/features/listing-photos/storage";
import { getCurrentUser } from "@/lib/current-user";

type RouteProps = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteProps) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in to upload photos." }, { status: 401 });

  const { id } = await params;
  const listingId = Number(id);
  if (!Number.isInteger(listingId) || listingId <= 0) {
    return Response.json({ error: "Listing not found." }, { status: 404 });
  }

  const context = await getPhotoUploadContext(listingId, user.id);
  if (!context) return Response.json({ error: "Listing not found." }, { status: 404 });

  const formData = await request.formData();
  const files = formData.getAll("photos").filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) return Response.json({ error: "Choose at least one photo." }, { status: 400 });
  if (files.length > context.remaining) {
    return Response.json({ error: `This listing can accept ${context.remaining} more photo${context.remaining === 1 ? "" : "s"}.` }, { status: 400 });
  }

  const suppliedAltText = formData.get("altText");
  const altText = typeof suppliedAltText === "string" && suppliedAltText.trim()
    ? suppliedAltText.trim().slice(0, 200)
    : `Photo of ${context.title}`;
  const stored: Array<{ storageKey: string; url: string }> = [];

  try {
    for (const file of files) stored.push(await storeListingPhoto(file));
    const created = await createListingPhotosForOwner(
      listingId,
      user.id,
      stored.map((photo) => ({ ...photo, altText })),
    );
    if (!created) {
      await Promise.all(stored.map((photo) => removeStoredListingPhoto(photo.storageKey)));
      return Response.json({ error: "The listing changed while photos were uploading. Try again." }, { status: 409 });
    }
    return Response.json(created, { status: 201 });
  } catch (error) {
    await Promise.allSettled(stored.map((photo) => removeStoredListingPhoto(photo.storageKey)));
    if (error instanceof PhotoValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("Listing photo upload failed", error);
    return Response.json({ error: "Could not store the photos." }, { status: 500 });
  }
}
