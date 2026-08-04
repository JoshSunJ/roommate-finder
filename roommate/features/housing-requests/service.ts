import type { Prisma } from "@/generated/prisma/client";
import type { CurrentUser } from "@/lib/current-user";
import prisma from "@/lib/prisma";

import type {
  CreateHousingRequestInput,
  HousingRequest,
} from "./types";

const requestWithOwner = {
  include: { owner: true },
} satisfies Prisma.HousingRequestDefaultArgs;

type HousingRequestRecord = Prisma.HousingRequestGetPayload<typeof requestWithOwner>;

function toHousingRequest(record: HousingRequestRecord | null): HousingRequest | undefined {
  if (!record) return undefined;

  return {
    id: record.id,
    ownerId: record.ownerId,
    title: record.title,
    maxRent: record.maxRent,
    preferredLocation: record.preferredLocation,
    description: record.description,
    moveInDate: record.moveInDate,
    moveOutDate: record.moveOutDate,
    bedroomsNeeded: record.bedroomsNeeded,
    status: record.status as HousingRequest["status"],
    requestedBy: record.owner.name,
  };
}

export async function getHousingRequests(): Promise<HousingRequest[]> {
  const records = await prisma.housingRequest.findMany({
    ...requestWithOwner,
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
  });

  return records.map((record) => toHousingRequest(record)!);
}

export async function getHousingRequestById(id: number): Promise<HousingRequest | undefined> {
  return toHousingRequest(
    await prisma.housingRequest.findUnique({
      ...requestWithOwner,
      where: { id },
    }),
  );
}

export async function getHousingRequestsForOwner(ownerId: number): Promise<HousingRequest[]> {
  const records = await prisma.housingRequest.findMany({
    ...requestWithOwner,
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });

  return records.map((record) => toHousingRequest(record)!);
}

export async function createHousingRequest(
  input: CreateHousingRequestInput,
  owner: CurrentUser,
): Promise<HousingRequest> {
  const record = await prisma.housingRequest.create({
    ...requestWithOwner,
    data: {
      ...input,
      owner: { connect: { id: owner.id } },
    },
  });

  return toHousingRequest(record)!;
}
