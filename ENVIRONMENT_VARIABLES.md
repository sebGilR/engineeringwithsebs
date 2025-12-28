# Environment Variables Reference

Complete reference for all environment variables needed for deploying engineeringwithsebs to Vercel.

## Quick Reference

### Vercel (Next.js Frontend)

| Variable | Required | Example Value | Description |
|----------|----------|---------------|-------------|
| `BAAS_API_URL` | ✅ Yes | `https://baas-dry-sun-7571.fly.dev` | Rails API base URL (Fly.io) |
| `NEXT_PUBLIC_SITE_URL` | ✅ Yes | `https://engineeringwithsebs.com` | Public site URL for metadata/SEO |
| `NEXT_PUBLIC_BLOG_SLUG` | ✅ Yes | `engineeringwithsebs` | Default blog slug for public content |
| `VERCEL_REVALIDATE_TOKEN` | ✅ Yes | `[64-char hex string]` | Secret for cache revalidation API |
| `REVALIDATE_SECRET` | ⚠️ Legacy | `[same as above]` | Backward compatible alias (optional) |

### Fly.io (Rails Backend)

| Variable | Required | Example Value | Description |
|----------|----------|---------------|-------------|
| `RAILS_MASTER_KEY` | ✅ Yes | `[from config/master.key]` | Rails credentials encryption key |
| `DATABASE_URL` | ✅ Yes | `postgres://user:pass@host:5432/db` | PostgreSQL connection string |
| `REDIS_URL` | ✅ Yes | `redis://host:6379` | Redis connection string (Upstash) |
| `VERCEL_REVALIDATE_URL` | ✅ Yes | `https://engineeringwithsebs.com/api/revalidate` | Vercel revalidation endpoint |
| `VERCEL_REVALIDATE_TOKEN` | ✅ Yes | `[same as Vercel]` | Must match Vercel token |
| `CORS_ORIGINS` | ✅ Yes | `https://engineeringwithsebs.com,https://www.engineeringwithsebs.com` | Allowed CORS origins (comma-separated) |
| `RAILS_LOG_LEVEL` | 🔹 Optional | `info` | Log level (debug/info/warn/error) |
| `WEB_CONCURRENCY` | 🔹 Optional | `1` | Number of Puma workers |
| `RAILS_MAX_THREADS` | 🔹 Optional | `5` | Max threads per Puma worker |

## Detailed Configuration

### 1. BAAS_API_URL

**Platform:** Vercel (Next.js)
**Required:** Yes
**Environment:** Production, Preview, Development

```bash
# Production
BAAS_API_URL=https://baas-dry-sun-7571.fly.dev

# Development (local)
BAAS_API_URL=http://localhost:3000
```

**Purpose:**
- Used by Next.js BFF (Backend for Frontend) routes under `app/api/*`
- All dashboard API calls go through this URL
- Public pages also fetch from this URL

**Important:**
- Must be the full URL including protocol (`https://`)
- No trailing slash
- Should point to your Fly.io app in production

---

### 2. NEXT_PUBLIC_SITE_URL

**Platform:** Vercel (Next.js)
**Required:** Yes
**Environment:** Production, Preview, Development

```bash
# Production (with custom domain)
NEXT_PUBLIC_SITE_URL=https://engineeringwithsebs.com

# Production (Vercel URL initially)
NEXT_PUBLIC_SITE_URL=https://engineeringwithsebs.vercel.app

# Development (local)
NEXT_PUBLIC_SITE_URL=http://localhost:3002
```

**Purpose:**
- Used for metadata (Open Graph, Twitter Cards)
- Sitemap URL generation
- RSS feed links
- Canonical URLs for SEO

**Important:**
- Must match your actual deployment URL
- Update after setting up custom domain
- Exposed to browser (starts with `NEXT_PUBLIC_`)

---

### 3. NEXT_PUBLIC_BLOG_SLUG

**Platform:** Vercel (Next.js)
**Required:** Yes
**Environment:** Production, Preview, Development

```bash
NEXT_PUBLIC_BLOG_SLUG=engineeringwithsebs
```

**Purpose:**
- Default blog slug for fetching posts on homepage
- Used in public API calls to BaaS
- Must match a blog slug in your backend database

**Important:**
- Must match exactly (case-sensitive)
- Exposed to browser (starts with `NEXT_PUBLIC_`)
- Typically the same across all environments

---

