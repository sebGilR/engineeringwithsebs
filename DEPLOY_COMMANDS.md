# Ready-to-Run Deployment Commands

Copy and paste these commands to deploy engineeringwithsebs to Vercel.

## 🔑 Your Generated Token

```
ecc106c5c0764495a0fc47ac21ea4fc22003188661ec2a4660b318acadd3f787
```

**IMPORTANT:** This token must be set in BOTH Vercel and Fly.io.

---

## 1️⃣ Set Up Backend (Fly.io)

### Navigate to backend directory

```bash
cd /Users/sebastiangil/workspace/baas
```

### Set Fly.io secrets

```bash
# Set the revalidation token (MUST match Vercel)
fly secrets set VERCEL_REVALIDATE_TOKEN="ecc106c5c0764495a0fc47ac21ea4fc22003188661ec2a4660b318acadd3f787"

# Set the Vercel revalidation URL (update after you know your Vercel URL)
# Temporary: use Vercel preview URL
fly secrets set VERCEL_REVALIDATE_URL="https://engineeringwithsebs.vercel.app/api/revalidate"

# Set CORS origins (update after you know your Vercel URL)
# Temporary: use Vercel preview URL
fly secrets set CORS_ORIGINS="https://engineeringwithsebs.vercel.app"

# If using custom domain, update to:
# fly secrets set VERCEL_REVALIDATE_URL="https://engineeringwithsebs.com/api/revalidate"
# fly secrets set CORS_ORIGINS="https://engineeringwithsebs.com,https://www.engineeringwithsebs.com"
```

### Verify secrets are set

```bash
fly secrets list
```

You should see:
- ✅ VERCEL_REVALIDATE_TOKEN
- ✅ VERCEL_REVALIDATE_URL
- ✅ CORS_ORIGINS
- ✅ RAILS_MASTER_KEY (if already deployed)
- ✅ DATABASE_URL (if already deployed)
- ✅ REDIS_URL (if already deployed)

### Deploy updated fly.toml

```bash
fly deploy
```

This deploys the updated configuration (always-on, 512MB RAM).

---

## 2️⃣ Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to:** https://vercel.com/new

2. **Import repository:** `sebGilR/engineeringwithsebs`

3. **Add environment variables** (Settings → Environment Variables)

   Add these for **Production**:

   | Key | Value |
   |-----|-------|
   | `BAAS_API_URL` | `https://baas-dry-sun-7571.fly.dev` |
   | `NEXT_PUBLIC_SITE_URL` | `https://engineeringwithsebs.vercel.app` |
   | `NEXT_PUBLIC_BLOG_SLUG` | `engineeringwithsebs` |
   | `VERCEL_REVALIDATE_TOKEN` | `ecc106c5c0764495a0fc47ac21ea4fc22003188661ec2a4660b318acadd3f787` |

   Optionally add for **Preview** and **Development** too.

4. **Click "Deploy"**

5. **Note your Vercel URL** (e.g., `https://engineeringwithsebs-xyz123.vercel.app`)

6. **Update backend CORS** (if your URL is different):
   ```bash
   cd /Users/sebastiangil/workspace/baas
   fly secrets set VERCEL_REVALIDATE_URL="https://[your-actual-url].vercel.app/api/revalidate"
   fly secrets set CORS_ORIGINS="https://[your-actual-url].vercel.app"
   ```

### Option B: Via Vercel CLI

```bash
# Navigate to frontend directory
cd /Users/sebastiangil/workspace/engineeringwithsebs

# Login to Vercel (if not already)
vercel login

# Add environment variables
vercel env add BAAS_API_URL production
# When prompted, enter: https://baas-dry-sun-7571.fly.dev

vercel env add NEXT_PUBLIC_SITE_URL production
# When prompted, enter: https://engineeringwithsebs.vercel.app (or your custom domain)

vercel env add NEXT_PUBLIC_BLOG_SLUG production
# When prompted, enter: engineeringwithsebs

vercel env add VERCEL_REVALIDATE_TOKEN production
# When prompted, enter: ecc106c5c0764495a0fc47ac21ea4fc22003188661ec2a4660b318acadd3f787

# Deploy to production
vercel --prod
```

---

## 3️⃣ Verify Deployment

### Check Vercel deployment

```bash
# View deployments
vercel ls

# View logs
vercel logs --follow
```

### Test the deployment

```bash
# Replace with your actual Vercel URL
VERCEL_URL="https://engineeringwithsebs.vercel.app"

# Test homepage
curl -I $VERCEL_URL

# Test sitemap
curl -I $VERCEL_URL/sitemap.xml

# Test RSS
curl -I $VERCEL_URL/rss.xml

# Test revalidation endpoint (should return 200 or 401 if token missing)
curl -X POST $VERCEL_URL/api/revalidate \
  -H "Content-Type: application/json" \
  -H "X-Revalidate-Token: ecc106c5c0764495a0fc47ac21ea4fc22003188661ec2a4660b318acadd3f787" \
  -d '{"tags":["posts:list:engineeringwithsebs"]}'
```

