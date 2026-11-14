import { NextRequest, NextResponse } from "next/server";
import { reconcileComments } from "@/lib/polling/comment-reconciler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await reconcileComments();
  return NextResponse.json({ success: true });
}
