# Odoo Enterprise Upgrade - Execution Guide

**Status:** Ready for Implementation
**Timeline:** 7 days (Dec 27, 2025 - Jan 2, 2026)
**Target:** Jan 5, 2026 Landing Page Deadline
**Environment:** Vultr VPS with Docker Compose

---

## Pre-Flight Checklist

Before starting, verify you have:
- [ ] SSH access to Vultr instance
- [ ] Odoo Enterprise license (purchased/allocated)
- [ ] 50GB+ free disk space on Vultr instance
- [ ] Database backup location configured
- [ ] Slack/email notification setup for monitoring

---

## Phase 1: Pre-Upgrade Verification (Day 1 - Dec 27)

### Step 1.1: Connect to Vultr Instance

```bash
# Connect via SSH (replace with your IP/domain)
ssh root@odoo.seitechinternational.org.uk

# Or if using key-based auth
ssh -i ~/.ssh/vultr_key root@<VULTR_IP>

# Verify SSH connection successful
echo "✓ SSH Connection Successful"
```

### Step 1.2: Check Current Odoo Version

```bash
# Navigate to docker directory
cd /root/seitech || cd /home/seitech || pwd

# Check docker-compose.yml location
ls -la docker-compose*.yml

# Get current Odoo version from running container
docker exec seitech-odoo /bin/bash -c "python3 -c \"import odoo; print(f'Current Odoo Version: {odoo.__version__}')\""

# Expected output: Current Odoo Version: 19.0.x.x
```

### Step 1.3: Verify Database and Volumes

```bash
# Check PostgreSQL connectivity
docker exec seitech-postgres psql -U odoo -d seitech_production -c "SELECT version();"

# List existing backups
ls -lah /backups/ 2>/dev/null || mkdir -p /backups

# Check disk space
df -h

# Check Docker volumes
docker volume ls | grep seitech

# Expected:
# - postgres_data volume exists
# - odoo_data volume exists
# - 50GB+ free space
```

### Step 1.4: Document Current State

```bash
# Create backup directory
mkdir -p /root/odoo_upgrade_backup

# Get current docker-compose configuration
docker-compose config > /root/odoo_upgrade_backup/docker-compose-current.yml

# Get current environment
docker inspect seitech-odoo --format='{{json .Config.Env}}' | python3 -m json.tool > /root/odoo_upgrade_backup/odoo-env-current.txt

# List installed custom addons
docker exec seitech-odoo find /mnt/custom_addons -name "__manifest__.py" -exec grep -l "name" {} \; | wc -l

# Expected custom modules: 18+ (seitech_elearning and dependencies)
```

### Step 1.5: Check Current API Endpoints

```bash
# Test auth API
curl -X POST http://localhost:8069/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@seitechinternational.org.uk","password":"admin"}' \
  2>/dev/null | python3 -m json.tool

# Expected response: user object with session token
# Status code: 200 (success) or fallback message

# Test courses API
curl http://localhost:8069/api/courses?limit=1 2>/dev/null | python3 -m json.tool

# Expected: course list with real Odoo data
```

---

## Phase 2: Database & Configuration Backup (Day 1 - Dec 27)

### Step 2.1: Full Database Backup

```bash
# Create timestamped backup
BACKUP_FILE="/backups/seitech_full_$(date +%Y%m%d_%H%M%S).sql"
mkdir -p /backups

# Backup entire database
docker exec seitech-postgres pg_dump \
  -U odoo \
  -h localhost \
  -d seitech_production \
  --verbose \
  > "$BACKUP_FILE" 2>&1

# Verify backup
ls -lah "$BACKUP_FILE"
head -20 "$BACKUP_FILE"

# Expected: Backup should be 100MB+ (includes all data and schemas)
```

### Step 2.2: Backup PostgreSQL Configuration

