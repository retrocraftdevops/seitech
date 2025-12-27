# Quick Odoo Integration Guide - SEI Tech Frontend

## TL;DR - Critical Action Items (Do First)

### ✅ BEFORE Jan 5 (Landing Page Deadline)

1. **Verify Odoo has API endpoints** (`{ODOO_URL}/api/auth/login`, etc.)
2. **Set environment variables:**
   ```bash
   NEXT_PUBLIC_ODOO_URL=https://odoo.seitechinternational.org.uk
   ODOO_DATABASE=seitech_production
   ODOO_ADMIN_USER=admin
   ODOO_ADMIN_PASSWORD=<password>
   ```
3. **Test login route** - Ensure `/api/auth/login` connects to Odoo
4. **Test courses display** - Verify `/api/courses` returns real data from `slide.channel`
5. **Remove demo data fallbacks** for production (keep for dev)
6. **Test session validation** - `/api/auth/me` validates with Odoo

---

## Integration Status by Feature

### 🔴 CRITICAL (Must Fix - This Week)

#### 1. Authentication
- **File:** `/src/app/api/auth/login/route.ts`
- **Status:** Tries Odoo, has demo fallback
- **Action:** Ensure Odoo endpoint works, test thoroughly
- **Odoo Needs:**
  - `POST /api/auth/login` → returns `{ sessionToken, user: {role, permissions} }`
  - `res.users` must have `groups_id` populated
  - Response must include user role (admin/manager/instructor/student)

#### 2. Session Management
- **File:** `/src/app/api/auth/me/route.ts`
- **Status:** Only checks cookies
- **Action:** Add Odoo validation call
- **Code Change Needed:**
  ```typescript
  // Current: Only reads cookie
  const user = JSON.parse(userInfoCookie.value);

  // Needed: Validate with Odoo
  const odoo = getAuthenticatedOdooClient();
  const session = await odoo.getSession();
  // Merge fresh permissions from Odoo
  ```

#### 3. Courses Display
- **File:** `/src/app/api/courses/route.ts`
- **Status:** Should use Odoo `slide.channel`
- **Action:** Verify it's fetching from Odoo correctly
- **Test:**
  ```bash
  curl http://localhost:4000/api/courses
  # Should return real courses, not demo data
  ```

---

### 🟠 HIGH PRIORITY (This Week)

#### 4. Course Creation (Instructor Feature)
- **Files:** `/src/app/api/courses/route.ts` (POST method)
- **Status:** Not implemented
- **Action:** Implement POST endpoint
- **Odoo Needs:** Permission check, course creation in `slide.channel`

#### 5. Enrollment System
- **File:** `/src/app/api/enrollments/route.ts`
- **Status:** GET only, no POST
- **Action:** Implement enrollment creation
- **Odoo Model:** `slide.channel.partner`

#### 6. Dashboard Statistics
- **File:** `/src/app/api/dashboard/stats/route.ts`
- **Status:** Returns hardcoded demo data
- **Action:** Remove demo data, fetch real stats from Odoo
- **Code Change:**
  ```typescript
  // Remove this:
  if (sessionToken.startsWith('demo_') || sessionToken.startsWith('admin_')) {
    return NextResponse.json({ success: true, data: demoData });
  }

  // Keep only Odoo path
  ```

---

### 🟡 MEDIUM PRIORITY (Week 2)

#### 7. User Registration
- **File:** `/src/app/api/auth/register/route.ts`
- **Status:** Tries Odoo, has demo fallback
- **Action:** Test Odoo endpoint works
- **Odoo Needs:** `POST /api/auth/register`

#### 8. Admin User Management
- **Files:** `/src/app/api/admin/users/**`
- **Status:** Partial integration
- **Action:** Implement full CRUD with permissions

#### 9. Certificates
- **Files:** `/src/app/api/certificates/**`
- **Status:** Basic implementation
- **Action:** Complete verification and download endpoints

#### 10. CMS Content
- **Files:** `/src/app/api/cms/**`
- **Status:** Not integrated
- **Action:** Create Odoo CMS module and integrate

---

## File-by-File Action Plan

### Step 1: Verify Odoo Configuration
**File:** Check environment variables
```bash
# In your deployment environment, verify:
echo $NEXT_PUBLIC_ODOO_URL
echo $ODOO_DATABASE
# (Don't echo passwords!)
```

### Step 2: Test Odoo Connection
**File:** `/src/app/api/health/route.ts`
```bash
curl http://localhost:4000/api/health
# Should show Odoo connectivity status
```

