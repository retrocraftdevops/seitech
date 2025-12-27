# Odoo Integration Implementation Plan

**Project:** SEI Tech Frontend - Complete Odoo Integration
**Timeline:** Immediate (Before Jan 5 for landing page)
**Priority:** Critical for business continuity

---

## Phase 1: Foundation - Authentication & Core Flow (This Week)

### 1.1 Fix Authentication (CRITICAL)
**File:** `/src/app/api/auth/login/route.ts`

**Current State:**
- ✅ Tries Odoo first
- ✅ Falls back to demo mode
- ❌ May have hardcoded credentials (needs verification)

**Required Changes:**
```typescript
// Remove any hardcoded credentials
// Ensure Odoo endpoint: POST {ODOO_URL}/api/auth/login
// Response format expected:
{
  success: true,
  data: {
    user: {
      id: number,
      name: string,
      email: string,
      firstName?: string,
      lastName?: string,
      role: 'admin' | 'manager' | 'instructor' | 'student_admin' | 'student'
    },
    sessionToken: string
  }
}
```

**Odoo Backend Endpoint Needed:**
```
POST /api/auth/login
Body: { email, password }
Response: User object with role from res.users.groups_id
```

### 1.2 Session Validation (CRITICAL)
**File:** `/src/app/api/auth/me/route.ts`

**Current Issues:**
- Only checks cookies, doesn't validate with Odoo
- No session expiry check

**Required Implementation:**
```typescript
// Call Odoo to validate session is still valid
// Use getAuthenticatedOdooClient() to fetch fresh user data
// Verify session hasn't expired
// Return normalized user with current permissions
```

**Odoo Backend Endpoint Needed:**
```
GET /api/auth/me (requires valid session)
Response: Current user object with updated role/permissions
```

### 1.3 User Registration with Odoo (CRITICAL)
**File:** `/src/app/api/auth/register/route.ts`

**Current State:**
- ✅ Tries Odoo at `{ODOO_URL}/api/auth/register`
- ✅ Falls back to demo mode

**Odoo Backend Endpoint Needed:**
```
POST /api/auth/register
Body: { name, email, password, firstName?, lastName? }
Response: { success, data: { user, sessionToken } }
```

**Odoo Implementation:**
- Create res.partner with email
- Create res.users linked to partner
- Set default role to 'student'
- Hash password securely
- Return session token

### 1.4 Password Reset (NEW)
**File:** `/src/app/api/auth/forgot-password/route.ts`

**Required Implementation:**
```typescript
export async function POST(request: NextRequest) {
  // 1. Validate email exists in Odoo
  // 2. Generate OTP / reset token
  // 3. Send email with reset link
  // 4. Return success
}
```

**Odoo Backend Endpoints Needed:**
```
POST /api/auth/forgot-password
Body: { email }
Response: { success, message: "Check your email" }

POST /api/auth/reset-password
Body: { token, newPassword }
Response: { success, data: { user, sessionToken } }
```

---

## Phase 2: Core Data Integration (Jan 5-15)

### 2.1 Courses - Complete CRUD

**Files:**
- `/src/app/api/courses/route.ts` - List & Create
- `/src/app/api/courses/[id]/route.ts` - Get, Update, Delete
- `/src/app/api/courses/slug/[slug]/route.ts` - Slug lookup
- `/src/app/api/courses/search/route.ts` - Search

**Odoo Model:** `slide.channel`

**Required Odoo Endpoints:**
```
GET /api/courses?limit=10&offset=0&order=create_date%20desc
Response: { courses: [{id, name, slug, description, image, price, ...}] }

POST /api/courses (instructor/admin only)
Body: { name, description, content, price, category_id, ... }
Response: { success, data: { course } }

GET /api/courses/{id}
GET /api/courses/slug/{slug}

PUT /api/courses/{id} (owner/admin only)
DELETE /api/courses/{id} (owner/admin only)

GET /api/courses/search?q=python
```

**Frontend Implementation:**
- [ ] Update `/src/app/api/courses/route.ts` to use Odoo slide.channel
- [ ] Implement course creation for instructors
- [ ] Add course editing functionality
- [ ] Add course deletion with permissions check
- [ ] Implement full-text search

### 2.2 Enrollments

**Files:**
- `/src/app/api/enrollments/route.ts`

**Odoo Model:** `slide.channel.partner`

