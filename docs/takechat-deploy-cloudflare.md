# TakeChat on Cloudflare and Supabase

This guide deploys the private TakeChat instance at:

`https://takechat.marceloholcomercial.workers.dev`

The app is currently for internal use. Only `marceloholcomercial@gmail.com` is allowed to sign in, and the Meta app remains in development mode.

## Resources

- Cloudflare Worker: `takechat`
- Cloudflare Queue: `takechat-dm-queue-production`
- Dead-letter Queue: `takechat-dm-dlq-production`
- Supabase project: `takechat` (`ibtnanxzzgniujnpscbn`), Canada Central (`ca-central-1`)
- Supabase schema: `takechat`
- Meta app: `TakeChat`, app ID `2162666984639710`

The TakeChat tables live in their own Postgres schema. They do not use the `public` schema or TakeMode tables.

## 1. Prepare the database

Create the isolated schema before the first Prisma migration:

```sql
CREATE SCHEMA IF NOT EXISTS takechat;
```

Then run migrations from a trusted terminal using the Supabase Postgres connection string:

```bash
DATABASE_URL='postgresql://…?sslmode=require&schema=takechat' npm run db:migrate
```

Use the database connection details shown in the Supabase dashboard. Do not commit the URL or send its password in chat. The Prisma migrations create TakeChat tables in `takechat` only.

## 2. Connect Hyperdrive

The Cloudflare `takechat-supabase` Hyperdrive configuration is already created for the isolated TakeChat database, and its ID is set in `wrangler.jsonc`. Its origin points to the Supabase direct host `db.ibtnanxzzgniujnpscbn.supabase.co`, database `postgres`, port 5432. Keep this binding when deploying; if you recreate it, update `hyperdrive[0].id`.

Use Supabase's direct PostgreSQL connection as the Hyperdrive origin. Do not point Hyperdrive at the Supabase session pooler: Hyperdrive provides its own connection pool. The connection used for `npm run db:migrate` must reach the same Supabase project and specify `schema=takechat`.

The two Cloudflare Queues listed above already exist. Wrangler attaches the queue producer, consumer, and cron triggers when the Worker is deployed.

## 3. Add Worker secrets

Set these with `npx wrangler secret put SECRET_NAME` from the repository. Wrangler prompts for each value without putting the secret in the command line.

Required:

- `NEXTAUTH_SECRET` — random secret used for sessions and OAuth state signing.
- `CRON_SECRET` — separate random secret protecting scheduled and queue routes.
- `ENCRYPTION_KEY` — exactly 64 hexadecimal characters, used to encrypt Instagram tokens.
- `INSTAGRAM_APP_SECRET` — app secret for Meta app `2162666984639710`.
- `FACEBOOK_APP_SECRET` — the same Meta app secret, used to verify signed webhook requests.
- `WEBHOOK_VERIFY_TOKEN` — random value entered in the Meta webhook configuration.
- `EMAIL_SERVER` or `RESEND_API_KEY` — required to deliver login links.
- `EMAIL_FROM` — a sender address accepted by the selected mail provider.

`NEXTAUTH_URL`, `INSTAGRAM_APP_ID`, `META_GRAPH_API_VERSION`, and `ALLOWED_EMAILS` are already set as non-secret Worker variables in `wrangler.jsonc`.

## 4. Build and deploy

From the repository root:

```bash
npm ci
npm run db:generate
npm run deploy
```

The deployment uses the local Wrangler version and deploys the Worker named `takechat`. The existing TakeMode Workers and Queues are separate and are not referenced by this configuration.

## 5. Configure the Meta app

In the TakeChat app's Instagram Login settings, add this OAuth redirect URI:

`https://takechat.marceloholcomercial.workers.dev/api/instagram/callback`

Configure the webhook callback as:

`https://takechat.marceloholcomercial.workers.dev/api/webhook`

Use the same value as the Worker secret `WEBHOOK_VERIFY_TOKEN` for Meta's verification token. Subscribe the app to Instagram comment, message, postback, and read events required by the enabled campaign features.

Add the Instagram accounts as app testers and accept the invitations. Connect professional (Business or Creator) Instagram accounts from TakeChat. While the Meta app is in development mode, only app roles and testers can use the integration. Public customer access requires Meta's App Review and the applicable Advanced Access; this repository does not mark that review as complete.

## Login mail

The login page sends email magic links. Configure either a verified Resend sender, or an SMTP URL for an email account you control. Keep the mail-provider credential in a Worker secret. The placeholder sender in `.env.example` will not deliver mail.

## Health check

After deployment and migrations, open:

`https://takechat.marceloholcomercial.workers.dev/api/health`

The response reports database connectivity, queue counts, and scheduled-worker heartbeats. A degraded response before the first scheduled event may clear after the next cron run.
