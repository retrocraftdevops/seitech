# 🚀 Run Odoo Enterprise Upgrade on Vultr NOW

**Status:** ✅ Ready to Execute
**SSH:** ✅ Key-based authentication configured
**Script:** ✅ Uploaded to Vultr instance
**Time:** 30-40 minutes

---

## ⚡ Quick Start (Copy-Paste Ready)

### Get Your Enterprise License (5 min)

Before running upgrade, get these from https://www.odoo.com/my/licenses:

```
Your License Key: _____________________________
Your DB UUID: _____________________________
```

### Execute Upgrade (30-40 min)

**Copy and paste these commands:**

```bash
# Step 1: Connect to Vultr
ssh -i ~/.ssh/vultr_seitech root@45.76.138.109

# Once connected, you'll see: root@vultr:~#

# Step 2: Navigate to project
cd /root/seitech

# Step 3: Set your Enterprise license (paste your actual keys)
export ODOO_ENTERPRISE_LICENSE_KEY="your_actual_license_key_here"
export ODOO_ENTERPRISE_DB_UUID="your_actual_db_uuid_here"
export ODOO_DB_PASSWORD="6,wDD*iQCG6+4A?H"

# Step 4: Run the upgrade
bash VULTR_ENTERPRISE_UPGRADE.sh

# Wait for completion (30-40 minutes)
# The script will show: ✓ Upgrade completed successfully!
```

That's it! The script handles everything automatically.

---

## 📋 What You Need

