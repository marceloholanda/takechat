-- Keep TakeChat's application data separate from other products in the project.
CREATE SCHEMA IF NOT EXISTS "takechat";

CREATE TYPE "QueueJobStatus" AS ENUM (
  'PENDING',
  'SCHEDULED',
  'ENQUEUED',
  'PROCESSING',
  'COMPLETED',
  'FAILED'
);

CREATE TABLE "QueueJob" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "status" "QueueJobStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leaseExpiresAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "QueueJob_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "QueueJob_status_runAt_idx" ON "QueueJob"("status", "runAt");
CREATE INDEX "QueueJob_status_leaseExpiresAt_idx" ON "QueueJob"("status", "leaseExpiresAt");

CREATE TABLE "RateLimitBucket" (
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "RateLimitBucket_expiresAt_idx" ON "RateLimitBucket"("expiresAt");

CREATE TABLE "WorkerHeartbeat" (
  "id" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "worker" TEXT NOT NULL,
  "pid" INTEGER NOT NULL DEFAULT 0,
  "hostname" TEXT,
  "startedAt" TIMESTAMP(3),
  "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WorkerHeartbeat_pkey" PRIMARY KEY ("id")
);
