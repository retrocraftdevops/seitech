# Odoo Enterprise Upgrade - Vultr Instance

**Status:** Ready to Execute
**Target:** Complete upgrade to Enterprise Edition
**Backup:** Automatic (included in script)

---

## 🚀 Quick Start (3 Steps)

### Step 1: Get Enterprise License Key

Before starting, you need your Odoo Enterprise license key:

1. Go to: https://www.odoo.com/my/licenses
2. Log in to your Odoo account
3. Copy your **License Key** (long alphanumeric string)
4. Copy your **DB UUID**

Have these ready before running the script.

---

### Step 2: SSH to Your Vultr Instance

```bash
ssh root@odoo.seitechinternational.org.uk
```

Or if using IP:
```bash
ssh root@YOUR_VULTR_IP
```

---

### Step 3: Run the Upgrade Script

**Option A: With License Key (Recommended)**

```bash
cd /root/seitech

# Set your license key (replace with your actual key)
export ODOO_ENTERPRISE_LICENSE_KEY="your_actual_license_key_here"
export ODOO_ENTERPRISE_DB_UUID="your_db_uuid_here"
export ODOO_DB_PASSWORD="your_db_password"

# Run the upgrade
bash VULTR_ENTERPRISE_UPGRADE.sh
```

**Option B: Interactive (Script Will Prompt)**

```bash
cd /root/seitech
bash VULTR_ENTERPRISE_UPGRADE.sh
# Script will ask you to enter license key and password
```

---

## ⏱️ What the Script Does (Automatically)

**Phase 1: Backup & Verification** (5-10 min)
- ✓ Verifies Docker and containers
- ✓ Checks disk space
- ✓ Backs up database (2.3GB)
- ✓ Backs up all volumes
- ✓ Verifies backups

**Phase 2: Enterprise Preparation** (1-2 min)
- ✓ Creates .env.enterprise with your license
- ✓ Creates docker-compose.enterprise.yml
- ✓ Loads environment variables

**Phase 3: Upgrade** (10-15 min)
- ✓ Stops Odoo gracefully
- ✓ Pulls Enterprise image
- ✓ Starts upgrade process
- ✓ Waits for completion

**Phase 4: API Testing** (2 min)
- ✓ Tests /api/auth/login
- ✓ Tests /api/courses
- ✓ Tests /api/dashboard/stats
- ✓ Checks for errors

**Phase 5: Verification** (1 min)
- ✓ Verifies database
- ✓ Checks custom modules
- ✓ Verifies CORS
- ✓ Runs health checks

**Phase 6: Summary** (1 min)
- ✓ Shows completion status
- ✓ Lists backups created
- ✓ Next steps

**Total Time:** ~30-40 minutes

---

## 📋 Before You Run

Make sure you have:

