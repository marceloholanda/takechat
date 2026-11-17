import { createHash } from "crypto";

export function postbackQueueId(accountId: string, userId: string, eventId: string): string {
  const digest = createHash("sha256")
    .update(JSON.stringify([accountId, userId, eventId]))
    .digest("hex");
  return `postback_${digest}`;
}
