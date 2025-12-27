# Odoo ↔ Frontend API Alignment Specification

## Overview

This document defines the exact API contract between Odoo backend and Vercel frontend (Next.js).

**Deployment:**
- Odoo: `https://odoo.seitechinternational.org.uk` (Vultr)
- Frontend: `https://www.seitechinternational.org.uk` (Vercel)

**Frontend Location:** `/frontend/src/app/api/`
**Odoo Location:** `/custom_addons/seitech_elearning/controllers/`

---

## Authentication APIs

### 1. POST /api/auth/login
**Frontend Call:** `src/app/api/auth/login/route.ts:50`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 2,
      "email": "user@example.com",
      "name": "John Doe",
      "firstName": "John",
      "lastName": "Doe",
      "partnerId": 3,
      "phone": "+44123456789",
      "image": "/web/image/res.partner/3/image_128",
      "isInstructor": false,
      "enrollmentsCount": 2,
      "certificatesCount": 1,
      "role": "student",
      "permissions": [],
      "instructorId": null
    },
    "sessionToken": "abc123def456..."
  }
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null
}
```

**Odoo Implementation:**
- File: `controllers/auth_api.py:56`
- Method: `login()`
- Status: ✅ Already implemented

**Frontend Handling:**
- File: `/frontend/src/app/api/auth/login/route.ts`
- Current: ✅ Calls Odoo endpoint, falls back to demo
- Needed: Remove demo fallback for production

---

### 2. POST /api/auth/logout
**Frontend Call:** `src/lib/stores/auth-store.ts:86`

**Request:**
```
POST /api/auth/logout
(No body)
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

**Odoo Implementation:**
- File: `controllers/auth_api.py:180`
- Method: `logout()`
- Status: ✅ Already implemented

---

### 3. GET /api/auth/me
**Frontend Call:** `src/app/api/auth/me/route.ts`

**Request:**
```
GET /api/auth/me
Cookie: session_id=...
```

**Response (Authenticated):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "email": "user@example.com",
    "name": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "partnerId": 3,
    "phone": "+44123456789",
    "image": "/web/image/res.partner/3/image_128",
    "isInstructor": false,
    "enrollmentsCount": 2,
    "certificatesCount": 1,
    "role": "student",
    "permissions": [],
    "instructorId": null
  }
}
```

**Response (Not Authenticated):**
```json
{
  "success": false,
  "message": "Not authenticated",
  "data": null
}
```

**Odoo Implementation:**
- File: `controllers/auth_api.py:200`
- Method: `get_current_user()`
- Status: ✅ Already implemented

---

### 4. POST /api/auth/register
**Frontend Call:** `src/app/api/auth/register/route.ts:34`

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Registration successful. You can now log in.",
  "data": {
    "id": 5,
    "email": "jane@example.com",
    "name": "Jane Doe",
    "role": "student",
    "permissions": []
  }
}
```

**Response (Failure - Email exists):**
```json
{
  "success": false,
  "message": "An account with this email already exists",
  "data": null
}
```

**Odoo Implementation:**
- File: `controllers/auth_api.py:274`
- Method: `register()`
- Status: ✅ Already implemented

---

## Course APIs

### 5. GET /api/courses
**Frontend Call:** `src/app/api/courses/route.ts`

