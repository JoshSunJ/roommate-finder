import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.");

export const housingRequestInputSchema = z
  .object({
    title: z.string().trim().min(5).max(120),
    maxRent: z.number().int().positive().max(100_000),
    preferredLocation: z.string().trim().min(2).max(120),
    description: z.string().trim().min(20).max(2_000),
    moveInDate: isoDate,
    moveOutDate: isoDate,
    bedroomsNeeded: z.number().int().positive().max(10),
  })
  .refine((request) => request.moveOutDate >= request.moveInDate, {
    message: "Move-out date must be on or after the move-in date.",
    path: ["moveOutDate"],
  });

export const housingRequestStatusSchema = z.object({
  status: z.enum(["active", "matched", "closed"]),
});
