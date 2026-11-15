import { prisma } from "@/lib/db/client";

const WORKER_HEARTBEAT_ID = "dm";
const WORKER_HEARTBEAT_TTL_SECONDS = 120;

export interface WorkerHeartbeat {
  status: "running";
  worker: "dm";
  pid: number;
  hostname?: string;
  startedAt?: string;
  checkedAt: string;
}

export interface WorkerHealth {
  healthy: boolean;
  heartbeat: WorkerHeartbeat | null;
  ageMs: number | null;
}

export interface WorkerAlert {
  level: "warning" | "error";
  message: string;
  jobId?: string;
  instagramAccountId?: string;
  commentId?: string;
  createdAt: string;
}

export async function recordWorkerHeartbeat(
  heartbeat: Omit<WorkerHeartbeat, "checkedAt" | "status" | "worker">,
) {
  const checkedAt = new Date();
  await prisma.workerHeartbeat.upsert({
    where: { id: WORKER_HEARTBEAT_ID },
    create: {
      id: WORKER_HEARTBEAT_ID,
      status: "running",
      worker: "dm",
      pid: heartbeat.pid,
      hostname: heartbeat.hostname,
      startedAt: heartbeat.startedAt ? new Date(heartbeat.startedAt) : null,
      checkedAt,
    },
    update: {
      status: "running",
      worker: "dm",
      pid: heartbeat.pid,
      hostname: heartbeat.hostname,
      startedAt: heartbeat.startedAt ? new Date(heartbeat.startedAt) : null,
      checkedAt,
    },
  });
}

export async function getWorkerHealth(): Promise<WorkerHealth> {
  const stored = await prisma.workerHeartbeat.findUnique({
    where: { id: WORKER_HEARTBEAT_ID },
  });
  if (!stored) return { healthy: false, heartbeat: null, ageMs: null };

  const ageMs = Date.now() - stored.checkedAt.getTime();
  return {
    healthy: ageMs <= WORKER_HEARTBEAT_TTL_SECONDS * 1000,
    heartbeat: {
      status: "running",
      worker: "dm",
      pid: stored.pid,
      hostname: stored.hostname ?? undefined,
      startedAt: stored.startedAt?.toISOString(),
      checkedAt: stored.checkedAt.toISOString(),
    },
    ageMs,
  };
}

export async function recordWorkerAlert(alert: Omit<WorkerAlert, "createdAt">) {
  const account = alert.instagramAccountId
    ? await prisma.instagramAccount.findUnique({
        where: { instagramId: alert.instagramAccountId },
        select: { workspaceId: true },
      })
    : null;

  await prisma.operationalEvent.create({
    data: {
      workspaceId: account?.workspaceId ?? null,
      source: "WORKER",
      level: alert.level === "warning" ? "WARNING" : "ERROR",
      message: alert.message,
      payload: {
        jobId: alert.jobId ?? null,
        instagramAccountId: alert.instagramAccountId ?? null,
        commentId: alert.commentId ?? null,
      },
    },
  });
}

export async function getWorkerAlerts(limit = 10): Promise<WorkerAlert[]> {
  const events = await prisma.operationalEvent.findMany({
    where: {
      source: "WORKER",
      level: { in: ["WARNING", "ERROR"] },
    },
    orderBy: { createdAt: "desc" },
    take: Math.max(0, limit),
    select: { level: true, message: true, payload: true, createdAt: true },
  });

  return events.map((event) => {
    const payload =
      event.payload && typeof event.payload === "object" && !Array.isArray(event.payload)
        ? (event.payload as Record<string, unknown>)
        : {};
    return {
      level: event.level === "WARNING" ? "warning" : "error",
      message: event.message,
      jobId: typeof payload.jobId === "string" ? payload.jobId : undefined,
      instagramAccountId:
        typeof payload.instagramAccountId === "string"
          ? payload.instagramAccountId
          : undefined,
      commentId: typeof payload.commentId === "string" ? payload.commentId : undefined,
      createdAt: event.createdAt.toISOString(),
    };
  });
}
