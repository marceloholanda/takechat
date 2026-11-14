import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db/client";
import { ApiError } from "./http";
import { reserveRateLimitBucket } from "@/lib/utils/rate-limit-bucket";

import { SERVICE_SCOPES } from "./scopes";
export { SERVICE_SCOPES } from "./scopes";
export type ServiceScope = typeof SERVICE_SCOPES[number];
export type ServiceContext = { workspaceId: string; keyId: string; scopes: string[] };
export const hashServiceToken = (token: string) => createHash("sha256").update(token).digest("hex");
export const newServiceToken = () => `orp_${randomBytes(32).toString("base64url")}`;

export function requireScope(context: ServiceContext, scope: ServiceScope) {
  if (!context.scopes.includes(scope)) throw new ApiError(`Missing scope: ${scope}`, 403);
}

export async function authenticateService(request: Request): Promise<ServiceContext> {
  const token = request.headers.get("authorization")?.match(/^Bearer (orp_[A-Za-z0-9_-]{43})$/)?.[1];
  if (!token) throw new ApiError("Bearer service key required", 401);
  const key = await prisma.serviceKey.findUnique({ where: { tokenHash: hashServiceToken(token) } });
  if (!key || key.revokedAt || key.expiresAt <= new Date()) throw new ApiError("Invalid or expired service key", 401);
  // Fail closed: a database outage must not turn the integration into an unlimited endpoint.
  let allowed: boolean;
  try {
    const result = await reserveRateLimitBucket(
      `integration-rate:${key.id}`,
      120,
      60,
    );
    allowed = result.allowed;
  } catch { throw new ApiError("Integration rate limiter unavailable", 503); }
  if (!allowed) throw new ApiError("Rate limit exceeded", 429);
  await prisma.serviceKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });
  return { workspaceId: key.workspaceId, keyId: key.id, scopes: key.scopes };
}
