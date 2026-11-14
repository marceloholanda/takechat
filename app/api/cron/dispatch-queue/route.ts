import { NextRequest, NextResponse } from "next/server";
import { dispatchDueQueueJobs } from "@/lib/queue/client";
import { recordWorkerHeartbeat } from "@/lib/ops/worker-health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const dispatched = await dispatchDueQueueJobs();
  await recordWorkerHeartbeat({ pid: 0, hostname: "cloudflare-scheduled" });
  return NextResponse.json({ success: true, dispatched });
}
