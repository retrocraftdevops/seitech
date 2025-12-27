# SEI Tech Odoo Enterprise Upgrade - Daily Checklist

**Target Launch:** January 5, 2026
**Total Duration:** 7 Days (Dec 27 - Jan 2)
**Status:** Ready to Begin

---

## 📅 DAY 1: DECEMBER 27 (TODAY) - Pre-Upgrade Backup

**⏱️ Estimated Time:** 1-2 hours
**💾 Primary Activity:** Backup current system

### Morning (30 min)

- [ ] **Verify SSH Access**
  ```bash
  ssh root@odoo.seitechinternational.org.uk
  # Should connect without errors
  ```

- [ ] **Check Docker Status**
  ```bash
  cd /root/seitech
  docker-compose ps
  # Should show: seitech-odoo (Up), seitech-postgres (Up)
  ```

- [ ] **Verify Disk Space**
  ```bash
  df -h /
  # Need: 50GB+ free
  ```
  ✅ Expected: Large green shows ample space

### Midday (1-1.5 hours)

- [ ] **Run Automated Backup (Phase 1)**
  ```bash
  chmod +x UPGRADE_QUICK_START.sh
  bash UPGRADE_QUICK_START.sh
  # This will:
  # - Check Odoo version
  # - Backup database
  # - Backup volumes
  # - Test APIs
  # - Create report
  ```
  ✅ Expected: "Phase 1: COMPLETE" message

- [ ] **Verify Backups Created**
  ```bash
  ls -lah /backups/
  ls -lah /root/odoo_upgrade_backup/
  # Should see multiple .gz files
  ```
  ✅ Expected: 3GB+ total backup size

- [ ] **Review Status Report**
  ```bash
  cat /root/odoo_upgrade_backup/upgrade_status_*.txt
  # Review all information
  ```
  ✅ Expected: All green checkmarks

### Afternoon (30 min)

- [ ] **Secure Backups**
  - [ ] Verify backups exist in 2 locations
  - [ ] Consider copying to external storage
  - [ ] Note backup filenames for reference

- [ ] **Test Backup Integrity**
  ```bash
  # Verify database backup can be read
  gunzip -t /backups/seitech_full_*.sql.gz
  # Should complete without errors
  ```
  ✅ Expected: No error messages

- [ ] **Prepare for Enterprise Phase**
  - [ ] Read: ODOO_ENTERPRISE_UPGRADE_EXECUTION.md (skim sections 3-4)
  - [ ] Note: You'll need Enterprise license for next phase
  - [ ] Prepare: Bookmark https://www.odoo.com/my/licenses

### End of Day 1

- [ ] ✅ Backup complete
- [ ] ✅ Status report generated
- [ ] ✅ All systems verified
- [ ] ✅ Ready for Enterprise setup

**Status:** 🟢 On Track

---

## 📅 DAY 2: DECEMBER 28 - Enterprise Preparation

**⏱️ Estimated Time:** 2-3 hours
**🔑 Primary Activity:** Get Enterprise license & prepare environment

### Morning (1-1.5 hours)

- [ ] **Obtain Enterprise License**
  - [ ] Go to https://www.odoo.com/my/licenses
  - [ ] Log in with Odoo account
  - [ ] Copy your license key (long alphanumeric string)
  - [ ] Copy your DB UUID
  - [ ] Note: Write these down securely

  ✅ Expected: You have license key and UUID

- [ ] **Create Environment File**
  ```bash
  cd /root/seitech
  cat > .env.enterprise <<EOF
  ODOO_DB_PASSWORD=your_secure_password_here
  ODOO_ENTERPRISE_LICENSE_KEY=<PASTE_LICENSE_KEY_HERE>
  ODOO_ENTERPRISE_DB_UUID=<PASTE_DB_UUID_HERE>
  ODOO_WORKERS=8
  ODOO_MAX_CRON_THREADS=2
  NEXT_PUBLIC_ODOO_URL=https://odoo.seitechinternational.org.uk
  ODOO_DATABASE=seitech_production
  ODOO_ADMIN_USER=admin
  EOF
  ```

  ✅ Expected: .env.enterprise file created with your license

- [ ] **Verify Environment**
  ```bash
  cat /root/seitech/.env.enterprise
  # Should show your license key (first 20 chars visible)
  ```
  ✅ Expected: File shows with your custom values

### Afternoon (1-1.5 hours)

