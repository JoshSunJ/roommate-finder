import { createHash } from "node:crypto";

import prisma from "@/lib/prisma";

type RateLimitPolicy = {
  scope: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type CounterRow = { count: number; resetAt: Date };

export function rateLimitKey(scope: string, identifier: string) {
  const digest = createHash("sha256")
    .update(identifier.trim().toLowerCase())
    .digest("hex");
  return `${scope}:${digest}`;
}

export function requestNetworkIdentifier(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded
    || request.headers.get("x-real-ip")?.trim()
    || "unknown-network";
}

export async function enforceRateLimit(
  policy: RateLimitPolicy,
  identifier: string,
  now = new Date(),
): Promise<RateLimitResult> {
  const key = rateLimitKey(policy.scope, identifier);
  const resetAt = new Date(now.getTime() + policy.windowMs);

  const rows = await prisma.$queryRaw<CounterRow[]>`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt", "updatedAt")
    VALUES (${key}, 1, ${resetAt}, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimitBucket"."resetAt" <= ${now} THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "resetAt" = CASE
        WHEN "RateLimitBucket"."resetAt" <= ${now} THEN ${resetAt}
        ELSE "RateLimitBucket"."resetAt"
      END,
      "updatedAt" = ${now}
    RETURNING "count", "resetAt"
  `;

  const counter = rows[0];
  if (!counter) throw new Error("Rate-limit counter was not returned.");

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((counter.resetAt.getTime() - now.getTime()) / 1000),
  );

  return {
    allowed: counter.count <= policy.limit,
    remaining: Math.max(0, policy.limit - counter.count),
    retryAfterSeconds,
  };
}

export function rateLimitResponse(result: RateLimitResult) {
  return Response.json(
    { error: "Too many requests. Try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": result.retryAfterSeconds.toString(),
        "Cache-Control": "no-store",
      },
    },
  );
}
