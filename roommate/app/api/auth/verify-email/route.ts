import { consumeEmailVerification } from "@/features/account-email/service";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token") ?? "";
  const verified = await consumeEmailVerification(token);
  const destination = new URL("/verify-email", requestUrl.origin);
  destination.searchParams.set("status", verified ? "verified" : "invalid");

  return Response.redirect(destination, 303);
}