```bash
# Backup postgres_data volume
docker run --rm \
  -v postgres_data:/postgres_data \
  -v /root/odoo_upgrade_backup:/backup \
  ubuntu bash -c "tar czf /backup/postgres_data_volume_$(date +%Y%m%d).tar.gz -C / postgres_data"

# Verify backup created
ls -lah /root/odoo_upgrade_backup/postgres_data_volume*.tar.gz
```

### Step 2.3: Backup Odoo Data & Configuration

```bash
# Backup odoo_data volume (contains sessions, attachments, etc.)
docker run --rm \
  -v odoo_data:/odoo_data \
  -v /root/odoo_upgrade_backup:/backup \
  ubuntu bash -c "tar czf /backup/odoo_data_volume_$(date +%Y%m%d).tar.gz -C / odoo_data"

# Backup custom addons
docker run --rm \
  -v custom_addons:/custom_addons \
  -v /root/odoo_upgrade_backup:/backup \
  ubuntu bash -c "tar czf /backup/custom_addons_$(date +%Y%m%d).tar.gz -C / custom_addons"

# Backup odoo config
docker exec seitech-odoo tar czf - /etc/odoo/odoo.conf | gzip > /root/odoo_upgrade_backup/odoo_conf_$(date +%Y%m%d).tar.gz

# List all backups
echo "=== Full Backup Status ==="
ls -lah /root/odoo_upgrade_backup/
du -sh /root/odoo_upgrade_backup/
du -sh /backups/

# Expected: Total backup size 2GB+
```

### Step 2.4: Snapshot Current Custom Addon Status

```bash
# List all installed and custom modules
docker exec seitech-odoo bash -c "python3 -c \"
import json
import os
os.chdir('/mnt/extra-addons')
addons = {}
for addon in os.listdir('.'):
    manifest_path = f'{addon}/__manifest__.py'
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path) as f:
                manifest = eval(f.read())
                addons[addon] = {
                    'version': manifest.get('version'),
                    'depends': manifest.get('depends', []),
                    'installable': manifest.get('installable', True)
                }
        except:
            pass
print(json.dumps(addons, indent=2))
\"" > /root/odoo_upgrade_backup/installed_addons_status.json

# Review addon dependencies
echo "=== Custom Addon Dependencies ==="
cat /root/odoo_upgrade_backup/installed_addons_status.json | python3 -m json.tool
```

---

## Phase 3: Enterprise Preparation (Day 2 - Dec 28)

### Step 3.1: Prepare Enterprise License

Before proceeding, you must have:

```bash
# Create file to store license info (DO NOT commit to git)
cat > /root/odoo_enterprise_license.txt <<EOF
ODOO_ENTERPRISE_LICENSE_KEY=<YOUR_ENTERPRISE_LICENSE_KEY>
ODOO_ENTERPRISE_DB_UUID=<YOUR_DB_UUID_FROM_ODOO_PORTAL>
ODOO_ENTERPRISE_PURCHASE_DATE=<PURCHASE_DATE>
EOF

# Verify file created (should be readable only by root)
ls -la /root/odoo_enterprise_license.txt
chmod 600 /root/odoo_enterprise_license.txt
```

### Step 3.2: Download Enterprise Edition

