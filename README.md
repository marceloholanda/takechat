# TakeChat

TakeChat automatically responds to configured keywords in comments on your Instagram posts and Reels. It uses Meta's official Instagram API, stores campaign data in Supabase Postgres, and runs the app and delivery queue on Cloudflare Workers.

This fork is currently configured for Marcelo's internal use. The Meta app remains in development mode, and sign-in is restricted to `marceloholcomercial@gmail.com`. Meta App Review has not been granted.

## What it does

- Connect Instagram Business and Creator accounts through Instagram Login.
- Create keyword campaigns for selected posts or Reels.
- Send a private reply and, optionally, a public comment reply.
- Track delivery status, failures, and link clicks in the dashboard.
- Process webhook events with Cloudflare Queues and recover missed comments on a schedule.

## Stack

| Part | Service |
| --- | --- |
| Web app, API, scheduled work | Cloudflare Workers |
| Background delivery | Cloudflare Queues |
| Campaigns, accounts, logs | Supabase Postgres, isolated in the `takechat` schema |
| Instagram connection and replies | Meta's official Instagram API |

## Development

See [the Cloudflare and Supabase deployment guide](docs/takechat-deploy-cloudflare.md) for environment setup, migrations, Meta callback URLs, and deployment.

```bash
npm ci
npm run db:generate
npm run dev
```

For local development, set `DATABASE_URL` to a PostgreSQL database before starting the app. Production uses the Cloudflare `HYPERDRIVE` binding instead.

## Deployment status

The production Worker has not been deployed yet. It still needs a Supabase Hyperdrive connection and private application secrets. Do not enable public signup or present the Meta app as approved while it remains in development mode.

## Upstream project and license

TakeChat is based on [OpenReply](https://github.com/diwenne/openreply) by Diwenne and preserves its MIT license. OpenReply was initially based on [instagram-comment-to-dm](https://github.com/im-anishraj/instagram-comment-to-dm) by Anish Raj. See [LICENSE](LICENSE) for the license terms.