### Step 3: Verify Login Flow
**Action:** Test login with Odoo credentials
1. Go to http://localhost:4000/login
2. Enter valid Odoo user email and password
3. Should redirect to /dashboard with user info
4. Check console for errors

### Step 4: Verify Courses Display
**Action:** Check homepage/courses page
```bash
curl http://localhost:4000/api/courses
# Must return real courses from Odoo slide.channel
```

### Step 5: Fix Dashboard Stats
**File:** `/src/app/api/dashboard/stats/route.ts`
- Remove the demo data section (lines 31-54)
- Ensure it calls `getAuthenticatedOdooClient()`
- Fetch real stats from Odoo

### Step 6: Implement Course Creation
**File:** `/src/app/api/courses/route.ts`
- Add POST method for course creation
- Add permission check (instructor/admin only)
- Call Odoo `slide.channel` create method

### Step 7: Implement Enrollment Creation
**File:** `/src/app/api/enrollments/route.ts`
- Add POST method
- Create `slide.channel.partner` record
- Return enrollment object

---

## Odoo Backend Requirements

### APIs That Must Exist in Odoo

**Authentication:**
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET /api/auth/me
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

**Courses:**
```
GET /api/courses
POST /api/courses
GET /api/courses/{id}
PUT /api/courses/{id}
DELETE /api/courses/{id}
GET /api/courses/search
```

**Enrollments:**
```
GET /api/enrollments
POST /api/enrollments
PUT /api/enrollments/{id}
DELETE /api/enrollments/{id}
```

**User Info:**
```
GET /api/users/{id}
PUT /api/users/{id}
```

### Models That Must Have Data

- `res.users` - Users with group assignments
- `res.partner` - User partners
- `res.groups` - Roles (admin, manager, instructor, student_admin, student)
- `slide.channel` - Courses
- `slide.channel.partner` - Enrollments
- `ir.config_parameter` - Site settings

---

## Testing Checklist

### Before Jan 5
- [ ] Login with Odoo user works
- [ ] Dashboard shows real enrollment data (not demo)
- [ ] Courses display real courses from Odoo
- [ ] User info (name, email, role) is correct
- [ ] Logout works properly
- [ ] Session persists on page refresh
- [ ] No hardcoded demo data visible in production

### Critical Tests
```bash
# Test 1: Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@seitechinternational.org.uk","password":"admin"}'

# Test 2: Get Current User
curl http://localhost:4000/api/auth/me \
  -H "Cookie: session_token=..."

# Test 3: Get Courses
curl http://localhost:4000/api/courses

# Test 4: Dashboard Stats
curl http://localhost:4000/api/dashboard/stats \
  -H "Cookie: session_token=..."
```

---

## Environment Variable Checklist

```bash
# REQUIRED for Odoo Integration
✅ NEXT_PUBLIC_ODOO_URL=https://odoo.seitechinternational.org.uk
✅ ODOO_DATABASE=seitech_production
✅ ODOO_ADMIN_USER=admin
✅ ODOO_ADMIN_PASSWORD=<password>

# RECOMMENDED
[ ] NODE_ENV=production (for Vercel deployment)
[ ] NEXT_PUBLIC_ENABLE_DEMO_MODE=false (disable demo fallback)
```

---

## Common Issues & Fixes

### Issue: "Odoo configuration missing"
**Fix:** Set `NEXT_PUBLIC_ODOO_URL` and `ODOO_DATABASE`

### Issue: Login succeeds but no user info
**Fix:** Check Odoo response includes `user.role` and `user.permissions`

### Issue: Dashboard shows demo data instead of real
**Fix:** Remove demo data check in `/src/app/api/dashboard/stats/route.ts`

### Issue: "Session expired" errors
**Fix:** Check `ODOO_ADMIN_USER` and `ODOO_ADMIN_PASSWORD` are correct

### Issue: CORS errors from Odoo
**Fix:** Configure CORS in Odoo server settings to allow frontend URL

---

## Next Steps

1. **Today:** Verify Odoo APIs exist and test connectivity
2. **This Week:** Fix critical issues (auth, courses, dashboard)
3. **Next Week:** Implement course creation and enrollments
4. **Week 3:** Add certificates and CMS
5. **Before Mar 1:** Complete all features and optimize

---

## Support & Documentation

- **OdooClient Reference:** `/src/lib/api/odoo-client.ts`
- **Integration Audit:** `/ODOO_INTEGRATION_AUDIT.md`
- **Implementation Plan:** `/ODOO_INTEGRATION_IMPLEMENTATION_PLAN.md`
- **Odoo Docs:** Check Odoo installation for `/api/` endpoint documentation

---

**Last Updated:** 2025-12-27
**Status:** Ready for implementation
**Contact:** Development Team