```bash
# Create enterprise build context
mkdir -p /root/odoo_enterprise

# Option A: If you have enterprise tarball
# Upload enterprise-19.0.tar.gz to server (via sftp or direct download)
# Then extract:
# tar xzf enterprise-19.0.tar.gz -C /root/odoo_enterprise

# Option B: Use Odoo Docker official enterprise image
# Update docker-compose to use enterprise image

cd /root/seitech
cat > docker-compose.enterprise.yml <<'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: seitech-postgres
    environment:
      POSTGRES_DB: seitech_production
      POSTGRES_USER: odoo
      POSTGRES_PASSWORD: ${ODOO_DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding UTF8 --lc-collate C --lc-ctype C"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    networks:
      - seitech-network
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "odoo"]
      interval: 10s
      timeout: 5s
      retries: 5

  odoo:
    # CHANGE: Enterprise image instead of community
    image: odoo:19.0  # Official Odoo Enterprise image
    container_name: seitech-odoo
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      HOST: postgres
      PORT: 5432
      USER: odoo
      PASSWORD: ${ODOO_DB_PASSWORD}
      DB_FILTER: seitech_production
      ODOO_RC: /etc/odoo/odoo.conf
      # Enterprise specific
      ODOO_ENTERPRISE_LICENSE_KEY: ${ODOO_ENTERPRISE_LICENSE_KEY}
      ODOO_ENTERPRISE_DB_UUID: ${ODOO_ENTERPRISE_DB_UUID}
    volumes:
      - ./custom_addons:/mnt/extra-addons
      - odoo_data:/var/lib/odoo
      - ./config/odoo.conf:/etc/odoo/odoo.conf
      - ./logs:/var/log/odoo
    ports:
      - "8069:8069"
      - "8072:8072"
    networks:
      - seitech-network
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8069/web/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  odoo_data:

networks:
  seitech-network:
    driver: bridge
EOF

# Display the new compose file
echo "=== Enterprise Docker Compose Created ==="
cat docker-compose.enterprise.yml
```

### Step 3.3: Update Environment Variables

```bash
# Create .env.enterprise with required variables
cat > /root/seitech/.env.enterprise <<'EOF'
# Database
ODOO_DB_PASSWORD=your_secure_password_here

# Enterprise License (from Odoo portal)
ODOO_ENTERPRISE_LICENSE_KEY=your_license_key_here
ODOO_ENTERPRISE_DB_UUID=your_db_uuid_here

# Odoo Configuration
ODOO_WORKERS=8
ODOO_MAX_CRON_THREADS=2
ODOO_LOG_LEVEL=info

# Frontend Integration
NEXT_PUBLIC_ODOO_URL=https://odoo.seitechinternational.org.uk
ODOO_DATABASE=seitech_production
ODOO_ADMIN_USER=admin

# Session & Security
SESSION_TIMEOUT=1800000
ENABLE_ODOO_LOGGING=true
EOF

# Make environment file secure
chmod 600 /root/seitech/.env.enterprise

echo "=== Environment File Created ==="
echo "⚠️  IMPORTANT: Update ODOO_ENTERPRISE_LICENSE_KEY in .env.enterprise"
echo "⚠️  Get this from: https://www.odoo.com/my/licenses"
```

---

## Phase 4: Upgrade Execution (Day 2-3 - Dec 28-29)

### Step 4.1: Stop Current Odoo Service

```bash
cd /root/seitech

# Gracefully stop Odoo (allows in-progress requests to complete)
docker-compose stop seitech-odoo --time=30

# Verify it's stopped
docker ps | grep seitech-odoo

# Expected: No seitech-odoo container running
```

### Step 4.2: Switch to Enterprise Compose File

```bash
# Backup current compose
cp docker-compose.yml docker-compose.community-backup.yml

# Use enterprise compose
cp docker-compose.enterprise.yml docker-compose.yml

# Load enterprise environment
export $(cat .env.enterprise | xargs)

# Verify compose file references correct image
grep -i "image:" docker-compose.yml
```

### Step 4.3: Pull Enterprise Image and Start

```bash
cd /root/seitech

# Pull the new enterprise image
docker-compose pull odoo

# Show what image will be used
echo "=== Image to be deployed ==="
docker-compose images

# Start Odoo with enterprise image
docker-compose up -d odoo

# Monitor startup (will take 2-5 minutes for upgrade)
echo "=== Odoo Startup Log ==="
docker-compose logs -f odoo --tail=50

# Wait for Odoo to be ready (look for "HTTP workers spawned")
# Press Ctrl+C once you see successful startup
```

### Step 4.4: Verify Enterprise Installation

