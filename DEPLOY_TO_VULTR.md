# Deploy Odoo Enterprise Upgrade to Vultr

**Your Vultr Instance Details:**
- IP: `45.76.138.109`
- SSH User: `root`
- DB Password: `6,wDD*iQCG6+4A?H`
- API Key: Available

**Status:** Ready to Deploy

---

## 🚀 Option 1: Quick Deploy (Recommended)

### Step 1: Copy Upgrade Script to Vultr

From your local machine:

```bash
# Copy the upgrade script to your Vultr instance
scp VULTR_ENTERPRISE_UPGRADE.sh root@45.76.138.109:/root/seitech/

# Or use this shortcut:
scp /path/to/VULTR_ENTERPRISE_UPGRADE.sh root@45.76.138.109:/root/seitech/
```

When prompted for password, use: `6,wDD*iQCG6+4A?H`

### Step 2: SSH to Vultr and Run Upgrade

```bash
# Connect to Vultr
ssh root@45.76.138.109

# When prompted for password, use: 6,wDD*iQCG6+4A?H

# Once connected, navigate to project
cd /root/seitech

# Set your Enterprise license (you need to have these from https://www.odoo.com/my/licenses)
export ODOO_ENTERPRISE_LICENSE_KEY="your_license_key_here"
export ODOO_ENTERPRISE_DB_UUID="your_db_uuid_here"
export ODOO_DB_PASSWORD="6,wDD*iQCG6+4A?H"

# Run the upgrade
bash VULTR_ENTERPRISE_UPGRADE.sh
```

**That's it!** The script will:
- Back up everything automatically
- Upgrade to Enterprise
- Test all APIs
- Show results

---

## 📋 Step-by-Step Instructions

### Step 1: Prepare Your Enterprise License

Before starting, get these from https://www.odoo.com/my/licenses:
- License Key (long alphanumeric string)
- DB UUID

Have these ready!

### Step 2: Open Terminal on Your Local Machine

```bash
# Make sure you have the upgrade script
ls -la VULTR_ENTERPRISE_UPGRADE.sh
# Should show the file exists
```

### Step 3: Copy Script to Vultr

```bash
# Copy the upgrade script
scp VULTR_ENTERPRISE_UPGRADE.sh root@45.76.138.109:/root/seitech/

# You'll see:
# The authenticity of host '45.76.138.109' can't be established...
# Type: yes

# Password prompt:
# root@45.76.138.109's password:
# Type: 6,wDD*iQCG6+4A?H
```

### Step 4: Connect to Your Vultr Instance

```bash
ssh root@45.76.138.109

# Password: 6,wDD*iQCG6+4A?H
```

You should now see:
```
root@vultr:~#
```

### Step 5: Navigate to Project and Set Credentials

```bash
cd /root/seitech

# Set your license key (replace with your actual key)
export ODOO_ENTERPRISE_LICENSE_KEY="your_actual_license_key"
export ODOO_ENTERPRISE_DB_UUID="your_actual_db_uuid"
export ODOO_DB_PASSWORD="6,wDD*iQCG6+4A?H"

# Verify environment is set
echo $ODOO_ENTERPRISE_LICENSE_KEY
# Should show your license key
```

### Step 6: Run the Upgrade Script

```bash
bash VULTR_ENTERPRISE_UPGRADE.sh
```

**Now just watch and wait!** The script will show progress like:

```
✓ Docker installed
✓ Docker daemon running
✓ Odoo container exists
ℹ Testing database connectivity...
✓ Database accessible
ℹ Backing up PostgreSQL database (this may take 3-5 minutes)...
✓ Database backup created: 2.1GB
✓ Backup compressed: 2.1GB
[... more progress ...]
✓ Upgrade completed successfully!
```

Total time: **30-40 minutes**

---

## 🔐 Security Notes

### Your Credentials Are:
- **Vultr IP:** 45.76.138.109
- **SSH User:** root
- **DB Password:** 6,wDD*iQCG6+4A?H
- **Vultr API Key:** Available in .env.production

### Safe Practices:
- ✅ Copy script via scp (encrypted)
- ✅ SSH connection is encrypted
- ✅ License key stored in .env.enterprise on server (not committed to git)
- ✅ Backups stored locally on server

---

## ✅ Complete Copy-Paste Commands

Here's everything you need in one place:

**On Your Local Machine:**

```bash
# Step 1: Navigate to project folder
cd /home/rodrickmakore/projects/seitech

# Step 2: Copy script to Vultr
scp VULTR_ENTERPRISE_UPGRADE.sh root@45.76.138.109:/root/seitech/
# Password: 6,wDD*iQCG6+4A?H

# Step 3: Connect to Vultr
ssh root@45.76.138.109
# Password: 6,wDD*iQCG6+4A?H
```

**On Vultr (after SSH):**

```bash
# Step 4: Navigate to project
cd /root/seitech

# Step 5: Set your Enterprise license (from https://www.odoo.com/my/licenses)
export ODOO_ENTERPRISE_LICENSE_KEY="your_license_key_here"
export ODOO_ENTERPRISE_DB_UUID="your_db_uuid_here"
export ODOO_DB_PASSWORD="6,wDD*iQCG6+4A?H"

# Step 6: Run upgrade
bash VULTR_ENTERPRISE_UPGRADE.sh

# ✓ Wait for completion (30-40 minutes)
```

---

## 📊 What the Script Does

**Phase 1: Backup** (5-10 min)
- Backs up 2.3GB database
- Backs up all Docker volumes
- Verifies backup integrity

