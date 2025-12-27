# SEI Tech International - Frontend Improvement Plan
## Comprehensive Strategy for World-Class Implementation

**Version:** 2.0  
**Date:** December 24, 2024  
**Status:** Strategic Blueprint  

---

## Executive Summary

This comprehensive plan outlines a strategic approach to elevate the SEI Tech International frontend to industry-leading standards. The analysis covers both the **Odoo-based frontend** (website theme) and the **Next.js application**, providing actionable recommendations across architecture, performance, accessibility, security, and user experience.

### Current State Assessment

#### Strengths ✅
- **Solid Foundation**: Well-structured Next.js 14 app with 228 TypeScript files
- **Modern Stack**: TypeScript, Tailwind CSS, Radix UI, Framer Motion
- **Design System**: Comprehensive SCSS variables (6,400+ lines) with teal/cyan branding
- **Modular Architecture**: Clear separation of concerns with feature-based components
- **Documentation**: Detailed technical specs and architecture documents

#### Areas for Improvement 🎯
- **Consistency**: Design system alignment between Odoo and Next.js
- **Performance**: Bundle optimization and lazy loading strategies
- **Accessibility**: WCAG 2.1 AA compliance gaps
- **Testing**: Test coverage expansion needed
- **API Integration**: Odoo client optimization required
- **SEO**: Structured data and metadata enhancements
- **State Management**: Centralized patterns needed

---

## 1. Architecture & Code Quality

### 1.1 Design System Unification

**Current Issue**: Color palette inconsistency between Odoo SCSS and Next.js Tailwind

**Odoo Variables** (variables.scss):
```scss
$seitech-primary: #0284c7 (Sky Blue)
$seitech-secondary: #0e9384 (Teal)
```

**Next.js Tailwind** (tailwind.config.ts):
```typescript
primary: { 500: '#22c55e' } // Green
secondary: { 500: '#06b6d4' } // Cyan
```

#### Action Plan

**Priority: HIGH | Timeline: 1-2 weeks**

1. **Create Master Design Tokens File**
   ```typescript
   // config/design-tokens.ts
   export const designTokens = {
     colors: {
       primary: {
         50: '#f0f9ff',
         100: '#e0f2fe',
         // ... matches Odoo exactly
         600: '#0284c7', // PRIMARY BRAND COLOR
       },
       secondary: {
         600: '#0e9384', // Teal accent
       }
     }
   } as const;
   ```

2. **Generate Tailwind Config from Tokens**
   ```typescript
   // tailwind.config.ts
   import { designTokens } from './config/design-tokens';
   
   export default {
     theme: {
       extend: {
         colors: designTokens.colors,
       }
     }
   };
   ```

3. **Generate SCSS Variables from Same Source**
   ```javascript
   // scripts/generate-scss-tokens.js
   const fs = require('fs');
   const { designTokens } = require('../config/design-tokens');
   
   // Generate SCSS from TypeScript source of truth
   ```

**Deliverables**:
- [ ] Single source of truth for design tokens
- [ ] Automated generation scripts
- [ ] CI/CD validation to prevent drift
- [ ] Visual regression testing setup

---

### 1.2 Component Library Standardization

**Current State**: Mix of Radix UI primitives and custom components

#### Recommended Component Hierarchy

```
components/
├── primitives/          # Radix UI wrappers (unstyled)
│   ├── Accordion/
│   ├── Dialog/
│   └── Dropdown/
│
├── ui/                  # Styled base components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   ├── Card/
│   └── Input/
│
├── composed/            # Multi-component compositions
│   ├── SearchBar/
│   ├── Pagination/
│   └── DataTable/
│
├── features/            # Feature-specific components
│   ├── courses/
│   │   ├── CourseCard/
│   │   ├── CourseGrid/
│   │   └── CourseFilters/
│   └── consultancy/
│
└── sections/            # Page sections
    ├── Hero/
    ├── Testimonials/
    └── CTA/
```

#### Action Plan

**Priority: MEDIUM | Timeline: 2-3 weeks**

1. **Audit Existing Components** (Week 1)
   - Document all 228 components
   - Identify duplicates and inconsistencies
   - Map component usage across pages

