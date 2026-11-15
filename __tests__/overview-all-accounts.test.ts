import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ findMany: vi.fn(), context: vi.fn(), media: vi.fn(), insights: vi.fn(), followers: vi.fn(), history: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getCurrentWorkspaceId: vi.fn(async () => "workspace") }));
vi.mock("@/lib/db/client", () => ({ prisma: { instagramAccount: { findMany: mock.findMany } } }));
vi.mock("@/lib/instagram/provider", () => ({ createInstagramContext: mock.context, getAllUserMedia: mock.media, getMediaInsights: mock.insights, PermissionError: class extends Error {} }));
vi.mock("@/lib/reports/follower-history", () => ({ ensureFollowerHistory: mock.followers, getFollowerHistory: mock.history }));
import { NextRequest } from "next/server";
import { GET } from "@/app/api/instagram/overview/route";
const accounts = [{ id: "a", username: "one", instagramId: "ig-a", provider: "META" }, { id: "b", username: "two", instagramId: "ig-b", provider: "META" }];
const post = (id: string, timestamp: string, likes: number) => ({ id, timestamp, like_count: likes, comments_count: 1, media_type: "IMAGE" });
describe("overview across accounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mock.findMany.mockResolvedValue(accounts);
    mock.context.mockImplementation(async account => ({ account: account.id }));
    mock.media.mockImplementation(async ({ context }) => context.account === "a" ? [post("1", "2026-11-01", 2),post("2", "2026-11-03", 4)] : [post("3", "2026-11-02", 5)]);
    mock.insights.mockImplementation(async ({ mediaId }) => ({ reach: Number(mediaId) * 10, saved: 1, shares: 2 }));
    mock.followers.mockImplementation(async account => account.id === "a" ? 100 : 200);
    mock.history.mockImplementation(async id => id === "a" ? [{date:"2026-11-01",followers:90,delta:null},{date:"2026-11-02",followers:100,delta:10}] : [{date:"2026-11-02",followers:200,delta:null}]);
  });
  it("combines accounts, sums followers, and selects the newest posts globally", async () => {
    const res = await GET(new NextRequest("https://example.com/api/instagram/overview?count=2"));
    const { data } = await res.json();
    expect(data.account).toBeNull();
    expect(data.posts.map((p: { id: string }) => p.id)).toEqual(["2", "3"]);
    expect(data.posts.map((p: { username: string }) => p.username)).toEqual(["one", "two"]);
    expect(data.totals).toMatchObject({ posts: 2, likes: 9, reach: 50, saved: 2, shares: 4 });
    expect(data.followers).toBe(300);
    expect(data.followerHistory).toEqual([{date:"2026-11-02",followers:300,delta:null}]);
    expect(mock.findMany).toHaveBeenCalledWith(expect.objectContaining({where:{workspaceId:"workspace"}}));
  });
  it("keeps an individual account separate", async () => {
    const res = await GET(new NextRequest("https://example.com/api/instagram/overview?instagramAccountId=a"));
    const { data } = await res.json();
    expect(data.account.username).toBe("one");
    expect(data.totals.likes).toBe(6);
    expect(data.followers).toBe(100);
    expect(mock.media).toHaveBeenCalledTimes(1);
  });
  it("marks partial results when an account fails", async () => {
    mock.context.mockImplementation(async account => { if (account.id === "b") throw new Error("unavailable"); return {account: account.id}; });
    const res = await GET(new NextRequest("https://example.com/api/instagram/overview"));
    const { data } = await res.json();
    expect(data.unavailableAccounts).toEqual(["two"]);
    expect(data.followers).toBeNull();
    expect(data.followerHistory).toEqual([]);
  });
  it("rejects an account outside the workspace", async () => {
    const res = await GET(new NextRequest("https://example.com/api/instagram/overview?instagramAccountId=outside"));
    expect(res.status).toBe(400);
    expect(mock.media).not.toHaveBeenCalled();
  });
});
