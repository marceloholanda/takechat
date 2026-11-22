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

// OpenNext supplies a distinct async-local context for each invocation.
// A client (and its pg pool) must never cross Worker request boundaries.
const requestClients = new WeakMap<object, PrismaClient>();

function createClient(connectionString: string, worker: boolean): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      max: worker ? 1 : Number(process.env.DB_POOL_MAX ?? 3),
      ...(worker ? { maxUses: 1 } : {}),
      idleTimeoutMillis: 10_000,
    }, { schema: "takechat" }),
  });
}

export function getPrisma(): PrismaClient {
  let context: ReturnType<typeof getCloudflareContext> | undefined;
  try {
    context = getCloudflareContext();
  } catch {
    // A local Node process may not have a Cloudflare request context.
  }

  const hyperdrive = (context?.env as unknown as TakeChatBindings | undefined)?.HYPERDRIVE;
  if (context && hyperdrive?.connectionString) {
    let client = requestClients.get(context);
    if (!client) {
      client = createClient(hyperdrive.connectionString, true);
      requestClients.set(context, client);
    }
    return client;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Set DATABASE_URL locally or bind Supabase through HYPERDRIVE");
  }
  // Production Worker requests using DATABASE_URL still require request isolation.
  if (context) {
    let client = requestClients.get(context);
    if (!client) {
      client = createClient(connectionString, true);
      requestClients.set(context, client);
    }
    return client;
  }
  return globalForPrisma.prisma ??= createClient(connectionString, false);
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