2. **Create Component Blueprint Template**
   ```typescript
   // templates/component-template/Component.tsx
   import * as React from 'react';
   import { cva, type VariantProps } from 'class-variance-authority';
   import { cn } from '@/lib/utils';
   
   const componentVariants = cva(
     'base-classes',
     {
       variants: {
         variant: { /* ... */ },
         size: { /* ... */ }
       },
       defaultVariants: { /* ... */ }
     }
   );
   
   export interface ComponentProps
     extends React.HTMLAttributes<HTMLDivElement>,
       VariantProps<typeof componentVariants> {
     // Props
   }
   
   const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
     ({ className, variant, size, ...props }, ref) => {
       return (
         <div
           ref={ref}
           className={cn(componentVariants({ variant, size, className }))}
           {...props}
         />
       );
     }
   );
   
   Component.displayName = 'Component';
   
   export { Component, componentVariants };
   ```

3. **Refactor High-Use Components** (Weeks 2-3)
   - Button (17 variants identified)
   - Card (11 variants)
   - Input/Form fields (23 variants)
   - Badge/Tag (9 variants)

4. **Setup Storybook** (Week 3)
   ```bash
   npx storybook@latest init
   ```
   - Document all components
   - Interactive playground
   - Accessibility checks

**Deliverables**:
- [ ] Component audit spreadsheet
- [ ] Storybook instance deployed
- [ ] Refactored core components
- [ ] Component usage guidelines doc

---

## 2. Performance Optimization

### 2.1 Current Performance Baseline

**Needs Assessment**: Run Lighthouse audits to establish baseline

#### Recommended Targets

| Metric | Target | Priority |
|--------|--------|----------|
| First Contentful Paint (FCP) | < 1.8s | HIGH |
| Largest Contentful Paint (LCP) | < 2.5s | HIGH |
| Total Blocking Time (TBT) | < 200ms | MEDIUM |
| Cumulative Layout Shift (CLS) | < 0.1 | HIGH |
| Speed Index | < 3.4s | MEDIUM |
| Time to Interactive (TTI) | < 3.8s | MEDIUM |

### 2.2 Bundle Size Optimization

**Action Plan**

**Priority: HIGH | Timeline: 1-2 weeks**

1. **Analyze Current Bundle**
   ```bash
   npm install --save-dev @next/bundle-analyzer
   ```
   
   ```javascript
   // next.config.js
   const withBundleAnalyzer = require('@next/bundle-analyzer')({
     enabled: process.env.ANALYZE === 'true',
   });
   
   module.exports = withBundleAnalyzer({
     // existing config
   });
   ```

2. **Implement Code Splitting Strategy**
   ```typescript
   // app/courses/[slug]/page.tsx
   import dynamic from 'next/dynamic';
   
   // Lazy load heavy components
   const CoursePlayer = dynamic(
     () => import('@/components/features/courses/CoursePlayer'),
     {
       loading: () => <CoursePlayerSkeleton />,
       ssr: false, // Only load client-side
     }
   );
   
   const CourseReviews = dynamic(
     () => import('@/components/features/courses/CourseReviews')
   );
   ```

3. **Optimize Dependencies**
   ```json
   // Check current sizes
   {
     "scripts": {
       "analyze": "ANALYZE=true npm run build",
       "size": "npm run build && size-limit"
     }
   }
   ```

   **Likely Candidates for Optimization**:
   - Framer Motion: Consider lighter alternatives for simple animations
   - Recharts: Lazy load, consider lightweight chart library
   - TanStack Table: Only import needed features
   - Date-fns: Use smaller alternatives like dayjs

4. **Tree Shaking Configuration**
   ```typescript
   // next.config.js
   module.exports = {
     experimental: {
       optimizePackageImports: [
         'lucide-react',
         '@radix-ui/react-icons',
         'date-fns',
       ],
     },
   };
   ```

**Deliverables**:
- [ ] Bundle analysis report
- [ ] Code splitting implementation
- [ ] Dependency optimization
- [ ] Performance budget established

---

### 2.3 Image Optimization Strategy

**Current State**: Using Next.js Image component (good foundation)

#### Enhanced Implementation

**Priority: MEDIUM | Timeline: 1 week**

1. **Implement Cloudinary Integration**
   ```typescript
   // lib/utils/image.ts
   export function getOptimizedImageUrl(
     src: string,
     options: {
       width?: number;
       height?: number;
       quality?: number;
       format?: 'auto' | 'webp' | 'avif';
     }
   ) {
     const cloudinaryBase = process.env.NEXT_PUBLIC_CLOUDINARY_BASE;
     const { width = 800, quality = 80, format = 'auto' } = options;
     
     return `${cloudinaryBase}/w_${width},q_${quality},f_${format}/${src}`;
   }
   ```

