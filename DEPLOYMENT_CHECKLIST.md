# Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment of engineeringwithsebs to Vercel.

## Pre-Deployment Checklist

### Backend (BaaS on Fly.io)

- [ ] **Backend is deployed and running**
  ```bash
  fly status -a baas-dry-sun-7571
  ```

- [ ] **Database is connected and migrated**
  ```bash
  fly ssh console -a baas-dry-sun-7571 -C "./bin/rails db:migrate:status"
  ```

- [ ] **Health endpoint is responding**
  ```bash
  curl https://baas-dry-sun-7571.fly.dev/up
  ```

- [ ] **At least one blog exists with slug `engineeringwithsebs`**
  ```bash
  fly ssh console -a baas-dry-sun-7571 -C "./bin/rails runner 'puts Publishing::Blog.find_by(slug: \"engineeringwithsebs\").inspect'"
  ```

- [ ] **At least one published post exists (for testing)**
  ```bash
  fly ssh console -a baas-dry-sun-7571 -C "./bin/rails runner 'puts Publishing::Post.published.count'"
  ```

### Frontend (Local)

- [ ] **All dependencies installed**
  ```bash
  cd /Users/sebastiangil/workspace/engineeringwithsebs
  npm install
  ```

- [ ] **Build succeeds locally**
  ```bash
  npm run build
  ```

- [ ] **Type checking passes**
  ```bash
  npm run typecheck
  ```

- [ ] **Linting passes**
  ```bash
  npm run lint
  ```

- [ ] **Code is committed and pushed to GitHub**
  ```bash
  git status
  git push origin main
  ```

## Deployment Setup

### Step 1: Generate Secrets

- [ ] **Generate VERCEL_REVALIDATE_TOKEN**
  ```bash
  openssl rand -hex 32
  ```
  **Save this value** - you'll use it in both Vercel and Fly.io

  Token: `_________________________________`

### Step 2: Configure Vercel Environment Variables

- [ ] **Create/Import Vercel Project**
  - Go to https://vercel.com/new
  - Import `sebGilR/engineeringwithsebs` from GitHub

- [ ] **Set Production Environment Variables** (in Vercel Dashboard)
  - [ ] `BAAS_API_URL` = `https://baas-dry-sun-7571.fly.dev`
  - [ ] `NEXT_PUBLIC_SITE_URL` = `https://[your-vercel-url].vercel.app` (update after custom domain)
  - [ ] `NEXT_PUBLIC_BLOG_SLUG` = `engineeringwithsebs`
  - [ ] `VERCEL_REVALIDATE_TOKEN` = `[token from Step 1]`

- [ ] **Set Preview Environment Variables** (same as production but for staging)
  - [ ] `BAAS_API_URL` = `https://baas-dry-sun-7571.fly.dev` (or use a staging backend)
  - [ ] `NEXT_PUBLIC_SITE_URL` = `https://[preview-url].vercel.app`
  - [ ] `NEXT_PUBLIC_BLOG_SLUG` = `engineeringwithsebs`
  - [ ] `VERCEL_REVALIDATE_TOKEN` = `[token from Step 1]`

### Step 3: Configure Backend (Fly.io Secrets)

- [ ] **Set VERCEL_REVALIDATE_TOKEN on Fly.io**
  ```bash
  cd /Users/sebastiangil/workspace/baas
  fly secrets set VERCEL_REVALIDATE_TOKEN=[token from Step 1]
  ```

- [ ] **Set VERCEL_REVALIDATE_URL on Fly.io**
  ```bash
  fly secrets set VERCEL_REVALIDATE_URL=https://[your-vercel-url].vercel.app/api/revalidate
  ```

- [ ] **Set CORS_ORIGINS on Fly.io**
  ```bash
  fly secrets set CORS_ORIGINS=https://[your-vercel-url].vercel.app
  ```

- [ ] **Verify all required secrets are set**
  ```bash
  fly secrets list
  ```
  Should include:
  - RAILS_MASTER_KEY
  - DATABASE_URL
  - REDIS_URL
  - VERCEL_REVALIDATE_TOKEN
  - VERCEL_REVALIDATE_URL
  - CORS_ORIGINS

### Step 4: Update Backend Configuration for Production

- [ ] **Update fly.toml for always-on (if needed)**

  Current configuration has `min_machines_running = 0` (will sleep when idle)

  For production, edit `/Users/sebastiangil/workspace/baas/fly.toml`:
  ```toml
  [http_service]
    auto_stop_machines = "off"
    min_machines_running = 1
  ```

