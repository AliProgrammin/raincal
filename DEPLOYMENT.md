# RainCal Deployment Guide

## Prerequisites

- Railway or Vercel account
- PostgreSQL database (included in Railway, external for Vercel)

## Option 1: Deploy to Railway (Recommended)

Railway provides PostgreSQL included, making deployment simpler.

### Steps

1. **Create Railway account**: https://railway.app

2. **New Project from GitHub**:
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `AliProgrammin/raincal`

3. **Add PostgreSQL**:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway auto-generates `DATABASE_URL`

4. **Configure Environment Variables**:
   ```bash
   # Required - auto-set by Railway
   DATABASE_URL=<from PostgreSQL service>

   # Required - generate these:
   # openssl rand -base64 32
   NEXTAUTH_SECRET=<generate>
   # openssl rand -base64 24
   CALENDSO_ENCRYPTION_KEY=<generate>

   # URLs - use Railway domain or custom domain
   NEXTAUTH_URL=https://raincal-production.up.railway.app
   NEXT_PUBLIC_WEBAPP_URL=https://raincal-production.up.railway.app
   NEXT_PUBLIC_WEBSITE_URL=https://raincal-production.up.railway.app

   # Branding (already in .env, but set here for production)
   NEXT_PUBLIC_APP_NAME=RainCal
   NEXT_PUBLIC_COMPANY_NAME=RainCode
   NEXT_PUBLIC_SUPPORT_MAIL_ADDRESS=support@raincode.tech

   # Signup
   NEXT_PUBLIC_DISABLE_SIGNUP=false
   NEXT_PUBLIC_LICENSE_CONSENT=true
   ```

5. **Deploy**:
   - Railway auto-deploys when you push to GitHub
   - Or trigger manual deploy from dashboard

6. **Run Database Migrations**:
   - In Railway, open a shell to your service
   - Run: `yarn workspace @calcom/prisma db-deploy`

7. **Custom Domain (Optional)**:
   - Settings → Domains → Add custom domain
   - Update DNS CNAME to Railway domain
   - Update NEXTAUTH_URL and NEXT_PUBLIC_* URLs
   - Redeploy

## Option 2: Deploy to Vercel

Vercel requires external PostgreSQL (Neon, Supabase, or Railway).

### Steps

1. **Create PostgreSQL database** (Neon recommended):
   - Create account at https://neon.tech
   - Create new project and database
   - Copy connection string

2. **Deploy to Vercel**:
   - Import from GitHub: `AliProgrammin/raincal`
   - Vercel Pro plan required (serverless function limits)

3. **Configure Environment Variables** in Vercel:
   - Same as Railway list above
   - Use Neon/Supabase DATABASE_URL

4. **Important for Preview Deployments**:
   Leave these EMPTY for preview deployments:
   - NEXTAUTH_URL
   - NEXT_PUBLIC_WEBSITE_URL
   - NEXT_PUBLIC_WEBAPP_URL

## Post-Deployment Verification

1. [ ] Homepage loads with RainCode branding
2. [ ] Can create admin account via signup
3. [ ] Can log in
4. [ ] Can create event type
5. [ ] Can view booking page
6. [ ] Guest booking works
7. [ ] Email confirmations (if SMTP configured)

## Generate Secrets

```bash
# NEXTAUTH_SECRET (32 bytes)
openssl rand -base64 32

# CALENDSO_ENCRYPTION_KEY (24 bytes)
openssl rand -base64 24
```

## AGPLv3 Compliance

This fork is public at https://github.com/AliProgrammin/raincal
See LICENSE-COMPLIANCE.md for details.

---
*Last updated: 2026-01-19*