2. **Setup Image Component Wrapper**
   ```typescript
   // components/ui/OptimizedImage.tsx
   import NextImage from 'next/image';
   import { getOptimizedImageUrl } from '@/lib/utils/image';
   
   export function OptimizedImage({ src, alt, ...props }) {
     return (
       <NextImage
         src={getOptimizedImageUrl(src, props)}
         alt={alt}
         loading="lazy"
         placeholder="blur"
         blurDataURL="/placeholder.svg"
         {...props}
       />
     );
   }
   ```

3. **Implement AVIF/WebP Support**
   ```html
   <picture>
     <source
       type="image/avif"
       srcSet="/images/course.avif"
     />
     <source
       type="image/webp"
       srcSet="/images/course.webp"
     />
     <img src="/images/course.jpg" alt="Course" />
   </picture>
   ```

**Deliverables**:
- [ ] Cloudinary CDN setup
- [ ] Image component wrapper
- [ ] Automated image optimization pipeline
- [ ] Lazy loading implementation

---

### 2.4 API & Data Fetching Optimization

**Current Issue**: Odoo JSON-RPC calls may be inefficient

#### Action Plan

**Priority: HIGH | Timeline: 2 weeks**

1. **Implement Request Batching**
   ```typescript
   // lib/api/odoo-batch-client.ts
   class OdooBatchClient {
     private queue: Array<{
       model: string;
       method: string;
       args: any[];
       resolve: (value: any) => void;
       reject: (error: any) => void;
     }> = [];
     
     private batchTimeout: NodeJS.Timeout | null = null;
     
     async call(model: string, method: string, args: any[]) {
       return new Promise((resolve, reject) => {
         this.queue.push({ model, method, args, resolve, reject });
         
         if (!this.batchTimeout) {
           this.batchTimeout = setTimeout(() => this.flush(), 50);
         }
       });
     }
     
     private async flush() {
       const batch = [...this.queue];
       this.queue = [];
       this.batchTimeout = null;
       
       // Single JSON-RPC call for all queued requests
       const results = await this.executeBatch(batch);
       
       batch.forEach((item, index) => {
         item.resolve(results[index]);
       });
     }
   }
   ```

2. **Setup SWR with Proper Caching**
   ```typescript
   // lib/api/swr-config.ts
   import { SWRConfig } from 'swr';
   
   export const swrConfig = {
     revalidateOnFocus: false,
     revalidateOnReconnect: true,
     dedupingInterval: 10000,
     errorRetryCount: 3,
     errorRetryInterval: 5000,
     
     fetcher: async (url: string) => {
       const res = await fetch(url);
       if (!res.ok) throw new Error('API Error');
       return res.json();
     },
     
     // Persistent cache
     provider: () => new Map(),
   };
   ```

3. **Implement Response Caching**
   ```typescript
   // app/api/courses/route.ts
   export const revalidate = 300; // 5 minutes
   
   export async function GET(request: NextRequest) {
     const searchParams = request.nextUrl.searchParams;
     
     // Use Next.js cache
     const courses = await fetch(
       `${process.env.ODOO_URL}/api/courses?${searchParams}`,
       {
         next: {
           revalidate: 300,
           tags: ['courses'], // For on-demand revalidation
         },
       }
     ).then(res => res.json());
     
     return NextResponse.json(courses);
   }
   ```

4. **Add Redis Caching Layer**
   ```typescript
   // lib/cache/redis.ts
   import { Redis } from '@upstash/redis';
   
   const redis = new Redis({
     url: process.env.REDIS_URL!,
     token: process.env.REDIS_TOKEN!,
   });
   
   export async function getCachedData<T>(
     key: string,
     fetcher: () => Promise<T>,
     ttl: number = 300
   ): Promise<T> {
     // Try cache first
     const cached = await redis.get<T>(key);
     if (cached) return cached;
     
     // Fetch and cache
     const data = await fetcher();
     await redis.setex(key, ttl, data);
     return data;
   }
   ```

**Deliverables**:
- [ ] Request batching implementation
- [ ] SWR configuration optimized
- [ ] Response caching strategy
- [ ] Redis integration (optional)