- [ ] **Deploy updated configuration**
  ```bash
  cd /Users/sebastiangil/workspace/baas
  fly deploy
  ```

## Deployment

### Step 5: Deploy to Vercel

- [ ] **Trigger deployment**
  - Via Dashboard: Click "Deploy" in Vercel project
  - Via CLI: `vercel --prod`
  - Via Git: Push to `main` branch (auto-deploys)

- [ ] **Monitor deployment**
  - Watch build logs in Vercel Dashboard
  - Ensure build completes successfully

- [ ] **Note your deployment URL**

  Vercel URL: `https://________________________________.vercel.app`

## Post-Deployment Verification

### Step 6: Test Public Pages

- [ ] **Homepage loads**
  - Visit: `https://[your-vercel-url].vercel.app`
  - Verify: Posts are displayed
  - Check: No console errors

- [ ] **Individual post page loads**
  - Visit: `https://[your-vercel-url].vercel.app/blog/engineeringwithsebs/[post-slug]`
  - Verify: Content renders correctly
  - Check: Metadata is correct (title, description)

- [ ] **Sitemap is accessible**
  - Visit: `https://[your-vercel-url].vercel.app/sitemap.xml`
  - Verify: Contains published posts

- [ ] **RSS feed is accessible**
  - Visit: `https://[your-vercel-url].vercel.app/rss.xml`
  - Verify: Contains published posts

- [ ] **Robots.txt is accessible**
  - Visit: `https://[your-vercel-url].vercel.app/robots.txt`
  - Verify: Contains correct content

### Step 7: Test Dashboard Authentication

- [ ] **Login page loads**
  - Visit: `https://[your-vercel-url].vercel.app/login`
  - Verify: Form is displayed

- [ ] **Can log in successfully**
  - Enter credentials
  - Verify: Redirected to dashboard
  - Check: Cookies are set (`access_token`, `refresh_token`)

- [ ] **Dashboard loads after login**
  - Visit: `https://[your-vercel-url].vercel.app/dashboard`
  - Verify: Dashboard displays
  - Check: No API errors in console

- [ ] **Unauthenticated access is blocked**
  - Open incognito window
  - Visit: `https://[your-vercel-url].vercel.app/dashboard`
  - Verify: Redirected to `/login`

### Step 8: Test Dashboard Functionality

- [ ] **Posts list loads**
  - Visit: `https://[your-vercel-url].vercel.app/dashboard/posts`
  - Verify: Existing posts are displayed
  - Check: Filtering works (All, Published, Drafts)

- [ ] **Can create a new post**
  - Visit: `https://[your-vercel-url].vercel.app/dashboard/posts/new`
  - Create a test post
  - Verify: Redirected to edit page
  - Check: Post appears in posts list

- [ ] **Can edit an existing post**
  - Visit edit page for a post
  - Make changes
  - Verify: Autosave works (check for success toast)
  - Check: Changes persist after reload

- [ ] **Tiptap editor works correctly**
  - Test formatting (bold, italic, headings)
  - Test links
  - Test images (if implemented)
  - Verify: Content saves correctly

### Step 9: Test Cache Revalidation (Critical!)

This tests the integration between Vercel and Fly.io.

- [ ] **Test publish workflow**
  1. Create/edit a post in dashboard
  2. Click "Publish"
  3. Check backend logs for revalidation job:
     ```bash
     fly logs -a baas-dry-sun-7571
     # Look for: FrontendRevalidateJob
     ```
  4. Visit homepage in new tab
  5. Verify: Post appears on homepage within ~5 seconds

- [ ] **Test unpublish workflow**
  1. Unpublish a post from dashboard
  2. Check backend logs
  3. Visit homepage
  4. Verify: Post is removed from homepage

- [ ] **Test revalidation endpoint directly**
  ```bash
  curl -X POST https://[your-vercel-url].vercel.app/api/revalidate \
    -H "Content-Type: application/json" \
    -H "X-Revalidate-Token: [your-token]" \
    -d '{"tags":["posts:list:engineeringwithsebs"]}'
  ```
  - Verify: Returns 200 OK
  - Check: Homepage cache is cleared

### Step 10: Performance & Caching

- [ ] **Homepage is cached by Vercel**
  - Visit homepage
  - Check Network tab for `X-Vercel-Cache: HIT` header (on second visit)

- [ ] **Post pages are cached**
  - Visit a post page twice
  - Check for cache headers

