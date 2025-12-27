# Odoo 19 Enterprise Upgrade & Frontend Alignment Plan

## Executive Summary

**Current State:**
- ✅ Odoo 19.0 Community Edition running on Vultr (Docker)
- ✅ Custom e-learning module with comprehensive APIs
- ✅ Models and controllers already implemented
- ✅ Authentication system in place

**Goal:**
- Upgrade to Odoo 19.0 Enterprise Edition
- Ensure full alignment with Vercel frontend (Next.js)
- Complete API implementation and testing
- Deploy by January 5 for landing page launch

**Timeline:** 5-7 days to Enterprise upgrade + alignment

---

## Phase 1: Pre-Upgrade Audit & Backup (Day 1)

### 1.1 Current Setup Verification

**File Locations:**
```
├── docker-compose.prod.yml    ✅ Production config exists
├── Dockerfile                  ✅ Custom Dockerfile
├── custom_addons/
│   ├── seitech_base/          ✅ Base module
│   ├── seitech_cms/           ✅ CMS module
│   ├── seitech_elearning/     ✅ Main e-learning module (26+ models)
│   └── seitech_website_theme/ ✅ Website theming
├── config/                     📦 Need to verify
└── scripts/                    📦 Need to verify
```

### 1.2 Current API Status

**Implemented Controllers:**
```
✅ /api/auth/login           (auth_api.py:57)
✅ /api/auth/logout          (auth_api.py:180)
✅ /api/auth/me              (auth_api.py:200)
✅ /api/auth/register        (auth_api.py:274)
✅ /api/courses              (course_api.py:63)
✅ /api/courses/{id}         (course_api.py:?)
⚠️ /api/courses/{id}/content (need to verify)
⚠️ /api/enrollments          (enrollment.py)
⚠️ /api/certificates         (certificate.py)
⚠️ /api/dashboard/stats      (need to verify)
⚠️ /api/admin/users          (admin_api.py)
⚠️ /api/admin/courses        (admin_api.py)
```

### 1.3 Database Backup

**Actions:**
```bash
# 1. Backup current database
docker exec seitech-postgres pg_dump -U odoo seitech > /backup/seitech_$(date +%Y%m%d).sql

# 2. Backup volumes
docker volume inspect seitech_postgres_data
docker volume inspect seitech_odoo_data

# 3. Backup custom addons
tar -czf /backup/custom_addons_$(date +%Y%m%d).tar.gz /home/rodrickmakore/projects/seitech/custom_addons/

# 4. Document current users
curl http://odoo.seitechinternational.org.uk/api/auth/me
```

### 1.4 Current Odoo Status Check

```bash
# SSH to Vultr instance
ssh root@<vultr-ip>

# Check current version
curl http://localhost:8069/web/health

# Check installed modules
docker logs seitech-odoo | tail -100

# Verify custom modules are installed
curl http://localhost:8069/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin"}'
```

---

## Phase 2: Enterprise License & Setup (Day 1-2)

### 2.1 Obtain Enterprise License

**Steps:**
1. Contact Odoo Sales or use existing Seitech enterprise license
2. Get license file or subscription key
3. Verify license includes:
   - Odoo 19.0 Enterprise
   - All apps needed (Website, Sales, eLearning, Surveys, etc.)
   - Technical support

### 2.2 Prepare Enterprise Docker Image

**Update Dockerfile:**
```dockerfile
# Current: FROM odoo:19.0
# New: Build from Enterprise source (if available)

# Option A: Use Odoo Inc official enterprise image (if subscribed)
FROM odoo:19.0-enterprise

# Option B: Build from source with enterprise addons
FROM odoo:19.0

# Add enterprise addons volume
# Mount enterprise directory with proper permissions
```

### 2.3 Docker Compose Updates

**File:** `docker-compose.prod.yml`

