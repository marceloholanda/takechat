# Contributing

Thanks for wanting to help improve TakeChat's Instagram comment reply workflow.

## Ways to help

- Fix a bug. The DM worker and the webhook parser are the parts that matter most.
- Improve the docs. Add setup changes to `docs/takechat-deploy-cloudflare.md`.
- Add campaign templates in `lib/templates/`.
- Add tests. The suite runs with `npm test`.

## Development setup

```bash
npm ci
cp .env.example .env      # fill in the values, see docs/takechat-deploy-cloudflare.md
npm run db:generate
npm run dev
```

## Before you open a pull request

Branch from `main`, keep the change focused on one thing, and make sure these pass:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

If a check cannot run in your environment, say why in the pull request body. A small, clear pull request is easier to merge than a large one that touches many things at once.

## A note on the codebase

This is Next.js hosted on Cloudflare Workers. Production queue delivery uses Cloudflare Queues; local development does not start a separate worker process.

## Campaign templates

A template contribution should include a name, the target niche, a suggested post or reel, the keywords, the DM copy, and a short example. Do not include real tokens, private data, or scraped content.

## Reporting bugs

Open an issue with what you did, what you expected, and what happened. For anything involving a webhook or a failed send, the Postgres tables describe it best: `WebhookEvent` for delivery, `DmLog` for send status, `OperationalEvent` for worker errors.

## Security

Do not open a public issue for a vulnerability. See [SECURITY.md](SECURITY.md).