- [ ] **Review Upgrade Steps**
  - [ ] Read: ODOO_ENTERPRISE_UPGRADE_EXECUTION.md Phase 4 (Upgrade Execution)
  - [ ] Understanding what will happen
  - [ ] Note any questions

- [ ] **Prepare Docker Compose**
  - [ ] Script will handle this - just for awareness
  - [ ] Will switch from community to enterprise image

- [ ] **Final Verification**
  ```bash
  # Check current state one more time
  docker exec seitech-odoo python3 -c "import odoo; print(f'Version: {odoo.__version__}')"
  # Should show: Version: 19.0.x.x (Community)
  ```
  ✅ Expected: Shows 19.0 Community version

### End of Day 2

- [ ] ✅ Enterprise license obtained
- [ ] ✅ .env.enterprise created with license
- [ ] ✅ Upgrade steps reviewed
- [ ] ✅ Ready for upgrade tomorrow

**Status:** 🟢 On Track

---

## 📅 DAY 3: DECEMBER 29 - Enterprise Upgrade

**⏱️ Estimated Time:** 2-3 hours
**⚙️ Primary Activity:** Execute upgrade to Enterprise

### Morning (1 hour)

- [ ] **Final Pre-Upgrade Check**
  ```bash
  cd /root/seitech

  # 1. Database is accessible
  docker exec seitech-postgres psql -U odoo -d seitech_production -c "SELECT version();"

  # 2. Odoo is running
  docker ps | grep seitech-odoo

  # 3. Backups exist
  ls /backups/seitech_full_*.sql.gz
  ```
  ✅ Expected: All three checks show success

- [ ] **Stop Current Odoo Gracefully**
  ```bash
  docker-compose stop seitech-odoo --time=30
  # Wait for it to stop
  ```
  ✅ Expected: Container stops in 30 seconds

- [ ] **Switch to Enterprise Docker Compose**
  Follow Phase 4 from ODOO_ENTERPRISE_UPGRADE_EXECUTION.md
  ```bash
  # Create enterprise compose (or copy provided one)
  cp docker-compose.yml docker-compose.community-backup.yml
  # Create docker-compose.enterprise.yml (steps provided)
  cp docker-compose.enterprise.yml docker-compose.yml
  ```
  ✅ Expected: docker-compose.yml now references enterprise image

### Midday (1.5-2 hours)

- [ ] **Pull Enterprise Image**
  ```bash
  docker-compose pull odoo
  # Will download ~2GB, takes 5-10 minutes
  ```
  ✅ Expected: Image download complete, no errors

- [ ] **Start Upgrade Process**
  ```bash
  docker-compose up -d odoo
  # Odoo will start and automatically upgrade database
  ```
  ✅ Expected: Container starts

- [ ] **Monitor Upgrade (IMPORTANT)**
  ```bash
  docker-compose logs -f odoo --tail=100
  # Watch for:
  # 1. Database migration messages
  # 2. "Module ... loaded" messages
  # 3. "HTTP workers spawned" (this means it's done)
  # Takes 5-15 minutes
  ```
  ✅ Expected: See "HTTP workers spawned" message

  (Press Ctrl+C when you see this)

### Afternoon (30 min - 1 hour)

- [ ] **Verify Enterprise Installation**
  ```bash
  # Check Odoo is running
  docker ps | grep seitech-odoo

  # Check version
  docker exec seitech-odoo python3 -c "import odoo; print(f'Version: {odoo.__version__}')"
  # Should still show 19.0.x.x (enterprise flag is separate)
  ```
  ✅ Expected: Container running, version shows 19.0

- [ ] **Verify License Registered**
  ```bash
  curl -s http://localhost:8069/web/health | python3 -m json.tool
  # Should show: { "status": "ok" }
  ```
  ✅ Expected: Health check returns ok

- [ ] **Check Custom Modules**
  ```bash
  docker exec seitech-odoo bash -c "ls /mnt/extra-addons | grep seitech"
  # Should show: seitech_elearning, seitech_base, etc.
  ```
  ✅ Expected: Custom modules present

### End of Day 3

- [ ] ✅ Upgrade complete
- [ ] ✅ Enterprise running
- [ ] ✅ Custom modules loaded
- [ ] ✅ Ready for API testing

**Status:** 🟢 On Track

---

## 📅 DAY 4: DECEMBER 30 - API Testing & Validation