```bash
# Check Odoo is running
docker ps | grep seitech-odoo

# Check database was automatically upgraded
docker exec seitech-postgres psql -U odoo -d seitech_production -c \
  "SELECT key, value FROM ir_config_parameter WHERE key IN ('web.base.url', 'base.module_installed') LIMIT 5;"

# Verify enterprise license was registered
curl -s http://localhost:8069/web/health | python3 -m json.tool

# Expected: { "status": "ok", ... }
```

### Step 4.5: Verify Custom Addons Compatibility

```bash
# Get list of active modules
docker exec seitech-odoo bash -c "
python3 << 'PYTHON'
import json
from pathlib import Path

# List active custom modules
addons_dir = Path('/mnt/extra-addons')
active_modules = []

for addon_dir in addons_dir.iterdir():
    if addon_dir.is_dir():
        manifest = addon_dir / '__manifest__.py'
        if manifest.exists():
            try:
                with open(manifest) as f:
                    data = eval(f.read())
                    if data.get('installable', True):
                        active_modules.append({
                            'name': addon_dir.name,
                            'version': data.get('version'),
                            'depends': data.get('depends', [])
                        })
            except Exception as e:
                print(f'Error loading {addon_dir.name}: {e}')

print(json.dumps(active_modules, indent=2))
PYTHON
"

# Check for any module load errors
docker exec seitech-odoo cat /var/log/odoo/odoo.log | grep -i "error\|warning" | tail -20
```

---

## Phase 5: API Validation (Day 3 - Dec 29)

### Step 5.1: Test Core Authentication APIs

```bash
#!/bin/bash
# Save as: /root/test_apis.sh

ODOO_URL="http://localhost:8069"
ADMIN_EMAIL="admin@seitechinternational.org.uk"
ADMIN_PASS="admin"

echo "=== Testing Odoo Enterprise APIs ==="

# Test 1: Login API
echo -e "\n1. Testing POST /api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$ODOO_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}")

echo "$LOGIN_RESPONSE" | python3 -m json.tool

# Extract session token for next tests
SESSION_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('sessionToken', ''))" 2>/dev/null)

if [ -z "$SESSION_TOKEN" ]; then
  echo "❌ ERROR: No session token returned"
  exit 1
fi

echo "✅ Session token: ${SESSION_TOKEN:0:20}..."

# Test 2: Get current user
echo -e "\n2. Testing GET /api/auth/me"
curl -s "$ODOO_URL/api/auth/me" \
  -H "Cookie: session_token=$SESSION_TOKEN" | python3 -m json.tool

# Test 3: List courses
echo -e "\n3. Testing GET /api/courses"
curl -s "$ODOO_URL/api/courses?limit=2" | python3 -m json.tool

# Test 4: Dashboard stats
echo -e "\n4. Testing GET /api/dashboard/stats"
curl -s "$ODOO_URL/api/dashboard/stats" \
  -H "Cookie: session_token=$SESSION_TOKEN" | python3 -m json.tool

# Test 5: Enrollments
echo -e "\n5. Testing GET /api/enrollments"
curl -s "$ODOO_URL/api/enrollments" \
  -H "Cookie: session_token=$SESSION_TOKEN" | python3 -m json.tool

echo -e "\n=== API Tests Complete ==="
```

Run the test script:

```bash
chmod +x /root/test_apis.sh
/root/test_apis.sh

# Expected output:
# - Login: returns user object with sessionToken
# - /me: returns current user with role
# - /courses: returns array of courses
# - /stats: returns dashboard statistics
# - /enrollments: returns user enrollments
```

### Step 5.2: Test Frontend Connection

```bash
# From Vercel frontend (or local terminal with curl)
FRONTEND_URL="https://seitech-frontend.vercel.app"  # Your Vercel URL
ODOO_URL="https://odoo.seitechinternational.org.uk"

# Test CORS headers from frontend domain
curl -s -X OPTIONS "$ODOO_URL/api/auth/login" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v 2>&1 | grep -i "access-control"

# Expected headers:
# Access-Control-Allow-Origin: https://seitech-frontend.vercel.app
# Access-Control-Allow-Methods: POST, OPTIONS
# Access-Control-Allow-Credentials: true
```

