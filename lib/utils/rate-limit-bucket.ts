import { prisma } from "@/lib/db/client";

export interface BucketReservation {
  allowed: boolean;
  count: number;
  remaining: number;
}

/** Atomically consume one slot in a Postgres-backed fixed-window counter. */
export async function reserveRateLimitBucket(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<BucketReservation> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);
  const rows = await prisma.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "takechat"."RateLimitBucket" ("key", "count", "expiresAt", "createdAt", "updatedAt")
    VALUES (${key}, 1, ${expiresAt}, ${now}, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimitBucket"."expiresAt" <= ${now} THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "expiresAt" = CASE
        WHEN "RateLimitBucket"."expiresAt" <= ${now} THEN ${expiresAt}
        ELSE "RateLimitBucket"."expiresAt"
      END,
      "updatedAt" = ${now}
    WHERE "RateLimitBucket"."expiresAt" <= ${now}
       OR "RateLimitBucket"."count" < ${limit}
    RETURNING "count"
  `;

  if (rows.length > 0) {
    const count = Number(rows[0].count);
    return { allowed: true, count, remaining: Math.max(0, limit - count) };
  }

  const current = await prisma.rateLimitBucket.findUnique({
    where: { key },
    select: { count: true, expiresAt: true },
  });
  if (!current || current.expiresAt.getTime() <= now.getTime()) {
    return reserveRateLimitBucket(key, limit, windowSeconds);
  }
  return { allowed: false, count: current.count, remaining: 0 };
}

export async function claimRateLimitBucket(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  return (await reserveRateLimitBucket(key, limit, windowSeconds)).allowed;
}

export async function getRateLimitBucketCount(
  key: string,
): Promise<number> {
  const bucket = await prisma.rateLimitBucket.findUnique({
    where: { key },
    select: { count: true, expiresAt: true },
  });
  if (!bucket || bucket.expiresAt.getTime() <= Date.now()) return 0;
  return bucket.count;
}

export async function releaseRateLimitBucket(key: string): Promise<number> {
  const rows = await prisma.$queryRaw<Array<{ count: number }>>`
    UPDATE "takechat"."RateLimitBucket"
    SET "count" = GREATEST("count" - 1, 0), "updatedAt" = NOW()
    WHERE "key" = ${key} AND "expiresAt" > NOW()
    RETURNING "count"
  `;
  return rows.length ? Number(rows[0].count) : 0;
}

export async function resetRateLimitBucket(key: string): Promise<void> {
  await prisma.rateLimitBucket.deleteMany({ where: { key } });
}
