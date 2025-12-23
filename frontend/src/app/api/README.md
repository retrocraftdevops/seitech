# SEI Tech API Routes Documentation

This directory contains all Next.js API routes for the SEI Tech frontend application. All routes connect to the Odoo backend using the `OdooClient` from `/src/lib/api/odoo-client.ts`.

## Table of Contents

- [Courses](#courses)
- [Categories](#categories)
- [Enrollments](#enrollments)
- [Certificates](#certificates)
- [Authentication](#authentication)
- [Contact](#contact)
- [Consultation](#consultation)
- [Cart](#cart)
- [SEO](#seo)

---

## Courses

### GET /api/courses

Fetch courses with filtering, pagination, and sorting.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 12, max: 100) - Items per page
- `category` (string) - Filter by category slug
- `level` (string) - Filter by difficulty level: `beginner`, `intermediate`, `advanced`
- `delivery` (string) - Filter by delivery method: `e-learning`, `face-to-face`, `virtual`, `in-house`
- `accreditation` (string) - Filter by accreditation: `IOSH`, `Qualsafe`, `NEBOSH`, `ProQual`, `CPD`
- `priceMin` (number) - Minimum price filter
- `priceMax` (number) - Maximum price filter
- `rating` (number, 1-5) - Minimum rating filter
- `search` (string) - Search by course name
- `sortBy` (string, default: popularity) - Sort order: `popularity`, `price-asc`, `price-desc`, `rating`, `newest`

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [...],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 50,
      "totalPages": 5
    },
    "categories": [...],
    "filters": {
      "levels": ["beginner", "intermediate", "advanced"],
      "deliveryMethods": ["e-learning", "face-to-face", "virtual", "in-house"],
      "accreditations": ["IOSH", "Qualsafe", "NEBOSH", "ProQual", "CPD"],
      "priceRange": { "min": 0, "max": 5000 }
    }
  }
}
```

### GET /api/courses/[id]

Fetch detailed information about a single course.

**Path Parameters:**
- `id` (number) - Course ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Course Name",
    "slug": "course-slug",
    "description": "...",
    "curriculum": [...],
    "faqs": [...],
    ...
  }
}
```

---

## Categories

### GET /api/categories

Fetch all course categories in a tree structure.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Category Name",
      "slug": "category-slug",
      "description": "...",
      "courseCount": 10,
      "children": [...]
    }
  ]
}
```

---

## Enrollments

### GET /api/enrollments

Fetch all enrollments for the current user.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "courseId": 5,
      "courseName": "Course Name",
      "state": "active",
      "progress": 45,
      "enrollmentDate": "2024-01-01T00:00:00Z",
      ...
    }
  ]
}
```

### POST /api/enrollments

Enroll the current user in a course.

**Authentication:** Required

**Request Body:**
```json
{
  "courseId": 5,
  "userId": 123 // Optional, defaults to current user
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully enrolled in course",
  "data": {
    "id": 10,
    "courseId": 5,
    "state": "pending",
    ...
  }
}
```

---

## Certificates

### GET /api/certificates

Fetch all certificates for the current user.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reference": "CERT-12345",
      "courseName": "Course Name",
      "issuedDate": "2024-01-01T00:00:00Z",
      "downloadUrl": "...",
      "verificationUrl": "...",
      ...
    }
  ]
}
```

### POST /api/certificates/verify

Verify a certificate by its reference number.

**Request Body:**
```json
{
  "reference": "CERT-12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate is valid",
  "data": {
    "id": 1,
    "reference": "CERT-12345",
    "courseName": "Course Name",
    "holderName": "John Doe",
    "holderEmail": "john@example.com",
    ...
  }
}
```

---

## Authentication

### POST /api/auth/login

Authenticate a user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    ...
  }
}
```

### POST /api/auth/logout

