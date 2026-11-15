import { NextRequest, NextResponse } from "next/server";
import { getCurrentWorkspaceId } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import {
  getAllUserMedia,
  getMediaInsights,
  PermissionError,
  type InstagramMedia,
} from "@/lib/instagram/provider";
import { createInstagramContext } from "@/lib/instagram/provider";
import {
  ensureFollowerHistory,
  getFollowerHistory,
  type FollowerHistoryPoint,
} from "@/lib/reports/follower-history";

// Allow time for paginated media + per-post insight calls on larger accounts.
export const maxDuration = 60;

// Safety ceiling for "all time": bounds pagination and the number of
// per-media insight requests so we can't hammer the API or time out.
const MAX_POSTS = 500;

// How many insight requests to run at once.
const INSIGHTS_CONCURRENCY = 8;

/** Map over items with a bounded number of in-flight async operations. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index], index);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    worker()
  );
  await Promise.all(workers);
  return results;
}

export interface OverviewPost {
  id: string;
  caption: string | null;
  permalink: string | null;
  thumbnailUrl: string | null;
  mediaType: string;
  timestamp: string;
  username: string;
  views: number | null;
  reach: number | null;
  likes: number;
  comments: number;
  saved: number | null;
  shares: number | null;
}

export interface OverviewResponse {
  account: { id: string; username: string } | null;
  unavailableAccounts: string[];
  accounts: Array<{ id: string; username: string }>;
  requestedCount: "all" | number;
  truncated: boolean;
  insightsAvailable: boolean;
  /** Current follower total, or null if Instagram did not return it. */
  followers: number | null;
  /**
   * Follower total per day, ascending. Independent of the selected post range —
   * limited to what has been snapshotted plus any 30-day insights backfill.
   */
  followerHistory: FollowerHistoryPoint[];
  totals: {
    posts: number;
    views: number;
    reach: number;
    likes: number;
    comments: number;
    saved: number;
    shares: number;
    interactions: number;
  };
  posts: OverviewPost[];
  provider?: "META" | "ZERNIO";
  limitations?: string[];
}

function isVideoLike(media: InstagramMedia): boolean {
  return media.media_product_type === "REELS" || media.media_type === "VIDEO";
}