**Phase 2: Preparation** (1-2 min)
- Creates .env.enterprise with your license
- Creates docker-compose.enterprise.yml
- Loads environment variables

**Phase 3: Upgrade** (10-15 min)
- Stops Odoo gracefully
- Pulls Enterprise image
- Starts upgrade
- Waits for completion

**Phase 4: API Testing** (2 min)
- Tests /api/auth/login
- Tests /api/courses
- Tests /api/dashboard/stats

**Phase 5: Verification** (1 min)
- Verifies database
- Checks custom modules
- Runs health checks

---

## 🧪 After Upgrade - Verification

Once the script finishes, verify everything worked:

**Still on Vultr (via SSH):**

```bash
# Test 1: Check Odoo is running
docker ps | grep seitech-odoo
# Should show: seitech-odoo (Up)

# Test 2: Check health
curl http://localhost:8069/web/health
# Should return: {"status": "ok"}

# Test 3: Test login API
curl -X POST http://localhost:8069/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@seitechinternational.org.uk","password":"admin"}'
# Should return user object with sessionToken

# Test 4: Check logs (no errors)
docker-compose logs odoo | grep -i error | wc -l
# Should be: 0 or minimal

# Exit SSH
exit
```

**From Your Local Machine:**

```bash
# Test 5: Verify frontend can connect
# Go to: https://seitech-frontend.vercel.app/login
# Enter: admin@seitechinternational.org.uk / admin
# Expected: Redirect to dashboard with real user info
```

---

## 🆘 Troubleshooting

### Can't connect via SSH?

```bash
# Verify IP is correct
ping 45.76.138.109

# Try with verbose output
ssh -vvv root@45.76.138.109

# If password auth isn't working, check:
# 1. Correct password: 6,wDD*iQCG6+4A?H
# 2. Correct IP: 45.76.138.109
# 3. Port 22 is open (should be by default)
```

### Script fails during upgrade?

```bash
# Check logs
docker-compose logs odoo | tail -50

# Check database
docker exec seitech-postgres psql -U odoo -d seitech_production -c "SELECT 1;"

# If need to rollback:
cd /root/seitech
cp docker-compose.community-backup.yml docker-compose.yml
docker-compose up -d odoo
```

### License key issues?

```bash
# Verify license is set
grep ODOO_ENTERPRISE /root/seitech/.env.enterprise

# Get license from: https://www.odoo.com/my/licenses
# Make sure you copied the correct key
```

---

## 📝 Log Files

The script saves detailed logs:

```bash
# Find the log
ls -lah /root/odoo_upgrade_*.log

# View specific log
cat /root/odoo_upgrade_20251227_143022.log

# Monitor in real-time (while script running)
tail -f /root/odoo_upgrade_*.log
```

---

## 🎯 Timeline

| Step | Time | Action |
|------|------|--------|
| 1 | 2 min | Copy script to Vultr |
| 2 | 2 min | SSH and set environment |
| 3 | 30-40 min | Run upgrade script |
| 4 | 5 min | Verify results |
| **Total** | **40-50 min** | Complete upgrade |

---

## ✨ Next Steps After Upgrade

Once upgrade is complete:

1. **Update frontend environment:**
   - Vercel dashboard
   - Set: `NEXT_PUBLIC_ENABLE_DEMO_MODE=false`
   - Redeploy frontend

2. **Test login flow:**
   - Go to: https://seitech-frontend.vercel.app/login
   - Use: admin@seitechinternational.org.uk / admin
   - Verify: Dashboard shows real Odoo data

3. **Monitor system:**
   ```bash
   ssh root@45.76.138.109
   docker-compose logs -f odoo
   # Watch for any errors
   ```

4. **Complete API integration:**
   - Follow: ODOO_INTEGRATION_IMPLEMENTATION_PLAN.md
   - Remove demo data fallbacks
   - Implement missing APIs

---

## 🔑 Important Reminders

⚠️ **Before Starting:**
- Have Enterprise license key ready
- Have DB UUID ready
- Ensure you have ~30 minutes available

⚠️ **During Upgrade:**
- Don't interrupt the script
- Let it run to completion
- Monitor the progress

⚠️ **After Upgrade:**
- Keep backup files safe
- Monitor logs for 24 hours
- Test all critical features

---

## 📞 Support

If you need help:

1. **Check the logs:**
   ```bash
   ssh root@45.76.138.109
   docker-compose logs odoo | tail -50
   ```

2. **Verify credentials:**
   ```bash
   echo "IP: 45.76.138.109"
   echo "User: root"
   echo "DB Password: 6,wDD*iQCG6+4A?H"
   ```

3. **Check documentation:**
   - VULTR_ENTERPRISE_UPGRADE.sh (the script)
   - QUICK_INTEGRATION_GUIDE.md (quick reference)
   - ODOO_ENTERPRISE_UPGRADE_EXECUTION.md (detailed steps)

---

## ✅ Ready to Deploy?

**Next Action:**

```bash
# 1. Get your license key from https://www.odoo.com/my/licenses
# 2. Have ready: License Key, DB UUID
# 3. Copy and paste the commands from the "Complete Copy-Paste" section above
# 4. Watch the upgrade complete
```

You've got this! 🚀

---

**Status:** Ready to Execute
**Next:** Get Enterprise license → Run script
**Time:** 40-50 minutes total
**Expected Result:** Odoo Enterprise running on Vultr with all data intact
