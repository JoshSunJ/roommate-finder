import prisma from "@/lib/prisma";
import { probeDatabase } from "@/lib/database-health";

export const runtime = "nodejs";

export async function GET() {
  const database = await probeDatabase(
    () => prisma.$queryRaw`SELECT 1`,
  );
  const status = database.reachable ? "ok" : "degraded";

  return Response.json(
    { status, database: database.reachable ? "reachable" : "unreachable" },
    {
      status: database.reachable ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