---

## Phase 6: Frontend Integration Testing (Day 4 - Dec 30)

### Step 6.1: Update Frontend Environment Variables

In your Vercel dashboard or `.env.production`:

```bash
NEXT_PUBLIC_ODOO_URL=https://odoo.seitechinternational.org.uk
ODOO_DATABASE=seitech_production
ODOO_ADMIN_USER=admin
ODOO_ADMIN_PASSWORD=<from-env>
NEXT_PUBLIC_ENABLE_DEMO_MODE=false
```

### Step 6.2: Test Login Flow

```bash
# 1. Navigate to https://seitech-frontend.vercel.app/login
# 2. Enter credentials:
#    Email: admin@seitechinternational.org.uk
#    Password: admin
# 3. Expected: Redirect to /dashboard with user info
# 4. Check browser console for any errors
# 5. Verify user menu shows admin name and role badge

# From terminal, verify API integration:
curl -s "https://seitech-frontend.vercel.app/api/auth/login" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@seitechinternational.org.uk","password":"admin"}'
```

### Step 6.3: Test Course Display

```bash
# Navigate to https://seitech-frontend.vercel.app/dashboard/my-courses
# Expected: Real courses from Odoo appear
# Each course should show:
# - Title
# - Description
# - Progress (if enrolled)
# - Instructor name
# - Enrollment status

# Verify API returns real data:
curl -s "https://seitech-frontend.vercel.app/api/courses?limit=5"
```

### Step 6.4: Test Dashboard Stats

```bash
# Navigate to https://seitech-frontend.vercel.app/dashboard
# Expected: Real statistics appear:
# - Courses enrolled: Real count (not hardcoded demo)
# - Certificates earned: Real count
# - Learning streak: Real data
# - Achievements: Real badges

# Verify API:
curl -s "https://seitech-frontend.vercel.app/api/dashboard/stats" \
  -H "Cookie: session_token=<your_session_token>"
```

---

## Phase 7: Post-Upgrade Tasks (Day 5 - Dec 31)

### Step 7.1: Update Custom Modules

```bash
# Review any modules that need updating for Enterprise
cd /root/seitech/custom_addons

# List modules that reference community-only features
grep -r "website_sale" . --include="*.py" 2>/dev/null || echo "No website_sale dependencies"
grep -r "website" . --include="__manifest__.py" 2>/dev/null | head -5

# Update seitech_elearning to ensure Enterprise compatibility
echo "=== Checking seitech_elearning compatibility ==="
cat seitech_elearning/__manifest__.py | grep -A5 "depends"
```

### Step 7.2: Enable Enterprise Features

```bash
# Activate enterprise modules that were previously unavailable
docker exec seitech-odoo odoo-bin shell -d seitech_production << 'PYTHON'
import odoo
env = odoo.api.Environment(cr, uid, {})

# List available modules
Module = env['ir.module.module']
enterprise_modules = Module.search([
    ('name', 'in', ['web', 'web_studio', 'web_diagram', 'web_grid']),
    ('state', '=', 'uninstalled')
])

print(f"Enterprise modules available: {[m.name for m in enterprise_modules]}")

# Note: Don't auto-install - let admin decide which to enable
PYTHON
```

### Step 7.3: Verify System Stability

