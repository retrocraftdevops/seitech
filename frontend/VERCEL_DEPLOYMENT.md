# Vercel Deployment Guide

Complete guide for deploying the SEI Tech International frontend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Odoo Backend**: Backend should be deployed and accessible (currently at `http://45.76.138.109:8069`)

## Quick Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select the repository containing this frontend

2. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

3. **Set Environment Variables**
   
   Click "Environment Variables" and add the following:

   ```env
   # Required - Odoo Backend
   NEXT_PUBLIC_ODOO_URL=http://45.76.138.109:8069
   NEXT_PUBLIC_API_URL=http://45.76.138.109:8069
   ODOO_DATABASE=seitech
   ODOO_USERNAME=tendai@seitechinternational.org.uk
   ODOO_PASSWORD=Seitechinternational2025!

   # Required - Site Configuration
   NEXT_PUBLIC_SITE_URL=https://seitechinternational.org.uk

   # Required - NextAuth
   NEXTAUTH_URL=https://seitechinternational.org.uk
   NEXTAUTH_SECRET=unAU312CuEuSs2IKyfa66EIXDhJflyKJGYm+BPuw94g=
   ```

   **Important**: 
   - Set these for **Production**, **Preview**, and **Development** environments
   - After DNS/SSL is configured, update URLs to use `https://api.seitechinternational.org.uk`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at `https://your-project.vercel.app`

5. **Configure Custom Domain**
   - Go to Project Settings → Domains
   - Add your domain: `seitechinternational.org.uk`
   - Follow DNS instructions provided by Vercel

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

4. **Deploy**
   ```bash
   # Link project (first time only)
   vercel link

   # Deploy to production
   vercel --prod
   ```

5. **Set Environment Variables via CLI**
   ```bash
   vercel env add NEXT_PUBLIC_ODOO_URL production
   # Enter: http://45.76.138.109:8069

   vercel env add NEXT_PUBLIC_API_URL production
   # Enter: http://45.76.138.109:8069

   vercel env add ODOO_DATABASE production
   # Enter: seitech

   vercel env add ODOO_USERNAME production
   # Enter: tendai@seitechinternational.org.uk

   vercel env add ODOO_PASSWORD production
   # Enter: Seitechinternational2025!

   vercel env add NEXT_PUBLIC_SITE_URL production
   # Enter: https://seitechinternational.org.uk

   vercel env add NEXTAUTH_URL production
   # Enter: https://seitechinternational.org.uk

   vercel env add NEXTAUTH_SECRET production
   # Enter: unAU312CuEuSs2IKyfa66EIXDhJflyKJGYm+BPuw94g=
   ```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `NEXT_PUBLIC_ODOO_URL` | Odoo backend URL (public) | `http://45.76.138.109:8069` |
| `NEXT_PUBLIC_API_URL` | API endpoint URL (public) | `http://45.76.138.109:8069` |
| `ODOO_DATABASE` | Odoo database name | `seitech` |
| `ODOO_USERNAME` | Odoo admin username | `tendai@seitechinternational.org.uk` |
| `ODOO_PASSWORD` | Odoo admin password | `Seitechinternational2025!` |
| `NEXT_PUBLIC_SITE_URL` | Your site's public URL | `https://seitechinternational.org.uk` |
| `NEXTAUTH_URL` | NextAuth callback URL | `https://seitechinternational.org.uk` |
| `NEXTAUTH_SECRET` | NextAuth encryption secret | `unAU312CuEuSs2IKyfa66EIXDhJflyKJGYm+BPuw94g=` |

### Optional Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | `G-XXXXXXXXXX` |
| `REDIS_URL` | Redis connection URL | `redis://...` |
| `REDIS_TOKEN` | Redis authentication token | `...` |
| `SENTRY_DSN` | Sentry error tracking DSN | `https://...` |

## Post-Deployment Checklist

### 1. Update Odoo URLs (After DNS/SSL Setup)

Once you've configured DNS and SSL for the Odoo backend:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update:
   - `NEXT_PUBLIC_ODOO_URL` → `https://api.seitechinternational.org.uk`
   - `NEXT_PUBLIC_API_URL` → `https://api.seitechinternational.org.uk`
3. Redeploy the application

### 2. Configure Custom Domain

1. Go to Project Settings → Domains
2. Add your domain: `seitechinternational.org.uk`
3. Add `www.seitechinternational.org.uk` (optional)
4. Follow DNS instructions:
   - Add A record pointing to Vercel's IP
   - Or add CNAME record pointing to Vercel's domain

### 3. Enable HTTPS

Vercel automatically provides SSL certificates via Let's Encrypt. No action needed.

### 4. Test Deployment

- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] API calls to Odoo backend succeed
- [ ] Authentication works
- [ ] Images load correctly
- [ ] Forms submit successfully

## Troubleshooting

### Build Fails

**Error**: `Environment variable validation failed`

**Solution**: Ensure all required environment variables are set in Vercel dashboard.

**Error**: `Module not found`

**Solution**: 
```bash
# Clear .next cache and rebuild locally
rm -rf .next
npm run build
```

### API Calls Fail

**Error**: `CORS policy error`

**Solution**: Ensure Odoo backend has CORS configured correctly (already done in deployment).

**Error**: `Network error`

**Solution**: 
- Check `NEXT_PUBLIC_ODOO_URL` is correct
- Verify Odoo backend is accessible
- Check firewall rules on Vultr server

### Authentication Issues

**Error**: `NEXTAUTH_SECRET is missing`

**Solution**: Set `NEXTAUTH_SECRET` in Vercel environment variables.

**Error**: `Invalid callback URL`

**Solution**: Ensure `NEXTAUTH_URL` matches your actual domain.

## Continuous Deployment

Vercel automatically deploys on every push to your main branch:

1. Push to `main` branch
2. Vercel detects changes
3. Builds and deploys automatically
4. Preview deployments for pull requests

## Monitoring

- **Vercel Dashboard**: View deployments, logs, and analytics
- **Function Logs**: Check API route logs in Vercel dashboard
- **Analytics**: Enable Vercel Analytics in project settings

## Support

For issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Test Odoo backend connectivity

---

**Last Updated**: December 27, 2025  
**Deployment Status**: Ready for Production