**Query Parameters:**
```
?limit=10&offset=0&order=create_date%20desc&search=python&category=1&level=beginner
```

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": 1,
        "name": "Python Basics",
        "slug": "python-basics",
        "description": "Learn Python programming from scratch",
        "shortDescription": "Python intro course",
        "imageUrl": "/web/image/slide.channel/1/image_1920",
        "thumbnailUrl": "/web/image/slide.channel/1/image_512",
        "listPrice": 99.99,
        "discountPrice": 79.99,
        "currency": "GBP",
        "categoryId": 1,
        "categoryName": "Programming",
        "deliveryMethod": "e-learning",
        "difficultyLevel": "beginner",
        "accreditation": null,
        "duration": 1800,
        "totalSlides": 24,
        "totalQuizzes": 4,
        "ratingAvg": 4.5,
        "ratingCount": 28,
        "enrollmentCount": 156,
        "instructorId": 3,
        "instructorName": "John Smith",
        "instructorAvatar": "/web/image/seitech.instructor/3/image",
        "outcomes": ["Learn Python", "Build applications"],
        "requirements": ["Basic computer knowledge"],
        "targetAudience": "Beginners",
        "metaTitle": "Python Basics",
        "metaDescription": "Learn Python programming",
        "keywords": ["python", "programming"],
        "isPublished": true,
        "isFeatured": false,
        "isPaid": true,
        "createdAt": "2025-01-01T10:00:00",
        "updatedAt": "2025-01-27T15:30:00"
      }
    ],
    "total": 125,
    "page": 1,
    "limit": 10
  }
}
```

**Odoo Implementation:**
- File: `controllers/course_api.py:63`
- Method: `get_courses()`
- Status: ✅ Already implemented

**Frontend Usage:**
- File: `/frontend/src/app/api/courses/route.ts`
- Current: Calls Odoo via OdooClient
- Status: ✅ Should work

---

### 6. GET /api/courses/{id}
**Frontend Call:** `src/app/api/courses/[id]/route.ts`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Python Basics",
    "description": "...",
    "content": "HTML content of course",
    "slides": [
      {
        "id": 1,
        "name": "Introduction",
        "isPreview": true,
        "duration": 120,
        "slideType": "document",
        "content": "<p>HTML content</p>",
        "videoUrl": null
      }
    ],
    "quizzes": [
      {
        "id": 1,
        "name": "Module 1 Quiz",
        "questions": 10
      }
    ],
    "userProgress": {
      "completedSlides": 5,
      "totalSlides": 24,
      "progress": 21,
      "lastAccessDate": "2025-01-27T10:00:00"
    }
  }
}
```

**Odoo Implementation:**
- File: `controllers/course_api.py` (need to verify/implement)
- Status: ⚠️ Needs verification

---

### 7. POST /api/courses (Create Course - Instructor)
**Frontend Call:** `src/components/features/admin/courses/...`

**Request:**
```json
{
  "name": "Advanced Python",
  "description": "...",
  "shortDescription": "...",
  "categoryId": 1,
  "listPrice": 199.99,
  "difficultyLevel": "advanced",
  "targetAudience": "Developers",
  "outcomes": ["..."],
  "requirements": ["Basic Python"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 125,
    "name": "Advanced Python",
    "slug": "advanced-python",
    "createdAt": "2025-01-27T12:00:00"
  }
}
```

**Odoo Implementation:**
- Status: ⚠️ Needs implementation
- Where: `controllers/course_api.py`
- Permission: Instructor or admin only

---

### 8. PUT /api/courses/{id} (Update Course)
**Frontend Call:** `src/components/features/admin/courses/...`

**Request:**
```json
{
  "name": "Advanced Python",
  "description": "...",
  "listPrice": 199.99
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course updated successfully"
}
```

**Odoo Implementation:**
- Status: ⚠️ Needs implementation
- Permission: Course owner or admin

---

### 9. DELETE /api/courses/{id}
**Frontend Call:** `src/components/features/admin/courses/...`

**Response:**
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

**Odoo Implementation:**
- Status: ⚠️ Needs implementation
- Permission: Admin only

---

### 10. GET /api/courses/slug/{slug}
**Frontend Call:** `src/app/api/courses/slug/[slug]/route.ts`

**Response:** Same as GET /api/courses/{id}

**Odoo Implementation:**
- Status: ⚠️ Needs verification

---

## Enrollment APIs

