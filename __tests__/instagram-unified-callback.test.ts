import { beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({ workspaceMember:{findFirst:vi.fn()}, instagramAccount:{findUnique:vi.fn(),updateMany:vi.fn(),create:vi.fn()}, operationalEvent:{create:vi.fn()} }));
vi.mock("@/lib/db/client", () => ({prisma:db}));
vi.mock("@/lib/auth", () => ({auth:vi.fn(async () => ({user:{id:"user"}}))}));
vi.mock("@/lib/meta/oauth", () => ({ verifyOAuthState:vi.fn(() => ({workspaceId:"workspace"})), exchangeCodeForToken:vi.fn(async () => ({accessToken:"system-secret"})), encryptToken:vi.fn((v:string) => `encrypted:${v}`) }));
vi.mock("@/lib/instagram-accounts", () => ({canConnectInstagramAccount:vi.fn(async () => ({allowed:true}))}));
vi.mock("@/lib/workspace-access", () => ({canManageWorkspace:vi.fn(() => true)}));
vi.mock("@/lib/meta/client", async (importOriginal) => ({...(await importOriginal<typeof import("@/lib/meta/client")>()),subscribeInstagramAccountToWebhooks:vi.fn(async () => ({success:true}))}));
import { NextRequest } from "next/server";
import { GET } from "@/app/api/instagram/callback/route";
import { subscribeInstagramAccountToWebhooks } from "@/lib/meta/client";

describe("unified callback", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("NEXTAUTH_URL", "https://example.com"); db.workspaceMember.findFirst.mockResolvedValue({role:"OWNER"}); db.instagramAccount.findUnique.mockResolvedValue(null); db.instagramAccount.create.mockResolvedValue({}); });
  it("connects all authorized accounts with distinct account-bound credentials", async () => {
    const fetchMock=vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({data:[{id:"111",username:"one"}],paging:{next:"next",cursors:{after:"cursor"}}}))).mockResolvedValueOnce(new Response(JSON.stringify({data:[{id:"222",username:"two"}]})));
    vi.stubGlobal("fetch",fetchMock);
    const response=await GET(new NextRequest("https://example.com/api/instagram/callback?code=code&state=signed"));
    expect(response.headers.get("location")).toBe("https://example.com/dashboard?connected=true");
    expect(db.instagramAccount.create).toHaveBeenCalledTimes(2);
    expect(db.instagramAccount.create.mock.calls[0][0].data.accessToken).toBe("encrypted:unified:111:system-secret");
    expect(db.instagramAccount.create.mock.calls[1][0].data.accessToken).toBe("encrypted:unified:222:system-secret");
    expect(db.instagramAccount.create.mock.calls[0][0].data.tokenExpiresAt).toBeNull();
    expect(vi.mocked(subscribeInstagramAccountToWebhooks)).toHaveBeenCalledTimes(2);
    expect(new URL(fetchMock.mock.calls[1][0]).searchParams.get("after")).toBe("cursor");
  });
  it("does not connect accounts when the API returns no shared assets", async () => {
    vi.stubGlobal("fetch",vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({data:[]}))));
    db.operationalEvent.create.mockResolvedValue({});
    const response=await GET(new NextRequest("https://example.com/api/instagram/callback?code=code&state=signed"));
    expect(response.headers.get("location")).toContain("instagram=failed");
    expect(db.instagramAccount.create).not.toHaveBeenCalled();
  });
});
