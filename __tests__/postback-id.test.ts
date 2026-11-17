import { describe, expect, it } from "vitest";
import { postbackQueueId } from "@/lib/queue/postback-id";

describe("postback queue identity", () => {
  it("keeps long Meta IDs below the queue limit and stable across retries", () => {
    const event = "m".repeat(500);
    const id = postbackQueueId("account", "person", event);
    expect(id.length).toBeLessThanOrEqual(200);
    expect(postbackQueueId("account", "person", event)).toBe(id);
    expect(postbackQueueId("account", "person", event + "x")).not.toBe(id);
    expect(postbackQueueId("account", "other", event)).not.toBe(id);
  });
});
