# SEI Tech International - Frontend Specifications

## Document Version: 1.0
## Date: December 2025
## Project: Next.js/React Hybrid Frontend with Odoo Backend

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Business Requirements](#business-requirements)
4. [Technical Architecture](#technical-architecture)
5. [Design System](#design-system)
6. [Page Structure & Navigation](#page-structure--navigation)
7. [Component Library](#component-library)
8. [API Integration Layer](#api-integration-layer)
9. [Content Migration Plan](#content-migration-plan)
10. [Deployment Strategy](#deployment-strategy)
11. [Performance & SEO Requirements](#performance--seo-requirements)

---

## 1. Executive Summary

### Project Goal
Build a world-class, hybrid Next.js/React frontend for SEI Tech International that:
- Provides seamless user experience connecting to the Odoo 19.0 backend
- Equally showcases both **Training** and **Consultancy** services
- Offers comprehensive navigation with mega menus
- Follows modern enterprise aesthetics inspired by ensemble.africa
- Supports multiple training delivery methods (E-learning, Face-to-face, Virtual Learning)
- Displays accreditations prominently

### Key Deliverables
- Comprehensive Next.js 14+ application with App Router
- Robust API integration layer with Odoo
- Full page suite with mega menu navigation
- Mobile-responsive design
- SEO-optimized pages
- Vercel-ready deployment configuration

---

## 2. Project Overview

### Company Profile
- **Name:** SEI Tech International
- **Tagline:** "See the Risks. Secure the Workplace"
- **Location:** Park Street, Ashford, Kent TN24 8DF
- **Contact:** +44 1233 438817 | info@seitechinternational.org.uk

### Two Core Service Pillars (Equal Importance)

#### Pillar 1: Training Services
- **E-Learning:** Self-paced online courses
- **Face-to-Face:** Classroom training at venues/client sites
- **Virtual Learning:** Live online sessions via Zoom/Teams
- **Accredited Training:** IOSH, Qualsafe, NEBOSH approved courses

#### Pillar 2: Consultancy Services
- Fire Risk Assessments
- Health & Safety GAP Audits
- Risk Assessment Services
- Face Fit Testing (RPE)
- Site Inspections
- DSE Assessments
- ISO Management (45001, 14001, 9001)
- Workplace Audits
- Legionella Risk Assessments
- Policy & Procedure Writing

### Accreditations & Partnerships
- IOSH (Institution of Occupational Safety & Health)
- Qualsafe Awards
- NEBOSH (National Examination Board in Occupational Safety and Health)
- ISO Standards Consulting (45001, 14001, 9001)
- UK HSE Compliance

---

## 3. Business Requirements

### 3.1 Primary Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| BR-01 | Equal visibility for Training & Consultancy on landing page | Critical |
| BR-02 | Training courses grouped by delivery method | Critical |
| BR-03 | Mega menu navigation with comprehensive structure | High |
| BR-04 | Prominent accreditation display | High |
| BR-05 | Course filtering by category, delivery method, accreditation | High |
| BR-06 | Seamless checkout flow for course purchases | Critical |
| BR-07 | Student learning dashboard integration | High |
| BR-08 | Mobile-responsive design | Critical |
| BR-09 | Fast page load times (<3s) | High |
| BR-10 | SEO optimization for all pages | High |

### 3.2 Reference Website Inspirations

| Website | Key Learnings |
|---------|---------------|
| lighthousesafety.co.uk | Balanced training/consultancy presentation, trending courses grid, testimonials carousel |
| phoenixhsc.co.uk | Four learning modality cards, pass pledge, Trustpilot integration, course catalog structure |
| britsafe.org | Course finder dropdown, virtual/online/classroom delivery presentation, audit & consultancy section |
| ensemble.africa | Card-based architecture, modern SaaS aesthetics, color system, hover states, image treatment |

### 3.3 Design Reference
Follow ensemble.africa design patterns:
- Card-based modular components
- Teal/cyan primary color palette
- Clean typography hierarchy
- Subtle hover animations
- High-quality imagery with gradient overlays
- Professional enterprise aesthetics

---

## 4. Technical Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js 14+ Frontend (Vercel)                │  │
│  │  • App Router with Server Components                      │  │
│  │  • React 18+ with TypeScript                              │  │
│  │  • Tailwind CSS + Framer Motion                           │  │
│  │  • SWR/React Query for data fetching                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Next.js API Routes (Middleware)                 │  │
│  │  • Authentication handling                                │  │
│  │  • Request transformation                                 │  │
│  │  • Response caching                                       │  │
│  │  • Rate limiting                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ JSON-RPC / REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER (Vultr)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Odoo 19.0 Enterprise                         │  │
│  │  • seitech_elearning module                               │  │
│  │  • seitech_base module                                    │  │
│  │  • seitech_website_theme module                           │  │
│  │  • Payment integration (Stripe, etc.)                     │  │
│  │  • PostgreSQL database                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Technology Stack

#### Frontend (Vercel)
```
Framework:        Next.js 14.x (App Router)
Language:         TypeScript 5.x
Styling:          Tailwind CSS 3.4+
Animations:       Framer Motion 11.x
State Management: Zustand / React Context
Data Fetching:    SWR / TanStack Query
Forms:            React Hook Form + Zod
Icons:            Lucide React
UI Components:    Radix UI primitives
Image CDN:        Next.js Image + Cloudinary/Vercel
```

#### Backend (Vultr)
```
Framework:        Odoo 19.0 Enterprise
Language:         Python 3.12
Database:         PostgreSQL 15+
Cache:            Redis
Queue:            Celery
Container:        Docker
```

### 4.3 Project Structure

```
seitech-frontend/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Marketing pages group
│   │   ├── page.tsx              # Homepage
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   └── accreditations/
│   │       └── page.tsx
│   │
│   ├── (training)/               # Training pages group
│   │   ├── courses/
│   │   │   ├── page.tsx          # Course listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Course detail
│   │   ├── e-learning/
│   │   │   └── page.tsx
│   │   ├── face-to-face/
│   │   │   └── page.tsx
│   │   ├── virtual-learning/
│   │   │   └── page.tsx
│   │   ├── schedules/
│   │   │   └── page.tsx
│   │   └── categories/
│   │       └── [slug]/
│   │           └── page.tsx
│   │
│   ├── (consultancy)/            # Consultancy pages group
│   │   ├── services/
│   │   │   ├── page.tsx          # Services overview
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Service detail
│   │   ├── fire-risk-assessment/
│   │   ├── health-safety-audit/
│   │   ├── iso-management/
│   │   └── free-consultation/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/              # User dashboard group
│   │   ├── my-learning/
│   │   │   └── page.tsx
│   │   ├── my-courses/
│   │   │   └── page.tsx
│   │   ├── certificates/
│   │   │   └── page.tsx
│   │   ├── achievements/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   │
│   ├── (commerce)/               # E-commerce group
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   ├── checkout/
│   │   │   └── page.tsx
│   │   └── orders/
│   │       └── page.tsx
│   │
│   ├── (auth)/                   # Authentication group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   │
│   ├── blog/                     # Blog section
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── enrollments/
│   │   ├── certificates/
│   │   └── contact/
│   │
│   ├── layout.tsx                # Root layout
│   ├── not-found.tsx
│   └── error.tsx
│
├── components/                    # Shared components
│   ├── ui/                       # Base UI components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Badge/
│   │   ├── Modal/
│   │   └── ...
│   │
│   ├── layout/                   # Layout components
│   │   ├── Header/
│   │   │   ├── MegaMenu.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── Footer/
│   │   └── Sidebar/
│   │
│   ├── sections/                 # Page sections
│   │   ├── Hero/
│   │   ├── ServicesOverview/
│   │   ├── TrainingMethods/
│   │   ├── CourseGrid/
│   │   ├── Testimonials/
│   │   ├── Accreditations/
│   │   ├── Statistics/
│   │   ├── CTABanner/
│   │   └── Newsletter/
│   │
│   ├── courses/                  # Course-specific components
│   │   ├── CourseCard/
│   │   ├── CourseFilter/
│   │   ├── CoursePlayer/
│   │   └── CourseProgress/
│   │
│   ├── consultancy/              # Consultancy components
│   │   ├── ServiceCard/
│   │   ├── ConsultationForm/
│   │   └── ServiceFeatures/
│   │
│   └── forms/                    # Form components
│       ├── ContactForm/
│       ├── EnquiryForm/
│       └── BookingForm/
│
├── lib/                          # Utility libraries
│   ├── api/
│   │   ├── odoo-client.ts        # Odoo API client
│   │   ├── courses.ts            # Course API functions
│   │   ├── enrollments.ts        # Enrollment API functions
│   │   ├── services.ts           # Consultancy services API
│   │   └── auth.ts               # Authentication functions
│   │
│   ├── utils/
│   │   ├── cn.ts                 # Class name utility
│   │   ├── formatters.ts         # Date, currency formatters
│   │   └── validators.ts         # Form validators
│   │
│   └── hooks/                    # Custom hooks
│       ├── useCourses.ts
│       ├── useAuth.ts
│       └── useCart.ts
│
├── types/                        # TypeScript types
│   ├── course.ts
│   ├── enrollment.ts
│   ├── service.ts
│   └── user.ts
│
├── styles/                       # Global styles
│   └── globals.css
│
├── public/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── logos/
│
├── config/                       # Configuration
│   ├── site.ts                   # Site metadata
│   ├── navigation.ts             # Navigation structure
│   └── services.ts               # Services data
│
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

---

## 5. Design System

### 5.1 Color Palette

Based on ensemble.africa aesthetics and SEI Tech branding:

```css
/* Primary Colors */
--primary-50:  #f0f9ff;
--primary-100: #e0f2fe;
--primary-200: #bae6fd;
--primary-300: #7dd3fc;
--primary-400: #38bdf8;
--primary-500: #0ea5e9;   /* Primary */
--primary-600: #0284c7;   /* Primary Dark */
--primary-700: #0369a1;
--primary-800: #075985;
--primary-900: #0c4a6e;

/* Secondary Colors (Teal) */
--secondary-50:  #f0fdfa;
--secondary-100: #ccfbf1;
--secondary-200: #99f6e4;
--secondary-300: #5eead4;
--secondary-400: #2dd4bf;
--secondary-500: #14b8a6;  /* Secondary */
--secondary-600: #0d9488;  /* Secondary Dark */
--secondary-700: #0f766e;
--secondary-800: #115e59;
--secondary-900: #134e4a;

/* Accent Colors */
--accent-orange: #f97316;
--accent-green:  #22c55e;
--accent-red:    #ef4444;
--accent-purple: #a855f7;

/* Neutral Colors */
--gray-50:  #f8fafc;
--gray-100: #f1f5f9;
--gray-200: #e2e8f0;
--gray-300: #cbd5e1;
--gray-400: #94a3b8;
--gray-500: #64748b;
--gray-600: #475569;
--gray-700: #334155;
--gray-800: #1e293b;
--gray-900: #0f172a;

/* Surface Colors */
--surface:     #ffffff;
--surface-alt: #f8fafc;
--surface-dark: #0f172a;
```

### 5.2 Typography

```css
/* Font Family */
--font-sans: 'Inter', system-ui, sans-serif;
--font-display: 'Plus Jakarta Sans', sans-serif;

/* Font Sizes */
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
--text-5xl:  3rem;      /* 48px */
--text-6xl:  3.75rem;   /* 60px */

/* Font Weights */
--font-normal:   400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;
```

### 5.3 Spacing & Layout

```css
/* Spacing Scale */
--space-1:  0.25rem;   /* 4px */
--space-2:  0.5rem;    /* 8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-5:  1.25rem;   /* 20px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */

/* Container Widths */
--container-sm:  640px;
--container-md:  768px;
--container-lg:  1024px;
--container-xl:  1280px;
--container-2xl: 1536px;
--container-max: 1400px;

/* Border Radius */
--radius-sm:   0.25rem;  /* 4px */
--radius-md:   0.375rem; /* 6px */
--radius-lg:   0.5rem;   /* 8px */
--radius-xl:   0.75rem;  /* 12px */
--radius-2xl:  1rem;     /* 16px */
--radius-3xl:  1.5rem;   /* 24px */
--radius-full: 9999px;
```

### 5.4 Component Design Patterns

#### Cards
```tsx
// Standard Card Pattern
<div className="
  bg-white
  rounded-2xl
  border border-gray-100
  shadow-sm
  hover:shadow-lg
  hover:border-primary-200
  transition-all
  duration-300
">
  {/* Card Content */}
</div>
```

#### Buttons
```tsx
// Primary Button
<button className="
  bg-primary-600
  hover:bg-primary-700
  text-white
  font-semibold
  px-6 py-3
  rounded-xl
  transition-colors
  duration-200
  inline-flex items-center gap-2
">
  Get Started <ArrowRight className="w-4 h-4" />
</button>

// Secondary Button
<button className="
  bg-white
  border border-gray-200
  hover:border-primary-300
  hover:bg-primary-50
  text-gray-700
  font-medium
  px-6 py-3
  rounded-xl
  transition-all
  duration-200
">
  Learn More
</button>
```

#### Section Layout
```tsx
// Alternating Sections
<section className="py-20 lg:py-28 bg-white">
  <div className="container mx-auto px-4 max-w-7xl">
    {/* Content */}
  </div>
</section>

<section className="py-20 lg:py-28 bg-gray-50">
  <div className="container mx-auto px-4 max-w-7xl">
    {/* Content */}
  </div>
</section>
```

---

## 6. Page Structure & Navigation

### 6.1 Mega Menu Structure

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ LOGO    │ Training ▼ │ Consultancy ▼ │ About │ Blog │ Contact │ 🔍 │ Login │ 🛒 │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌─ TRAINING MEGA MENU ──────────────────────────────────────────────────────┐ │
│  │                                                                           │ │
│  │  BY DELIVERY METHOD           BY ACCREDITATION         POPULAR COURSES   │ │
│  │  ──────────────────           ───────────────────      ────────────────   │ │
│  │  🖥️ E-Learning                 IOSH Courses            Fire Warden        │ │
│  │  👥 Face-to-Face Training     Qualsafe Courses        Manual Handling    │ │
│  │  💻 Virtual Classroom          NEBOSH Courses          Risk Assessment   │ │
│  │  🏢 In-House Training          ProQual NVQ             First Aid         │ │
│  │                                                                           │ │
│  │  BY CATEGORY                  QUICK LINKS                                │ │
│  │  ──────────────               ────────────                               │ │
│  │  Health & Safety              📅 Upcoming Schedules                       │ │
│  │  Fire Safety                  🎓 All Courses                             │ │
│  │  First Aid                    📜 Certificates                            │ │
│  │  Mental Health                💼 Corporate Training                      │ │
│  │  Environmental                                                           │ │
│  │                                                                           │ │
│  │  [View All Courses →]         [Book Free Consultation →]                 │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌─ CONSULTANCY MEGA MENU ───────────────────────────────────────────────────┐ │
│  │                                                                           │ │
│  │  COMPLIANCE SERVICES          ISO MANAGEMENT           WHY CHOOSE US     │ │
│  │  ───────────────────          ──────────────           ─────────────     │ │
│  │  🔥 Fire Risk Assessment       ISO 45001 (H&S)          ✓ Accredited     │ │
│  │  📋 Health & Safety Audit     ISO 14001 (Env)          ✓ Experienced    │ │
│  │  ⚠️ Risk Assessment            ISO 9001 (Quality)       ✓ UK Nationwide  │ │
│  │  😷 Face Fit Testing                                    ✓ Competitive    │ │
│  │  🔍 Site Inspections          SPECIALIST SERVICES                        │ │
│  │  💻 DSE Assessments            ───────────────────                        │ │
│  │  💧 Legionella Assessment     Policy Writing                             │ │
│  │  📊 Workplace Audits           Compliance Support                        │ │
│  │                                                                           │ │
│  │  [All Services →]             [Request Free Consultation →]              │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Complete Site Map

```
SEI Tech International
│
├── Home (/)
│   ├── Hero Section (Training + Consultancy equal)
│   ├── Services Overview (2-column: Training | Consultancy)
│   ├── Training Delivery Methods (4 cards)
│   ├── Trending Courses Grid
│   ├── Consultancy Services Grid
│   ├── Accreditations Banner
│   ├── Statistics Section
│   ├── Testimonials Carousel
│   ├── Latest Blog Posts
│   ├── Newsletter Signup
│   └── CTA Section
│
├── Training Section
│   ├── All Courses (/courses)
│   │   ├── Course Filters
│   │   ├── Course Grid/List View
│   │   └── Pagination
│   │
│   ├── Course Detail (/courses/[slug])
│   │   ├── Course Header
│   │   ├── Overview Tab
│   │   ├── Curriculum Tab
│   │   ├── Reviews Tab
│   │   ├── FAQs Tab
│   │   ├── Instructor Info
│   │   └── Enrollment CTA
│   │
│   ├── By Delivery Method
│   │   ├── E-Learning (/e-learning)
│   │   ├── Face-to-Face (/face-to-face)
│   │   ├── Virtual Classroom (/virtual-learning)
│   │   └── In-House Training (/in-house-training)
│   │
│   ├── By Accreditation
│   │   ├── IOSH Courses (/iosh-courses)
│   │   ├── Qualsafe Courses (/qualsafe-courses)
│   │   ├── NEBOSH Courses (/nebosh-courses)
│   │   └── NVQ Qualifications (/nvq-qualifications)
│   │
│   ├── By Category
│   │   ├── Health & Safety (/categories/health-safety)
│   │   ├── Fire Safety (/categories/fire-safety)
│   │   ├── First Aid (/categories/first-aid)
│   │   ├── Mental Health (/categories/mental-health)
│   │   └── Environmental (/categories/environmental)
│   │
│   └── Training Schedules (/schedules)
│       └── Calendar View
│
├── Consultancy Section
│   ├── Services Overview (/services)
│   │
│   ├── Individual Services
│   │   ├── Fire Risk Assessment (/services/fire-risk-assessment)
│   │   ├── Health & Safety Audit (/services/health-safety-audit)
│   │   ├── Risk Assessment (/services/risk-assessment)
│   │   ├── Face Fit Testing (/services/face-fit-testing)
│   │   ├── Site Inspections (/services/site-inspections)
│   │   ├── DSE Assessments (/services/dse-assessments)
│   │   ├── Legionella Assessment (/services/legionella-assessment)
│   │   └── Workplace Audits (/services/workplace-audits)
│   │
│   ├── ISO Management (/services/iso-management)
│   │   ├── ISO 45001 (/services/iso-45001)
│   │   ├── ISO 14001 (/services/iso-14001)
│   │   └── ISO 9001 (/services/iso-9001)
│   │
│   └── Free Consultation (/free-consultation)
│
├── About Section
│   ├── About Us (/about)
│   ├── Our Team (/about/team)
│   ├── Accreditations (/about/accreditations)
│   ├── Testimonials (/about/testimonials)
│   └── Careers (/about/careers)
│
├── Resources
│   ├── Blog (/blog)
│   │   └── Blog Post (/blog/[slug])
│   ├── Resources Library (/resources)
│   └── FAQs (/faqs)
│
├── User Dashboard (Authenticated)
│   ├── My Learning (/dashboard)
│   ├── My Courses (/dashboard/courses)
│   │   └── Course Player (/dashboard/courses/[id]/learn)
│   ├── My Certificates (/dashboard/certificates)
│   ├── Achievements (/dashboard/achievements)
│   ├── Profile (/dashboard/profile)
│   └── Orders (/dashboard/orders)
│
├── Commerce
│   ├── Shopping Cart (/cart)
│   ├── Checkout (/checkout)
│   └── Order Confirmation (/checkout/confirmation)
│
├── Authentication
│   ├── Login (/login)
│   ├── Register (/register)
│   └── Reset Password (/forgot-password)
│
└── Legal & Info
    ├── Contact (/contact)
    ├── Terms & Conditions (/terms)
    ├── Privacy Policy (/privacy)
    ├── Cookie Policy (/cookies)
    └── Accessibility (/accessibility)
```

### 6.3 Page Templates

#### Homepage Sections Order
1. Hero Section (dual CTA for Training + Consultancy)
2. Trusted By / Client Logos
3. Services Overview (2-column split)
4. Training Delivery Methods (4 cards)
5. Trending Courses (6-card grid)
6. Consultancy Services (4-card grid)
7. Accreditations Bar
8. Statistics Counter
9. Testimonials Carousel
10. Latest Blog Posts
11. Newsletter Signup
12. CTA Banner

---

## 7. Component Library

### 7.1 Core UI Components

| Component | Description |
|-----------|-------------|
| `Button` | Primary, secondary, ghost, outline variants |
| `Card` | Standard, hover, featured variants |
| `Badge` | Status, category, accreditation badges |
| `Input` | Text, email, tel, textarea with validation |
| `Select` | Dropdown with search capability |
| `Checkbox` | Standard and custom styled |
| `Radio` | Radio button groups |
| `Modal` | Dialog, drawer variants |
| `Toast` | Success, error, warning notifications |
| `Skeleton` | Loading placeholders |
| `Avatar` | User/instructor avatars |
| `Rating` | Star rating display and input |
| `Progress` | Progress bars and circles |
| `Tabs` | Horizontal and vertical tabs |
| `Accordion` | FAQ and content accordions |
| `Breadcrumb` | Navigation breadcrumbs |
| `Pagination` | Page navigation |

### 7.2 Section Components

| Component | Description |
|-----------|-------------|
| `HeroSection` | Full-width hero with CTA buttons |
| `ServicesOverview` | Two-column training/consultancy split |
| `TrainingMethodsGrid` | Four delivery method cards |
| `CourseGrid` | Responsive course card grid |
| `ServiceGrid` | Consultancy service cards |
| `AccreditationBar` | Logo carousel of accreditations |
| `TestimonialCarousel` | Client testimonial slider |
| `StatisticsCounter` | Animated number counters |
| `CTASection` | Call-to-action banner |
| `NewsletterSignup` | Email capture form |
| `BlogGrid` | Blog post card grid |
| `TrustIndicators` | Client logos, reviews, badges |

### 7.3 Course Components

| Component | Description |
|-----------|-------------|
| `CourseCard` | Course preview card |
| `CourseFilters` | Category, price, level filters |
| `CourseSearch` | Search with autocomplete |
| `CourseHero` | Course detail page header |
| `CourseCurriculum` | Expandable curriculum list |
| `CourseReviews` | Reviews section with ratings |
| `CourseFAQ` | Course-specific FAQs |
| `CourseInstructor` | Instructor profile card |
| `CoursePricing` | Price card with enrollment CTA |
| `CourseProgress` | Progress tracker for dashboard |
| `CoursePlayer` | Video/content player |

### 7.4 Consultancy Components

| Component | Description |
|-----------|-------------|
| `ServiceCard` | Service overview card |
| `ServiceHero` | Service detail page header |
| `ServiceFeatures` | Feature list with icons |
| `ConsultationForm` | Free consultation request |
| `QuoteCalculator` | Service quote builder |
| `ISOServiceCard` | ISO-specific service card |

### 7.5 Layout Components

| Component | Description |
|-----------|-------------|
| `Header` | Main navigation header |
| `MegaMenu` | Full-featured mega menu |
| `MobileNav` | Mobile navigation drawer |
| `Footer` | Site footer with links |
| `Sidebar` | Dashboard/filter sidebar |
| `Container` | Max-width container |
| `Section` | Consistent section wrapper |

---

## 8. API Integration Layer

### 8.1 Odoo API Client

```typescript
// lib/api/odoo-client.ts

interface OdooConfig {
  baseUrl: string;
  database: string;
}

class OdooClient {
  private baseUrl: string;
  private database: string;
  private sessionId: string | null = null;

  constructor(config: OdooConfig) {
    this.baseUrl = config.baseUrl;
    this.database = config.database;
  }

  // Authentication
  async authenticate(email: string, password: string): Promise<AuthResponse>;
  async logout(): Promise<void>;
  async getCurrentUser(): Promise<User>;

  // JSON-RPC Call
  async call(model: string, method: string, args: any[]): Promise<any>;

  // Search & Read
  async searchRead<T>(
    model: string,
    domain: Domain[],
    fields: string[],
    options?: SearchOptions
  ): Promise<T[]>;

  // CRUD Operations
  async create(model: string, values: Record<string, any>): Promise<number>;
  async read(model: string, ids: number[], fields: string[]): Promise<any[]>;
  async write(model: string, ids: number[], values: Record<string, any>): Promise<boolean>;
  async unlink(model: string, ids: number[]): Promise<boolean>;
}
```

### 8.2 API Endpoints Mapping

| Frontend Route | Odoo Model | Method |
|----------------|------------|--------|
| `GET /api/courses` | `slide.channel` | `search_read` |
| `GET /api/courses/[id]` | `slide.channel` | `read` |
| `GET /api/categories` | `course.category` | `search_read` |
| `POST /api/enrollments` | `seitech.enrollment` | `create` |
| `GET /api/enrollments/mine` | `seitech.enrollment` | `search_read` |
| `POST /api/cart/add` | `sale.order` | `add_to_cart` |
| `GET /api/cart` | `sale.order` | `get_cart` |
| `POST /api/checkout` | `sale.order` | `action_confirm` |
| `GET /api/certificates` | `seitech.certificate` | `search_read` |
| `POST /api/progress` | `seitech.video.progress` | `update_progress` |
| `GET /api/services` | `compliance.service` | `search_read` |
| `POST /api/consultation` | `crm.lead` | `create` |
| `POST /api/auth/login` | `res.users` | `authenticate` |
| `POST /api/auth/register` | `res.users` | `signup` |

### 8.3 Data Fetching Patterns

```typescript
// Server Component Data Fetching
// app/courses/page.tsx

import { getCourses } from '@/lib/api/courses';

export default async function CoursesPage({ searchParams }) {
  const courses = await getCourses({
    category: searchParams.category,
    level: searchParams.level,
    delivery: searchParams.delivery,
    page: searchParams.page || 1,
    limit: 12
  });

  return <CourseGrid courses={courses} />;
}

// Client-side Data Fetching with SWR
// components/courses/CourseFilter.tsx

import useSWR from 'swr';

function CourseFilter() {
  const { data: categories } = useSWR('/api/categories', fetcher);
  // ...
}
```

---

## 9. Content Migration Plan

### 9.1 Content Sources

1. **Legacy PHP Database** (`alms(10).sql`)
   - Courses, categories, lessons
   - User accounts
   - Enrollment records
   - Blog posts

2. **Current Website** (`seitechinternational.org.uk`)
   - Company information
   - Service descriptions
   - Contact details

3. **Legacy PHP Views**
   - Navigation structure
   - Page templates
   - Form layouts

### 9.2 Migration Mapping

| Source Content | Target Location |
|----------------|-----------------|
| Course data | Odoo `slide.channel` |
| Categories | Odoo `course.category` |
| Users | Odoo `res.users` |
| Services | Odoo `compliance.service` (new) |
| Blog posts | Odoo `blog.post` |
| Static pages | Next.js MDX/CMS |

### 9.3 Content to Create

New content required:
- Updated company description
- Service detail pages (10 services)
- Accreditation information pages
- FAQ content
- Terms & conditions
- Privacy policy

---

## 10. Deployment Strategy

### 10.1 Infrastructure

```
┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│         Vercel (Frontend)       │     │         Vultr (Backend)         │
│                                 │     │                                 │
│  ┌───────────────────────────┐  │     │  ┌───────────────────────────┐  │
│  │    Next.js Application    │  │────▶│  │    Odoo 19.0 Server      │  │
│  │    - Static pages         │  │     │  │    - API endpoints        │  │
│  │    - API routes           │  │     │  │    - Business logic       │  │
│  │    - Edge functions       │  │     │  │    - Database             │  │
│  └───────────────────────────┘  │     │  └───────────────────────────┘  │
│                                 │     │                                 │
│  CDN: Global Edge Network       │     │  PostgreSQL + Redis            │
│  Domain: seitechinternational   │     │  Domain: api.seitechintl       │
│           .org.uk               │     │           .org.uk              │
└─────────────────────────────────┘     └─────────────────────────────────┘
```

### 10.2 Environment Variables

```env
# .env.local (Frontend - Vercel)

# Odoo API Configuration
NEXT_PUBLIC_ODOO_URL=https://api.seitechinternational.org.uk
ODOO_DATABASE=seitech
ODOO_API_KEY=your_api_key_here

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://seitechinternational.org.uk

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Payment
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Image CDN
NEXT_PUBLIC_IMAGE_CDN=https://res.cloudinary.com/seitech
```

### 10.3 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml

name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run linting
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 11. Performance & SEO Requirements

### 11.1 Performance Targets

| Metric | Target |
|--------|--------|
| Largest Contentful Paint (LCP) | < 2.5s |
| First Input Delay (FID) | < 100ms |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Time to First Byte (TTFB) | < 600ms |
| Lighthouse Performance Score | > 90 |

### 11.2 Optimization Strategies

- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Dynamic imports for heavy components
- **Static Generation**: Pre-render marketing pages at build time
- **ISR**: Incremental Static Regeneration for course pages
- **Edge Caching**: Vercel Edge Network for API responses
- **Bundle Analysis**: Regular bundle size monitoring

### 11.3 SEO Requirements

- **Meta Tags**: Title, description, keywords per page
- **Open Graph**: Social sharing meta tags
- **JSON-LD**: Structured data for courses, services, organization
- **Sitemap**: Dynamic XML sitemap generation
- **Robots.txt**: Proper crawling directives
- **Canonical URLs**: Prevent duplicate content
- **Schema Markup**: Course, Organization, FAQ, Review schemas

### 11.4 Accessibility (WCAG 2.1 AA)

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast ratios > 4.5:1
- Alt text for all images
- Focus indicators
- Screen reader testing

---

## Appendix A: Key Contacts

- **Project Lead**: [Your Name]
- **Backend Developer**: Odoo team
- **Design Reference**: ensemble.africa

## Appendix B: Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 2025 | Claude | Initial specification |

---

*This document serves as the comprehensive specification for the SEI Tech International frontend development project. All implementation should follow these guidelines to ensure consistency, quality, and maintainability.*
