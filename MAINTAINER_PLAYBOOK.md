# engineeringwithsebs — Day‑1 Maintainer Playbook

This is the “how to operate this repo” guide: where data flows, where to make changes, and how to debug the common failures.

## What this repo is

`engineeringwithsebs` is a Next.js 15 App Router app with two faces:

- **Public site** (SSR/server components): reads published content from the BaaS public API and renders it.
- **Dashboard** (client components): writes content via a small **BFF** layer implemented as Next route handlers under `app/api/*`.

The Rails backend (“BaaS”) is the source of truth for users, blogs, posts, and the rich-content rendering pipeline.

## Architecture in one picture

### Public reads (no auth)

Public page (server component)
→ `lib/server/api.ts` (`fetchFromBaasAPI`)
→ BaaS public endpoints
→ render HTML (`content_html`)

### Dashboard writes (auth)

Client page
→ Next route handler (`app/api/...`)
→ reads httpOnly cookies (`access_token`, `refresh_token`)
→ `fetchFromBaasAPI(..., { accessToken })`
→ BaaS private endpoints
→ returns JSON to client

## Routing map (what lives where)

- `app/(public)/*` — public pages & SEO endpoints
  - `app/(public)/page.tsx` — homepage (recent posts)
  - `app/(public)/blog/[blogSlug]/[postSlug]/page.tsx` — post page (SEO + HTML render)
  - `app/(public)/sitemap.xml/route.ts` — sitemap
  - `app/(public)/rss.xml/route.ts` — RSS
  - `app/(public)/robots.txt/route.ts` — robots

- `app/(auth)/*` — auth pages
  - `app/(auth)/login/page.tsx`
  - `app/(auth)/signup/page.tsx`

- `app/(app)/*` — authenticated dashboard
  - `app/(app)/layout.tsx` — wraps dashboard in `BlogProvider` and sidebar
  - `app/(app)/dashboard/page.tsx` — overview
  - `app/(app)/dashboard/posts/page.tsx` — list + filter
  - `app/(app)/dashboard/posts/new/page.tsx` — create draft
  - `app/(app)/dashboard/posts/[id]/edit/page.tsx` — edit + autosave + publish

- `app/api/*` — BFF routes (server-side proxy to BaaS)
  - `app/api/auth/*` — login/signup/refresh/logout (cookie management)
  - `app/api/posts/*` — CRUD + publish/unpublish
  - `app/api/blogs/*` — list/create/update/delete
- `app/api/revalidate/route.ts` — Next cache revalidation endpoint (supports tag + path invalidation)

## Core primitive: calling the backend

`lib/server/api.ts` exports `fetchFromBaasAPI(path, options)`:

- Sends JSON:API headers (`application/vnd.api+json`) by default.
- Adds `Authorization: Bearer <accessToken>` when `accessToken` is passed.
- Throws on non-OK responses (route handlers must catch + translate to `NextResponse`).

This function is used from:

- Public pages (no `accessToken`)
- Route handlers (with `accessToken` from cookies)

## Auth & sessions (how “logged in” works)

### Cookies

The session is represented by two httpOnly cookies:

- `access_token` — short-lived bearer token (used for all dashboard BFF calls)
- `refresh_token` — long-lived token (used only by `/api/auth/refresh`)

These are set in:

- `app/api/auth/login/route.ts`
- `app/api/auth/signup/route.ts`
- `app/api/auth/refresh/route.ts`

### Route protection

`middleware.ts` guards `/dashboard/*`:

- If no `access_token`, redirect to `/login`

### Refresh strategy

This repo includes a refresh endpoint (`app/api/auth/refresh/route.ts`) but does not currently centralize “auto-refresh on 401” across all fetches.

If you want a single place to handle this, add a small client helper that:

1) retries once after calling `/api/auth/refresh` when a request returns 401,
2) then replays the original request.

## Content model contract (the part that matters)

The editor contract is:

- **Frontend writes** `content_json` (Tiptap document JSON)
- **Backend derives** `content_html` and `content_text` (and other computed fields like reading time/excerpt)
- **Public UI renders** `content_html`

Important: `dangerouslySetInnerHTML` is used on the public post page, so the backend must sanitize/allowlist the generated HTML.

## How the dashboard works

### Blog selection (`BlogProvider`)

`lib/contexts/BlogContext.tsx` implements “single blog per user”:

1) `GET /api/blogs`
2) if empty: `POST /api/blogs` to create a default blog
3) stores the first blog as `blog`

Dashboard pages rely on `blog.id` being available to list/create posts.

### Posts list

`app/(app)/dashboard/posts/page.tsx`:

- calls `/api/posts?blog_id=<blogId>&status=<filter>`
- uses the JSON:API response `data` array to render cards

### Create post

`app/(app)/dashboard/posts/new/page.tsx`:

- calls `POST /api/posts` with `{ title, slug, excerpt, content_json, blog_id }`
- navigates to `/dashboard/posts/<id>/edit`

### Edit post

`app/(app)/dashboard/posts/[id]/edit/page.tsx`:

- loads post from `GET /api/posts/:id`
- autosaves changes to `PATCH /api/posts/:id`
- publishes via `POST /api/posts/:id/publish` (and unpublish similarly)

## The editor (Tiptap) quick tour

`components/editor/TiptapEditor.tsx`:

- Emits JSON via `editor.getJSON()` on each update.
- Provides toolbar UI (headings, formatting, links, images, alignment).
- Images are currently inserted as base64 or URL (no backend upload pipeline).