**Required Odoo Endpoints:**
```
GET /api/enrollments (current user)
Response: { enrollments: [{courseId, courseName, progress, state, ...}] }

POST /api/enrollments
Body: { courseId }
Response: { success, data: { enrollment } }

PUT /api/enrollments/{id}
Body: { progress, completed?: true }

DELETE /api/enrollments/{id} (admin only)
```

**Frontend Implementation:**
- [ ] Update enrollments list to fetch from Odoo
- [ ] Implement enrollment creation
- [ ] Add progress update functionality
- [ ] Display enrollment status correctly

### 2.3 Dashboard Statistics

**File:** `/src/app/api/dashboard/stats/route.ts`

**Current Issue:** Returns hardcoded demo data

**Required Implementation:**
```typescript
// Remove demo data check
// Use getAuthenticatedOdooClient() to fetch real data
// Query:
// - User's enrollments (slide.channel.partner)
// - User's certificates
// - User's points/badges
// - User's streaks
// Return aggregated statistics
```

**Odoo Queries Needed:**
```
GET /api/dashboard/stats
- Count user's courses (slide.channel.partner)
- Count completed courses (state='completed')
- Count certificates issued
- Calculate total time spent
- Fetch current/longest streak
```

---

## Phase 3: Advanced Features (Jan 15-Feb)

### 3.1 Certificates

**Files:**
- `/src/app/api/certificates/route.ts`
- `/src/app/api/certificates/verify/route.ts`

**Odoo Model:** `slide.channel.certificate`

**Required Odoo Endpoints:**
```
GET /api/certificates (current user)
Response: { certificates: [{id, courseId, courseName, issueDate, expiryDate, ...}] }

POST /api/certificates (admin/system only - auto-generated)
Body: { userId, courseId, templateId }

GET /api/certificates/{id}/download
Response: PDF binary

GET /api/certificates/verify?reference={ref}
Response: { valid, data: { certificate } }
```

**Implementation Tasks:**
- [ ] Auto-generate certificate on course completion
- [ ] Certificate download endpoint
- [ ] Certificate verification system
- [ ] QR code generation

### 3.2 CMS Content Management

**Files:**
- `/src/app/api/cms/pages/**`
- `/src/app/api/cms/services/**`
- `/src/app/api/cms/faqs/**`
- `/src/app/api/cms/team/**`
- `/src/app/api/cms/testimonials/**`
- `/src/app/api/cms/partners/**`

**Required Odoo Module:** `seitech_cms` (Custom)

**Odoo Models Needed:**
- `seitech.cms_page`
- `seitech.cms_service`
- `seitech.cms_faq`
- `seitech.cms_team_member`
- `seitech.cms_testimonial`
- `seitech.cms_partner`

**Required Odoo Endpoints:**
```
GET /api/cms/pages?published=true
GET /api/cms/pages/{slug}
POST /api/cms/pages (admin only)
PUT /api/cms/pages/{id} (admin only)
DELETE /api/cms/pages/{id} (admin only)

GET /api/cms/services?category={cat}
POST /api/cms/services (admin only)
...
```

**Implementation Priority:**
1. Services (needed for landing page)
2. FAQs
3. Team
4. Testimonials
5. Partners
6. General pages

### 3.3 Admin Panel APIs

**Files:**
- `/src/app/api/admin/users/route.ts`
- `/src/app/api/admin/instructors/route.ts`
- `/src/app/api/admin/courses/route.ts`
- `/src/app/api/admin/analytics/overview/route.ts`

**Implementation:**
- [ ] User management with proper role assignment
- [ ] Instructor creation/management
- [ ] Course approval workflow
- [ ] Admin-level analytics

---

## Phase 4: Gamification & Social (Jan 20-Feb)

### 4.1 Gamification

**Files:**
- `/src/app/api/gamification/**`
- `/src/app/api/leaderboard/route.ts`

**Required Odoo Module:** `seitech_gamification` (Custom)

**Odoo Models Needed:**
- `seitech.badge` - Badge definitions
- `seitech.user_badge` - User badge assignments
- `seitech.streak` - User streaks
- `seitech.points` - User points tracking

**Required Odoo Endpoints:**
```
GET /api/gamification/badges?userId={id}
POST /api/gamification/badges/{id}/claim

GET /api/leaderboard?period=month&type=points
Response: { rank, position, points, badges: [...] }

GET /api/gamification/streaks/me
Response: { current, longest, lastActivityDate }
```

