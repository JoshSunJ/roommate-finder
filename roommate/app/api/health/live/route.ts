export const runtime = "nodejs";

export async function GET() {
  return Response.json(
    { status: "ok" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