Changes needed:
```yaml
services:
  odoo:
    # Specify enterprise image or custom build
    image: odoo:19.0-enterprise  # OR build custom

    volumes:
      # Existing
      - ./odoo:/opt/odoo/odoo:ro
      - ./custom_addons:/opt/odoo/custom_addons
      - odoo_data:/opt/odoo/data
      - odoo_logs:/opt/odoo/logs

      # Enterprise (if separate)
      - ./enterprise:/opt/odoo/enterprise:ro

      # License (if needed)
      - ./licenses:/opt/odoo/licenses:ro

    environment:
      # Add enterprise-specific vars if needed
      - ODOO_ENTERPRISE=1
```

### 2.4 Environment Variables (.env)

**Add to production .env:**
```bash
# Odoo Enterprise
ODOO_VERSION=19.0
ODOO_ENTERPRISE=true
ODOO_LICENSE_FILE=/opt/odoo/licenses/license.txt

# Security
ADMIN_PASSWORD=<strong-password>
ENCRYPTION_KEY=<random-key>

# Frontend
NEXT_PUBLIC_ODOO_URL=https://odoo.seitechinternational.org.uk
FRONTEND_URL=https://www.seitechinternational.org.uk

# Database
DB_HOST=postgres
DB_USER=odoo
DB_PASSWORD=<strong-password>
DB_NAME=seitech_enterprise

# Performance
WORKERS=6
MAX_CRON_THREADS=3
```

---

## Phase 3: Upgrade Process (Day 2-3)

### 3.1 Pre-Upgrade Database Preparation

```sql
-- Connect to current database
docker exec -it seitech-postgres psql -U odoo -d seitech -c "
-- Check for any pending migrations
SELECT name, state FROM ir_module_module
WHERE state = 'to upgrade'
ORDER BY name;

-- Get current module versions
SELECT name, latest_version, installed_version
FROM ir_module_module
WHERE state = 'installed'
ORDER BY name;
"
```

### 3.2 Upgrade Steps

**Step 1: Stop Current Services**
```bash
ssh root@<vultr-ip>
cd /root/seitech
docker-compose -f docker-compose.prod.yml down

# Keep database and volumes
# docker-compose -f docker-compose.prod.yml down --remove-orphans
```

**Step 2: Create Fresh Database for Enterprise**
```bash
# Option A: Upgrade existing database
# Option B: Fresh install (faster, recommended for enterprise)

# Create new database
docker-compose -f docker-compose.prod.yml up postgres -d
# Wait for postgres to be ready
sleep 30

# Create empty database
docker exec seitech-postgres createdb -U odoo seitech_enterprise
```

**Step 3: Update Docker Image**
```bash
# Update docker-compose.prod.yml to use enterprise image
nano docker-compose.prod.yml

# Update Dockerfile if using custom build
nano Dockerfile

# Build new image
docker-compose -f docker-compose.prod.yml build odoo

# Pull/build takes 10-15 minutes
```

**Step 4: Migrate Data (if upgrading existing database)**
```bash
# This step is complex - may need Odoo backup/restore tools
# Or use upgrade service
```

**Step 5: Start Enterprise Services**
```bash
docker-compose -f docker-compose.prod.yml up odoo postgres -d

# Monitor logs
docker logs -f seitech-odoo

# Wait for initialization (3-5 minutes)
```

**Step 6: Activate License**
```bash
# Access Odoo web interface
curl http://localhost:8069/web
# OR
ssh -L 8069:localhost:8069 root@<vultr-ip>
# Then navigate to http://localhost:8069

# Go to Settings > Activate License
# Enter Odoo enterprise license
# Restart services
docker restart seitech-odoo
```

**Step 7: Install Enterprise Apps (if needed)**
```bash
# Via Odoo UI: Apps > Search > Install additional apps
# OR Via command line:
docker exec seitech-odoo odoo --addons-path=/opt/odoo/custom_addons,/opt/odoo/enterprise \
  -i account,crm,project \
  --database=seitech_enterprise
```

### 3.3 Verify Upgrade Success

```bash
# Check Odoo version
curl http://localhost:8069/api/about -H "Accept: application/json"

# Test API endpoints
curl http://localhost:8069/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@seitech.co.zw","password":"admin"}'

# Check modules
curl http://localhost:8069/web/health
```

---

## Phase 4: Custom Module Updates (Day 3-4)

### 4.1 Module Compatibility Check

**Verify all custom modules work with Odoo 19 Enterprise:**

