import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

interface HyperdriveBinding {
  connectionString: string;
}

interface TakeChatBindings {
  HYPERDRIVE?: HyperdriveBinding;
}

function getDatabaseConnectionString(): { connectionString: string; worker: boolean } {
  const localConnectionString = process.env.DATABASE_URL;
  if (localConnectionString) {
    return { connectionString: localConnectionString, worker: false };
  }

  const { env } = getCloudflareContext();
  const hyperdrive = (env as unknown as TakeChatBindings).HYPERDRIVE;
  if (!hyperdrive?.connectionString) {
    throw new Error("Set DATABASE_URL locally or bind Supabase through HYPERDRIVE");
  }
  return { connectionString: hyperdrive.connectionString, worker: true };
}

/**
 * A single Prisma client uses Hyperdrive's connection pool. maxUses=1 prevents
 * a database socket from being reused between Worker requests.
 */
export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const { connectionString, worker } = getDatabaseConnectionString();
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg({
        connectionString,
        max: worker ? 1 : Number(process.env.DB_POOL_MAX ?? 3),
        ...(worker ? { maxUses: 1 } : {}),
        idleTimeoutMillis: 10_000,
      }, { schema: "takechat" }),
    });
  }
  return globalForPrisma.prisma;
}

/**
 * Keep the existing `prisma.model.method()` call sites while resolving the
 * Hyperdrive binding only when a request is active. This also preserves real
 * PrismaPromise values for `$transaction([...])` calls.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    if (typeof property !== "string") return Reflect.get(getPrisma(), property);

    if (property.startsWith("$")) {
      return (...args: unknown[]) => {
        const client = getPrisma() as unknown as Record<string, unknown>;
        const member = client[property];
        if (typeof member !== "function") return member;
        return member.apply(client, args);
      };
    }

    return new Proxy(
      {},
      {
        get(_delegate, method) {
          if (typeof method !== "string") return undefined;
          const client = getPrisma() as unknown as Record<string, unknown>;
          const delegate = client[property] as Record<string, unknown>;
          const member = delegate[method];
          return typeof member === "function" ? member.bind(delegate) : member;
        },
      },
    );
  },
});
