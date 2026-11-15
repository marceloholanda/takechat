import NextAuth, { type NextAuthConfig } from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import Resend from "next-auth/providers/resend";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/client";
import { ensureWorkspaceForUser, getPrimaryWorkspace } from "@/lib/workspace";
import { isEmailAllowedToSignIn } from "@/lib/env";

type AdapterPrismaClient = Parameters<typeof PrismaAdapter>[0];
type EmailTransport = "cloudflare" | "resend" | "smtp";

const emailFrom = process.env.EMAIL_FROM ?? "TakeChat <login@example.com>";
const smtpServer = process.env.EMAIL_SERVER;
const requestedEmailTransport = process.env.EMAIL_PROVIDER?.trim().toLowerCase();

function resolveEmailTransport(): EmailTransport {
  if (!requestedEmailTransport) return smtpServer ? "smtp" : "resend";
  if (
    requestedEmailTransport === "cloudflare" ||
    requestedEmailTransport === "resend" ||
    requestedEmailTransport === "smtp"
  ) {
    return requestedEmailTransport;
  }
  throw new Error("EMAIL_PROVIDER must be cloudflare, resend, or smtp");
}

const emailTransport = resolveEmailTransport();
if (emailTransport === "smtp" && !smtpServer) {
  throw new Error("EMAIL_SERVER is required when EMAIL_PROVIDER=smtp");
}

/**
 * Provider id the login form has to sign in with. It differs per transport,
 * so it is derived here rather than hardcoded at the call site.
 */
export const EMAIL_PROVIDER_ID =
  emailTransport === "smtp"
    ? "nodemailer"
    : emailTransport === "cloudflare"
      ? "cloudflare"
      : "resend";

interface CloudflareEmailAddress {
  email: string;
  name?: string;
}

interface CloudflareEmailBinding {
  send(message: {
    to: string;
    from: string | CloudflareEmailAddress;
    subject: string;
    html: string;
    text: string;
  }): Promise<{ messageId: string }>;
}

interface TakeChatCloudflareBindings {
  EMAIL?: CloudflareEmailBinding;
}

interface MagicLinkRequest {
  identifier: string;
  url: string;
  provider: { from?: string };
}

function parseEmailSender(value: string): CloudflareEmailAddress {
  const match = value.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);
  if (!match) return { email: value.trim() };

  const name = match[1].trim().replace(/^["']|["']$/g, "");
  const email = match[2].trim();
  return name ? { email, name } : { email };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

const cloudflareEmailProvider = {
  id: "cloudflare",
  name: "Cloudflare Email",
  type: "email" as const,
  from: emailFrom,
  maxAge: 24 * 60 * 60,
  async sendVerificationRequest({ identifier, url, provider }: MagicLinkRequest) {
    const { env } = getCloudflareContext();
    const email = (env as unknown as TakeChatCloudflareBindings).EMAIL;
    if (!email) {
      throw new Error("The Cloudflare EMAIL binding is not configured");
    }

    const safeUrl = escapeHtml(url);
    await email.send({
      from: parseEmailSender(provider.from ?? emailFrom),
      to: identifier,
      subject: "Acesse sua conta no TakeChat",
      html:
        '<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;color:#171717">' +
        '<h1 style="font-size:24px;margin:0 0 16px">TakeChat</h1>' +
        '<p>Você solicitou um link para entrar no TakeChat. Clique no botão abaixo:</p>' +
        '<p style="margin:28px 0"><a href="' +
        safeUrl +
        '" style="background:#f97316;border-radius:6px;color:#fff;padding:12px 20px;text-decoration:none">Entrar no TakeChat</a></p>' +
        '<p>Se você não solicitou este link, ignore este e-mail.</p>' +
        '<p style="color:#737373;font-size:12px">Este link expira em 24 horas.</p>' +
        "</div>",
      text:
        "Você solicitou um link para entrar no TakeChat. Acesse: " +
        url +
        "\n\nSe você não solicitou este link, ignore este e-mail. O link expira em 24 horas.",
    });
  },
};

const emailProvider =
  emailTransport === "smtp"
    ? Nodemailer({ server: smtpServer!, from: emailFrom })
    : emailTransport === "cloudflare"
      ? cloudflareEmailProvider
      : Resend({
          apiKey: process.env.RESEND_API_KEY ?? "missing-resend-api-key",
          from: emailFrom,
        });

export const authConfig = {
  adapter: PrismaAdapter(prisma as unknown as AdapterPrismaClient),
  providers: [emailProvider],
  callbacks: {
    // Runs before the magic link is sent, so a blocked address never receives
    // one, and again when the link is verified.
    async signIn({ user }) {
      return isEmailAllowedToSignIn(user?.email);
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        await ensureWorkspaceForUser(user.id, user.email);
      }
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
  },
  session: {
    strategy: "database",
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function getCurrentWorkspaceId(): Promise<string | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const workspace = await getPrimaryWorkspace(userId);
  if (workspace) return workspace.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const createdWorkspace = await ensureWorkspaceForUser(userId, user?.email);
  return createdWorkspace.id;
}