```
seitech_base:
  ✅ Should work - base dependencies OK

seitech_elearning:
  ⚠️ Check website_slides compatibility
  ⚠️ Check survey compatibility
  ⚠️ Check payment compatibility (enterprise feature)

seitech_cms:
  ⚠️ Check if needed or use enterprise CMS

seitech_website_theme:
  ✅ Should work - theme only
```

### 4.2 Update Manifest Files

**File:** `custom_addons/seitech_elearning/__manifest__.py`

Update if needed:
```python
{
    'version': '19.0.1.0.0',  # ✅ Already correct
    'depends': [
        'seitech_base',
        'seitech_website_theme',
        'website_slides',  # ✅ Enterprise compatible
        'survey',         # ✅ Enterprise compatible
        'website_sale',   # ✅ Enterprise compatible
        'payment',        # ✅ Enterprise feature
        'rating',         # ✅ Enterprise compatible
        'calendar',       # ✅ Enterprise compatible
    ],
}
```

### 4.3 Database Migration for Custom Models

**Ensure all fields exist in Enterprise:**

```bash
docker exec seitech-odoo odoo --database=seitech_enterprise \
  --addons-path=/opt/odoo/custom_addons,/opt/odoo/enterprise \
  -i seitech_base,seitech_elearning \
  --update=seitech_base,seitech_elearning
```

### 4.4 Run Database Updates

```bash
# Update all installed modules
docker exec seitech-odoo odoo --database=seitech_enterprise \
  --addons-path=/opt/odoo/custom_addons,/opt/odoo/enterprise \
  -u all
```

---

## Phase 5: API Implementation Complete (Day 4-5)

### 5.1 Verify All Required APIs Exist

**Auth APIs** ✅ Complete
```
✅ POST /api/auth/login
✅ POST /api/auth/logout
✅ GET /api/auth/me
✅ POST /api/auth/register
```

**Course APIs** - Need verification
```
✅ GET /api/courses (list)
⚠️ POST /api/courses (create - needs permission check)
⚠️ GET /api/courses/{id} (detail)
⚠️ PUT /api/courses/{id} (update)
⚠️ DELETE /api/courses/{id} (delete)
⚠️ GET /api/courses/search (search)
```

**Enrollment APIs** - Implement if missing
```
⚠️ GET /api/enrollments (list user enrollments)
⚠️ POST /api/enrollments (create enrollment)
⚠️ PUT /api/enrollments/{id} (update progress)
⚠️ DELETE /api/enrollments/{id} (unenroll)
```

**Certificate APIs** - Implement if missing
```
⚠️ GET /api/certificates (list user certificates)
⚠️ POST /api/certificates (generate/issue)
⚠️ GET /api/certificates/{id}/download (download)
⚠️ GET /api/certificates/verify (verify certificate)
```

**Dashboard APIs** - Implement if missing
```
⚠️ GET /api/dashboard/stats (user statistics)
⚠️ GET /api/admin/analytics/overview (admin analytics)
```

**Admin APIs** - Implement if missing
```
⚠️ GET /api/admin/users
⚠️ POST /api/admin/users
⚠️ PUT /api/admin/users/{id}
⚠️ DELETE /api/admin/users/{id}
⚠️ GET /api/admin/courses
⚠️ POST /api/admin/courses
```

### 5.2 Create Missing API Endpoints

**File:** `custom_addons/seitech_elearning/controllers/enrollment.py`

```python
@http.route('/api/enrollments', type='http', auth='user', methods=['GET', 'POST'], csrf=False, cors='*')
def enrollments(self, **kwargs):
    """GET: List user enrollments, POST: Create new enrollment"""
    if request.httprequest.method == 'GET':
        # Return user's enrollments
        pass
    elif request.httprequest.method == 'POST':
        # Create new enrollment
        pass
```

**File:** `custom_addons/seitech_elearning/controllers/dashboard.py`

```python
@http.route('/api/dashboard/stats', type='http', auth='user', methods=['GET'], csrf=False, cors='*')
def dashboard_stats(self, **kwargs):
    """Get user dashboard statistics"""
    # Return stats: courses, certificates, points, streaks, etc.
    pass
```

