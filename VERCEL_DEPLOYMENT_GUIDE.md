# Vercel Deployment Guide for engineeringwithsebs

This guide walks you through deploying the Next.js frontend to Vercel.

## Prerequisites

- ✅ Backend (BaaS) deployed on Fly.io
- ✅ Fly app URL available (e.g., `https://baas-dry-sun-7571.fly.dev`)
- ✅ Domain name ready (optional, but recommended)
- ✅ GitHub repository: `sebGilR/engineeringwithsebs`

## Step 1: Prepare Vercel Project

### 1.1 Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### 1.2 Link to GitHub Repository

The project is already on GitHub: `git@github.com:sebGilR/engineeringwithsebs.git`

## Step 2: Configure Environment Variables

You need to set these environment variables in your Vercel project settings.

### Required Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `BAAS_API_URL` | `https://baas-dry-sun-7571.fly.dev` | Rails API base URL from Fly.io |
| `NEXT_PUBLIC_SITE_URL` | `https://engineeringwithsebs.com` | Your production domain (or Vercel URL initially) |
| `NEXT_PUBLIC_BLOG_SLUG` | `engineeringwithsebs` | Default blog slug for public content |
| `VERCEL_REVALIDATE_TOKEN` | `[GENERATE_RANDOM_STRING]` | Secret token for cache revalidation (must match backend) |

### How to Generate VERCEL_REVALIDATE_TOKEN

```bash
# Option 1: Using OpenSSL
openssl rand -hex 32

# Option 2: Using Node
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

**IMPORTANT:** Use the SAME token value in both:
- Vercel: `VERCEL_REVALIDATE_TOKEN`
- Fly.io: `VERCEL_REVALIDATE_TOKEN` (see backend configuration below)

### Setting Variables in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project or create new from GitHub
3. Go to **Settings** → **Environment Variables**
4. Add each variable above for **Production**, **Preview**, and **Development** environments
   - For `NEXT_PUBLIC_SITE_URL`, use your Vercel preview URL for Preview/Development
   - For `BAAS_API_URL`, you might use your local backend for Development

### Setting Variables via Vercel CLI

```bash
cd /Users/sebastiangil/workspace/engineeringwithsebs

# Set production environment variables
vercel env add BAAS_API_URL production
# Enter: https://baas-dry-sun-7571.fly.dev

vercel env add NEXT_PUBLIC_SITE_URL production
# Enter: https://engineeringwithsebs.com

vercel env add NEXT_PUBLIC_BLOG_SLUG production
# Enter: engineeringwithsebs

vercel env add VERCEL_REVALIDATE_TOKEN production
# Enter: [your-generated-token]
```

## Step 3: Configure Backend (Fly.io)

The backend needs to know about your Vercel deployment for:
1. CORS (Cross-Origin Resource Sharing)
2. ISR revalidation callbacks

### Required Fly.io Secrets

```bash
# Navigate to backend
cd /Users/sebastiangil/workspace/baas

# Set the revalidation URL (your Vercel deployment)
fly secrets set VERCEL_REVALIDATE_URL=https://engineeringwithsebs.com/api/revalidate

# Set the SAME token as Vercel
fly secrets set VERCEL_REVALIDATE_TOKEN=[your-generated-token]

# Set CORS origins (comma-separated, include both www and non-www)
fly secrets set CORS_ORIGINS=https://engineeringwithsebs.com,https://www.engineeringwithsebs.com

# Verify secrets are set
fly secrets list
```

### Check Current Fly.io Configuration

Your current Fly app: `baas-dry-sun-7571`
Region: `ewr` (East Coast US)

**NOTE:** Your fly.toml has `min_machines_running = 0` which means the app will sleep when idle.
According to deploy_plan.md, you should update this for production:

```toml
[http_service]
  auto_stop_machines = "off"
  min_machines_running = 1
```

## Step 4: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended for first deployment)

1. Go to https://vercel.com/new
2. Import your GitHub repository: `sebGilR/engineeringwithsebs`
3. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
4. Add environment variables (see Step 2)
5. Click **Deploy**

### Option B: Via Vercel CLI

```bash
cd /Users/sebastiangil/workspace/engineeringwithsebs

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No (or Yes if you already created it)
# - Project name? engineeringwithsebs
# - Directory? ./
# - Override settings? No
```

## Step 5: Configure Custom Domain (Optional)

### In Vercel Dashboard

1. Go to your project → **Settings** → **Domains**
2. Add your domain: `engineeringwithsebs.com`
3. Add www subdomain: `www.engineeringwithsebs.com`
4. Follow DNS configuration instructions from Vercel

### Update Environment Variables After Domain Setup

Once your domain is live, update:

```bash
# Update NEXT_PUBLIC_SITE_URL to use your custom domain
vercel env rm NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_SITE_URL production
# Enter: https://engineeringwithsebs.com

# Also update backend
cd /Users/sebastiangil/workspace/baas
fly secrets set VERCEL_REVALIDATE_URL=https://engineeringwithsebs.com/api/revalidate
fly secrets set CORS_ORIGINS=https://engineeringwithsebs.com,https://www.engineeringwithsebs.com
```

## Step 6: Verify Deployment

### 6.1 Check Deployment Status

```bash
# Via CLI
vercel ls