### Check backend is healthy

```bash
cd /Users/sebastiangil/workspace/baas

# Check app status
fly status

# Check logs
fly logs

# Test health endpoint
curl https://baas-dry-sun-7571.fly.dev/up

# Check if Sidekiq is running
fly ssh console -C "ps aux | grep sidekiq"
```

---

## 4️⃣ Test Integration

### Test the full publish workflow

1. **Login to dashboard:**
   - Visit: `https://[your-vercel-url]/login`
   - Login with your backend credentials

2. **Create and publish a post:**
   - Go to: `https://[your-vercel-url]/dashboard/posts/new`
   - Create a test post
   - Publish it

3. **Verify revalidation:**
   - Check backend logs for `FrontendRevalidateJob`:
     ```bash
     cd /Users/sebastiangil/workspace/baas
     fly logs | grep FrontendRevalidateJob
     ```

   - Visit homepage in new tab:
     ```bash
     open https://[your-vercel-url]
     ```

   - Post should appear within ~5 seconds

---

## 5️⃣ Add Custom Domain (Optional)

### In Vercel Dashboard

1. Go to: **Project → Settings → Domains**
2. Add domain: `engineeringwithsebs.com`
3. Add www subdomain: `www.engineeringwithsebs.com`
4. Follow DNS configuration instructions

### Update environment variables with custom domain

```bash
# Update Vercel
cd /Users/sebastiangil/workspace/engineeringwithsebs

vercel env rm NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_SITE_URL production
# Enter: https://engineeringwithsebs.com

# Trigger redeploy
vercel --prod

# Update Fly.io
cd /Users/sebastiangil/workspace/baas

fly secrets set VERCEL_REVALIDATE_URL="https://engineeringwithsebs.com/api/revalidate"
fly secrets set CORS_ORIGINS="https://engineeringwithsebs.com,https://www.engineeringwithsebs.com"
```

---

## 🐛 Troubleshooting Commands

### Check Vercel build logs

```bash
vercel logs --follow
```

### Check Fly.io logs

```bash
cd /Users/sebastiangil/workspace/baas
fly logs
```

### Test backend directly

```bash
# Health check
curl https://baas-dry-sun-7571.fly.dev/up

# List public posts
curl https://baas-dry-sun-7571.fly.dev/public/v1/blogs/engineeringwithsebs/posts

# Get specific post
curl https://baas-dry-sun-7571.fly.dev/public/v1/blogs/engineeringwithsebs/posts/[post-slug]
```

### Test authentication

```bash
# Login (get tokens)
curl -X POST https://baas-dry-sun-7571.fly.dev/api/v1/auth/login \
  -H "Content-Type: application/vnd.api+json" \
  -d '{
    "data": {
      "type": "auth",
      "attributes": {
        "email": "your-email@example.com",
        "password": "your-password"
      }
    }
  }'
```

### Force rebuild on Vercel

```bash
# Trigger a new deployment
vercel --prod --force
```

### Scale Fly.io resources if needed

```bash
# Check current scaling
fly scale show

# Scale up memory
fly scale memory 1024

# Scale to multiple machines
fly scale count 2
```

---

## 📝 Quick Reference

### Your Configuration

- **Fly.io App:** `baas-dry-sun-7571`
- **Fly.io Region:** `ewr` (East Coast US)
- **Fly.io URL:** `https://baas-dry-sun-7571.fly.dev`
- **GitHub Repo:** `sebGilR/engineeringwithsebs`
- **Revalidation Token:** `ecc106c5c0764495a0fc47ac21ea4fc22003188661ec2a4660b318acadd3f787`

### Environment Variables Summary

**Vercel:**
```bash
BAAS_API_URL=https://baas-dry-sun-7571.fly.dev
NEXT_PUBLIC_SITE_URL=https://engineeringwithsebs.vercel.app
NEXT_PUBLIC_BLOG_SLUG=engineeringwithsebs
VERCEL_REVALIDATE_TOKEN=ecc106c5c0764495a0fc47ac21ea4fc22003188661ec2a4660b318acadd3f787
```

**Fly.io:**
```bash
VERCEL_REVALIDATE_TOKEN=ecc106c5c0764495a0fc47ac21ea4fc22003188661ec2a4660b318acadd3f787
VERCEL_REVALIDATE_URL=https://engineeringwithsebs.vercel.app/api/revalidate
CORS_ORIGINS=https://engineeringwithsebs.vercel.app
```

---

## ✅ Next Steps After Deployment

1. Test all functionality with [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
2. Set up monitoring and alerts
3. Configure custom domain
4. Enable Vercel Analytics
5. Set up error tracking (Sentry, etc.)

---

**Need help?** See:
- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - Full guide with troubleshooting
- [MAINTAINER_PLAYBOOK.md](./MAINTAINER_PLAYBOOK.md) - Day-to-day operations guide
