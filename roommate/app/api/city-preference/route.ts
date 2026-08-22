import { NextResponse } from "next/server";

import {
  CITY_PREFERENCE_COOKIE,
  parseCityPreference,
  serializeCityPreference,
} from "@/features/location-search/city-preference";

export async function POST(request: Request) {
  const city = parseCityPreference(await request.json().catch(() => null));
  if (!city) {
    return NextResponse.json({ error: "Choose a valid city." }, { status: 400 });
  }

  const response = NextResponse.json({ city });
  response.cookies.set(CITY_PREFERENCE_COOKIE, serializeCityPreference(city), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
