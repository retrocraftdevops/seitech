# DNS Configuration Guide

## 🌐 Required DNS Records

### Primary API Endpoint

**A Record** (Required):
```
Type: A
Name: api
Value: 45.76.138.109
TTL: 3600
Priority: N/A
```

**Result**: `api.seitechinternational.org.uk` → `45.76.138.109`

This is the **primary endpoint** that your Vercel frontend should use.

---

## 📍 All IP Addresses and Endpoints

### Server IP
- **Primary IP**: `45.76.138.109`
- **Purpose**: Main server hosting Odoo backend
- **Access**: SSH, HTTP, HTTPS

### API Endpoints

#### Production (After DNS Setup)
- **HTTPS API**: `https://api.seitechinternational.org.uk`
- **HTTP API**: `http://api.seitechinternational.org.uk` (redirects to HTTPS)
- **Port**: `443` (HTTPS) / `80` (HTTP)

#### Direct IP Access (Before DNS / Testing)
- **Direct HTTP**: `http://45.76.138.109:8069`
- **Direct HTTPS**: `https://45.76.138.109` (if SSL configured)
- **Port**: `8069` (Odoo) / `443` (Nginx)

### Internal Services (Not Publicly Accessible)

- **PostgreSQL**: `localhost:5432` (Docker network only)
- **Odoo Direct**: `localhost:8069` (via Nginx only)
- **Longpolling**: `localhost:8072` (via Nginx only)

---

## 🔧 Frontend Configuration (Vercel)

### Environment Variables

Update your Vercel project with:

```env
# Production API URL
NEXT_PUBLIC_ODOO_URL=https://api.seitechinternational.org.uk
NEXT_PUBLIC_API_URL=https://api.seitechinternational.org.uk

# WebSocket/Longpolling (if needed)
NEXT_PUBLIC_WS_URL=wss://api.seitechinternational.org.uk
```

### CORS Configuration

Odoo backend is configured to accept requests from:
- `https://seitechinternational.org.uk`
- `https://www.seitechinternational.org.uk`

Make sure your Vercel domain matches one of these.

---

## 📋 DNS Provider Setup

### Example: Cloudflare

1. Login to Cloudflare
2. Select domain: `seitechinternational.org.uk`
3. Go to **DNS** → **Records**
4. Click **Add record**
5. Configure:
   - **Type**: A
   - **Name**: `api`
   - **IPv4 address**: `45.76.138.109`
   - **Proxy status**: DNS only (gray cloud) - **Important for SSL**
   - **TTL**: Auto (or 3600)
6. Click **Save**

### Example: Namecheap

1. Login to Namecheap
2. Go to **Domain List** → Select domain
3. Click **Advanced DNS**
4. Under **Host Records**, click **Add New Record**
5. Configure:
   - **Type**: A Record
   - **Host**: `api`
   - **Value**: `45.76.138.109`
   - **TTL**: Automatic (or 3600)
6. Click **Save**

### Example: GoDaddy

1. Login to GoDaddy
2. Go to **My Products** → **DNS**
3. Under **Records**, click **Add**
4. Configure:
   - **Type**: A
   - **Name**: `api`
   - **Value**: `45.76.138.109`
   - **TTL**: 1 Hour (3600)
5. Click **Save**

---

## ⏱️ DNS Propagation

- **Typical Time**: 5-15 minutes
- **Maximum Time**: Up to 48 hours (rare)
- **Check Status**: Use `dig` or online tools

### Verify DNS Propagation

```bash
# Check DNS record
dig api.seitechinternational.org.uk

# Or use nslookup
nslookup api.seitechinternational.org.uk

# Online tools
# https://dnschecker.org
# https://www.whatsmydns.net
```

Expected result:
```
api.seitechinternational.org.uk. 3600 IN A 45.76.138.109
```

---

## 🔒 SSL Certificate Setup

**Important**: SSL certificates can only be issued **after** DNS is configured and propagated.

### After DNS Propagation

1. SSH to server:
   ```bash
   ssh root@45.76.138.109
   ```

2. Run SSL setup:
   ```bash
   cd /opt/seitech
   ./scripts/setup-ssl.sh
   ```

3. Or manually:
   ```bash
   certbot --nginx -d api.seitechinternational.org.uk \
     --non-interactive \
     --agree-tos \
     --email admin@seitechinternational.org.uk \
     --redirect
   ```

### Verify SSL

```bash
# Check certificate
curl -I https://api.seitechinternational.org.uk

# Test SSL
openssl s_client -connect api.seitechinternational.org.uk:443 -servername api.seitechinternational.org.uk
```

---

## 🧪 Testing Endpoints

### Before DNS Setup

```bash
# Test direct IP access
curl http://45.76.138.109:8069/web/health

# Test API endpoint
curl -X POST http://45.76.138.109:8069/api/chat/support \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com"}'
```

### After DNS Setup

```bash
# Test HTTPS endpoint
curl https://api.seitechinternational.org.uk/web/health

# Test API endpoint
curl -X POST https://api.seitechinternational.org.uk/api/chat/support \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com"}'
```

---

## 📊 Port Summary

| Port | Service | Access | Notes |
|------|---------|--------|-------|
| 22 | SSH | Public | Secure shell access |
| 80 | HTTP | Public | Redirects to HTTPS |
| 443 | HTTPS | Public | Main API endpoint |
| 8069 | Odoo | Localhost only | Behind Nginx |
| 8072 | Longpolling | Localhost only | Behind Nginx |
| 5432 | PostgreSQL | Docker network | Internal only |

---

## ✅ Checklist

- [ ] DNS A record added: `api` → `45.76.138.109`
- [ ] DNS propagation verified (5-15 minutes)
- [ ] SSL certificate installed
- [ ] Frontend environment variables updated
- [ ] API endpoint tested
- [ ] CORS configuration verified

---

## 🚨 Troubleshooting

### DNS Not Resolving

1. **Check DNS record**: Verify A record is correct
2. **Wait for propagation**: Can take up to 48 hours
3. **Clear DNS cache**: 
   ```bash
   # macOS/Linux
   sudo dscacheutil -flushcache
   
   # Windows
   ipconfig /flushdns
   ```

### SSL Certificate Fails

1. **Verify DNS**: Ensure DNS is fully propagated
2. **Check firewall**: Port 80 must be open
3. **Check Nginx**: `nginx -t` to verify config
4. **Manual test**: `certbot certonly --standalone -d api.seitechinternational.org.uk`

### Connection Refused

1. **Check firewall**: `ufw status`
2. **Check Docker**: `docker ps`
3. **Check Nginx**: `systemctl status nginx`
4. **Check logs**: `docker logs seitech-odoo`

---

## 📞 Quick Reference

**Server IP**: `45.76.138.109`  
**API Domain**: `api.seitechinternational.org.uk`  
**SSH**: `ssh root@45.76.138.109`  
**Deployment**: `./scripts/deploy-vultr.sh`  
**SSL Setup**: `./scripts/setup-ssl.sh`

---

**Ready to configure DNS?** Add the A record and wait for propagation!

