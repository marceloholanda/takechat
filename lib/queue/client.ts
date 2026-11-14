/**
 * TakeChat's durable queue adapter.
 *
 * Job payloads and idempotency keys live in the TakeChat Postgres schema. The
 * Cloudflare Queue only carries the small row id, so delayed jobs survive queue
 * retention limits and can be recovered by the scheduled dispatcher.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";

export type CommentSource = "WEBHOOK" | "POLLING";

export interface ProcessCommentJob {
  accountConnectionId?: string;
  instagramAccountId: string;
  commentId: string;
  commentText: string;
  commenterId: string;
  commenterName?: string;
  mediaId: string;
  originalMediaId?: string;
  requeueAttempt?: number;
  source?: CommentSource;
}

export interface ProcessPostbackJob {
  accountConnectionId?: string;
  instagramAccountId: string;
  userId: string;
  payload: string;
  mid?: string;
  fallback?: boolean;
  followRecheck?: boolean;
  followRecheckAttempt?: number;
}

export interface ProcessFollowUpJob {
  accountConnectionId?: string;
  instagramAccountId: string;
  userId: string;
  automationId: string;
  commenterName?: string | null;
}

export interface ProcessMessageJob {
  accountConnectionId?: string;
  instagramAccountId: string;
  messageId: string;
  messageText: string;
  senderId: string;
}

export type DmQueueJob =
  | ProcessCommentJob
  | ProcessPostbackJob
  | ProcessFollowUpJob
  | ProcessMessageJob;

export const POSTBACK_JOB_NAME = "process-postback";
export const FOLLOWUP_JOB_NAME = "process-followup";
export const MESSAGE_JOB_NAME = "process-message";

/** Kept only for the repository's legacy BullMQ processor tests. */
export function getRedisConnection(): never {
  throw new Error("TakeChat production queue runs on Cloudflare Queues");
}

export interface QueueJobOptions {
  jobId?: string;
  delay?: number;
}

export interface DMQueue {
  add(name: string, data: DmQueueJob, options?: QueueJobOptions): Promise<{ id: string }>;
  getJobCounts(...states: string[]): Promise<Record<string, number>>;
}

interface CloudflareQueueBinding {
  send(body: { queueJobId: string }, options?: { delaySeconds?: number }): Promise<void>;
}

interface TakeChatBindings {
  TAKECHAT_DM_QUEUE?: CloudflareQueueBinding;
}

const ACTIVE_STATES = ["PENDING", "ENQUEUED"] as const;
// Leave four hours of room under the free queue's 24-hour message retention.
const MAX_QUEUE_DELAY_MS = 20 * 60 * 60 * 1000;
const QUEUE_DELIVERY_LEASE_MS = 15 * 60 * 1000;

function getQueueBinding(): CloudflareQueueBinding {
  const { env } = getCloudflareContext();
  const binding = (env as unknown as TakeChatBindings).TAKECHAT_DM_QUEUE;
  if (!binding) {
    throw new Error("TAKECHAT_DM_QUEUE Cloudflare binding is missing");
  }
  return binding;
}

async function dispatchQueueJob(
  queueJobId: string,
  delaySeconds?: number,
): Promise<void> {
  const task = await prisma.queueJob.findUnique({ where: { id: queueJobId } });
  if (!task || task.status === "COMPLETED" || task.status === "FAILED") return;
  if (delaySeconds === undefined && task.runAt.getTime() > Date.now()) return;

  await getQueueBinding().send(
    { queueJobId },
    delaySeconds === undefined ? undefined : { delaySeconds },
  );
  const leaseBase = Math.max(Date.now(), task.runAt.getTime());
  await prisma.queueJob.updateMany({
    where: { id: queueJobId, status: { in: [...ACTIVE_STATES, "SCHEDULED"] } },
    data: {
      status: "ENQUEUED",
      leaseExpiresAt: new Date(leaseBase + QUEUE_DELIVERY_LEASE_MS),
    },
  });
}

