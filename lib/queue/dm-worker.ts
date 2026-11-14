/** Legacy BullMQ harness retained for the repository's existing processor tests. */

import { UnrecoverableError, Worker, type Job } from "bullmq";
import { prisma } from "@/lib/db/client";
import { getRedisConnection, type DmQueueJob } from "./client";
import {
  processDMQueueJob,
  recordWorkerFailure,
  UnrecoverableDmJobError,
  type WorkerJob as ProcessorJob,
} from "./processor";

const BACKOFF_DELAYS = [5 * 60 * 1000, 15 * 60 * 1000, 45 * 60 * 1000];

function toProcessorJob(job: Job<DmQueueJob>): ProcessorJob {
  return {
    id: job.id ?? `${job.name}_${crypto.randomUUID()}`,
    name: job.name,
    data: job.data,
    attemptsMade: job.attemptsMade,
  };
}

export function createDMWorker(): Worker<DmQueueJob> {
  const worker = new Worker<DmQueueJob>(
    "dm-processing",
    async (job) => {
      try {
        await processDMQueueJob(toProcessorJob(job));
      } catch (error) {
        if (error instanceof UnrecoverableDmJobError) {
          throw new UnrecoverableError(error.message);
        }
        throw error;
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: 5,
      settings: {
        backoffStrategy: (attemptsMade: number) =>
          BACKOFF_DELAYS[Math.min(attemptsMade - 1, BACKOFF_DELAYS.length - 1)],
      },
    },
  );

  worker.on("failed", (job, error) => {
    void recordWorkerFailure(job ? toProcessorJob(job) : undefined, error);
  });
  worker.on("error", (error) => {
    void prisma.operationalEvent
      .create({
        data: {
          source: "WORKER",
          level: "ERROR",
          message: `DM worker process error: ${error.message}`,
          payload: { name: error.name },
        },
      })
      .catch((recordError) => {
        console.error("[DM Worker] Failed to record worker process error:", recordError);
      });
  });

  return worker;
}
