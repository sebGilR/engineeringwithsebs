# engineeringwithsebs — deploy_plan.md

This file is the practical deployment plan for the `engineeringwithsebs` Next.js app (public site + dashboard/BFF).

## Target architecture

- **Next.js** on **Vercel**
  - Public routes: ISR + on-demand revalidation
  - Dashboard/BFF routes: dynamic (no caching)
- **Rails API** on **Fly.io** (see `baas/deploy_plan.md`)

## Vercel environment variables

- `BAAS_API_URL` — Rails API base URL (Fly), e.g. `https://baas-api.fly.dev`
- `NEXT_PUBLIC_SITE_URL` — canonical site URL, e.g. `https://engineeringwithsebs.com`
- `NEXT_PUBLIC_BLOG_SLUG` — public blog slug, e.g. `engineeringwithsebs`
- `VERCEL_REVALIDATE_TOKEN` — long random secret (shared with Rails)

Backward compatible (optional):
- `REVALIDATE_SECRET` — legacy name for `VERCEL_REVALIDATE_TOKEN`

## ISR + revalidation (what to validate)

### Public cache tags

- `posts:list:{blogSlug}` (home/list views)
- `post:{blogSlug}/{postSlug}` (post detail)

### Revalidate endpoint

- `POST /api/revalidate`
- Auth: `X-Revalidate-Token: <token>`
- Body:
  - `{ "tags": ["..."], "paths": ["..."] }`

Rails triggers this after publish/unpublish/update.

## Smoke checks (post-deploy)

- Home loads and is cached by Vercel (repeat requests are fast)
- Publishing a post triggers backend revalidation and updates:
  - `/`
  - `/blog/{blogSlug}/{postSlug}`
  - `/sitemap.xml` and `/rss.xml`

