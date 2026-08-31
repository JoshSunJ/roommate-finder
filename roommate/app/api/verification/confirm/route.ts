import { consumeAffiliationVerification } from "@/features/verification/service";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const verified = await consumeAffiliationVerification(
    requestUrl.searchParams.get("token") ?? "",
  );
  const destination = new URL("/verify", requestUrl.origin);
  destination.searchParams.set("status", verified ? "verified" : "invalid");
  return Response.redirect(destination, 303);
}
