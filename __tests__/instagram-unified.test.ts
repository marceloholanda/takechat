import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exchangeCodeForToken, getAuthorizationUrl } from "@/lib/meta/oauth";
import { getUserInfo, getUserMedia, sendDirectMessage, subscribeInstagramAccountToWebhooks, unifiedToken } from "@/lib/meta/client";

const fetchMock = vi.fn();
describe("Instagram Unified Login", () => {
  beforeEach(() => {
    vi.stubEnv("INSTAGRAM_APP_ID", "123");
    vi.stubEnv("INSTAGRAM_UNIFIED_CONFIG_ID", "456");
    vi.stubEnv("FACEBOOK_APP_SECRET", "meta-secret");
    vi.stubEnv("META_GRAPH_API_VERSION", "v25.0");
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
  it("creates a business login URL with the configured ID and signed state", () => {
    const url = new URL(getAuthorizationUrl("https://example.com/callback", "signed-state"));
    expect(url.origin).toBe("https://www.facebook.com");
    expect(url.searchParams.get("client_id")).toBe("123");
    expect(url.searchParams.get("config_id")).toBe("456");
    expect(url.searchParams.get("state")).toBe("signed-state");
  });
  it("exchanges a code using the Meta application secret", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({access_token:"system-token"})));
    expect(await exchangeCodeForToken("code", "https://example.com/callback")).toEqual({accessToken:"system-token"});
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin).toBe("https://graph.facebook.com");
    expect(url.searchParams.get("client_secret")).toBe("meta-secret");
    expect(url.searchParams.get("redirect_uri")).toBe("https://example.com/callback");
  });
  it("uses the selected professional account and removes the token marker before calling Meta", async () => {
    const token = unifiedToken("secret-token", "789");
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({id:"789",username:"example"})));
    await getUserInfo(token);
    let url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin).toBe("https://graph.facebook.com");
    expect(url.pathname).toBe("/v25.0/789");
    expect(url.searchParams.get("access_token")).toBe("secret-token");
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({data:[]})));
    await getUserMedia(token);
    url = new URL(fetchMock.mock.calls[1][0]);
    expect(url.pathname).toBe("/v25.0/789/media");
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({recipient_id:"1",message_id:"2"})));
    await sendDirectMessage(token, "789", "1", "hi");
    expect(fetchMock.mock.calls[2][0]).toContain("graph.facebook.com/v25.0/789/messages");
    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe("Bearer secret-token");
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({success:true})));
    await subscribeInstagramAccountToWebhooks("789", token);
    expect(fetchMock.mock.calls[3][1].headers.Authorization).toBe("Bearer secret-token");
  });
  it("retains the original Instagram API route for legacy credentials", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({data:[]})));
    await getUserMedia("legacy-token");
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.origin).toBe("https://graph.instagram.com");
    expect(url.pathname).toBe("/v25.0/me/media");
  });
});