### 5.3 CORS Configuration

**Ensure CORS is properly set for Vercel frontend:**

```python
# In each controller:
def _json_response(self, data, status=200):
    return request.make_response(
        json.dumps(data),
        headers=[
            ('Content-Type', 'application/json'),
            ('Access-Control-Allow-Origin', 'https://www.seitechinternational.org.uk'),  # Production
            ('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'),
            ('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token'),
            ('Access-Control-Allow-Credentials', 'true'),
            ('Access-Control-Max-Age', '3600'),
        ],
        status=status
    )
```

**OR Configure in Odoo settings:**
```
Settings > Technical > HTTP Headers
Add CORS configuration for Vercel domain
```

### 5.4 API Documentation

Create Swagger/OpenAPI documentation:

**File:** `custom_addons/seitech_elearning/static/api-docs.yaml`

```yaml
openapi: 3.0.0
info:
  title: SEI Tech E-Learning API
  version: 19.0.0
servers:
  - url: https://odoo.seitechinternational.org.uk
paths:
  /api/auth/login:
    post:
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: Login successful
  # ... more endpoints
```

---

## Phase 6: Testing & Validation (Day 5-6)

### 6.1 API Testing

**Test with Postman/cURL:**

```bash
# 1. Test authentication
curl -X POST https://odoo.seitechinternational.org.uk/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@seitech.co.zw","password":"admin"}' \
  -v

# Expected: 200 OK with sessionToken

# 2. Test get current user
curl https://odoo.seitechinternational.org.uk/api/auth/me \
  -H "Cookie: session_id=..." \
  -v

# 3. Test courses list
curl https://odoo.seitechinternational.org.uk/api/courses \
  -v

# 4. Test with frontend
curl https://www.seitechinternational.org.uk/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### 6.2 Frontend Integration Testing

**Test each endpoint from Vercel frontend:**

```typescript
// In frontend test
const testOdooAPI = async () => {
  // 1. Test login
  const loginRes = await fetch('https://odoo.seitechinternational.org.uk/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@seitech.co.zw', password: 'admin' }),
    credentials: 'include',
  });

  console.log('Login:', await loginRes.json());

  // 2. Test courses
  const coursesRes = await fetch('https://odoo.seitechinternational.org.uk/api/courses');
  console.log('Courses:', await coursesRes.json());

  // 3. Test get current user
  const meRes = await fetch('https://odoo.seitechinternational.org.uk/api/auth/me', {
    credentials: 'include',
  });
  console.log('Current User:', await meRes.json());
};
```

### 6.3 Performance Testing

```bash
# Load test API endpoints
ab -n 1000 -c 10 https://odoo.seitechinternational.org.uk/api/courses

# Test response times
time curl https://odoo.seitechinternational.org.uk/api/courses
```

### 6.4 Security Testing

- [ ] Test XSS protection
- [ ] Test CSRF prevention
- [ ] Test SQL injection prevention
- [ ] Test authentication bypass
- [ ] Test authorization (user can't access admin API)
- [ ] Test rate limiting

---

## Phase 7: Deployment & Go-Live (Day 6-7)

### 7.1 Final Production Configuration

**Update production environment variables:**

```bash
# SSH to Vultr
ssh root@<vultr-ip>
cd /root/seitech
nano .env

# Add/update:
NEXT_PUBLIC_ODOO_URL=https://odoo.seitechinternational.org.uk
ODOO_DATABASE=seitech_enterprise
ODOO_ADMIN_USER=admin@seitech.co.zw
ADMIN_PASSWORD=<strong-password>
```

### 7.2 Nginx Configuration

**Ensure Nginx is configured for both:**
- Odoo: odoo.seitechinternational.org.uk (port 8069)
- Frontend: www.seitechinternational.org.uk (Vercel)

**File:** `/etc/nginx/sites-available/seitech`

```nginx
upstream odoo {
    server localhost:8069;
}

