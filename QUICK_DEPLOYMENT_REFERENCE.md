# 🚀 Quick Deployment Reference Card

## 📍 Server Information

| Item | Value |
|------|-------|
| **Server IP** | `45.76.138.109` |
| **SSH User** | `root` |
| **SSH Command** | `ssh root@45.76.138.109` |
| **Deployment Dir** | `/opt/seitech` |

## 🌐 DNS Configuration

### Required A Record
```
Type: A
Name: api
Value: 45.76.138.109
TTL: 3600
```

**Result**: `api.seitechinternational.org.uk` → `45.76.138.109`

## 🔗 Access URLs

### Before DNS Setup
- **Odoo Web UI**: `http://45.76.138.109:8069`
- **Nginx Proxy**: `http://45.76.138.109`

### After DNS Setup
- **API Endpoint**: `https://api.seitechinternational.org.uk`
- **Odoo Web UI**: `https://api.seitechinternational.org.uk`

## 🔐 Credentials

| Service | Username | Password |
|---------|----------|----------|
| **Odoo Admin** | `admin` | `6,wDD*iQCG6+4A?H` |
| **PostgreSQL** | `odoo` | `6,wDD*iQCG6+4A?H` |
| **Server SSH** | `root` | `6,wDD*iQCG6+4A?H` |

## 🚀 Deployment Commands

### 1. Deploy to Server
```bash
cd /home/rodrickmakore/projects/seitech
./scripts/deploy-vultr.sh
```

### 2. Set Up SSL (After DNS)
```bash
ssh root@45.76.138.109
cd /opt/seitech
./scripts/setup-ssl.sh
```

### 3. Check Status
```bash
ssh root@45.76.138.109
cd /opt/seitech
docker ps
docker logs seitech-odoo
```

## 🔒 Firewall Ports

| Port | Service | Access |
|------|---------|--------|
| 22 | SSH | ✅ Public |
| 80 | HTTP | ✅ Public |
| 443 | HTTPS | ✅ Public |
| 8069 | Odoo | ❌ Localhost only |
| 5432 | PostgreSQL | ❌ Docker network only |

## 📦 Services

- **PostgreSQL**: `seitech-postgres` container
- **Odoo**: `seitech-odoo` container
- **Nginx**: System service (reverse proxy)
- **UFW**: Firewall

## 🔧 Frontend Configuration (Vercel)

```env
NEXT_PUBLIC_ODOO_URL=https://api.seitechinternational.org.uk
NEXT_PUBLIC_API_URL=https://api.seitechinternational.org.uk
```

## ✅ Post-Deployment Checklist

1. [ ] Run `./scripts/deploy-vultr.sh`
2. [ ] Configure DNS A record
3. [ ] Wait for DNS propagation (5-15 min)
4. [ ] Run `./scripts/setup-ssl.sh`
5. [ ] Install Odoo modules via web UI
6. [ ] Update Vercel environment variables
7. [ ] Test API connectivity

## 🧪 Quick Tests

```bash
# Test Odoo health
curl http://45.76.138.109:8069/web/health

# Test API endpoint
curl -X POST http://45.76.138.109:8069/api/chat/support \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com"}'

# Test DNS (after setup)
dig api.seitechinternational.org.uk
```

## 📞 Support Commands

```bash
# View logs
docker logs seitech-odoo -f
docker logs seitech-postgres -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Backup database
docker exec seitech-postgres pg_dump -U odoo seitech > backup.sql
```

---

**🎯 Ready?** Run: `./scripts/deploy-vultr.sh`

