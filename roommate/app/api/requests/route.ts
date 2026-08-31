import {
  createHousingRequest,
  getHousingRequests,
} from "@/features/housing-requests/service";
import { housingRequestInputSchema } from "@/features/housing-requests/schema";
import { getCurrentUser, isVerifiedUser } from "@/lib/current-user";

export async function GET() {
  return Response.json(await getHousingRequests());
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return Response.json({ error: "Sign in to post a housing request." }, { status: 401 });
  }
  if (!isVerifiedUser(currentUser)) return Response.json({ error: "Verify your affiliation before posting a request." }, { status: 403 });

  const parsed = housingRequestInputSchema.safeParse(
    await request.json().catch(() => null),
  );
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