class CloudflareDMQueue implements DMQueue {
  async add(
    name: string,
    data: DmQueueJob,
    options: QueueJobOptions = {},
  ): Promise<{ id: string }> {
    const id = options.jobId ?? crypto.randomUUID();
    const delayMs = Math.max(0, options.delay ?? 0);
    const runAt = new Date(Date.now() + delayMs);
    const payload = JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue;

    try {
      await prisma.queueJob.create({
        data: {
          id,
          name,
          data: payload,
          runAt,
          status: delayMs > 0 ? "SCHEDULED" : "PENDING",
        },
      });
    } catch (error) {
      if (
        typeof error !== "object" ||
        error === null ||
        !("code" in error) ||
        error.code !== "P2002"
      ) {
        throw error;
      }

      const existing = await prisma.queueJob.findUnique({ where: { id } });
      if (!existing) throw error;
      if (existing.status !== "FAILED") return { id };

      const retried = await prisma.queueJob.updateMany({
        where: { id, status: "FAILED" },
        data: {
          name,
          data: payload,
          status: delayMs > 0 ? "SCHEDULED" : "PENDING",
          attempts: 0,
          runAt,
          leaseExpiresAt: null,
          lastError: null,
          completedAt: null,
        },
      });
      if (!retried.count) return { id };
    }

    if (delayMs === 0) {
      await dispatchQueueJob(id);
    } else if (delayMs <= MAX_QUEUE_DELAY_MS) {
      await dispatchQueueJob(id, Math.ceil(delayMs / 1000));
    }
    return { id };
  }

  async getJobCounts(..._states: string[]): Promise<Record<string, number>> {
    const [waiting, active, delayed, failed] = await Promise.all([
      prisma.queueJob.count({ where: { status: { in: [...ACTIVE_STATES] } } }),
      prisma.queueJob.count({ where: { status: "PROCESSING" } }),
      prisma.queueJob.count({ where: { status: "SCHEDULED" } }),
      prisma.queueJob.count({ where: { status: "FAILED" } }),
    ]);
    return { waiting, active, delayed, failed };
  }
}

let dmQueue: DMQueue | null = null;

export function getDMQueue(): DMQueue {
  dmQueue ??= new CloudflareDMQueue();
  return dmQueue;
}

/** Re-send due or expired work after transient queue/worker failures. */
export async function dispatchDueQueueJobs(limit = 100): Promise<number> {
  const now = new Date();
  const dueJobs = await prisma.queueJob.findMany({
    where: {
      OR: [
        { status: { in: ["PENDING", "SCHEDULED"] }, runAt: { lte: now } },
        { status: "ENQUEUED", leaseExpiresAt: { lte: now } },
        { status: "PROCESSING", leaseExpiresAt: { lte: now } },
      ],
    },
    orderBy: { runAt: "asc" },
    take: limit,
    select: { id: true, status: true },
  });

  let dispatched = 0;
  for (const task of dueJobs) {
    if (task.status === "ENQUEUED") {
      const reclaimed = await prisma.queueJob.updateMany({
        where: {
          id: task.id,
          status: "ENQUEUED",
          leaseExpiresAt: { lte: now },
        },
        data: {
          leaseExpiresAt: new Date(now.getTime() + QUEUE_DELIVERY_LEASE_MS),
        },
      });
      if (!reclaimed.count) continue;
    }

    if (task.status === "PROCESSING") {
      const reclaimed = await prisma.queueJob.updateMany({
        where: {
          id: task.id,
          status: "PROCESSING",
          leaseExpiresAt: { lte: now },
        },
        data: { status: "ENQUEUED", leaseExpiresAt: null },
      });
      if (!reclaimed.count) continue;
    }

    try {
      await dispatchQueueJob(task.id);
      dispatched += 1;
    } catch (error) {
      console.error("[TakeChat Queue] Dispatch failed:", error);
    }
  }
  return dispatched;
}