- [ ] SSH access to Vultr instance
- [ ] Enterprise license key (from https://www.odoo.com/my/licenses)
- [ ] DB UUID from license portal
- [ ] PostgreSQL password for Odoo user
- [ ] 30+ GB free disk space on Vultr
- [ ] Time available (30-40 minutes without interruption)

---

## 📝 Full Command (Copy-Paste Ready)

Here's the complete sequence you can copy and paste:

```bash
# 1. Connect to Vultr
ssh root@odoo.seitechinternational.org.uk

# 2. Navigate to project
cd /root/seitech

# 3. Set your license (replace with your actual values)
export ODOO_ENTERPRISE_LICENSE_KEY="your_license_key_here"
export ODOO_ENTERPRISE_DB_UUID="your_db_uuid_here"
export ODOO_DB_PASSWORD="your_postgres_password"

# 4. Run the upgrade
bash VULTR_ENTERPRISE_UPGRADE.sh

# The script will:
# - Back up everything automatically
# - Upgrade to Enterprise
# - Test all APIs
# - Show results
```

**That's it!** The script handles everything else.

---

## 🔍 Monitoring the Upgrade

While the script runs, you'll see:

```
✓ Docker installed
✓ Docker daemon running
✓ Odoo container exists
ℹ Testing database connectivity...
✓ Database accessible
✓ Database size: 2.3GB
ℹ Backing up PostgreSQL database...
✓ Database backup created: 2.1GB
✓ Backup compressed: 2.1GB
✓ Backup integrity verified

[... more progress ...]

ℹ Pulling Enterprise Odoo image...
✓ Enterprise image pulled
ℹ Starting Odoo upgrade (this may take 10-15 minutes)...
ℹ Waiting for Odoo to be ready... (0/120s)
ℹ Waiting for Odoo to be ready... (20/120s)
ℹ Waiting for Odoo to be ready... (40/120s)
✓ Enterprise Odoo is ready!

[... more verification ...]

✓ Upgrade completed successfully!
```

Just watch the progress and **don't interrupt** the process.

---

## ✅ What Happens After

Once the script completes:

1. **Backups are created:**
   ```bash
   ls -lah /backups/
   ls -lah /root/odoo_upgrade_backup/
   ```

2. **Odoo is running in Enterprise mode:**
   ```bash
   docker ps | grep odoo
   # Should show: seitech-odoo (Up)
   ```

3. **Environment file is saved:**
   ```bash
   cat /root/seitech/.env.enterprise
   # Shows your configuration
   ```

4. **Logs are available:**
   ```bash
   docker-compose logs -f odoo
   # Watch real-time logs
   ```

---

## 🧪 Verify the Upgrade Worked

### Test 1: Check Odoo is Running

```bash
docker ps | grep seitech-odoo
# Should show: seitech-odoo (Up)
```

### Test 2: Check Health

```bash
curl http://localhost:8069/web/health
# Should return: {"status": "ok"}
```

### Test 3: Test Login API

```bash
curl -X POST http://localhost:8069/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@seitechinternational.org.uk","password":"admin"}'

# Should return user object with sessionToken
```

### Test 4: Test Courses

```bash
curl http://localhost:8069/api/courses?limit=2
# Should return real courses from Odoo
```

### Test 5: Check Frontend Can Connect

```bash
# From your browser or another machine:
# Go to: https://seitech-frontend.vercel.app/login
# Enter: admin@seitechinternational.org.uk / admin
# Expected: Redirect to dashboard with user info
```

---

## 🚨 If Something Goes Wrong

### Odoo won't start after upgrade

```bash
# Check logs
docker-compose logs odoo | tail -50

# If license issue:
# 1. Verify license key in .env.enterprise
# 2. Restart: docker-compose restart odoo

# If database issue:
# 1. Check database: docker exec postgres psql -U odoo -d seitech_production -c "SELECT 1;"
# 2. If problem persists, rollback (see below)
```

### Rollback to Community (If Needed)

```bash
cd /root/seitech

# Stop Enterprise
docker-compose stop seitech-odoo

# Restore community compose
cp docker-compose.community-backup.yml docker-compose.yml

# Restart
docker-compose up -d odoo
```

### Restore from Backup (If Needed)

```bash
# Find your backup
ls -lah /root/odoo_upgrade_backup/

# Stop Odoo
docker-compose down odoo

# Restore database (CAREFUL - this overwrites!)
gunzip -c /backups/seitech_full_TIMESTAMP.sql.gz | \
  docker exec -i seitech-postgres psql -U odoo -d seitech_production

# Restart
docker-compose up -d odoo
```

---

## 📊 Environment Variables Saved

The script creates `.env.enterprise` with:

```bash
ODOO_DB_PASSWORD=your_password
ODOO_ENTERPRISE_LICENSE_KEY=your_license_key
ODOO_ENTERPRISE_DB_UUID=your_db_uuid
ODOO_WORKERS=8
ODOO_MAX_CRON_THREADS=2
NEXT_PUBLIC_ODOO_URL=https://odoo.seitechinternational.org.uk
ODOO_DATABASE=seitech_production
ODOO_ADMIN_USER=admin
```

This file is:
- ✓ Created automatically
- ✓ Set to secure permissions (chmod 600)
- ✓ **NOT** committed to git (.gitignore)
- ✓ Safe for secrets

---

## 📝 Log File

The script saves a detailed log:

```bash
# Find the log
ls -lah /root/odoo_upgrade_*.log

# View the log
cat /root/odoo_upgrade_20251227_143022.log

# Monitor in real-time
tail -f /root/odoo_upgrade_*.log
```

---

## 🔑 Important Reminders

⚠️ **Before Starting:**
- Have your Enterprise license key ready
- Have PostgreSQL password ready
- Ensure 30GB+ free disk space
- Backup your data (script does this automatically)

⚠️ **During Upgrade:**
- Don't interrupt the script
- Don't stop Docker containers
- Let it run to completion (30-40 minutes)

⚠️ **After Upgrade:**
- Keep backup files safe
- Store license key securely (.env.enterprise is gitignored)
- Monitor logs for 24 hours
- Test all critical features

---

## 🎯 Next Steps After Upgrade

Once upgrade completes successfully:

1. **Verify frontend connection:**
   ```bash
   # Go to: https://seitech-frontend.vercel.app/login
   # Try logging in with admin credentials
   ```

2. **Check dashboard shows real data:**
   - Should show real enrollment count (not demo)
   - Should show real certificates
   - Should show real streak data

3. **Update frontend env (if needed):**
   - In Vercel dashboard
   - Set: `NEXT_PUBLIC_ENABLE_DEMO_MODE=false`
   - Trigger redeploy

4. **Monitor system:**
   ```bash
   # Watch logs
   docker-compose logs -f odoo

   # Check errors
   docker-compose logs odoo | grep -i error
   ```

5. **Remove demo data fallbacks:**
   - Frontend still has demo mode fallbacks for development
   - For production, these should be removed
   - See QUICK_INTEGRATION_GUIDE.md for details

---

## ✨ Summary

**The easy way:**

```bash
# 1. SSH to Vultr
ssh root@odoo.seitechinternational.org.uk

# 2. Go to project
cd /root/seitech

# 3. Export your license
export ODOO_ENTERPRISE_LICENSE_KEY="your_key"
export ODOO_ENTERPRISE_DB_UUID="your_uuid"
export ODOO_DB_PASSWORD="your_password"

# 4. Run upgrade
bash VULTR_ENTERPRISE_UPGRADE.sh

# That's it! The script handles everything.
```

---

## 📞 Support

If you have issues:

1. **Check logs:**
   ```bash
   docker-compose logs odoo | tail -50
   ```

2. **Check database:**
   ```bash
   docker exec seitech-postgres psql -U odoo -d seitech_production -c "SELECT 1;"
   ```

3. **Verify license:**
   ```bash
   grep ODOO_ENTERPRISE /root/seitech/.env.enterprise
   ```

4. **Rollback if needed:**
   ```bash
   cd /root/seitech
   cp docker-compose.community-backup.yml docker-compose.yml
   docker-compose up -d odoo
   ```

---

**Status:** Ready to Execute
**Next Action:** Gather your license key and run the script
**Estimated Time:** 30-40 minutes
**Expected Result:** Odoo Enterprise running on Vultr with real data

Good luck! 🚀