**⏱️ Estimated Time:** 2-3 hours
**🧪 Primary Activity:** Test all critical APIs

### Morning (1-1.5 hours)

- [ ] **Create Test Script**
  ```bash
  # Save this as: /root/test_apis.sh
  # (Script provided in ODOO_ENTERPRISE_UPGRADE_EXECUTION.md, Phase 5)

  bash /root/test_apis.sh
  # Tests:
  # 1. Login API
  # 2. Get current user
  # 3. List courses
  # 4. Dashboard stats
  # 5. Enrollments
  ```
  ✅ Expected: All tests return valid JSON responses

- [ ] **Test Critical Endpoints**
  ```bash
  # Test 1: Auth Login
  curl -X POST http://localhost:8069/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@seitechinternational.org.uk","password":"admin"}'
  # Should return: user object with sessionToken

  # Test 2: Courses
  curl http://localhost:8069/api/courses?limit=2
  # Should return: array of courses

  # Test 3: Health check
  curl http://localhost:8069/web/health
  # Should return: {"status": "ok"}
  ```
  ✅ Expected: All return 200 status with valid responses

### Afternoon (1-1.5 hours)

- [ ] **Check for Errors**
  ```bash
  docker-compose logs odoo --since=1h | grep -i "error\|warning"
  # Should be minimal/no errors
  ```
  ✅ Expected: Few or no error messages

- [ ] **Verify Database Schema**
  ```bash
  docker exec seitech-postgres psql -U odoo -d seitech_production -c \
    "SELECT COUNT(*) FROM slide_channel;"
  # Should show: count of courses (>0)
  ```
  ✅ Expected: Shows course count from database

- [ ] **Test API Response Format**
  ```bash
  curl http://localhost:8069/api/courses | python3 -m json.tool | head -30
  # Should show properly formatted JSON
  ```
  ✅ Expected: Valid JSON output with courses

### End of Day 4

- [ ] ✅ All APIs responding
- [ ] ✅ No critical errors
- [ ] ✅ Database queries working
- [ ] ✅ Ready for frontend integration

**Status:** 🟢 On Track

---

## 📅 DAY 5: DECEMBER 31 - Frontend Integration Testing

**⏱️ Estimated Time:** 2-3 hours
**🌐 Primary Activity:** Test frontend-Odoo connection

### Morning (1 hour)

- [ ] **Update Frontend Environment**
  - [ ] Go to Vercel Dashboard: https://vercel.com
  - [ ] Project: seitech-frontend
  - [ ] Settings → Environment Variables
  - [ ] Update/verify these are set:
    ```
    NEXT_PUBLIC_ODOO_URL=https://odoo.seitechinternational.org.uk
    ODOO_DATABASE=seitech_production
    ODOO_ADMIN_USER=admin
    ODOO_ADMIN_PASSWORD=<from-env>
    NEXT_PUBLIC_ENABLE_DEMO_MODE=false
    ```

  ✅ Expected: All variables set in Vercel

- [ ] **Trigger Frontend Redeploy**
  - [ ] In Vercel, go to Deployments
  - [ ] Click last deployment
  - [ ] Click "Redeploy"
  - [ ] Wait for deploy to complete (2-3 min)

  ✅ Expected: Deployment shows "Ready"

### Midday (1-1.5 hours)

- [ ] **Test Login Flow**
  - [ ] Go to: https://seitech-frontend.vercel.app/login
  - [ ] Enter credentials:
    - Email: `admin@seitechinternational.org.uk`
    - Password: `admin`
  - [ ] Click Login
  - [ ] Expected: Redirect to /dashboard

  ✅ Expected: Dashboard loads with user info shown

- [ ] **Check User Menu**
  - [ ] Look at top right corner
  - [ ] Should show: Admin name with role badge
  - [ ] Click menu: Should show "Dashboard", "Settings", "Sign Out"

  ✅ Expected: User menu shows correctly

- [ ] **Verify Dashboard Data**
  - [ ] Check dashboard statistics
  - [ ] Should show: Real enrollment count (not 42 demo)
  - [ ] Should show: Real certificate count
  - [ ] Should show: Real streak data

  ✅ Expected: Real data displayed (not hardcoded demo)

### Afternoon (30 min - 1 hour)

- [ ] **Test Courses Page**
  - [ ] Click "My Courses" from menu
  - [ ] Should display: Real courses from Odoo
  - [ ] Should show: Course progress, enrollment status

  ✅ Expected: Real Odoo courses displayed

