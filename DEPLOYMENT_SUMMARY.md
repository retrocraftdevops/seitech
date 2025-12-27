# Vultr Deployment Summary

## 🚀 Quick Start

### Deploy to Vultr Server

```bash
cd /home/rodrickmakore/projects/seitech
./scripts/deploy-vultr.sh
```

This single command will:
- ✅ Remove old Odoo setup
- ✅ Install Docker, Nginx, Certbot
- ✅ Upload all code
- ✅ Configure firewall
- ✅ Start services
- ✅ Set up Nginx reverse proxy

## 📋 Server Details

### Server Information
- **IP Address**: `45.76.138.109`
- **SSH User**: `root`
- **SSH Port**: `22`
- **Deployment Directory**: `/opt/seitech`

### Access URLs

#### Before DNS Configuration
- **Odoo Direct**: `http://45.76.138.109:8069`
- **Nginx Proxy**: `http://45.76.138.109`

#### After DNS Configuration
- **API Endpoint**: `https://api.seitechinternational.org.uk`
- **Odoo Web UI**: `https://api.seitechinternational.org.uk`

## 🔧 DNS Configuration Required

### A Record
```
Type: A
Name: api
Value: 45.76.138.109
TTL: 3600
```

This creates: `api.seitechinternational.org.uk → 45.76.138.109`

## 🔐 Credentials

All credentials are stored in `.env.production`:
- **Database Password**: `6,wDD*iQCG6+4A?H`
- **Admin Password**: `6,wDD*iQCG6+4A?H`
- **Vultr API Key**: `T545D6WULEFNFGWMPM5HU7JZC5XJSRRWNVOQ`

**⚠️ Security Note**: These are production credentials. Keep `.env.production` secure and never commit to git.

## 🔒 Firewall Configuration

The deployment script automatically configures UFW firewall:

| Port | Service | Access |
|------|---------|--------|
| 22 | SSH | Public |
| 80 | HTTP | Public (redirects to HTTPS) |
| 443 | HTTPS | Public |
| 8069 | Odoo | Localhost only (via Nginx) |
| 5432 | PostgreSQL | Docker network only |

## 📦 Services Deployed

### Docker Containers
1. **seitech-postgres**: PostgreSQL 15 database
2. **seitech-odoo**: Odoo 19.0 Enterprise with custom modules

### System Services
1. **Nginx**: Reverse proxy with SSL support
2. **Certbot**: SSL certificate management
3. **UFW**: Firewall

## 🔄 Post-Deployment Steps

### 1. Configure DNS
Add the A record as shown above. Wait 5-15 minutes for propagation.

### 2. Set Up SSL Certificate
After DNS propagates:

```bash
ssh root@45.76.138.109
cd /opt/seitech
./scripts/setup-ssl.sh
```

Or manually:
```bash
certbot --nginx -d api.seitechinternational.org.uk --non-interactive --agree-tos --email admin@seitechinternational.org.uk --redirect
```

### 3. Install Odoo Modules
1. Access: `https://api.seitechinternational.org.uk` (or `http://45.76.138.109:8069` before DNS)
2. Login: `admin` / `6,wDD*iQCG6+4A?H`
3. Go to **Apps** → Install "Seitech E-Learning"

### 4. Update Frontend Environment Variables

In Vercel, update:
```env
NEXT_PUBLIC_ODOO_URL=https://api.seitechinternational.org.uk
NEXT_PUBLIC_API_URL=https://api.seitechinternational.org.uk
```

## 📊 Network Architecture

```
Internet
   ↓
[UFW Firewall]
   ↓
[Nginx:443/80] ← SSL/TLS
   ↓
[Docker Network: seitech-network]
   ├── [Odoo Container:8069]
   └── [PostgreSQL Container:5432]
```

## 🔍 Monitoring & Maintenance

### View Logs
```bash
ssh root@45.76.138.109
cd /opt/seitech

# Odoo logs
docker logs seitech-odoo -f

# PostgreSQL logs
docker logs seitech-postgres -f

# Nginx logs
tail -f /var/log/nginx/odoo-access.log
```

### Restart Services
```bash
ssh root@45.76.138.109
cd /opt/seitech
docker compose -f docker-compose.prod.yml restart
```

### Backup Database
```bash
ssh root@45.76.138.109
cd /opt/seitech
docker exec seitech-postgres pg_dump -U odoo seitech > backups/seitech_$(date +%Y%m%d_%H%M%S).sql
```

## 🌐 CORS Configuration

Odoo is configured to accept requests from:
- `https://seitechinternational.org.uk`
- `https://www.seitechinternational.org.uk`

This allows your Vercel frontend to communicate with the API.

## 📝 Files Created

1. **docker-compose.prod.yml** - Production Docker Compose configuration
2. **.env.production** - Production environment variables
3. **config/odoo.prod.conf** - Production Odoo configuration
4. **scripts/deploy-vultr.sh** - Automated deployment script
5. **scripts/nginx-odoo.conf** - Nginx reverse proxy configuration
6. **scripts/setup-ssl.sh** - SSL certificate setup script
7. **docs/VULTR_DEPLOYMENT.md** - Detailed deployment guide

## ✅ Deployment Checklist

- [x] Production Docker Compose file created
- [x] Environment variables configured
- [x] Deployment script created
- [x] Nginx configuration ready
- [x] Firewall rules defined
- [x] SSL setup script prepared
- [x] Documentation complete

## 🚨 Important Notes

1. **Security**: The `.env.production` file contains production credentials. Never commit it to git.

2. **DNS**: You must configure DNS before SSL certificates can be issued.

3. **Modules**: After deployment, install Odoo modules via the web interface.

4. **Updates**: To update code, run `./scripts/deploy-vultr.sh` again.

5. **Backups**: Set up regular database backups (recommended: daily).

## 📞 Support

For issues:
1. Check logs: `docker logs seitech-odoo`
2. Verify DNS: `dig api.seitechinternational.org.uk`
3. Test SSL: `curl -I https://api.seitechinternational.org.uk`
4. Check firewall: `ufw status`

## 🎯 Next Steps

1. **Run deployment**: `./scripts/deploy-vultr.sh`
2. **Configure DNS**: Add A record for `api.seitechinternational.org.uk`
3. **Set up SSL**: Run `./scripts/setup-ssl.sh` after DNS propagates
4. **Install modules**: Via Odoo web interface
5. **Update frontend**: Set environment variables in Vercel
6. **Test**: Verify API connectivity from frontend

---

**Ready to deploy?** Run: `./scripts/deploy-vultr.sh`