Have ready:
- ✅ Odoo Enterprise License Key (from https://www.odoo.com/my/licenses)
- ✅ DB UUID from license portal
- ✅ 30-40 minutes available
- ✅ Terminal/SSH client open

---

## 🎯 Complete Walkthrough

### Step 1: Open Terminal

On your local machine, open a terminal/command prompt.

### Step 2: Connect to Vultr with SSH Key

```bash
ssh -i ~/.ssh/vultr_seitech root@45.76.138.109
```

**Expected output:**
```
Welcome to Vultr...
root@vultr:~#
```

### Step 3: Navigate to Seitech Project

```bash
cd /root/seitech
```

**Expected output:**
```
root@vultr:/root/seitech#
```

### Step 4: Verify Script is There

```bash
ls -la VULTR_ENTERPRISE_UPGRADE.sh
```

**Expected output:**
```
-rw------- 1 root root 18K Dec 27 14:26 VULTR_ENTERPRISE_UPGRADE.sh
```

### Step 5: Set Environment Variables

```bash
# Get your license from: https://www.odoo.com/my/licenses
# Replace the values below with your actual keys

export ODOO_ENTERPRISE_LICENSE_KEY="your_license_key_from_odoo_portal"
export ODOO_ENTERPRISE_DB_UUID="your_db_uuid_from_odoo_portal"
export ODOO_DB_PASSWORD="6,wDD*iQCG6+4A?H"

# Verify they're set
echo $ODOO_ENTERPRISE_LICENSE_KEY
# Should display: your_license_key_from_odoo_portal (first 20 chars at least)
```

### Step 6: Start the Upgrade

```bash
bash VULTR_ENTERPRISE_UPGRADE.sh
```

**The script will now run through these phases:**

```
================================
SEI Tech Odoo Enterprise Upgrade
Starting Upgrade...
================================

>>> PHASE 0: Checking Prerequisites
✓ Docker installed
✓ Docker daemon running
✓ Odoo container exists
✓ Enterprise license key provided

>>> PHASE 1: Backup & Verification
ℹ Testing database connectivity...
✓ Database accessible
ℹ Backing up PostgreSQL database (this may take 3-5 minutes)...
[Progress...]
✓ Database backup created: 2.1GB
✓ Backup compressed: 2.1GB
✓ PostgreSQL volume backed up
✓ Odoo data volume backed up
✓ Custom addons backed up

>>> PHASE 2: Enterprise Preparation
ℹ Creating .env.enterprise configuration...
✓ .env.enterprise created
ℹ Creating docker-compose.enterprise.yml...
✓ docker-compose.enterprise.yml created

>>> PHASE 3: Executing Enterprise Upgrade
ℹ Stopping Odoo container...
✓ Odoo container confirmed stopped
ℹ Switching to enterprise docker-compose...
ℹ Pulling Enterprise Odoo image (this may take 2-5 minutes)...
✓ Enterprise image pulled
ℹ Starting Odoo upgrade (this may take 10-15 minutes)...
ℹ Waiting for Odoo to be ready... (0/120s)
ℹ Waiting for Odoo to be ready... (20/120s)
✓ Enterprise Odoo is ready!

>>> PHASE 4: API Testing & Validation
ℹ Testing /api/auth/login...
✓ Auth API working
ℹ Testing /api/courses...
✓ Courses API working
✓ No errors in recent logs

>>> PHASE 5: System Verification
ℹ Verifying database...
✓ Database has X courses
✓ Found X custom addon folders

================================
UPGRADE COMPLETE ✓
================================

=== UPGRADE SUMMARY ===
Timestamp: 20251227_142200
Log file: /root/odoo_upgrade_20251227_142200.log

Backups Created:
  - Database: /backups/seitech_full_20251227_142200.sql.gz
  - PostgreSQL volume: /root/odoo_upgrade_backup/postgres_data_volume_*.tar.gz
  - Odoo data: /root/odoo_upgrade_backup/odoo_data_volume_*.tar.gz
  - Custom addons: /root/odoo_upgrade_backup/custom_addons_*.tar.gz

✓ Upgrade completed successfully!
```

### Step 7: After Upgrade - Verify Everything

While still SSH'd into Vultr, run these quick tests:

```bash
# Test 1: Check Odoo is running
docker ps | grep seitech-odoo

# Expected: seitech-odoo (Up)

# Test 2: Check health
curl http://localhost:8069/web/health

# Expected: {"status": "ok"}

# Test 3: Test login API
curl -X POST http://localhost:8069/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@seitechinternational.org.uk","password":"admin"}'

# Expected: user object with sessionToken

# Test 4: Exit SSH
exit
```

### Step 8: Verify Frontend Connection (From Your Local Machine)

```bash
# In your web browser:
# Go to: https://seitech-frontend.vercel.app/login
# Enter:
#   Email: admin@seitechinternational.org.uk
#   Password: admin
# Expected: Redirect to /dashboard with real user info
```

---

## 📊 Timeline

| Activity | Time | Status |
|----------|------|--------|
| Get license | 5 min | ⏳ Do first |
| SSH and setup | 2 min | Quick |
| Run upgrade script | 30-40 min | Main step |
| Verify results | 5 min | Final check |
| **Total** | **42-52 min** | **Complete** |

---

## 🔑 SSH Configuration

Your SSH setup is complete:

```bash
# You can connect with either:

# Option 1 (Using SSH config):
ssh vultr-seitech

# Option 2 (Using IP):
ssh -i ~/.ssh/vultr_seitech root@45.76.138.109

# Both work the same way
```

**SSH Key Files:**
- Private key: `~/.ssh/vultr_seitech`
- Public key: `~/.ssh/vultr_seitech.pub`
- Config: `~/.ssh/config`

---

## 🆘 If Upgrade Fails

### Check Logs

```bash
# While SSH'd to Vultr:
docker-compose logs odoo | tail -50
```

### Verify Database is OK

```bash
docker exec seitech-postgres psql -U odoo -d seitech_production -c "SELECT 1;"
```

### Rollback to Community (If Needed)

```bash
cd /root/seitech
cp docker-compose.community-backup.yml docker-compose.yml
docker-compose up -d odoo
```

### Check Full Log File

```bash
ls -la /root/odoo_upgrade_*.log
cat /root/odoo_upgrade_*.log | tail -100
```

---

## ✅ Success Indicators

After upgrade completes, you should see:

✅ All Phase labels completed
✅ No "error" or "failed" messages
✅ "✓ Upgrade completed successfully!" message
✅ Backup files created (check /backups/ and /root/odoo_upgrade_backup/)
✅ Odoo container running (docker ps shows it as "Up")
✅ Health check returns {"status": "ok"}
✅ Login API returns user object with sessionToken
✅ Courses API returns real courses
✅ Frontend can connect and login

---

## 📞 Support Commands

If you need to monitor during or after upgrade:

```bash
# SSH to Vultr
ssh -i ~/.ssh/vultr_seitech root@45.76.138.109

# Watch logs in real-time
docker-compose logs -f odoo

# Check specific phase
docker-compose logs odoo | grep "PHASE"

# Count errors
docker-compose logs odoo | grep -i "error" | wc -l

# View backup files
ls -lah /backups/
ls -lah /root/odoo_upgrade_backup/

# Check disk usage
df -h /

# Exit SSH
exit
```

---

## 🎯 Your Enterprise License

Before you start, visit: **https://www.odoo.com/my/licenses**

1. Log in with your Odoo account
2. Find Odoo 19 Enterprise license
3. Copy the **License Key**
4. Copy the **DB UUID**
5. Paste into the environment variables in Step 5 above

---

## 📝 Quick Reference

**Your Vultr Instance:**
- IP: `45.76.138.109`
- SSH User: `root`
- SSH Key: `~/.ssh/vultr_seitech`
- Database: `seitech_production`
- Project Dir: `/root/seitech`

**Upgrade Script:**
- Location: `/root/seitech/VULTR_ENTERPRISE_UPGRADE.sh`
- Duration: 30-40 minutes
- Backups: Automatic
- Rollback: Available

---

## ✨ What Happens Next

After successful upgrade:

1. **Odoo Enterprise is running** on your Vultr instance
2. **All data is intact** - database backed up and upgraded
3. **Custom modules loaded** - seitech_elearning and dependencies working
4. **APIs responding** - all endpoints tested
5. **Frontend can connect** - real Odoo data flowing to Vercel

Then:

1. Update frontend environment: `NEXT_PUBLIC_ENABLE_DEMO_MODE=false`
2. Remove demo data fallbacks from frontend routes
3. Test end-to-end: login → dashboard → courses → enrollment
4. Monitor system for 24 hours
5. Deploy to production

---

## 🚀 Ready?

**Next step:**

1. Get your Enterprise license from https://www.odoo.com/my/licenses
2. Run the commands above
3. Watch it complete in 30-40 minutes
4. Verify results
5. Celebrate! 🎉

**Command to start:**

```bash
ssh -i ~/.ssh/vultr_seitech root@45.76.138.109
cd /root/seitech
export ODOO_ENTERPRISE_LICENSE_KEY="your_key"
export ODOO_ENTERPRISE_DB_UUID="your_uuid"
export ODOO_DB_PASSWORD="6,wDD*iQCG6+4A?H"
bash VULTR_ENTERPRISE_UPGRADE.sh
```

Good luck! 🚀