If you add new extensions, keep the contract the same: output remains valid `content_json` for the backend renderer.

## Cache revalidation (when to use it)

There is an internal endpoint:

- `POST /api/revalidate` with `{ tags?: string[], paths?: string[] }`

It uses Next’s `revalidateTag()` + `revalidatePath()` and is protected by `VERCEL_REVALIDATE_TOKEN` (or legacy `REVALIDATE_SECRET`).

Helper functions:

- `lib/utils/revalidate.ts` (`revalidatePostPaths(blogSlug, postSlug)`)

### Recommended rule

After a publish/unpublish, revalidate:

- `/`
- `/blog/<blogSlug>/<postSlug>`
- `/sitemap.xml`
- `/rss.xml`

## Adding features (the “how do I extend this?” section)

### A) Add tags/categories support (dashboard + public)

This is the typical end-to-end pattern for new domain features.

1) **Confirm backend endpoints**
   - The BaaS already supports tags/categories in its API.
2) **Add/extend types**
   - Add `lib/types/tag.ts` and/or `lib/types/category.ts` (mirror JSON:API shape).
   - Extend `lib/types/post.ts` relationships for tags/categories if needed.
3) **Add BFF routes**
   - Create `app/api/tags/route.ts`, `app/api/categories/route.ts` (and `[id]` if needed).
   - Pattern-match `app/api/posts/route.ts`:
     - read cookies
     - forward to BaaS with bearer token
     - return JSON or map error
4) **Add dashboard UI**
   - In `app/(app)/dashboard/posts/[id]/edit/page.tsx` add controls to:
     - fetch available tags/categories
     - set selected values on post update (`PATCH /api/posts/:id`)
   - Ensure payload stays JSON:API and matches BaaS expectations (often `tag_ids`, `category_id`).
5) **Render publicly**
   - Extend `app/(public)/blog/[blogSlug]/[postSlug]/page.tsx` to display them (optional).
6) **Revalidate**
   - After changes that affect public views, call revalidation (see above).

### B) Add a new public page

Example: `/about`.

1) Create `app/(public)/about/page.tsx`.
2) Use existing layout primitives:
   - Wrap with `AppShell` + `Container` (pattern in `app/(public)/page.tsx`).
3) If it needs backend data:
   - call `fetchFromBaasAPI()` directly (public endpoints only).
4) If it is cached and should update after publishing:
   - include `/about` in revalidation paths (optional).

### C) Add a new authenticated dashboard feature

Pattern:

1) Add a UI page under `app/(app)/dashboard/...` (client component if interactive).
2) Add a BFF route handler under `app/api/...` to talk to the backend with bearer token.
3) Make the UI call the BFF route (never call BaaS directly from the browser if it needs auth).
4) If it affects public pages, trigger revalidation.

## Debugging playbook (when stuff breaks)

### 1) “Dashboard redirects me to /login constantly”

Checklist:

- Confirm `access_token` cookie exists in the browser.
- If missing, ensure `app/api/auth/login/route.ts` is being hit and is setting cookies.
- Confirm `middleware.ts` is only checking `access_token` and matcher is `/dashboard/:path*`.

### 2) “BFF routes return 401 Unauthorized”

Checklist:

- Confirm you’re forwarding `accessToken` into `fetchFromBaasAPI`.
- Confirm `BAAS_API_URL` points to the Rails server.

### 3) “Public pages show 404 / notFound”

Checklist:

- Confirm the post is **published** on the backend.
- Confirm you’re using the correct `blogSlug` and `postSlug`.
- Confirm `NEXT_PUBLIC_BLOG_SLUG` matches your backend blog slug for homepage/feeds.

### 4) “Content renders blank on the public page”

Checklist:

- Ensure the post has `content_html` set in the BaaS response.
- Ensure dashboard saves are sending `content_json` (edit page does).
- If the create flow seems empty, inspect whether `POST /api/posts` forwards `content_json` in its JSON:API payload.

### 5) “Publish works but homepage/sitemap/rss doesn’t update”

Checklist:

- Ensure you’re calling `POST /api/revalidate` (or using `revalidatePostPaths`).
- Confirm `VERCEL_REVALIDATE_TOKEN` (or legacy `REVALIDATE_SECRET`) is set and matches `X-Revalidate-Token`.

## Environment & local dev

See `.env.local.example` for the canonical set:

- `NEXT_PUBLIC_SITE_URL`
- `BAAS_API_URL`
- `VERCEL_REVALIDATE_TOKEN` (or legacy `REVALIDATE_SECRET`)
- `NEXT_PUBLIC_BLOG_SLUG`

### Deploy env var checklist

**Vercel (Next.js project env vars):**
- `BAAS_API_URL` (Fly Rails URL)
- `NEXT_PUBLIC_SITE_URL` (e.g. `https://engineeringwithsebs.com`)
- `NEXT_PUBLIC_BLOG_SLUG`
- `VERCEL_REVALIDATE_TOKEN` (must match Fly)

**Fly (Rails secrets/env vars):**
- `RAILS_MASTER_KEY`
- `DATABASE_URL` (DigitalOcean managed Postgres)
- `REDIS_URL` (Upstash)
- `CORS_ORIGINS` (comma-separated; include Vercel domains)
- `VERCEL_REVALIDATE_URL` (e.g. `https://engineeringwithsebs.com/api/revalidate`)
- `VERCEL_REVALIDATE_TOKEN` (must match Vercel)

Common commands:

- `npm run dev`
- `npm run build && npm run start`
- `npm run lint`
- `npm run typecheck`