```bash
#!/bin/bash

echo "=== System Stability Check ==="

# Check disk usage
echo "Disk Usage:"
df -h | grep -E "^Filesystem|/$"

# Check memory usage
echo -e "\nMemory Usage:"
free -h

# Check Odoo process health
echo -e "\nOdoo Process:"
docker stats --no-stream seitech-odoo --format "{{.CPUPerc}}\t{{.MemUsage}}"

# Check database connection pool
echo -e "\nDatabase Connections:"
docker exec seitech-postgres psql -U odoo -d seitech_production -c \
  "SELECT count(*) as active_connections FROM pg_stat_activity;"

# Check error logs in last hour
echo -e "\nRecent Errors (last 60 min):"
docker-compose logs odoo --since=1h | grep -i "error\|exception" | wc -l

# Expected:
# - CPU < 50%
# - Memory < 70%
# - Active connections < 20
# - Errors < 5
```

---

## Phase 8: Go-Live Preparation (Day 6-7 - Jan 1-2)

### Step 8.1: Final Backup Before Go-Live

```bash
# Create final backup snapshot
FINAL_BACKUP="/backups/seitech_pre_golive_$(date +%Y%m%d_%H%M%S).sql.gz"

docker exec seitech-postgres pg_dump \
  -U odoo \
  -d seitech_production | gzip > "$FINAL_BACKUP"

# Verify backup
ls -lah "$FINAL_BACKUP"
file "$FINAL_BACKUP"

# Test restore on backup (in case needed)
echo "Testing backup integrity..."
gunzip -t "$FINAL_BACKUP" && echo "✅ Backup integrity verified"
```

### Step 8.2: Performance Optimization

```bash
# Update PostgreSQL for production workload
docker exec seitech-postgres psql -U postgres <<EOF
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET effective_cache_size = '12GB';
ALTER SYSTEM SET maintenance_work_mem = '1GB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
EOF

# Restart PostgreSQL to apply settings
docker-compose restart postgres

echo "=== PostgreSQL Optimized for Production ==="
```

### Step 8.3: SSL Certificate Validation

```bash
# Verify SSL certificate is valid
curl -v https://odoo.seitechinternational.org.uk/web/health 2>&1 | grep -A5 "SSL"

# Check certificate expiry
openssl s_client -connect odoo.seitechinternational.org.uk:443 -showcerts </dev/null 2>/dev/null | \
  openssl x509 -noout -dates

# Expected: Not After date is well in the future
```

### Step 8.4: Enable Monitoring & Alerting

```bash
# Add health check endpoint to monitoring
# If you use Uptime Robot, DataDog, or similar:

# Critical endpoints to monitor:
MONITOR_ENDPOINTS=(
  "https://odoo.seitechinternational.org.uk/web/health"
  "https://odoo.seitechinternational.org.uk/api/auth/login"
  "https://odoo.seitechinternational.org.uk/api/courses"
)

for endpoint in "${MONITOR_ENDPOINTS[@]}"; do
  echo "Adding to monitoring: $endpoint"
done

# Example: Add to crontab for hourly health checks
cat >> /var/spool/cron/crontabs/root <<EOF
0 * * * * curl -s https://odoo.seitechinternational.org.uk/web/health || \
  echo "Odoo health check failed at \$(date)" | mail -s "Odoo Alert" admin@example.com
EOF
```

---

## Step 9: Go-Live Verification (Jan 5)

### 9.1: Landing Page Launch Checklist

Before 9 AM Jan 5, verify:

```bash
#!/bin/bash

echo "=== Jan 5 Go-Live Verification ==="

ODOO_URL="https://odoo.seitechinternational.org.uk"
FRONTEND_URL="https://seitech-frontend.vercel.app"

# 1. Odoo is accessible
echo "1. Odoo Accessibility:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" "$ODOO_URL/web/health"

# 2. Database is online
echo "2. Database Status:"
docker exec seitech-postgres psql -U odoo -d seitech_production -c "SELECT now();"

# 3. APIs responding
echo "3. API Status:"
for endpoint in "/api/auth/login" "/api/courses" "/api/dashboard/stats"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$ODOO_URL$endpoint")
  echo "  $endpoint: $status"
done

# 4. Frontend connectivity
echo "4. Frontend Connectivity:"
curl -s -o /dev/null -w "Frontend Status: %{http_code}\n" "$FRONTEND_URL"

# 5. No hardcoded demo data
echo "5. Demo Data Check:"
docker exec seitech-odoo grep -r "demo_" config/odoo.conf || echo "✅ No demo mode detected"

# 6. SSL certificates valid
echo "6. SSL Status:"
openssl s_client -connect odoo.seitechinternational.org.uk:443 -showcerts </dev/null 2>/dev/null | \
  openssl x509 -noout -dates | head -1

# 7. Disk space adequate
echo "7. Disk Space:"
df -h / | tail -1

echo ""
echo "=== All Checks Complete ==="
echo "Ready for landing page launch ✅"
```

