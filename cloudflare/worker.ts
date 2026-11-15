// @ts-ignore `.open-next/worker.js` is generated during the Cloudflare build.
import { default as appWorker } from "../.open-next/worker.js";

interface Env {
  CRON_SECRET?: string;
}

interface QueueMessage {
  body: { queueJobId: string };
  ack(): void;
  retry(options?: { delaySeconds?: number }): void;
}

interface QueueBatch {
  messages: QueueMessage[];
}

interface ScheduledEvent {
  cron: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

async function invokeInternalRoute(
  path: string,
  env: Env,
  context: ExecutionContext,
): Promise<Response> {
  const secret = env.CRON_SECRET;
  if (!secret) throw new Error("CRON_SECRET Worker secret is missing");
  return appWorker.fetch(
    new Request(`https://takechat.internal${path}`, {
      headers: { authorization: `Bearer ${secret}` },
    }),
    env,
    context,
  );
}

export default {
  fetch: appWorker.fetch,

  async queue(batch: QueueBatch, env: Env, context: ExecutionContext) {
    await Promise.all(
      batch.messages.map(async (message) => {
        try {
          const secret = env.CRON_SECRET;
          if (!secret) throw new Error("CRON_SECRET Worker secret is missing");
          const response = await appWorker.fetch(
            new Request("https://takechat.internal/api/internal/queue/process", {
              method: "POST",
              headers: {
                authorization: `Bearer ${secret}`,
                "content-type": "application/json",
              },
              body: JSON.stringify(message.body),
            }),
            env,
            context,
          );

          if (response.status >= 500 || response.status === 429) {
            message.retry({ delaySeconds: 30 });
          } else {
            message.ack();
          }
        } catch (error) {
          console.error("[TakeChat Queue] Consumer invocation failed:", error);
          message.retry({ delaySeconds: 30 });
        }
      }),
    );
  },

  async scheduled(event: ScheduledEvent, env: Env, context: ExecutionContext) {
    const paths = ["/api/cron/dispatch-queue"];
    if (event.cron === "*/5 * * * *") {
      paths.push("/api/cron/attach-next-reel", "/api/cron/reconcile-comments");
    }
    if (event.cron === "0 */6 * * *") paths.push("/api/cron/refresh-tokens");
    if (event.cron === "0 9 * * *") paths.push("/api/cron/snapshot-followers");

    for (const path of paths) {
      try {
        const response = await invokeInternalRoute(path, env, context);
        if (!response.ok) {
          console.error(`[TakeChat Scheduled] ${path} returned ${response.status}`);
        }
      } catch (error) {
        console.error(`[TakeChat Scheduled] ${path} failed:`, error);
      }
    }
  },
};