### 11. GET /api/enrollments
**Frontend Call:** `src/app/api/enrollments/route.ts`

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollments": [
      {
        "id": 1,
        "courseId": 1,
        "courseName": "Python Basics",
        "courseSlug": "python-basics",
        "courseImage": "/web/image/slide.channel/1/image_512",
        "state": "active",
        "progress": 45,
        "enrollmentDate": "2025-01-01T10:00:00",
        "completionDate": null,
        "lastAccessDate": "2025-01-27T14:30:00",
        "expirationDate": "2025-06-01T00:00:00",
        "totalTimeSpent": 3600
      }
    ]
  }
}
```

**Odoo Implementation:**
- Model: `seitech.enrollment`
- Status: ⚠️ Needs implementation
- File: Create `controllers/enrollment_api.py`

---

### 12. POST /api/enrollments (Enroll in Course)
**Frontend Call:** `src/app/(dashboard)/my-courses/page.tsx`

**Request:**
```json
{
  "courseId": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollmentId": 42,
    "courseId": 5,
    "state": "active",
    "progress": 0
  }
}
```

**Odoo Implementation:**
- Status: ⚠️ Needs implementation
- Permission: Authenticated users

---

### 13. PUT /api/enrollments/{id} (Update Progress)
**Frontend Call:** `src/components/course-player.tsx`

**Request:**
```json
{
  "progress": 50,
  "lastAccessDate": "2025-01-27T15:00:00",
  "completed": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Progress updated"
}
```

**Odoo Implementation:**
- Status: ⚠️ Needs implementation

---

## Certificate APIs

### 14. GET /api/certificates
**Frontend Call:** `src/app/(dashboard)/certificates/page.tsx`

**Response:**
```json
{
  "success": true,
  "data": {
    "certificates": [
      {
        "id": 1,
        "reference": "CERT-2025-001",
        "courseName": "Python Basics",
        "courseSlug": "python-basics",
        "issuedDate": "2025-01-27T10:00:00",
        "expiryDate": "2026-01-27T00:00:00",
        "downloadUrl": "/web/image/seitech.certificate/1/pdf_certificate",
        "verificationUrl": "/certificates/verify?ref=CERT-2025-001",
        "qrCode": "data:image/png;base64,...",
        "templateName": "Standard Certificate"
      }
    ]
  }
}
```

**Odoo Implementation:**
- Model: `seitech.certificate`
- Status: ⚠️ Needs implementation
- File: Create `controllers/certificate_api.py`

---

### 15. POST /api/certificates (Issue Certificate - System)
**Internal call (auto-generated on course completion)**

**Request:**
```json
{
  "userId": 2,
  "courseId": 1,
  "templateId": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "certificateId": 1,
    "reference": "CERT-2025-001"
  }
}
```

**Odoo Implementation:**
- Triggered: By enrollment completion (via cron or workflow)
- Status: ⚠️ Needs implementation

---

### 16. GET /api/certificates/{id}/download
**Frontend Call:** `src/app/(dashboard)/certificates/page.tsx`

**Response:** PDF file (binary)

**Odoo Implementation:**
- Status: ⚠️ Needs implementation
- Return: PDF binary with proper headers

---

## Dashboard APIs

### 17. GET /api/dashboard/stats
**Frontend Call:** `src/app/api/dashboard/stats/route.ts`

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalCourses": 5,
      "completedCourses": 2,
      "inProgressCourses": 3,
      "totalCertificates": 2,
      "totalPoints": 1250,
      "totalBadges": 8,
      "totalTimeSpent": 36000,
      "currentStreak": 5,
      "longestStreak": 12
    },
    "recentEnrollments": [
      {
        "courseId": 1,
        "courseName": "Python Basics",
        "progress": 45,
        "lastAccessDate": "2025-01-27T14:30:00"
      }
    ],
    "recentCertificates": [
      {
        "reference": "CERT-2025-001",
        "courseName": "Python Basics",
        "issuedDate": "2025-01-20T10:00:00"
      }
    ]
  }
}
```

**Odoo Implementation:**
- Status: ⚠️ Partially implemented (currently hardcoded demo data)
- File: `controllers/user_api.py` or new endpoint
- Current: `/frontend/src/app/api/dashboard/stats/route.ts:32-54` returns hardcoded data
- Needed: Replace with real Odoo queries

---

## Admin APIs

### 18. GET /api/admin/users
**Permission:** Admin only
**Frontend Call:** `src/components/features/admin/users/...`

**Query Parameters:**
```
?page=1&limit=10&search=john&role=student
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 2,
        "email": "john@example.com",
        "name": "John Doe",
        "role": "student",
        "createdAt": "2025-01-01T10:00:00",
        "enrollmentsCount": 3,
        "certificatesCount": 1
      }
    ],
    "total": 145,
    "page": 1,
    "limit": 10
  }
}
```

**Odoo Implementation:**
- Status: ⚠️ Needs implementation
- File: `controllers/admin_api.py`

---

### 19. POST /api/admin/users (Create User)
**Permission:** Admin only

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "email": "jane@example.com",
    "name": "Jane Smith",
    "role": "student"
  }
}
```

---

### 20. PUT /api/admin/users/{id}
**Permission:** Admin only (can edit own, admin can edit all)

**Request:**
```json
{
  "name": "Jane Smith",
  "role": "instructor"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully"
}
```

---

### 21. DELETE /api/admin/users/{id}
**Permission:** Admin only

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 22. GET /api/admin/courses
**Permission:** Admin/Manager

**Response:** List of all courses (published and draft)

**Odoo Implementation:**
- Status: ⚠️ Needs implementation

---

### 23. GET /api/admin/analytics/overview
**Permission:** Admin only
**Frontend Call:** `src/app/(admin)/admin/page.tsx`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 145,
    "totalCourses": 25,
    "totalEnrollments": 342,
    "totalRevenue": 45230.50,
    "averageRating": 4.3,
    "monthlyGrowth": 12.5,
    "enrollmentsByMonth": [
      { "month": "Jan", "count": 45 },
      { "month": "Feb", "count": 52 }
    ],
    "topCourses": [
      { "name": "Python Basics", "enrollments": 156 }
    ]
  }
}
```

