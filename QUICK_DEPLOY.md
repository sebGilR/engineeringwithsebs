# Quick Deploy Guide - TL;DR

The fastest path to deploying engineeringwithsebs to Vercel.

## Prerequisites

- ✅ Backend running on Fly.io: `https://baas-dry-sun-7571.fly.dev`
- ✅ GitHub repo: `sebGilR/engineeringwithsebs`

## Step 1: Generate Token (30 seconds)

```bash
# Generate a revalidation token
openssl rand -hex 32

# Copy the output - you'll need it twice
```

Save this token somewhere safe. You'll use it in both Vercel and Fly.io.

## Step 2: Deploy to Vercel (2 minutes)

1. Go to https://vercel.com/new
2. Import GitHub repository: `sebGilR/engineeringwithsebs`
3. Add these environment variables:

```bash
BAAS_API_URL=https://baas-dry-sun-7571.fly.dev
NEXT_PUBLIC_SITE_URL=https://engineeringwithsebs.vercel.app
NEXT_PUBLIC_BLOG_SLUG=engineeringwithsebs
VERCEL_REVALIDATE_TOKEN=[paste-token-from-step-1]
```

4. Click "Deploy"
5. Wait for build to complete (~2 minutes)
6. Note your Vercel URL (e.g., `https://engineeringwithsebs.vercel.app`)

## Step 3: Update Backend (1 minute)

```bash
cd /Users/sebastiangil/workspace/baas

# Set the same token from Step 1
fly secrets set VERCEL_REVALIDATE_TOKEN=[paste-token-from-step-1]

# Set Vercel URL (use your actual Vercel URL)
fly secrets set VERCEL_REVALIDATE_URL=https://engineeringwithsebs.vercel.app/api/revalidate

# Set CORS (use your actual Vercel URL)
fly secrets set CORS_ORIGINS=https://engineeringwithsebs.vercel.app
```

## Step 4: Test (2 minutes)

1. **Test homepage:** Visit `https://[your-vercel-url].vercel.app`
   - Should show published posts

2. **Test login:** Visit `https://[your-vercel-url].vercel.app/login`
   - Login with your backend credentials
   - Should redirect to dashboard

3. **Test revalidation:**
   - Publish a post from dashboard
   - Check if it appears on homepage immediately

## Done! 🎉

Your site is live at: `https://[your-vercel-url].vercel.app`

## Optional: Add Custom Domain (5 minutes)

1. In Vercel Dashboard → Project → Settings → Domains
2. Add `engineeringwithsebs.com`
3. Follow DNS instructions
4. Update environment variables:

```bash
# Vercel - update NEXT_PUBLIC_SITE_URL
vercel env rm NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_SITE_URL production
# Enter: https://engineeringwithsebs.com

# Fly.io - update revalidation URL and CORS
cd /Users/sebastiangil/workspace/baas
fly secrets set VERCEL_REVALIDATE_URL=https://engineeringwithsebs.com/api/revalidate
fly secrets set CORS_ORIGINS=https://engineeringwithsebs.com,https://www.engineeringwithsebs.com
```

## Troubleshooting

**Build fails?**
- Check build logs in Vercel Dashboard
- Ensure `npm run build` works locally

**Can't login?**
- Verify `BAAS_API_URL` is correct
- Check cookies are enabled

**Homepage is blank?**
- Ensure you have published posts in backend
- Check `NEXT_PUBLIC_BLOG_SLUG` matches backend blog slug

**Publish doesn't update homepage?**
- Verify `VERCEL_REVALIDATE_TOKEN` is the SAME on both Vercel and Fly
- Check backend logs: `fly logs -a baas-dry-sun-7571`

## Need More Details?

- **Full deployment guide:** [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
- **Step-by-step checklist:** [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Environment variables reference:** [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)
- **Troubleshooting:** [MAINTAINER_PLAYBOOK.md](./MAINTAINER_PLAYBOOK.md)