Run final verification:

```bash
chmod +x /root/golive_check.sh
/root/golive_check.sh
```

---

## Rollback Plan (If Needed)

If issues arise, execute rollback:

```bash
#!/bin/bash

echo "!!! INITIATING ROLLBACK !!!"

cd /root/seitech

# 1. Stop Enterprise Odoo
docker-compose stop seitech-odoo

# 2. Restore community compose file
cp docker-compose.community-backup.yml docker-compose.yml

# 3. Restart with community image
docker-compose up -d odoo

# 4. If database issues, restore from backup
# (This is manual and requires careful execution)

echo "Rollback initiated. Check logs:"
docker-compose logs odoo --tail=50
```

---

## Troubleshooting

### Issue: Enterprise image fails to start

**Diagnosis:**
```bash
docker-compose logs odoo | tail -30
```

**Solutions:**
1. Verify license key is correct in environment
2. Check database password is set in .env
3. Ensure backup was successful before upgrade
4. Check available disk space (must be >20GB)

### Issue: Custom modules not loading

**Diagnosis:**
```bash
docker exec seitech-odoo python3 -c "
import importlib
import sys
sys.path.insert(0, '/mnt/extra-addons')
try:
    importlib.import_module('seitech_elearning')
    print('✅ seitech_elearning loads OK')
except Exception as e:
    print(f'❌ Error: {e}')
"
```

**Solutions:**
1. Check manifest.py syntax in each addon
2. Verify Python dependencies are installed
3. Check file permissions (should be readable by Odoo user)
4. Review /var/log/odoo/odoo.log for import errors

### Issue: Frontend still shows demo data

**Diagnosis:**
```bash
# Check if demo fallback is still enabled
curl -s https://seitech-frontend.vercel.app/api/dashboard/stats | grep -i "demo"
```

**Solutions:**
1. Verify `NEXT_PUBLIC_ENABLE_DEMO_MODE=false` in Vercel env vars
2. Check that API routes have removed demo data fallbacks
3. Rebuild and redeploy frontend

---

## Success Criteria

By Jan 5, 2026:

- ✅ Odoo Enterprise running on Vultr (version 19.0 Enterprise)
- ✅ All 5 custom modules compatible and active
- ✅ All critical APIs responding with real Odoo data
- ✅ Frontend login/dashboard showing real data (no demo fallbacks)
- ✅ SSL certificates valid and HTTPS enforced
- ✅ Zero hardcoded demo data in production
- ✅ Database backups automated and verified
- ✅ Monitoring and alerting active
- ✅ Landing page displays real courses from Odoo
- ✅ Signup/login flow functional with real Odoo backend

---

## Support & Escalation

**If upgrade fails:**
1. Check logs: `docker-compose logs odoo`
2. Verify backups are intact: `ls -lah /backups/`
3. Test database: `docker exec postgres psql -U odoo -d seitech_production -c "SELECT 1"`
4. Rollback procedure above

**Emergency contacts:**
- Odoo Support: https://www.odoo.com/help
- Vultr Support: Ticket in Vultr control panel
- Development Team: Internal Slack

---

**Created:** 2025-12-27
**Last Updated:** 2025-12-27
**Status:** Ready for Execution
