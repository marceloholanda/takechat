import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import type { DmQueueJob } from "@/lib/queue/client";
import {
  processDMQueueJob,
  recordWorkerFailure,
  UnrecoverableDmJobError,
} from "@/lib/queue/processor";
import { recordWorkerHeartbeat } from "@/lib/ops/worker-health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 3;
const PROCESSING_LEASE_MS = 15 * 60 * 1000;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const queueJobId =
    body && typeof body === "object" && "queueJobId" in body &&
    typeof body.queueJobId === "string"
      ? body.queueJobId
      : null;
  if (!queueJobId || queueJobId.length > 200) {
    return NextResponse.json({ success: false, error: "Invalid queue job" }, { status: 400 });
  }

  const task = await prisma.queueJob.findUnique({ where: { id: queueJobId } });
  if (!task || task.status === "COMPLETED" || task.status === "FAILED") {
    return NextResponse.json({ success: true, ignored: true });
  }

  const now = new Date();
  if (task.runAt.getTime() > now.getTime()) {
    return NextResponse.json({ success: true, scheduled: true });
  }

  const claimed = await prisma.queueJob.updateMany({
    where: {
      id: queueJobId,
      OR: [
        { status: { in: ["PENDING", "ENQUEUED"] } },
        { status: "SCHEDULED", runAt: { lte: now } },
        { status: "PROCESSING", leaseExpiresAt: { lte: now } },
      ],
    },
    data: {
      status: "PROCESSING",
      attempts: { increment: 1 },
      leaseExpiresAt: new Date(now.getTime() + PROCESSING_LEASE_MS),
    },
  });

  if (!claimed.count) {
    return NextResponse.json({ success: true, duplicate: true });
  }

  const jobTask = await prisma.queueJob.findUnique({ where: { id: queueJobId } });
  if (!jobTask) return NextResponse.json({ success: true, ignored: true });

  const job = {
    id: jobTask.id,
    name: jobTask.name,
    data: jobTask.data as unknown as DmQueueJob,
    attemptsMade: Math.max(0, jobTask.attempts - 1),
  };

  try {
    await processDMQueueJob(job);
    await prisma.queueJob.updateMany({
      where: { id: queueJobId, status: "PROCESSING" },
      data: {
        status: "COMPLETED",
        leaseExpiresAt: null,
        lastError: null,
        completedAt: new Date(),
      },
    });
    await recordWorkerHeartbeat({ pid: 0, hostname: "cloudflare-queues" });
    return NextResponse.json({ success: true });
  } catch (cause) {
    const error = cause instanceof Error ? cause : new Error("Unknown queue error");
    const terminal = cause instanceof UnrecoverableDmJobError || jobTask.attempts >= MAX_ATTEMPTS;

    await prisma.queueJob.updateMany({
      where: { id: queueJobId, status: "PROCESSING" },
      data: {
        status: terminal ? "FAILED" : "ENQUEUED",
        leaseExpiresAt: null,
        lastError: error.message.slice(0, 2000),
        ...(terminal ? { completedAt: new Date() } : {}),
      },
    });

    if (terminal) await recordWorkerFailure(job, error);
    await recordWorkerHeartbeat({ pid: 0, hostname: "cloudflare-queues" });
    return NextResponse.json(
      { success: false, retry: !terminal },
      { status: terminal ? 200 : 503 },
    );
  }
}
