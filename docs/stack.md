# TakeChat stack

| Component | Service | Purpose |
| --- | --- | --- |
| Next.js app and APIs | Cloudflare Workers | Dashboard, OAuth callback, webhooks |
| Queue consumer and scheduled tasks | Cloudflare Queues and Worker schedules | Replies, retries, reconciliation, token refresh |
| Relational data | Supabase Postgres, `takechat` schema | Accounts, workspaces, campaigns, logs, queue outbox |
| Database connectivity | Cloudflare Hyperdrive | Pooled Worker connections to Supabase |
| Login links | Resend or configured SMTP | Email sign-in |
| Instagram | Meta's official Instagram API | OAuth, comments, and replies |

The `takechat` schema keeps app tables apart from TakeMode tables. The Worker and queues are also named specifically for TakeChat.

See [the deployment guide](takechat-deploy-cloudflare.md) for setup and secrets. No Redis service or long-running Node worker is required in production.