server {
    server_name odoo.seitechinternational.org.uk;
    listen 443 ssl http2;

    ssl_certificate /etc/letsencrypt/live/odoo.seitechinternational.org.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/odoo.seitechinternational.org.uk/privkey.pem;

    location / {
        proxy_pass http://odoo;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend is on Vercel - just DNS alias
```

### 7.3 DNS Configuration

```
odoo.seitechinternational.org.uk  → <vultr-ip>  (A record)
www.seitechinternational.org.uk   → vercel.app (CNAME)
```

### 7.4 Health Check & Monitoring

**Set up monitoring:**

```bash
# Odoo health check
curl -f https://odoo.seitechinternational.org.uk/web/health || alert

# API endpoint check
curl -f https://odoo.seitechinternational.org.uk/api/courses || alert

# Frontend health check
curl -f https://www.seitechinternational.org.uk/ || alert
```

### 7.5 Rollback Plan

If issues occur:

```bash
# 1. Stop current services
docker-compose -f docker-compose.prod.yml down

# 2. Restore from backup
docker volume rm seitech_postgres_data
docker volume create seitech_postgres_data
cat /backup/seitech_YYYYMMDD.sql | docker exec -i seitech-postgres psql -U odoo

# 3. Restart with previous image
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify services
curl http://localhost:8069/web/health
```

---

## Checklist Before Jan 5 Launch

### Week 1: Upgrade
- [ ] Backup current database and volumes
- [ ] Obtain Odoo Enterprise license
- [ ] Update Docker image to Enterprise
- [ ] Stop current services
- [ ] Start Enterprise Odoo
- [ ] Activate license
- [ ] Verify all custom modules install
- [ ] Test basic Odoo functionality

### Week 2: API Integration
- [ ] Verify all auth APIs work
- [ ] Verify all course APIs work
- [ ] Implement missing enrollment APIs
- [ ] Implement missing certificate APIs
- [ ] Implement dashboard stats API
- [ ] Implement admin APIs
- [ ] Test CORS configuration
- [ ] Test all endpoints from frontend

### Week 3: Testing & Deployment
- [ ] Unit tests for API endpoints
- [ ] Integration tests (Frontend ↔ Odoo)
- [ ] Performance testing
- [ ] Security testing
- [ ] Update production .env
- [ ] Configure Nginx for both domains
- [ ] Deploy to Vercel frontend
- [ ] Deploy to Vultr Odoo
- [ ] Verify landing page loads correctly
- [ ] Test user registration and login
- [ ] Monitor logs and health checks

---

## Critical Success Factors

1. **Authentication** - Must work perfectly between Vercel frontend and Odoo
2. **CORS** - Frontend must be able to call Odoo APIs
3. **Data Consistency** - User data must sync properly
4. **Performance** - APIs must respond quickly
5. **Security** - All endpoints must validate permissions
6. **Uptime** - Services must be stable for business

---

## Support & Troubleshooting

### Common Issues

**Issue: "Odoo configuration missing"**
- Solution: Set NEXT_PUBLIC_ODOO_URL environment variable

**Issue: CORS errors**
- Solution: Update CORS headers in each API controller
- Add Access-Control headers to Nginx

**Issue: Authentication fails**
- Solution: Check Odoo user exists and password is correct
- Verify session_id is being set properly

**Issue: Slow API responses**
- Solution: Add indexes to frequently queried fields
- Increase Odoo workers: WORKERS=8
- Enable caching for courses

### Debugging

```bash
# View Odoo logs
docker logs -f seitech-odoo

# Connect to database
docker exec -it seitech-postgres psql -U odoo -d seitech_enterprise

# Check running services
docker ps

# View nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

---

## Timeline Summary

| Date | Activity | Status |
|------|----------|--------|
| **Jan 1** | Backup & Audit | 🔴 TODO |
| **Jan 2** | Enterprise Setup | 🔴 TODO |
| **Jan 3** | Upgrade Process | 🔴 TODO |
| **Jan 4** | Module Updates & APIs | 🔴 TODO |
| **Jan 5** | Testing & Go-Live | 🔴 TODO |
| **Jan 6-7** | Buffer for issues | 🔴 TODO |

---

**Document Version:** 1.0
**Last Updated:** 2025-12-27
**Owner:** Development Team
