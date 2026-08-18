import { z } from "zod";

const dateString = z.string().trim().min(1, "Choose a date.").max(60).refine(
  (value) => !Number.isNaN(Date.parse(value)),
  "Use a valid date.",
);

const coordinatesSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
});

export const listingInputSchema = z.object({
  title: z.string().trim().min(5).max(100),
  rent: z.number().int().positive().max(50_000),
  location: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(3_000),
  bedrooms: z.number().int().positive().max(20),
  bathroomType: z.enum(["Private", "Shared"]),
  availableFrom: dateString,
  availableUntil: dateString.nullable(),
  roomType: z.enum(["private", "shared", "entire_place"]),
  leaseType: z.enum(["sublet", "month_to_month", "fixed_term"]),
  furnished: z.boolean(),
  utilitiesIncluded: z.boolean(),
  utilitiesEstimate: z.number().int().nonnegative().max(10_000).nullable(),
  securityDeposit: z.number().int().nonnegative().max(100_000).nullable(),
  parkingAvailable: z.boolean(),
  petsAllowed: z.boolean(),
  coordinates: coordinatesSchema,
}).strict().superRefine((listing, context) => {
  if (
    listing.availableUntil &&
    Date.parse(listing.availableUntil) <= Date.parse(listing.availableFrom)
  ) {
    context.addIssue({
      code: "custom",
      path: ["availableUntil"],
      message: "Available-until must be later than available-from.",
    });
  }
});

export const listingPatchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("status"),
    status: z.enum(["active", "filled", "expired"]),
  }).strict(),
  z.object({
    action: z.literal("details"),
    listing: listingInputSchema,
  }).strict(),
]);