---

## 3. Accessibility (WCAG 2.1 AA Compliance)

### 3.1 Current Accessibility Audit

**Action Required**: Run automated accessibility testing

```bash
npm install --save-dev @axe-core/playwright
```

```typescript
// tests/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility tests', () => {
  test('Homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

### 3.2 Accessibility Improvements Checklist

**Priority: HIGH | Timeline: 2-3 weeks**

#### Semantic HTML Structure

- [ ] **Landmark Regions**: Proper use of `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`
- [ ] **Heading Hierarchy**: No skipped heading levels (h1 → h2 → h3)
- [ ] **Lists**: Use `<ul>`, `<ol>` for navigation and content lists
- [ ] **Tables**: Proper `<thead>`, `<tbody>`, `<th scope="">` for data tables

#### Keyboard Navigation

```typescript
// components/ui/Button.tsx
export function Button({ children, onClick, ...props }: ButtonProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e as any);
    }
  };
  
  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      {...props}
    >
      {children}
    </button>
  );
}
```

#### ARIA Labels & Descriptions

```typescript
// components/features/courses/CourseCard.tsx
<article
  aria-labelledby={`course-title-${course.id}`}
  aria-describedby={`course-desc-${course.id}`}
>
  <h3 id={`course-title-${course.id}`}>{course.name}</h3>
  <p id={`course-desc-${course.id}`}>{course.shortDescription}</p>
  
  <button
    aria-label={`Enroll in ${course.name} course`}
    aria-describedby={`course-price-${course.id}`}
  >
    Enroll Now
  </button>
  
  <span id={`course-price-${course.id}`} className="sr-only">
    Course price: £{course.listPrice}
  </span>
</article>
```

#### Color Contrast

**Minimum Ratios**:
- Normal text: 4.5:1
- Large text (18pt+): 3:1
- UI components: 3:1

```typescript
// scripts/check-contrast.ts
import { checkContrast } from 'color-contrast-checker';

const colors = {
  primary: '#0284c7',
  white: '#ffffff',
  textPrimary: '#0b1220',
};