# Or visit Vercel Dashboard
# https://vercel.com/[your-username]/engineeringwithsebs
```

### 6.2 Test Public Pages

Visit your deployed site:

1. **Homepage:** `https://[your-vercel-url].vercel.app` or `https://engineeringwithsebs.com`
   - Should load without errors
   - Should display published posts from backend

2. **Post page:** `https://[your-domain]/blog/engineeringwithsebs/[post-slug]`
   - Should render post content
   - Check that `content_html` is rendering properly

3. **Sitemap:** `https://[your-domain]/sitemap.xml`
   - Should list all published posts

4. **RSS Feed:** `https://[your-domain]/rss.xml`
   - Should contain published posts

### 6.3 Test Dashboard

1. **Login:** `https://[your-domain]/login`
   - Should allow login with backend credentials
   - Should set httpOnly cookies

2. **Dashboard:** `https://[your-domain]/dashboard`
   - Should redirect to login if not authenticated
   - Should load dashboard after login

3. **Create/Edit Post:** `https://[your-domain]/dashboard/posts/new`
   - Should allow creating new posts
   - Should autosave changes
   - Editor should work properly

### 6.4 Test Cache Revalidation

This is the critical integration test:

1. Create a new post in the dashboard
2. Publish it
3. Check if it appears on homepage immediately (within seconds)
4. Check backend logs for revalidation calls:

```bash
cd /Users/sebastiangil/workspace/baas
fly logs
# Look for: FrontendRevalidateJob logs
```

5. Check Vercel logs for revalidation hits:
   - Go to Vercel Dashboard → Your Project → Logs
   - Filter for `/api/revalidate`

## Step 7: Monitor & Debug

### Vercel Logs

```bash
# Real-time logs
vercel logs --follow

# Or in dashboard
# https://vercel.com/[your-username]/engineeringwithsebs/logs
```

### Common Issues

#### Issue: "Dashboard redirects to /login constantly"

**Solution:**
- Check browser cookies (should have `access_token`)
- Verify `BAAS_API_URL` is correct
- Check backend logs for 401 errors

#### Issue: "Public pages show 404"

**Solution:**
- Ensure posts are published (not drafts)
- Verify `NEXT_PUBLIC_BLOG_SLUG` matches backend blog slug
- Check backend is reachable from Vercel

#### Issue: "Content renders blank"

**Solution:**
- Verify post has `content_html` in backend response
- Check that editor is sending `content_json`
- Test backend endpoint directly: `GET https://baas-dry-sun-7571.fly.dev/public/v1/blogs/[slug]/posts/[slug]`

#### Issue: "Publishing doesn't update homepage"

**Solution:**
- Verify `VERCEL_REVALIDATE_TOKEN` matches on both Vercel and Fly
- Check `VERCEL_REVALIDATE_URL` is set correctly on Fly
- Test revalidation endpoint manually:

```bash
curl -X POST https://[your-domain]/api/revalidate \
  -H "Content-Type: application/json" \
  -H "X-Revalidate-Token: [your-token]" \
  -d '{"tags":["posts:list:engineeringwithsebs"]}'
```

## Step 8: Production Optimizations

### 8.1 Update Backend for Always-On

Edit `/Users/sebastiangil/workspace/baas/fly.toml`:

```toml
[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = "off"  # Changed from "stop"
  auto_start_machines = true
  min_machines_running = 1    # Changed from 0
  processes = ['app']
```

Then deploy:

```bash
cd /Users/sebastiangil/workspace/baas
fly deploy
```

### 8.2 Scale Resources (if needed)

```bash
# Check current resources
fly scale show

# Scale up if needed
fly scale memory 512  # For web process
```

### 8.3 Set Up Monitoring

- Enable Vercel Analytics (built-in)
- Set up error tracking (Sentry, etc.)
- Monitor Fly.io metrics

## Environment Variables Summary

### Vercel (Next.js)

```bash
BAAS_API_URL=https://baas-dry-sun-7571.fly.dev
NEXT_PUBLIC_SITE_URL=https://engineeringwithsebs.com
NEXT_PUBLIC_BLOG_SLUG=engineeringwithsebs
VERCEL_REVALIDATE_TOKEN=[same-as-backend]
```

### Fly.io (Rails)

```bash
RAILS_MASTER_KEY=[from config/master.key]
DATABASE_URL=[DigitalOcean Postgres connection string]
REDIS_URL=[Upstash Redis connection string]
CORS_ORIGINS=https://engineeringwithsebs.com,https://www.engineeringwithsebs.com
VERCEL_REVALIDATE_URL=https://engineeringwithsebs.com/api/revalidate
VERCEL_REVALIDATE_TOKEN=[same-as-vercel]
RAILS_LOG_LEVEL=info
WEB_CONCURRENCY=1
RAILS_MAX_THREADS=5
```

## Next Steps

1. Set up continuous deployment (GitHub integration handles this automatically)
2. Configure preview deployments for branches
3. Set up domain redirects (www → non-www or vice versa)
4. Enable Vercel Analytics
5. Set up custom error pages
6. Configure security headers
7. Set up monitoring and alerting

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Fly.io Documentation](https://fly.io/docs)
- [Project Deploy Plan](./deploy_plan.md)
- [Maintainer Playbook](./MAINTAINER_PLAYBOOK.md)
