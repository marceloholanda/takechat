/**
 * Postgres-backed rate limiter for Instagram private replies.
 *
 * The account cap matches Meta's documented 750 private replies per hour.
 * Atomic reservations share the same Supabase database as the app, so TakeChat
 * does not need a separate Redis service.
 */

import {
  getRateLimitBucketCount,
  releaseRateLimitBucket,
  reserveRateLimitBucket,
  resetRateLimitBucket,
} from "@/lib/utils/rate-limit-bucket";

const RATE_LIMIT_MAX = 750;
const RATE_LIMIT_WINDOW = 3600;
const REQUEUE_DELAY_MS = 30 * 60 * 1000;
const MAX_REQUEUE_ATTEMPTS = 3;

export interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  remainingDMs: number;
  shouldRequeue: boolean;
  requeueDelayMs: number;
  shouldSkip: boolean;
  reserved: boolean;
}

function blockedResult(count: number, requeueAttempt: number): RateLimitResult {
  if (requeueAttempt >= MAX_REQUEUE_ATTEMPTS) {
    return {
      allowed: false,
      currentCount: count,
      remainingDMs: 0,
      shouldRequeue: false,
      requeueDelayMs: 0,
      shouldSkip: true,
      reserved: false,
    };
  }
  return {
    allowed: false,
    currentCount: count,
    remainingDMs: 0,
    shouldRequeue: true,
    requeueDelayMs: REQUEUE_DELAY_MS,
    shouldSkip: false,
    reserved: false,
  };
}

export async function checkRateLimit(
  instagramAccountId: string,
  requeueAttempt = 0,
): Promise<RateLimitResult> {
  const count = await getRateLimitBucketCount(`rate:dm:${instagramAccountId}`);
  if (count >= RATE_LIMIT_MAX) return blockedResult(count, requeueAttempt);
  return {
    allowed: true,
    currentCount: count,
    remainingDMs: RATE_LIMIT_MAX - count,
    shouldRequeue: false,
    requeueDelayMs: 0,
    shouldSkip: false,
    reserved: false,
  };
}

export async function reserveDMSlot(
  instagramAccountId: string,
  requeueAttempt = 0,
): Promise<RateLimitResult> {
  const result = await reserveRateLimitBucket(
    `rate:dm:${instagramAccountId}`,
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW,
  );
  if (!result.allowed) return blockedResult(result.count, requeueAttempt);
  return {
    allowed: true,
    currentCount: result.count,
    remainingDMs: result.remaining,
    shouldRequeue: false,
    requeueDelayMs: 0,
    shouldSkip: false,
    reserved: true,
  };
}

export async function releaseDMSlot(instagramAccountId: string): Promise<number> {
  return releaseRateLimitBucket(`rate:dm:${instagramAccountId}`);
}

export async function incrementDMCounter(
  instagramAccountId: string,
): Promise<number> {
  return (await reserveDMSlot(instagramAccountId, MAX_REQUEUE_ATTEMPTS))
    .currentCount;
}

export async function getCurrentDMCount(
  instagramAccountId: string,
): Promise<number> {
  return getRateLimitBucketCount(`rate:dm:${instagramAccountId}`);
}

export async function resetRateLimit(instagramAccountId: string): Promise<void> {
  return resetRateLimitBucket(`rate:dm:${instagramAccountId}`);
}

export { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW, REQUEUE_DELAY_MS, MAX_REQUEUE_ATTEMPTS };
