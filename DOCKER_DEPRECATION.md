# Docker Deprecation Notice

## Status: Docker is NOT used in Vultr Production

**As of 2025-12-27**, Seitech Odoo on Vultr has moved away from Docker containerization.

### Current Vultr Setup
- **Direct Odoo Installation** on Vultr server
- **Git Sparse Checkout** for code deployment
- **Systemd Service** for process management
- **Native PostgreSQL** installation

### Why We Moved Away from Docker
1. **Resource Efficiency**: Direct installation uses fewer resources
2. **Simpler Deployment**: No container overhead
3. **Better Performance**: Native database access
4. **Easier Debugging**: Direct log access and system integration
5. **Reduced Complexity**: Fewer moving parts

---

## Docker Files in Repository

The following Docker-related files are kept **for local development only**:
- `docker-compose.yml` - Local dev environment
- `docker-compose.dev.yml` - Development setup
- `docker-compose.official.yml` - Testing Odoo official image
- `docker-compose.prod.yml` - (DEPRECATED - See below)
- `Dockerfile` - (DEPRECATED - See below)

### Important
**These Docker files should NOT be used for Vultr production deployments.**

---

## Production Deployment

For Vultr production deployment, use:
- **Setup**: `vultr-setup.sh` - One-time server setup
- **Deploy**: `deploy-to-vultr.sh` - Push updates to production
- **Guide**: `VULTR_DEPLOYMENT.md` - Complete deployment documentation

See `VULTR_DEPLOYMENT.md` for detailed instructions.

---

## If You Need to Use Docker Locally

Docker is still supported for local development:

```bash
# Local development with Docker
docker-compose -f docker-compose.yml up -d

# Official Odoo image testing
docker-compose -f docker-compose.official.yml up -d
```

---

## Migration Notes

If you were previously using Docker on Vultr and want to migrate:

1. **Backup your database**:
   ```bash
   pg_dump -U odoo seitech > backup_$(date +%Y%m%d).sql
   ```

2. **Stop Docker containers**:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

3. **Run Vultr setup**:
   ```bash
   bash vultr-setup.sh
   ```

4. **Restore database and data** as needed

---

## Questions?

For deployment issues, refer to:
- `VULTR_DEPLOYMENT.md` - Deployment guide
- `/var/log/odoo/odoo.log` - Application logs
- `/var/log/odoo/deployments.log` - Deployment history