// Verify all color combinations meet WCAG AA
console.log(checkContrast(colors.primary, colors.white)); // Should be > 4.5
```

#### Focus Indicators

```css
/* styles/globals.css */
*:focus-visible {
  outline: 2px solid var(--primary-600);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Skip to main content */
.skip-to-main {
  position: absolute;
  left: -9999px;
  z-index: 999;
}

.skip-to-main:focus {
  left: 1rem;
  top: 1rem;
  background: var(--primary-600);
  color: white;
  padding: 0.5rem 1rem;
  text-decoration: none;
  border-radius: 0.375rem;
}
```

#### Screen Reader Support

```typescript
// components/layout/Header.tsx
<nav aria-label="Main navigation">
  <ul role="list">
    <li>
      <Link href="/courses" aria-current={isActive ? 'page' : undefined}>
        Training
      </Link>
    </li>
  </ul>
</nav>

// Loading states
<div role="status" aria-live="polite" aria-atomic="true">
  {isLoading ? 'Loading courses...' : null}
</div>

// Error states
<div role="alert" aria-live="assertive">
  {error ? 'Failed to load courses. Please try again.' : null}
</div>
```

**Deliverables**:
- [ ] Automated accessibility testing setup
- [ ] Accessibility audit report
- [ ] Remediation of critical issues
- [ ] Documentation for accessible patterns

---

## 4. SEO & Metadata Optimization

### 4.1 Enhanced Metadata Strategy

**Priority: HIGH | Timeline: 1 week**

#### Dynamic Metadata Generation

```typescript
// app/courses/[slug]/page.tsx
import { Metadata } from 'next';
import { getCourseBySlug } from '@/lib/api/courses';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourseBySlug(params.slug);
  
  if (!course) {
    return {
      title: 'Course Not Found | SEI Tech',
    };
  }
  
  return {
    title: `${course.name} - ${course.deliveryMethod} | SEI Tech`,
    description: course.metaDescription || course.shortDescription,
    keywords: [
      course.name,
      course.categoryName,
      course.deliveryMethod,
      'health and safety training',
      'fire safety',
      course.accreditation,
    ].filter(Boolean),
    
    openGraph: {
      title: course.name,
      description: course.shortDescription,
      type: 'website',
      url: `https://seitechinternational.org.uk/courses/${course.slug}`,
      images: [
        {
          url: course.imageUrl,
          width: 1200,
          height: 630,
          alt: course.name,
        },
      ],
      siteName: 'SEI Tech International',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: course.name,
      description: course.shortDescription,
      images: [course.imageUrl],
      creator: '@seitech',
    },
    
    alternates: {
      canonical: `https://seitechinternational.org.uk/courses/${course.slug}`,
    },
    
    robots: {
      index: course.isPublished,
      follow: true,
      googleBot: {
        index: course.isPublished,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
```

### 4.2 Structured Data (JSON-LD)

```typescript
// lib/utils/structured-data.ts
export function generateCourseSchema(course: Course) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.shortDescription,
    provider: {
      '@type': 'Organization',
      name: 'SEI Tech International',
      url: 'https://seitechinternational.org.uk',
      logo: 'https://seitechinternational.org.uk/logo.png',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Park Street',
        addressLocality: 'Ashford',
        addressRegion: 'Kent',
        postalCode: 'TN24 8DF',
        addressCountry: 'GB',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+44 1233 438817',
        contactType: 'customer service',
        email: 'info@seitechinternational.org.uk',
      },
    },
    image: course.imageUrl,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: course.ratingAvg,
      reviewCount: course.ratingCount,
      bestRating: 5,
      worstRating: 1,
    },
    offers: {
      '@type': 'Offer',
      price: course.listPrice,
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      url: `https://seitechinternational.org.uk/courses/${course.slug}`,
      validFrom: new Date().toISOString(),
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: course.deliveryMethod,
      courseWorkload: `PT${course.duration}H`,
    },
    educationalLevel: course.difficultyLevel,
    teaches: course.outcomes,
    coursePrerequisites: course.requirements,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'SEI Tech International',
    },
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'SEI Tech International',
    alternateName: 'SEI Tech',
    url: 'https://seitechinternational.org.uk',
    logo: 'https://seitechinternational.org.uk/logo.png',
    description: 'Health & Safety Training and Consultancy',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Park Street',
      addressLocality: 'Ashford',
      addressRegion: 'Kent',
      postalCode: 'TN24 8DF',
      addressCountry: 'GB',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+44 1233 438817',
      contactType: 'customer service',
      email: 'info@seitechinternational.org.uk',
      areaServed: 'GB',
      availableLanguage: 'English',
    },
    sameAs: [
      'https://www.linkedin.com/company/seitech',
      'https://twitter.com/seitech',
      'https://facebook.com/seitech',
    ],
  };
}
```

### 4.3 Sitemap Generation

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllCourses } from '@/lib/api/courses';
import { getAllServices } from '@/lib/api/services';
import { getAllBlogPosts } from '@/lib/api/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://seitechinternational.org.uk';
  
  // Static pages
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/courses',
    '/services',
    '/blog',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));
  
  // Dynamic course pages
  const courses = await getAllCourses();
  const coursePages = courses.map(course => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: new Date(course.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  
  // Dynamic service pages
  const services = await getAllServices();
  const servicePages = services.map(service => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  
  // Blog posts
  const posts = await getAllBlogPosts();
  const blogPages = posts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
  
  return [...staticPages, ...coursePages, ...servicePages, ...blogPages];
}
```

**Deliverables**:
- [ ] Dynamic metadata implementation
- [ ] JSON-LD structured data
- [ ] Sitemap generation
- [ ] Robots.txt configuration

---

## 5. Testing Strategy

### 5.1 Test Coverage Goals

| Test Type | Current | Target | Priority |
|-----------|---------|--------|----------|
| Unit Tests | ~10% | 80% | HIGH |
| Integration Tests | ~5% | 60% | MEDIUM |
| E2E Tests | 0% | Critical Flows | HIGH |
| Accessibility Tests | 0% | 100% Pages | HIGH |

### 5.2 Unit Testing Setup

**Priority: HIGH | Timeline: 2 weeks**

