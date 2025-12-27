# Odoo Deployment - Final Instructions

## ✅ Odoo is Running!

**Server**: `45.76.138.109`  
**Status**: Odoo 19.0 Official Docker image deployed

## 🌐 Access Now

Open your browser and visit:
```
http://45.76.138.109:8069
```

You should see the Odoo database manager or login screen.

## 🔐 Credentials

- **Master Password**: `6,wDD*iQCG6+4A?H`
- **Admin Username**: `admin`
- **Admin Password**: `6,wDD*iQCG6+4A?H`

## 📋 Next Steps

### 1. Create Database (if needed)
If you see the database manager:
1. Master Password: `6,wDD*iQCG6+4A?H`
2. Database Name: `seitech`
3. Email: `admin@seitechinternational.org.uk`
4. Password: `6,wDD*iQCG6+4A?H`
5. Language: English
6. Country: United Kingdom
7. Demo data: **No**
8. Click "Create database"

### 2. Install Custom Modules
1. Login to Odoo
2. Go to **Apps** menu
3. Remove any filters
4. Search for:
   - `seitech_base`
   - `seitech_elearning`
   - `seitech_cms`
   - `seitech_website_theme`
5. Install each module

### 3. Configure DNS

Add this A record in your DNS provider (Cloudflare/Namecheap/GoDaddy):

```
Type: A
Name: api
Value: 45.76.138.109
TTL: 3600
```

**Result**: `api.seitechinternational.org.uk` → `45.76.138.109`

### 4. Install SSL Certificate

After DNS propagates (wait 5-15 minutes), run:

```bash
ssh root@45.76.138.109
# Password: 6,wDD*iQCG6+4A?H

certbot --nginx -d api.seitechinternational.org.uk \
  --non-interactive \
  --agree-tos \
  --email admin@seitechinternational.org.uk \
  --redirect
```

### 5. Update Frontend (Vercel)

Set environment variables in Vercel:

```env
NEXT_PUBLIC_ODOO_URL=https://api.seitechinternational.org.uk
NEXT_PUBLIC_API_URL=https://api.seitechinternational.org.uk
```

## 🛠️ Useful Commands

### Check Containers
```bash
ssh root@45.76.138.109
docker ps
```

### View Logs
```bash
# Odoo logs
docker logs seitech-odoo -f

# PostgreSQL logs
docker logs seitech-postgres -f
```

### Restart Odoo
```bash
cd /opt/seitech
docker restart seitech-odoo
```

### Backup Database
```bash
docker exec seitech-postgres pg_dump -U odoo seitech > backup_$(date +%Y%m%d).sql
```

## 📁 Files on Server

- **Docker Compose**: `/opt/seitech/docker-compose.official.yml`
- **Odoo Config**: `/opt/seitech/config/odoo.official.conf`
- **Custom Addons**: `/opt/seitech/custom_addons/`
- **Nginx Config**: `/etc/nginx/sites-available/odoo`

## 🔧 Troubleshooting

If page doesn't load:
```bash
ssh root@45.76.138.109
docker restart seitech-odoo
docker logs seitech-odoo --tail 50
```

## 🎯 Deployment Complete!

All infrastructure is in place. Complete the steps above to finalize your Odoo setup.

---

**Deployed**: December 27, 2025  
**Server**: 45.76.138.109  
**Version**: Odoo 19.0 (Official Docker Image)