Log out the current user.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+44 123 456 7890", // Optional
  "companyName": "Company Ltd", // Optional
  "jobTitle": "Safety Officer" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": 123,
    "email": "john@example.com",
    "name": "John Doe",
    ...
  }
}
```

### GET /api/auth/me

Get the current authenticated user's profile and data.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "john@example.com",
    "name": "John Doe",
    "enrollments": [...],
    "certificates": [...],
    "totalPoints": 500,
    "level": "Advanced",
    ...
  }
}
```

---

## Contact

### POST /api/contact

Submit a contact form.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+44 123 456 7890", // Optional
  "subject": "Inquiry about courses",
  "message": "I would like to know more about..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for contacting us. We will get back to you shortly.",
  "data": {
    "id": 456
  }
}
```

---

## Consultation

### POST /api/consultation

Request a free consultation.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+44 123 456 7890",
  "companyName": "Company Ltd", // Optional
  "serviceInterested": ["fire-risk-assessment", "health-safety-audit"],
  "message": "We need help with...",
  "preferredContact": "email", // "email" or "phone"
  "preferredTime": "Morning" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for requesting a free consultation. Our team will contact you shortly.",
  "data": {
    "id": 789
  }
}
```

---

## Cart

### GET /api/cart

Fetch the current user's shopping cart.

**Authentication:** Required (returns empty cart for guests)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "courseId": 5,
        "courseName": "Course Name",
        "price": 299.99,
        "quantity": 1,
        "subtotal": 299.99
      }
    ],
    "subtotal": 299.99,
    "tax": 59.99,
    "total": 359.98,
    "itemCount": 1
  }
}
```

### POST /api/cart

Add an item to the cart.

**Authentication:** Required

**Request Body:**
```json
{
  "courseId": 5,
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "orderId": 123,
    "itemCount": 2,
    "total": 599.98
  }
}
```

### POST /api/cart/sync

Sync local cart items with the server (useful after login).

**Authentication:** Required

**Request Body:**
```json
{
  "items": [
    {
      "courseId": 5,
      "quantity": 1
    },
    {
      "courseId": 8,
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart synced successfully",
  "data": {
    "orderId": 123,
    "itemCount": 3,
    "total": 899.97,
    "synced": 2
  }
}
```

---

## SEO

### GET /api/sitemap

Generate dynamic XML sitemap for search engines.

**Response:** XML sitemap with all courses, categories, and static pages.

**Content-Type:** `application/xml`

### GET /api/robots

Generate robots.txt file for search engine crawlers.

**Response:** robots.txt content

**Content-Type:** `text/plain`

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error message description",
  "data": null
}
```

### Common HTTP Status Codes

- **200 OK** - Successful GET request
- **201 Created** - Successful POST request that created a resource
- **400 Bad Request** - Invalid request data (validation error)
- **401 Unauthorized** - Authentication required or invalid credentials
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

---

## Authentication

Routes marked with **Authentication: Required** need a valid Odoo session. The session is managed automatically by the `OdooClient` using HTTP-only cookies set by the Odoo backend.

To authenticate:
1. Call `POST /api/auth/login` with valid credentials
2. The Odoo session will be stored in cookies
3. Subsequent requests will automatically include the session

To log out:
1. Call `POST /api/auth/logout`
2. The session will be destroyed

---

## Validation

All endpoints use Zod schemas for input validation. Invalid requests will return a 400 error with a descriptive message.

---

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_ODOO_URL` - Odoo backend URL
- `ODOO_DATABASE` - Odoo database name
- `NEXT_PUBLIC_SITE_URL` - Frontend site URL (for sitemap generation)

---

## Notes

- All date/time fields are in ISO 8601 format
- All prices are in the course's currency (default: GBP)
- Binary data (images) is returned as base64-encoded data URIs
- Pagination is zero-indexed (page 1 is the first page)
- The Odoo backend must have the eLearning module installed

---

## Development

To test these endpoints during development:

```bash
# Start the Next.js development server
npm run dev

# Make requests to http://localhost:3000/api/...
curl http://localhost:3000/api/courses?limit=5
```

---

## Support

For issues or questions, please contact the development team or refer to the main project documentation.