```typescript
// __tests__/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('applies variant styles correctly', () => {
    const { container } = render(<Button variant="outline">Button</Button>);
    expect(container.firstChild).toHaveClass('border-2');
  });
  
  it('is disabled when isLoading', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 5.3 E2E Testing with Playwright

```typescript
// tests/e2e/course-enrollment.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Course Enrollment Flow', () => {
  test('User can browse and enroll in a course', async ({ page }) => {
    // Navigate to courses
    await page.goto('/courses');
    
    // Filter by category
    await page.click('text=Fire Safety');
    await page.waitForURL('**/courses?category=fire-safety');
    
    // Click on a course
    await page.click('text=Fire Warden Training');
    await expect(page).toHaveURL(/\/courses\/fire-warden-training/);
    
    // Verify course details loaded
    await expect(page.locator('h1')).toContainText('Fire Warden');
    await expect(page.locator('[data-testid="course-price"]')).toBeVisible();
    
    // Add to cart
    await page.click('button:has-text("Add to Cart")');
    
    // Verify cart updated
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
    
    // Go to checkout
    await page.click('[data-testid="cart-button"]');
    await page.click('text=Checkout');
    
    // Fill checkout form
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    
    // Complete purchase (mocked)
    await page.click('button:has-text("Complete Purchase")');
    
    // Verify success
    await expect(page).toHaveURL(/\/checkout\/success/);
    await expect(page.locator('text=Thank you')).toBeVisible();
  });
});
```

### 5.4 Visual Regression Testing

```typescript
// tests/visual/homepage.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('Homepage matches snapshot', async ({ page }) => {
    await page.goto('/');
    
    // Wait for dynamic content
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });
  
  test('Course card hover state', async ({ page }) => {
    await page.goto('/courses');
    
    const firstCard = page.locator('[data-testid="course-card"]').first();
    await firstCard.hover();
    
    await expect(firstCard).toHaveScreenshot('course-card-hover.png');
  });
});
```

**Deliverables**:
- [ ] Vitest configuration
- [ ] Component test coverage > 80%
- [ ] E2E test suite for critical flows
- [ ] Visual regression baseline

---

## 6. Security Enhancements

### 6.1 Security Checklist

**Priority: CRITICAL | Timeline: Ongoing**

#### Input Validation & Sanitization

```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters'),
  
  email: z.string()
    .email('Invalid email address')
    .toLowerCase(),
  
  phone: z.string()
    .regex(/^(\+44|0)[0-9]{10}$/, 'Invalid UK phone number')
    .optional(),
  
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
});

// Usage in component
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(contactFormSchema),
});
```

#### API Route Protection

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  // Rate limiting
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await rateLimit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // Authentication check for protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth-token');
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // CORS headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};
```

#### Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.seitechinternational.org.uk",
      "frame-ancestors 'none'",
    ].join('; '),
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

#### Environment Variable Protection

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Public variables (available client-side)
  NEXT_PUBLIC_ODOO_URL: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  
  // Private variables (server-only)
  ODOO_DATABASE: z.string().min(1),
  ODOO_API_KEY: z.string().min(32),
  NEXTAUTH_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
});

// Validate at build time
const env = envSchema.parse(process.env);

export { env };
```

**Deliverables**:
- [ ] Zod validation for all forms
- [ ] Rate limiting implementation
- [ ] CSP headers configured
- [ ] Environment variable validation

---

## 7. State Management & Data Flow

### 7.1 Zustand Store Organization

**Priority: MEDIUM | Timeline: 1 week**

```typescript
// lib/stores/index.ts
export { useAuthStore } from './auth-store';
export { useCartStore } from './cart-store';
export { useUIStore } from './ui-store';

// Combine stores for dev tools
export const useStores = () => ({
  auth: useAuthStore(),
  cart: useCartStore(),
  ui: useUIStore(),
});
```

```typescript
// lib/stores/cart-store.ts
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface CartItem {
  id: number;
  courseId: number;
  name: string;
  price: number;
  imageUrl: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Computed getters
  totalItems: () => number;
  totalPrice: () => number;
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (courseId: number) => void;
  updateQuantity: (courseId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      immer((set, get) => ({
        items: [],
        isOpen: false,
        
        totalItems: () => get().items.length,
        
        totalPrice: () =>
          get().items.reduce((sum, item) => sum + item.price, 0),
        
        addItem: (item) =>
          set((state) => {
            const existingItem = state.items.find(
              (i) => i.courseId === item.courseId
            );
            
            if (!existingItem) {
              state.items.push({
                id: Date.now(),
                ...item,
              });
            }
          }),
        
        removeItem: (courseId) =>
          set((state) => {
            state.items = state.items.filter(
              (item) => item.courseId !== courseId
            );
          }),
        
        clearCart: () => set({ items: [] }),
        
        toggleCart: () =>
          set((state) => {
            state.isOpen = !state.isOpen;
          }),
      })),
      {
        name: 'cart-storage',
        partialize: (state) => ({ items: state.items }),
      }
    ),
    { name: 'Cart Store' }
  )
);
```

### 7.2 React Query Integration

```typescript
// lib/queries/courses.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourses, getCourseBySlug } from '@/lib/api/courses';