### 4. VERCEL_REVALIDATE_TOKEN

**Platform:** Vercel (Next.js) + Fly.io (Rails)
**Required:** Yes
**Environment:** Production, Preview, Development

```bash
# Generate with:
openssl rand -hex 32

# Example (do NOT use this value):
VERCEL_REVALIDATE_TOKEN=a1b2c3d4e5f6...
```

**Purpose:**
- Authenticates requests to `/api/revalidate` endpoint
- Backend sends this token when calling Vercel to clear cache
- Protects cache invalidation from unauthorized access

**Important:**
- **MUST BE THE SAME** on both Vercel and Fly.io
- Should be at least 32 bytes (64 hex characters)
- Keep this secret - don't commit to git
- Generate a unique token for production

**Setting in Vercel:**
```bash
vercel env add VERCEL_REVALIDATE_TOKEN production
```

**Setting in Fly.io:**
```bash
fly secrets set VERCEL_REVALIDATE_TOKEN=[same-token-as-vercel]
```

---

### 5. VERCEL_REVALIDATE_URL

**Platform:** Fly.io (Rails)
**Required:** Yes
**Environment:** Production

```bash
# Production (with custom domain)
VERCEL_REVALIDATE_URL=https://engineeringwithsebs.com/api/revalidate

# Production (Vercel URL)
VERCEL_REVALIDATE_URL=https://engineeringwithsebs.vercel.app/api/revalidate
```

**Purpose:**
- Backend calls this URL to trigger cache revalidation
- Called after publish/unpublish/update operations
- Uses Sidekiq job: `FrontendRevalidateJob`

**Important:**
- Must be the full URL to your Vercel deployment
- Path must be `/api/revalidate`
- Update after setting up custom domain

**Setting in Fly.io:**
```bash
fly secrets set VERCEL_REVALIDATE_URL=https://engineeringwithsebs.com/api/revalidate
```

---

### 6. CORS_ORIGINS

**Platform:** Fly.io (Rails)
**Required:** Yes
**Environment:** Production

```bash
# Production (with custom domain - both www and non-www)
CORS_ORIGINS=https://engineeringwithsebs.com,https://www.engineeringwithsebs.com

# Development (local)
CORS_ORIGINS=http://localhost:3000,http://localhost:3002
```

**Purpose:**
- Allows Next.js frontend to call Rails API from browser
- Configured in `config/initializers/cors.rb`
- Protects API from unauthorized domains

**Important:**
- Comma-separated list (no spaces)
- Include both www and non-www if using custom domain
- Must include all Vercel preview URLs if testing with branches

**Setting in Fly.io:**
```bash
fly secrets set CORS_ORIGINS=https://engineeringwithsebs.com,https://www.engineeringwithsebs.com
```

---

### 7. RAILS_MASTER_KEY

**Platform:** Fly.io (Rails)
**Required:** Yes
**Environment:** Production

```bash
# Get from:
cat /Users/sebastiangil/workspace/baas/config/master.key
```

**Purpose:**
- Decrypts `config/credentials.yml.enc`
- Required for Rails to access encrypted credentials
- Contains secrets like database passwords, API keys

**Important:**
- Never commit this to git (already in .gitignore)
- Should already be set if you've deployed before
- Keep this secret and secure

**Setting in Fly.io:**
```bash
fly secrets set RAILS_MASTER_KEY=[content-of-master.key]
```

---

### 8. DATABASE_URL

**Platform:** Fly.io (Rails)
**Required:** Yes
**Environment:** Production

```bash
# Format:
DATABASE_URL=postgresql://username:password@host:port/database_name

# Example (DigitalOcean):
DATABASE_URL=postgresql://doadmin:password@db-postgresql-nyc3-12345.db.ondigitalocean.com:25060/defaultdb?sslmode=require
```

**Purpose:**
- PostgreSQL database connection
- Used by ActiveRecord for all database operations

**Important:**
- Should point to a managed database (DigitalOcean, AWS RDS, etc.)
- Must include `?sslmode=require` for production
- Keep credentials secure

**Setting in Fly.io:**
```bash
fly secrets set DATABASE_URL=[your-database-url]
```

---

### 9. REDIS_URL

**Platform:** Fly.io (Rails)
**Required:** Yes
**Environment:** Production

```bash
# Format:
REDIS_URL=redis://username:password@host:port

# Example (Upstash):
REDIS_URL=rediss://default:password@us1-example-12345.upstash.io:6379
```

