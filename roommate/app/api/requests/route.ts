import { z } from "zod";

import {
  createHousingRequest,
  getHousingRequests,
} from "@/features/housing-requests/service";
import { getCurrentUser, isVerifiedUser } from "@/lib/current-user";

const createHousingRequestSchema = z.object({
  title: z.string().trim().min(5).max(120),
  maxRent: z.number().int().positive(),
  preferredLocation: z.string().trim().min(2).max(120),
  description: z.string().trim().min(20).max(2_000),
  moveInDate: z.string().trim().min(3).max(60),
  moveOutDate: z.string().trim().min(3).max(60),
  bedroomsNeeded: z.number().int().positive().max(10),
});

export async function GET() {
  return Response.json(await getHousingRequests());
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return Response.json({ error: "Sign in to post a housing request." }, { status: 401 });
  }
  if (!isVerifiedUser(currentUser)) return Response.json({ error: "Verify your affiliation before posting a request." }, { status: 403 });

  const parsed = createHousingRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Check the request details: title, budget, location, dates, and description are required." },
      { status: 400 },
    );
  }

  return Response.json(
    await createHousingRequest(parsed.data, currentUser),
    { status: 201 },
  );
}