export function useCourses(filters: CourseFilters) {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => getCourses(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCourse(slug: string) {
  return useQuery({
    queryKey: ['course', slug],
    queryFn: () => getCourseBySlug(slug),
    staleTime: 10 * 60 * 1000,
  });
}

export function useEnrollInCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (courseId: number) => enrollInCourse(courseId),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
```

**Deliverables**:
- [ ] Zustand stores refactored
- [ ] React Query setup
- [ ] State management documentation

---

## 8. Deployment & CI/CD

### 8.1 GitHub Actions Workflow

**Priority: HIGH | Timeline: 3 days**

```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
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
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run Prettier
        run: npm run format -- --check

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  build:
    needs: [lint, type-check, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Analyze bundle size
        run: npm run analyze

  deploy-preview:
    needs: [build, e2e]
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: [build, e2e]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 8.2 Pre-commit Hooks

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
npm run type-check
```

**Deliverables**:
- [ ] GitHub Actions workflow
- [ ] Husky pre-commit hooks
- [ ] Vercel deployment config

---

## 9. Documentation

### 9.1 Component Documentation

**Priority: MEDIUM | Timeline: Ongoing**

```typescript
// components/ui/Button/README.md
```markdown
# Button Component

Versatile button component with multiple variants and sizes.

## Usage

\```typescript
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>
\```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'outline' \| 'ghost' | 'primary' | Visual style variant |
| size | 'sm' \| 'md' \| 'lg' \| 'xl' | 'md' | Button size |
| isLoading | boolean | false | Shows loading spinner |
| leftIcon | ReactNode | - | Icon before text |
| rightIcon | ReactNode | - | Icon after text |

## Examples

### Primary Button
\```tsx
<Button variant="primary">Primary</Button>
\```

### With Icons
\```tsx
<Button leftIcon={<ArrowLeft />} variant="outline">
  Go Back
</Button>
\```

### Loading State
\```tsx
<Button isLoading>Loading...</Button>
\```
```

### 9.2 API Documentation

```typescript
// docs/API.md
```markdown
# API Documentation

## Courses

### Get All Courses

\```typescript
GET /api/courses?category=5&level=beginner&page=1&limit=12
\```

**Response:**
\```json
{
  "courses": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4
  }
}
\```

### Get Course by Slug

\```typescript
GET /api/courses/fire-warden-training
\```

**Response:**
\```json
{
  "id": 1,
  "name": "Fire Warden Training",
  "slug": "fire-warden-training",
  ...
}
\```
```

**Deliverables**:
- [ ] Component README files
- [ ] API documentation
- [ ] Developer onboarding guide
- [ ] Architecture decision records (ADRs)

---

## 10. Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
- [ ] Design system unification
- [ ] Bundle size optimization
- [ ] Security enhancements
- [ ] CI/CD pipeline setup

### Phase 2: Core Improvements (Weeks 3-4)
- [ ] Component library refactor
- [ ] Accessibility audit & fixes
- [ ] SEO optimization
- [ ] Performance optimizations

### Phase 3: Testing & Quality (Weeks 5-6)
- [ ] Unit test coverage to 80%
- [ ] E2E test suite
- [ ] Visual regression testing
- [ ] Accessibility testing

### Phase 4: Polish & Documentation (Week 7)
- [ ] Component documentation
- [ ] API documentation
- [ ] Performance monitoring setup
- [ ] Final audit and optimization

### Phase 5: Launch Preparation (Week 8)
- [ ] Production deployment
- [ ] Monitoring and alerting
- [ ] User acceptance testing
- [ ] Go-live checklist

---

## 11. Success Metrics

### Performance KPIs
- [ ] Lighthouse Performance Score: > 90
- [ ] First Contentful Paint: < 1.8s
- [ ] Largest Contentful Paint: < 2.5s
- [ ] Cumulative Layout Shift: < 0.1
- [ ] Total Blocking Time: < 200ms

### Quality KPIs
- [ ] Test Coverage: > 80%
- [ ] Accessibility Score: 100/100
- [ ] SEO Score: > 95
- [ ] Zero critical security vulnerabilities

### User Experience KPIs
- [ ] Page Load Time: < 3s
- [ ] Time to Interactive: < 3.8s
- [ ] Bounce Rate: < 40%
- [ ] Conversion Rate: > 5%

---

## 12. Maintenance & Monitoring

### 12.1 Performance Monitoring

```typescript
// lib/monitoring/performance.ts
export function reportWebVitals(metric: NextWebVitalsMetric) {
  const body = JSON.stringify(metric);
  const url = '/api/analytics';
  
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true });
  }
}
```

```typescript
// app/layout.tsx
import { reportWebVitals } from '@/lib/monitoring/performance';

export { reportWebVitals };
```

### 12.2 Error Tracking

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    return event;
  },
});
```

### 12.3 Analytics Setup

```typescript
// lib/analytics/google.ts
export const pageview = (url: string) => {
  window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
    page_path: url,
  });
};

