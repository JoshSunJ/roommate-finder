import prisma from "@/lib/prisma";
import { MAX_LISTING_PHOTOS } from "@/features/listing-photos/constants";
import type { ListingPhoto } from "@/features/listings/types";

type StoredPhotoInput = {
  url: string;
  storageKey: string;
  altText: string;
};

function toListingPhoto(photo: { id: number; url: string; altText: string; position: number }): ListingPhoto {
  return { id: photo.id, url: photo.url, altText: photo.altText, position: photo.position };
}

export async function getPhotoUploadContext(listingId: number, ownerId: number) {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, ownerId },
    select: { title: true, _count: { select: { photos: true } } },
  });
  if (!listing) return null;
  return {
    title: listing.title,
    remaining: Math.max(0, MAX_LISTING_PHOTOS - listing._count.photos),
  };
}

export async function createListingPhotosForOwner(
  listingId: number,
  ownerId: number,
  photos: StoredPhotoInput[],
): Promise<ListingPhoto[] | null> {
  return prisma.$transaction(async (transaction) => {
    const listing = await transaction.listing.findFirst({
      where: { id: listingId, ownerId },
      select: { _count: { select: { photos: true } } },
    });
    if (!listing || listing._count.photos + photos.length > MAX_LISTING_PHOTOS) return null;

    const created: ListingPhoto[] = [];
    for (const [index, photo] of photos.entries()) {
      const record = await transaction.listingPhoto.create({
        data: {
          listingId,
          ...photo,
          position: listing._count.photos + index,
        },
      });
      created.push(toListingPhoto(record));
    }
    return created;
  });
}

export async function deleteListingPhotoForOwner(
  listingId: number,
  photoId: number,
  ownerId: number,
): Promise<string | null> {
  return prisma.$transaction(async (transaction) => {
    const photo = await transaction.listingPhoto.findFirst({
      where: { id: photoId, listingId, listing: { ownerId } },
      select: { id: true, position: true, storageKey: true },
    });
    if (!photo) return null;

    await transaction.listingPhoto.delete({ where: { id: photo.id } });
    await transaction.listingPhoto.updateMany({
      where: { listingId, position: { gt: photo.position } },
      data: { position: { decrement: 1 } },
    });
    return photo.storageKey;
  });
}

export async function setListingCoverPhotoForOwner(
  listingId: number,
  photoId: number,
  ownerId: number,
): Promise<boolean> {
  return prisma.$transaction(async (transaction) => {
    const selected = await transaction.listingPhoto.findFirst({
      where: { id: photoId, listingId, listing: { ownerId } },
      select: { id: true, position: true },
    });
    if (!selected) return false;
    if (selected.position === 0) return true;

    const currentCover = await transaction.listingPhoto.findFirst({
      where: { listingId, position: 0 },
      select: { id: true },
    });
    if (currentCover) {
      await transaction.listingPhoto.update({
        where: { id: currentCover.id },
        data: { position: selected.position },
      });
    }
    await transaction.listingPhoto.update({ where: { id: selected.id }, data: { position: 0 } });
    return true;
  });
}