- [ ] **Dashboard routes are NOT cached**
  - Check dashboard pages don't have ISR cache headers

## Custom Domain Setup (Optional)

### Step 11: Add Custom Domain

- [ ] **Add domain in Vercel**
  - Go to Project Settings → Domains
  - Add: `engineeringwithsebs.com`
  - Add: `www.engineeringwithsebs.com`

- [ ] **Configure DNS**
  - Follow Vercel's instructions
  - Add A/CNAME records to your DNS provider

- [ ] **Wait for DNS propagation**
  - Can take up to 48 hours (usually much faster)
  - Test with: `dig engineeringwithsebs.com`

- [ ] **Update environment variables with custom domain**

  **In Vercel:**
  ```bash
  # Update NEXT_PUBLIC_SITE_URL
  vercel env rm NEXT_PUBLIC_SITE_URL production
  vercel env add NEXT_PUBLIC_SITE_URL production
  # Enter: https://engineeringwithsebs.com
  ```

  **In Fly.io:**
  ```bash
  cd /Users/sebastiangil/workspace/baas
  fly secrets set VERCEL_REVALIDATE_URL=https://engineeringwithsebs.com/api/revalidate
  fly secrets set CORS_ORIGINS=https://engineeringwithsebs.com,https://www.engineeringwithsebs.com
  ```

- [ ] **Redeploy both apps**
  - Vercel: Auto-redeploys after env var change
  - Fly: `fly deploy` if needed

- [ ] **Test with custom domain**
  - Repeat verification steps above using custom domain

## Monitoring & Alerts

### Step 12: Set Up Monitoring

- [ ] **Enable Vercel Analytics**
  - Go to Project → Analytics
  - Enable if not already enabled

- [ ] **Check Vercel Logs**
  - Ensure logs are being collected
  - Set up log drains if needed

- [ ] **Monitor Fly.io metrics**
  ```bash
  fly dashboard -a baas-dry-sun-7571
  ```

- [ ] **Set up error tracking** (optional)
  - Sentry, LogRocket, or similar
  - Add to both frontend and backend

## Production Optimizations

### Step 13: Optimize Backend

- [ ] **Scale backend resources if needed**
  ```bash
  fly scale show
  # If needed:
  fly scale memory 512
  ```

- [ ] **Verify Sidekiq is running**
  ```bash
  fly ssh console -a baas-dry-sun-7571 -C "ps aux | grep sidekiq"
  ```

- [ ] **Check Redis connection**
  ```bash
  fly ssh console -a baas-dry-sun-7571 -C "./bin/rails runner 'puts Redis.new(url: ENV[\"REDIS_URL\"]).ping'"
  ```

### Step 14: Security Checklist

- [ ] **All secrets are secure**
  - Tokens are random and sufficiently long
  - No secrets in git history

- [ ] **HTTPS is enforced**
  - Check `force_https = true` in fly.toml
  - Vercel handles HTTPS automatically

- [ ] **CORS is properly configured**
  - Only allows your Vercel domain(s)

- [ ] **Environment variables are set per environment**
  - Production uses production values
  - Preview uses preview values

## Troubleshooting

If anything fails, refer to:
- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - Full deployment guide with solutions
- [MAINTAINER_PLAYBOOK.md](./MAINTAINER_PLAYBOOK.md) - Debugging playbook
- [deploy_plan.md](./deploy_plan.md) - Architecture overview

### Common Issues

**Issue: Build fails on Vercel**
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in package.json
- Verify TypeScript types are correct

**Issue: 500 errors on public pages**
- Check Vercel logs
- Verify BAAS_API_URL is correct
- Ensure backend is accessible from Vercel

**Issue: Dashboard won't stay logged in**
- Verify cookies are being set (check DevTools)
- Check BAAS_API_URL points to correct backend
- Ensure backend CORS allows your Vercel domain

**Issue: Revalidation doesn't work**
- Verify tokens match on both Vercel and Fly
- Check backend logs for FrontendRevalidateJob
- Test revalidation endpoint manually

## Sign-Off

- [ ] **All tests pass**
- [ ] **Performance is acceptable**
- [ ] **No console errors**
- [ ] **Cache revalidation works**
- [ ] **Team has access to Vercel project**
- [ ] **Documentation is updated**

---

**Deployment Date:** ___________________

**Deployed By:** ___________________

**Vercel URL:** ___________________

**Custom Domain:** ___________________ (if applicable)

**Notes:**
