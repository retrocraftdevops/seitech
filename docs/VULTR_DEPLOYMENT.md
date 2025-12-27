# Vultr Production Deployment Guide

## Server Information

- **Server IP**: `45.76.138.109`
- **Login**: `root`
- **SSH Port**: `22`
- **API Domain**: `api.seitechinternational.org.uk` (configure in DNS)

## Architecture

```
Internet
   ↓
Nginx (Port 443/80) ← SSL/TLS
   ↓
Docker Network
   ├── Odoo Container (Port 8069)
   └── PostgreSQL Container (Port 5432)
```

## Deployment Steps

### 1. Initial Deployment

Run the deployment script from your local machine:

```bash
cd /home/rodrickmakore/projects/seitech
chmod +x scripts/deploy-vultr.sh
./scripts/deploy-vultr.sh
```

This script will:
- ✅ Install Docker, Docker Compose, Nginx, Certbot
- ✅ Remove any existing Odoo setup
- ✅ Upload project files
- ✅ Configure firewall (UFW)
- ✅ Build and start Docker containers
- ✅ Configure Nginx reverse proxy
- ✅ Set up basic security

### 2. DNS Configuration

Configure your DNS provider with the following records:

#### A Record
```
Type: A
Name: api
Value: 45.76.138.109
TTL: 3600
```

This will make `api.seitechinternational.org.uk` point to your server.

### 3. SSL Certificate Setup

After DNS propagation (usually 5-15 minutes), set up SSL:

```bash
ssh root@45.76.138.109
cd /opt/seitech
chmod +x scripts/setup-ssl.sh
./scripts/setup-ssl.sh
```

Or manually:
```bash
ssh root@45.76.138.109
certbot --nginx -d api.seitechinternational.org.uk --non-interactive --agree-tos --email admin@seitechinternational.org.uk --redirect
```

### 4. Install Odoo Modules

1. Access Odoo web interface:
   - **Before DNS**: `http://45.76.138.109:8069`
   - **After DNS**: `https://api.seitechinternational.org.uk`

2. Login with:
   - **Username**: `admin`
   - **Password**: (from `.env.production`)

3. Go to **Apps** → Search for "Seitech E-Learning"
4. Click **Install**
5. Wait for installation to complete

### 5. Frontend Configuration

Update your Vercel frontend environment variables:

```env
NEXT_PUBLIC_ODOO_URL=https://api.seitechinternational.org.uk
NEXT_PUBLIC_API_URL=https://api.seitechinternational.org.uk
```

## Network Configuration

### Firewall Rules (UFW)

The deployment script configures:

- ✅ **Port 22** (SSH) - Open
- ✅ **Port 80** (HTTP) - Open (redirects to HTTPS)
- ✅ **Port 443** (HTTPS) - Open
- ❌ **Port 8069** (Odoo) - Only accessible via Nginx (localhost)
- ❌ **Port 5432** (PostgreSQL) - Internal only

### Access Points

| Service | URL | Port | Access |
|---------|-----|------|--------|
| Odoo Web UI | `https://api.seitechinternational.org.uk` | 443 | Public (HTTPS) |
| Odoo Direct | `http://45.76.138.109:8069` | 8069 | Localhost only |
| PostgreSQL | Internal | 5432 | Docker network only |
| SSH | `ssh root@45.76.138.109` | 22 | Public (with key) |

## Security Configuration

### CORS Settings

Odoo is configured to allow requests from:
- `https://seitechinternational.org.uk`
- `https://www.seitechinternational.org.uk`

### Environment Variables

All sensitive credentials are stored in `/opt/seitech/.env`:
- Database password
- Admin password
- Server credentials

**⚠️ Never commit `.env.production` to git!**

## Maintenance

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
tail -f /var/log/nginx/odoo-error.log
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

### Update Code

```bash
# From local machine
cd /home/rodrickmakore/projects/seitech
./scripts/deploy-vultr.sh
```

## Troubleshooting

### Odoo Not Starting

1. Check logs: `docker logs seitech-odoo`
2. Check PostgreSQL: `docker logs seitech-postgres`
3. Verify environment: `docker exec seitech-odoo env | grep DB_`

### SSL Certificate Issues

1. Verify DNS: `dig api.seitechinternational.org.uk`
2. Check Nginx config: `nginx -t`
3. Renew certificate: `certbot renew`

### Connection Refused

1. Check firewall: `ufw status`
2. Check Docker: `docker ps`
3. Check Nginx: `systemctl status nginx`

## IP Addresses for DNS Configuration

### Primary A Record
```
api.seitechinternational.org.uk → 45.76.138.109
```

### Optional: Direct IP Access (for testing)
```
odoo.seitechinternational.org.uk → 45.76.138.109
```

## Production Checklist

- [x] Docker and Docker Compose installed
- [x] Nginx configured as reverse proxy
- [x] SSL certificate installed
- [x] Firewall configured (UFW)
- [x] Environment variables set
- [x] Database initialized
- [x] Odoo modules installed
- [x] CORS configured for frontend domain
- [x] Logs configured
- [x] Backup strategy in place
- [x] Monitoring set up (optional)

## Support

For issues:
1. Check logs first
2. Verify DNS propagation
3. Test SSL certificate
4. Check firewall rules
5. Review Docker container status

