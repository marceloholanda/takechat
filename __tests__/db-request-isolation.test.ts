import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ context: {} as object, clients: 0 }));
vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: () => mocks.context }));
vi.mock("@prisma/adapter-pg", () => ({ PrismaPg: class {} }));
vi.mock("@prisma/client", () => ({ PrismaClient: class { id = ++mocks.clients; } }));
import { getPrisma } from "@/lib/db/client";

describe("database request isolation", () => {
  beforeEach(() => { mocks.context = { env: { HYPERDRIVE: { connectionString: "postgres://test" } } }; });
  it("reuses a client within one request and isolates concurrent requests", () => {
    const first = getPrisma();
    expect(getPrisma()).toBe(first);
    const firstContext = mocks.context;
    mocks.context = { env: { HYPERDRIVE: { connectionString: "postgres://test" } } };
    const second = getPrisma();
    expect(second).not.toBe(first);
    mocks.context = firstContext;
    expect(getPrisma()).toBe(first);
  });
});