**Purpose:**
- Redis connection for Sidekiq
- Used for background jobs (revalidation, etc.)
- Can also be used for caching

**Important:**
- Recommended: Use Upstash for serverless Redis
- Must support SSL in production (`rediss://`)
- Should be in same region as Fly.io app for low latency

**Setting in Fly.io:**
```bash
fly secrets set REDIS_URL=[your-redis-url]
```

---

## Setting All Variables at Once

### Vercel CLI

```bash
cd /Users/sebastiangil/workspace/engineeringwithsebs

# Production
vercel env add BAAS_API_URL production
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_BLOG_SLUG production
vercel env add VERCEL_REVALIDATE_TOKEN production

# Preview (for branch deployments)
vercel env add BAAS_API_URL preview
vercel env add NEXT_PUBLIC_SITE_URL preview
vercel env add NEXT_PUBLIC_BLOG_SLUG preview
vercel env add VERCEL_REVALIDATE_TOKEN preview

# Development
vercel env add BAAS_API_URL development
vercel env add NEXT_PUBLIC_SITE_URL development
vercel env add NEXT_PUBLIC_BLOG_SLUG development
vercel env add VERCEL_REVALIDATE_TOKEN development
```

### Fly.io CLI

```bash
cd /Users/sebastiangil/workspace/baas

# Set all secrets at once
fly secrets set \
  VERCEL_REVALIDATE_TOKEN=[your-token] \
  VERCEL_REVALIDATE_URL=https://engineeringwithsebs.com/api/revalidate \
  CORS_ORIGINS=https://engineeringwithsebs.com,https://www.engineeringwithsebs.com

# Check they're set
fly secrets list
```

## Verification

### Check Vercel Variables

```bash
# List all environment variables
vercel env ls

# Pull environment variables to local .env file
vercel env pull .env.production
```

### Check Fly.io Secrets

```bash
# List all secrets (values are hidden)
fly secrets list

# Verify a specific secret
fly ssh console -C "echo \$VERCEL_REVALIDATE_TOKEN"
```

## Environment-Specific Values

### Development (Local)

Create `.env.local` in engineeringwithsebs:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3002
BAAS_API_URL=http://localhost:3000
VERCEL_REVALIDATE_TOKEN=dev-secret-token
NEXT_PUBLIC_BLOG_SLUG=engineeringwithsebs
```

### Preview (Vercel Branch Deployments)

```bash
NEXT_PUBLIC_SITE_URL=https://engineeringwithsebs-git-[branch].vercel.app
BAAS_API_URL=https://baas-dry-sun-7571.fly.dev
VERCEL_REVALIDATE_TOKEN=[production-token]
NEXT_PUBLIC_BLOG_SLUG=engineeringwithsebs
```

### Production (Vercel)

```bash
NEXT_PUBLIC_SITE_URL=https://engineeringwithsebs.com
BAAS_API_URL=https://baas-dry-sun-7571.fly.dev
VERCEL_REVALIDATE_TOKEN=[production-token]
NEXT_PUBLIC_BLOG_SLUG=engineeringwithsebs
```

## Security Best Practices

1. **Never commit secrets to git**
   - Use `.env.local` (already in .gitignore)
   - Use environment variable management tools

2. **Use different tokens per environment**
   - Development: Simple token is fine
   - Production: Long random token (32+ bytes)

3. **Rotate tokens periodically**
   - Update both Vercel and Fly.io at the same time
   - Test after rotation

4. **Limit CORS origins**
   - Only include domains you control
   - Don't use wildcards (`*`) in production

5. **Use SSL/TLS**
   - Always use `https://` in production
   - Redis should use `rediss://` (SSL)
   - Database should use `?sslmode=require`

## Troubleshooting

### "Environment variable not found"

**Solution:** Redeploy after adding variables
```bash
vercel --prod
```

### "CORS error from browser"

**Solution:** Check CORS_ORIGINS includes your Vercel domain
```bash
fly secrets set CORS_ORIGINS=https://[your-domain].com
```

### "Revalidation not working"

**Solution:** Verify tokens match
```bash
# Check Vercel
vercel env ls | grep VERCEL_REVALIDATE_TOKEN

# Check Fly
fly secrets list | grep VERCEL_REVALIDATE_TOKEN
```

## Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Fly.io Secrets Management](https://fly.io/docs/reference/secrets/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
