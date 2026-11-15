import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { getBaseUrl, getMetaGraphApiVersion } from "@/lib/env";
import { canConnectInstagramAccount } from "@/lib/instagram-accounts";
import { subscribeInstagramAccountToWebhooks, unifiedToken } from "@/lib/meta/client";
import {
  encryptToken,
  exchangeCodeForToken,
  verifyOAuthState,
} from "@/lib/meta/oauth";
import { canManageWorkspace } from "@/lib/workspace-access";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const state = verifyOAuthState(request.nextUrl.searchParams.get("state"));
  const baseUrl = getBaseUrl();

  if (error) {
    return NextResponse.redirect(`${baseUrl}/settings?instagram=denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/settings?instagram=invalid`);
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(`${baseUrl}/login`);
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: state.workspaceId,
      userId: session.user.id,
    },
  });

  if (!membership || !canManageWorkspace(membership.role)) {
    return NextResponse.redirect(`${baseUrl}/settings?instagram=forbidden`);
  }

  try {
    const redirectUri = `${baseUrl}/api/instagram/callback`;
    const { accessToken } = await exchangeCodeForToken(code, redirectUri);
    type Page = { data?: Array<{id: string; username: string; name?: string}>; paging?: { cursors?: {after?: string}; next?: string }; error?: {message?: string} };
    const accounts: NonNullable<Page["data"]> = [];
    let cursor: string | undefined;
    const seen = new Set<string>();
    for (let page = 0; page < 100; page++) {
      const url = new URL(`https://graph.facebook.com/${getMetaGraphApiVersion()}/me/assigned_instagram_accounts`);
      url.searchParams.set("fields", "id,username");
      url.searchParams.set("limit", "100");
      if (cursor) url.searchParams.set("after", cursor);
      const response = await fetch(url, {headers: {Authorization: `Bearer ${accessToken}`}});
      const data = await response.json() as Page;
      if (!response.ok || data.error) throw new Error(`Meta account lookup failed: ${data.error?.message ?? response.status}`);
      accounts.push(...(data.data ?? []));
      if (!data.paging?.next) break;
      const next = data.paging.cursors?.after;
      if (!next || seen.has(next)) throw new Error("Meta account pagination did not advance");
      seen.add(next);
      cursor = next;
      if (page === 99) throw new Error("Meta account pagination exceeded limit");
    }
    if (!accounts.length) throw new Error("Nenhuma conta do Instagram foi compartilhada.");

    let connected = 0;
    for (const account of accounts) {
      if (!account.id || !account.username) continue;
      const connection = await canConnectInstagramAccount({workspaceId: state.workspaceId, instagramId: account.id});
      if (!connection.allowed) continue;
      const credential = unifiedToken(accessToken, account.id);
      let webhookSubscribed = false;
      try {
        webhookSubscribed = Boolean((await subscribeInstagramAccountToWebhooks(account.id, credential)).success);
      } catch (subscriptionError) {
        console.warn("[Instagram Callback] Webhook subscription failed", subscriptionError);
      }
      const data = {username: account.username, name: account.name ?? null, accessToken: encryptToken(credential), tokenExpiresAt: null, webhookSubscribed};
      const existing = await prisma.instagramAccount.findUnique({where: {instagramId: account.id}});
      if (existing) {
        const result = await prisma.instagramAccount.updateMany({where: {id: existing.id, workspaceId: state.workspaceId, provider: "META"}, data});
        connected += result.count;
      } else {
        await prisma.instagramAccount.create({data: {...data, workspaceId: state.workspaceId, instagramId: account.id, provider: "META"}});
        connected++;
      }
    }
    if (!connected) return NextResponse.redirect(`${baseUrl}/settings?instagram=already_connected`);

    return NextResponse.redirect(`${baseUrl}/dashboard?connected=true`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Instagram Callback] Error:", err);
    // The message is the only diagnostic a self-hoster gets for a failed
    // connect, so persist it alongside the other operational events rather
    // than leaving it in server logs they may not be able to reach.
    await prisma.operationalEvent
      .create({
        data: {
          source: "SYSTEM",
          level: "ERROR",
          workspaceId: state.workspaceId,
          message: "Instagram connection failed",
          payload: { reason: message },
        },
      })
      .catch(() => {});

    return NextResponse.redirect(
      `${baseUrl}/settings?instagram=failed&reason=${encodeURIComponent(
        message.slice(0, 200)
      )}`
    );
  }
}