### 4.2 Discussions & Community

**Files:**
- `/src/app/api/discussions/**`
- `/src/app/api/study-groups/**`

**Required Odoo Module:** `seitech_social_learning` (Custom)

**Odoo Models Needed:**
- `seitech.discussion`
- `seitech.discussion_reply`
- `seitech.study_group`
- `seitech.study_group_member`

---

## Phase 5: Optimization & Polish (Feb-Mar)

### 5.1 Caching Strategy

**Files:**
- `/src/lib/api/optimized/batch-client.ts`
- `/src/lib/api/optimized/swr-config.ts`

**Implementation:**
- [ ] Batch API requests to reduce calls
- [ ] SWR cache configuration
- [ ] Cache invalidation on updates
- [ ] Session caching

### 5.2 Error Handling & Logging

**Files:**
- `/src/lib/api/error-handling.ts`

**Implementation:**
- [ ] Comprehensive error handling
- [ ] Error logging to Odoo (if available)
- [ ] User-friendly error messages
- [ ] Retry mechanisms

---

## Environment Variables Configuration

```bash
# CRITICAL - Must be set for production
NEXT_PUBLIC_ODOO_URL=https://odoo.seitechinternational.org.uk
ODOO_DATABASE=seitech_production
ODOO_ADMIN_USER=admin
ODOO_ADMIN_PASSWORD=<secure-password>

# Optional
NEXT_PUBLIC_ENABLE_DEMO_MODE=false  # Disable demo fallback
ODOO_API_TIMEOUT=30000
SESSION_TIMEOUT=1800000  # 30 minutes
ENABLE_ODOO_LOGGING=true
```

---

## Testing Checklist

### Authentication Tests
- [ ] Login with valid Odoo credentials
- [ ] Login with invalid credentials
- [ ] Register new user
- [ ] Session validation
- [ ] Logout and session clearing
- [ ] Password reset flow

### Course Tests
- [ ] List courses from Odoo
- [ ] Create course as instructor
- [ ] Update course details
- [ ] Delete course
- [ ] Search courses
- [ ] Access control (only owner can edit)

### Enrollment Tests
- [ ] Enroll in course
- [ ] Update progress
- [ ] Complete course
- [ ] Certificate generation
- [ ] Unenroll

### Admin Tests
- [ ] List users with filtering
- [ ] Create/edit/delete users
- [ ] Manage instructors
- [ ] Approve courses
- [ ] View analytics

---

## Odoo Backend Checklist

Before frontend can be fully integrated, verify Odoo has:

### API Endpoints
- [ ] `/api/auth/login`
- [ ] `/api/auth/register`
- [ ] `/api/auth/logout`
- [ ] `/api/auth/me`
- [ ] `/api/auth/forgot-password`
- [ ] `/api/auth/reset-password`

### Core Data Endpoints
- [ ] `/api/courses` (CRUD)
- [ ] `/api/enrollments` (CRUD)
- [ ] `/api/certificates`
- [ ] `/api/dashboard/stats`

### Custom Modules
- [ ] `seitech_cms` - Content management
- [ ] `seitech_gamification` - Badges, points, streaks
- [ ] `seitech_social_learning` - Discussions, study groups
- [ ] `seitech_learning_paths` - Learning paths
- [ ] `seitech_skills` - Skills management

### Database Fields
- [ ] `res.users.groups_id` - User roles/groups
- [ ] `res.partner.is_instructor` - Instructor flag
- [ ] `slide.channel.state` - Course publish state
- [ ] `slide.channel.price` - Course pricing
- [ ] `slide.channel.partner.progress` - Enrollment progress

---

## Success Criteria

By January 5:
- ✅ Landing page loads with real courses from Odoo
- ✅ Users can log in with Odoo credentials
- ✅ User dashboard shows real enrollment data
- ✅ All demo data removed from production

By January 20:
- ✅ Instructors can create/edit courses
- ✅ Students can enroll and track progress
- ✅ Certificates auto-generate on completion
- ✅ Admin panel fully functional

By March 1:
- ✅ All features integrated with Odoo
- ✅ Gamification system active
- ✅ CMS content manageable
- ✅ Performance optimized

---

**Created:** 2025-12-27
**Last Updated:** 2025-12-27
**Owner:** Development Team