- [ ] **Check Browser Console**
  - [ ] Open Developer Tools (F12)
  - [ ] Go to Console tab
  - [ ] Should be: No red error messages
  - [ ] Allowed warnings about deprecated features

  ✅ Expected: Clean console, no 404 errors

- [ ] **Test Logout**
  - [ ] Click user menu
  - [ ] Click "Sign Out"
  - [ ] Expected: Redirect to home page
  - [ ] Login button should reappear

  ✅ Expected: Logout works, session cleared

### End of Day 5

- [ ] ✅ Frontend connected to Odoo
- [ ] ✅ Login/logout working
- [ ] ✅ Real data displaying
- [ ] ✅ No demo data showing
- [ ] ✅ Ready for final verification

**Status:** 🟢 On Track

---

## 📅 DAY 6: JANUARY 1 - Final Testing & Optimization

**⏱️ Estimated Time:** 1-2 hours
**🔍 Primary Activity:** Final verification and optimization

### Morning (1 hour)

- [ ] **System Health Check**
  ```bash
  # Run diagnostic script
  # Expected output: All green

  # 1. Disk space
  df -h / | tail -1
  # Need: >30GB free

  # 2. Memory usage
  free -h
  # Need: <70% used

  # 3. CPU usage
  docker stats --no-stream seitech-odoo --format "{{.CPUPerc}}"
  # Should be: <50% idle

  # 4. Database connections
  docker exec seitech-postgres psql -U odoo -d seitech_production -c \
    "SELECT count(*) FROM pg_stat_activity;"
  # Should be: <20 connections
  ```
  ✅ Expected: All metrics healthy

- [ ] **Check for Errors**
  ```bash
  docker-compose logs odoo --since=6h | grep -i error | wc -l
  # Should be: <5 errors
  ```
  ✅ Expected: Minimal errors

### Afternoon (1 hour)

- [ ] **Performance Test**
  ```bash
  # Test API response times
  time curl -s http://localhost:8069/api/courses > /dev/null
  # Should complete in: <2 seconds

  time curl -s http://localhost:8069/api/dashboard/stats > /dev/null
  # Should complete in: <2 seconds
  ```
  ✅ Expected: Fast response times

- [ ] **Frontend Performance Check**
  - [ ] Go to: https://seitech-frontend.vercel.app/dashboard
  - [ ] Check browser's Network tab (F12)
  - [ ] All API calls should return 200 status
  - [ ] Page should load in <3 seconds

  ✅ Expected: Fast page load, no errors

- [ ] **Final Data Verification**
  ```bash
  # Verify real data in database
  docker exec seitech-postgres psql -U odoo -d seitech_production <<EOF
  SELECT 'Users' as item, COUNT(*) FROM res_users
  UNION ALL
  SELECT 'Courses', COUNT(*) FROM slide_channel
  UNION ALL
  SELECT 'Enrollments', COUNT(*) FROM slide_channel_partner;
  EOF
  ```
  ✅ Expected: All counts > 0

### End of Day 6

- [ ] ✅ System performance verified
- [ ] ✅ No critical errors
- [ ] ✅ APIs responding fast
- [ ] ✅ Ready for go-live

**Status:** 🟢 On Track

---

## 📅 DAY 7: JANUARY 2 - Pre-Launch Preparation

**⏱️ Estimated Time:** 1-2 hours
**🚀 Primary Activity:** Final go-live preparation

### Morning (1 hour)

- [ ] **Create Final Backup**
  ```bash
  FINAL_BACKUP="/backups/seitech_prelive_$(date +%Y%m%d_%H%M%S).sql.gz"

  docker exec seitech-postgres pg_dump \
    -U odoo \
    -d seitech_production | gzip > "$FINAL_BACKUP"

  # Verify
  ls -lah "$FINAL_BACKUP"
  # Should be: 2GB+ file
  ```
  ✅ Expected: Pre-launch backup created

- [ ] **Enable Monitoring**
  - [ ] Set up uptime monitoring for:
    - `https://odoo.seitechinternational.org.uk/web/health`
    - `https://seitech-frontend.vercel.app`
  - [ ] Configure alerts if needed

  ✅ Expected: Monitoring active

### Afternoon (1 hour)