**Odoo Implementation:**
- File: `controllers/admin_api.py`
- Status: ⚠️ Needs implementation

---

## Response Format Specification

**All successful responses:**
```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... }
}
```

**All error responses:**
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden (no permission)
- `404` - Not found
- `409` - Conflict (email exists, etc.)
- `500` - Server error

---

## CORS Configuration

**Required CORS Headers for all endpoints:**
```
Access-Control-Allow-Origin: https://www.seitechinternational.org.uk
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

**Implementation in Odoo:**
```python
def _json_response(self, data, status=200):
    return request.make_response(
        json.dumps(data),
        headers=[
            ('Content-Type', 'application/json'),
            ('Access-Control-Allow-Origin', 'https://www.seitechinternational.org.uk'),
            ('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'),
            ('Access-Control-Allow-Headers', 'Content-Type, Authorization'),
            ('Access-Control-Allow-Credentials', 'true'),
            ('Access-Control-Max-Age', '3600'),
        ],
        status=status
    )
```

---

## Testing Verification Script

**File:** `/odoo-api-test.sh`

```bash
#!/bin/bash

ODOO_URL="https://odoo.seitechinternational.org.uk"
ADMIN_EMAIL="admin@seitech.co.zw"
ADMIN_PASSWORD="admin"

echo "🧪 Testing Odoo Frontend API Alignment"
echo "======================================"

# Test 1: Login
echo "1️⃣  Testing POST /api/auth/login..."
LOGIN_RESPONSE=$(curl -s -X POST "$ODOO_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

echo "$LOGIN_RESPONSE" | jq .

SESSION_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.sessionToken')
echo "Session Token: $SESSION_TOKEN"

# Test 2: Get courses
echo ""
echo "2️⃣  Testing GET /api/courses..."
curl -s "$ODOO_URL/api/courses?limit=1" | jq .

# Test 3: Get current user
echo ""
echo "3️⃣  Testing GET /api/auth/me..."
curl -s "$ODOO_URL/api/auth/me" \
  -H "Cookie: session_id=$SESSION_TOKEN" | jq .

# Test 4: Get enrollments
echo ""
echo "4️⃣  Testing GET /api/enrollments..."
curl -s "$ODOO_URL/api/enrollments" \
  -H "Cookie: session_id=$SESSION_TOKEN" | jq .

# Test 5: Get dashboard stats
echo ""
echo "5️⃣  Testing GET /api/dashboard/stats..."
curl -s "$ODOO_URL/api/dashboard/stats" \
  -H "Cookie: session_id=$SESSION_TOKEN" | jq .

echo ""
echo "✅ API Testing Complete"
```

---

## Implementation Priority

### 🔴 Critical (Must have by Jan 5)
1. ✅ POST /api/auth/login
2. ✅ GET /api/auth/me
3. ✅ POST /api/auth/logout
4. ✅ POST /api/auth/register
5. ✅ GET /api/courses (list)
6. 🟠 GET /api/dashboard/stats (currently hardcoded)
7. 🟠 GET /api/enrollments

### 🟠 High Priority (Before Jan 15)
8. POST /api/enrollments
9. GET /api/certificates
10. GET /api/admin/users
11. GET /api/admin/courses
12. POST /api/courses (instructor)

### 🟡 Medium Priority (Before Feb)
13. PUT /api/courses/{id}
14. DELETE /api/courses/{id}
15. PUT /api/enrollments/{id}
16. POST /api/certificates
17. GET /api/admin/analytics/overview

### 🟢 Lower Priority (Before Mar)
18. GET /api/courses/{id}
19. GET /api/courses/slug/{slug}
20. PUT /api/admin/users/{id}
21. DELETE /api/admin/users/{id}

---

**Document Version:** 1.0
**Last Updated:** 2025-12-27
**Status:** Ready for implementation
