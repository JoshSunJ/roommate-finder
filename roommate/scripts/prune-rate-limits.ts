import "dotenv/config";

import prisma from "../lib/prisma";

const RETENTION_HOURS = 24;

async function main() {
  const cutoff = new Date(Date.now() - RETENTION_HOURS * 60 * 60 * 1000);
  const result = await prisma.rateLimitBucket.deleteMany({
    where: { resetAt: { lt: cutoff } },
  });

  console.log(
    JSON.stringify({
      event: "security.rate_limits.pruned",
      deletedBuckets: result.count,
      retainedHours: RETENTION_HOURS,
    }),
  );
}

main()
  .catch(() => {
    console.error(
      JSON.stringify({
        event: "security.rate_limits.prune_failed",
      }),
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