export async function GET(request: NextRequest) {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const selectedId = request.nextUrl.searchParams.get("instagramAccountId");
  try {
    const allAccounts = await prisma.instagramAccount.findMany({ where: { workspaceId }, orderBy: { connectedAt: "desc" } });
    const selected = selectedId && selectedId !== "all" ? allAccounts.filter(a => a.id === selectedId) : allAccounts;
    if (!selected.length) return NextResponse.json({ success: false, error: "Instagram account not connected. Please connect your account first." }, { status: 400 });
    const countParam = request.nextUrl.searchParams.get("count");
    const parsedCount = countParam ? Number.parseInt(countParam, 10) : NaN;
    const requestedCount: "all" | number = countParam === "all" ? "all" : Number.isFinite(parsedCount) ? Math.max(parsedCount, 1) : 50;
    const target = requestedCount === "all" ? MAX_POSTS : Math.min(requestedCount, MAX_POSTS);

    // Load up to target from each account, then select the newest posts globally.
    // This keeps the limit meaningful even when one account has more posts.
    const loaded = await mapWithConcurrency(selected, 3, async account => {
      try {
        const context = await createInstagramContext(account);
        const media = await getAllUserMedia({ context, max: target });
        let followers: number | null = null;
        let history: FollowerHistoryPoint[] = [];
        try {
          followers = await ensureFollowerHistory({ id: account.id, instagramId: account.instagramId }, context);
          history = await getFollowerHistory(account.id);
        } catch (error) {
          console.warn("[Instagram Overview] Follower history unavailable:", error instanceof Error ? error.message : error);
        }
        return { account, context, media, followers, history };
      } catch (error) {
        console.warn("[Instagram Overview] Account unavailable:", error instanceof Error ? error.message : error);
        return null;
      }
    });
    const unavailableAccounts = selected.filter((_, index) => !loaded[index]).map(account => account.username);
    const successful = loaded.filter((item): item is NonNullable<typeof item> => item !== null);
    if (!successful.length) return NextResponse.json({ success: false, error: "Failed to load Instagram overview" }, { status: 502 });
    const allMedia = successful.flatMap(item => item.media.map(media => ({ media, context: item.context, username: item.account.username })));
    allMedia.sort((a, b) => Date.parse(b.media.timestamp) - Date.parse(a.media.timestamp));
    const chosen = allMedia.slice(0, target);
    const truncated = requestedCount === "all" && (allMedia.length > target || successful.some(item => item.media.length >= MAX_POSTS));
    let insightsFailed = false;
    const insights = await mapWithConcurrency(chosen, INSIGHTS_CONCURRENCY, async ({ media, context }) => {
      try {
        return await getMediaInsights({ context, mediaId: media.id, metrics: isVideoLike(media) ? ["views", "reach", "saved", "shares", "total_interactions"] : ["reach", "saved", "shares", "total_interactions"] });
      } catch (error) {
        if (error instanceof PermissionError) insightsFailed = true;
        else console.warn("[Instagram Overview] Media insights unavailable:", error instanceof Error ? error.message : error);
        return null;
      }
    });
    const posts: OverviewPost[] = chosen.map(({ media, username }, i) => {
      const ins = insights[i];
      return { id: media.id, username, caption: media.caption?.trim().slice(0, 120) ?? null, permalink: media.permalink ?? null, thumbnailUrl: media.thumbnail_url ?? media.media_url ?? null, mediaType: media.media_product_type ?? media.media_type, timestamp: media.timestamp, views: ins?.views ?? null, reach: ins?.reach ?? null, likes: media.like_count ?? 0, comments: media.comments_count ?? 0, saved: ins?.saved ?? null, shares: ins?.shares ?? null };
    });
    const totals = posts.reduce((acc, p) => ({ posts: acc.posts + 1, views: acc.views + (p.views ?? 0), reach: acc.reach + (p.reach ?? 0), likes: acc.likes + p.likes, comments: acc.comments + p.comments, saved: acc.saved + (p.saved ?? 0), shares: acc.shares + (p.shares ?? 0), interactions: acc.interactions + p.likes + p.comments + (p.saved ?? 0) + (p.shares ?? 0) }), { posts: 0, views: 0, reach: 0, likes: 0, comments: 0, saved: 0, shares: 0, interactions: 0 });

    // Only sum dates where every selected account has a snapshot. Filling in
    // missing days would invent follower counts for accounts without history.
    const histories = successful.map(item => new Map(item.history.map(point => [point.date, point.followers])));
    const dates = unavailableAccounts.length || histories.length === 0 ? [] : [...histories[0].keys()].filter(date => histories.every(history => history.has(date))).sort();
    const followerHistory: FollowerHistoryPoint[] = dates.map((date, index) => {
      const followers = histories.reduce((sum, history) => sum + history.get(date)!, 0);
      const previous = index ? histories.reduce((sum, history) => sum + history.get(dates[index - 1])!, 0) : null;
      return { date, followers, delta: previous === null ? null : followers - previous };
    });
    const followers = unavailableAccounts.length || successful.some(item => item.followers === null) ? null : successful.reduce((sum, item) => sum + item.followers!, 0);
    const data: OverviewResponse = {
      account: selectedId && selectedId !== "all" ? { id: selected[0].id, username: selected[0].username } : null,
      accounts: allAccounts.map(account => ({ id: account.id, username: account.username })),
      unavailableAccounts, requestedCount, truncated, insightsAvailable: !insightsFailed && (chosen.length === 0 || insights.some(Boolean)), followers, followerHistory, totals, posts,
      provider: selected.length === 1 ? selected[0].provider : undefined,
      limitations: successful.some(item => item.account.provider === "ZERNIO") ? ["Post reporting covers the 25 most recent Instagram posts.", "Insights and follower history require the Zernio Analytics add-on and reflect its last sync. Missing metrics remain unavailable."] : [],
    };
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[Instagram Overview] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to load Instagram overview" }, { status: 500 });
  }
}