- [ ] **Documentation Review**
  - [ ] Ensure you have: Backup locations documented
  - [ ] Ensure you have: Rollback procedure saved
  - [ ] Ensure you have: Emergency contact info

- [ ] **Team Communication**
  - [ ] Inform team: Jan 5 launch is go
  - [ ] Share: Monitoring dashboard link
  - [ ] Share: Rollback procedure (if needed)

- [ ] **Last Minute Checks**
  ```bash
  # Run Jan 5 go-live verification
  # (Script in ODOO_ENTERPRISE_UPGRADE_EXECUTION.md, Phase 9)

  chmod +x golive_check.sh
  ./golive_check.sh

  # Should show:
  # ✅ Odoo Accessibility: 200
  # ✅ Database Status: OK
  # ✅ API Status: 200 for all endpoints
  # ✅ Frontend Connectivity: 200
  # ✅ No demo mode detected
  # ✅ SSL Status: Valid
  # ✅ Disk Space: Adequate
  ```
  ✅ Expected: All checks pass

### End of Day 7

- [ ] ✅ Final backup created
- [ ] ✅ Monitoring enabled
- [ ] ✅ Team informed
- [ ] ✅ Go-live verified
- [ ] ✅ Ready to launch tomorrow!

**Status:** 🟢 Ready for Launch

---

## 📅 JANUARY 5 - LAUNCH DAY ✨

**⏱️ Time Budget:** 30 min - 1 hour for verification
**🎯 Primary Activity:** Monitor and celebrate!

### Morning (30 min)

- [ ] **Launch Verification (9:00 AM)**
  ```bash
  # Run final go-live check
  ./golive_check.sh
  # All should be green
  ```
  ✅ Expected: All checks pass

- [ ] **User Communication**
  - [ ] Announce: Landing page is live
  - [ ] Share: Signup link
  - [ ] Note: Real Odoo data powering everything

### Throughout Day

- [ ] **Monitor System**
  - [ ] Watch: Error logs (should be minimal)
  - [ ] Watch: Performance metrics
  - [ ] Watch: User signups/logins
  - [ ] Alert: On any issues

- [ ] **Support Users**
  - [ ] Answer: FAQ about login
  - [ ] Help: With course enrollment
  - [ ] Collect: Early feedback

### End of Launch Day

- [ ] ✅ Landing page live with real data
- [ ] ✅ Users successfully signing up
- [ ] ✅ Dashboard showing real enrollments
- [ ] ✅ System stable and performant

**Status:** 🎉 LAUNCH SUCCESSFUL

---

## 🆘 Emergency Contacts & Procedures

### If Upgrade Fails

1. **Check logs immediately**
   ```bash
   docker-compose logs odoo | tail -50
   ```

2. **Verify database is still accessible**
   ```bash
   docker exec seitech-postgres psql -U odoo -d seitech_production -c "SELECT 1;"
   ```

3. **Initiate rollback if needed**
   ```bash
   cd /root/seitech
   docker-compose stop seitech-odoo
   cp docker-compose.community-backup.yml docker-compose.yml
   docker-compose up -d odoo
   ```

4. **Contact support** if rollback doesn't work

### If Frontend Can't Connect

1. **Check CORS configuration**
2. **Verify environment variables in Vercel**
3. **Check network connectivity between frontend and Odoo**
4. **Redeploy frontend** if variables updated

### If Users Report Issues

1. **Check API endpoints are responding**
2. **Verify database has real data**
3. **Check for 404 errors in console**
4. **Restart Odoo** if needed: `docker-compose restart odoo`

---

## ✅ Summary

| Day | Activity | Status |
|-----|----------|--------|
| Dec 27 | Backup & Verification | ⏳ Today |
| Dec 28 | Enterprise Preparation | ⏳ Tomorrow |
| Dec 29 | Enterprise Upgrade | ⏳ +2 days |
| Dec 30 | API Testing | ⏳ +3 days |
| Dec 31 | Frontend Integration | ⏳ +4 days |
| Jan 1 | Final Testing | ⏳ +5 days |
| Jan 2 | Go-Live Prep | ⏳ +6 days |
| Jan 5 | 🎉 **LAUNCH** | 🚀 Live! |

---

**Start Date:** December 27, 2025
**End Date:** January 5, 2026
**Status:** Ready - Begin with Day 1 today!
**Next Step:** Run UPGRADE_QUICK_START.sh

Let's go! 🚀