export const event = ({ action, category, label, value }: GAEvent) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
```

**Deliverables**:
- [ ] Vercel Analytics setup
- [ ] Sentry error tracking
- [ ] Google Analytics 4
- [ ] Performance dashboards

---

## 13. Cost & Resource Estimates

### Development Resources

| Phase | Effort (Dev Days) | Timeline |
|-------|------------------|----------|
| Phase 1: Foundation | 10 days | 2 weeks |
| Phase 2: Core Improvements | 10 days | 2 weeks |
| Phase 3: Testing | 8 days | 2 weeks |
| Phase 4: Documentation | 4 days | 1 week |
| Phase 5: Launch Prep | 3 days | 1 week |
| **Total** | **35 dev days** | **8 weeks** |

### Infrastructure Costs (Monthly)

| Service | Cost | Purpose |
|---------|------|---------|
| Vercel Pro | $20 | Next.js hosting |
| Cloudinary | $89 | Image CDN |
| Upstash Redis | $20 | Caching layer |
| Sentry | $26 | Error tracking |
| **Total** | **$155/mo** | |

---

## 14. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Design system conflicts | High | Medium | Create single source of truth |
| Performance regression | Medium | High | Continuous monitoring, budgets |
| Breaking Odoo API changes | Low | High | Version API, add fallbacks |
| Accessibility non-compliance | Medium | High | Automated testing, audits |
| Security vulnerabilities | Low | Critical | Regular security scans |

---

## 15. Next Steps

### Immediate Actions (Week 1)

1. **Stakeholder Buy-in**
   - Present this plan to team
   - Get approval for timeline and budget
   - Assign responsibilities

2. **Environment Setup**
   - Setup CI/CD pipeline
   - Configure monitoring tools
   - Establish performance baselines

3. **Quick Wins**
   - Fix critical accessibility issues
   - Implement bundle optimization
   - Setup pre-commit hooks

### Long-term Actions

1. **Quarterly Performance Reviews**
2. **Monthly Security Audits**
3. **Continuous Accessibility Testing**
4. **Regular Dependency Updates**

---

## Conclusion

This comprehensive plan provides a roadmap to elevate the SEI Tech International frontend to world-class standards. By focusing on **design consistency**, **performance**, **accessibility**, **security**, and **testing**, we can create an exceptional user experience that drives business goals.

**Key Success Factors**:
1. ✅ Single source of truth for design tokens
2. ✅ Comprehensive testing strategy
3. ✅ Performance monitoring and budgets
4. ✅ Accessibility-first development
5. ✅ Security best practices
6. ✅ Clear documentation

**Estimated Timeline**: 8 weeks  
**Estimated Effort**: 35 development days  
**Monthly Infrastructure Cost**: $155

---

## Appendix A: Reference Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Vitals](https://web.dev/vitals/)
- [Odoo External API](https://www.odoo.com/documentation/19.0/developer/reference/external_api.html)

## Appendix B: Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | Dec 24, 2024 | Comprehensive improvement plan created |

---

**Document Owner**: Development Team  
**Last Updated**: December 24, 2024  
**Next Review**: January 2025
