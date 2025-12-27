# Vercel Environment Variables - Quick Reference

Copy and paste these into Vercel Dashboard → Settings → Environment Variables

## Required Environment Variables

```env
NEXT_PUBLIC_ODOO_URL=http://45.76.138.109:8069
NEXT_PUBLIC_API_URL=http://45.76.138.109:8069
ODOO_DATABASE=seitech
ODOO_USERNAME=tendai@seitechinternational.org.uk
ODOO_PASSWORD=Seitechinternational2025!
NEXT_PUBLIC_SITE_URL=https://seitechinternational.org.uk
NEXTAUTH_URL=https://seitechinternational.org.uk
NEXTAUTH_SECRET=unAU312CuEuSs2IKyfa66EIXDhJflyKJGYm+BPuw94g=
```

## After DNS/SSL Setup (Update These)

Once `api.seitechinternational.org.uk` is configured with SSL:

```env
NEXT_PUBLIC_ODOO_URL=https://api.seitechinternational.org.uk
NEXT_PUBLIC_API_URL=https://api.seitechinternational.org.uk
```

## How to Add in Vercel

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. For each variable:
   - Click **Add New**
   - Enter **Name** and **Value**
   - Select environments: **Production**, **Preview**, **Development**
   - Click **Save**
4. **Redeploy** your application after adding variables

## Verification

After deployment, verify:
- ✅ Homepage loads
- ✅ API calls work (check browser console)
- ✅ Authentication works
- ✅ No CORS errors

---

**Note**: Keep these credentials secure. Never commit `.env.production` to Git.

