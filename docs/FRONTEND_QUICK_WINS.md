# Frontend Quick Wins - Priority Action List

**Target: Immediate improvements within 1-2 weeks**

---

## 🔴 CRITICAL (Do First)

### 1. Design System Consistency
**Problem**: Color mismatch between Odoo (#0284c7) and Next.js (#22c55e)  
**Solution**: Create `config/design-tokens.ts` as single source of truth  
**Effort**: 1 day  
**Files to Update**:
- `custom_addons/seitech_website_theme/static/src/scss/variables.scss`
- `frontend/tailwind.config.ts`
- `frontend/src/styles/globals.css`

```bash
# Quick fix command
cd frontend
npx tailwindcss-cli init --full
# Then update primary colors to match Odoo exactly
```

---

### 2. Bundle Size Reduction
**Current**: Unknown (needs analysis)  
**Target**: < 200KB initial JS bundle  
**Actions**:
1. Run bundle analyzer: `ANALYZE=true npm run build`
2. Dynamic import heavy components (Framer Motion, Recharts)
3. Remove unused Radix UI components

```typescript
// Replace static imports with dynamic
const CoursePlayer = dynamic(() => import('@/components/features/courses/CoursePlayer'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false
});
```

**Effort**: 2 days  
**Expected Savings**: 40-60KB

---

### 3. Accessibility Quick Fixes
**Run audit first**:
```bash
npm install --save-dev @axe-core/playwright
npx playwright test tests/accessibility.spec.ts
```

**Common Issues to Fix**:
- [ ] Add `alt` text to all images
- [ ] Ensure proper heading hierarchy (no skipped levels)
- [ ] Add ARIA labels to icon buttons
- [ ] Implement skip-to-main-content link
- [ ] Fix color contrast violations

**Effort**: 2 days  
**Impact**: WCAG 2.1 AA compliance

---

### 4. SEO Metadata
**Quick wins**:
- [ ] Add structured data (JSON-LD) to course pages
- [ ] Generate sitemap: `app/sitemap.ts`
- [ ] Create robots.txt
- [ ] Add Open Graph images (1200x630)

```typescript
// app/courses/[slug]/page.tsx - Add this
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: course.name,
  provider: {
    '@type': 'Organization',
    name: 'SEI Tech International'
  },
  offers: {
    '@type': 'Offer',
    price: course.listPrice,
    priceCurrency: 'GBP'
  }
};

return (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    {/* Rest of page */}
  </>
);
```

**Effort**: 1 day  
**Impact**: Better search engine visibility

---

## 🟡 HIGH (Week 2)

### 5. API Request Optimization
**Problem**: Likely N+1 queries to Odoo  
**Solution**: Implement request batching

```typescript
// lib/api/odoo-batch-client.ts
class OdooBatchClient {
  private queue = [];
  
  async call(model, method, args) {
    return new Promise((resolve) => {
      this.queue.push({ model, method, args, resolve });
      setTimeout(() => this.flush(), 50);
    });
  }
  
  async flush() {
    // Execute all queued requests in single call
  }
}
```

**Effort**: 2 days  
**Impact**: 50-70% reduction in API calls

---

### 6. Image Optimization
**Setup Cloudinary**:
```bash
npm install cloudinary
```

```typescript
// lib/utils/image.ts
export function getOptimizedImage(src: string, width: number) {
  return `https://res.cloudinary.com/${CLOUD_NAME}/w_${width},f_auto,q_auto/${src}`;
}
```

**Actions**:
- [ ] Convert all JPGs to WebP/AVIF
- [ ] Implement lazy loading
- [ ] Add blur placeholders
- [ ] Resize images to correct dimensions

**Effort**: 1 day  
**Impact**: 50-70% faster image loading

---

### 7. CI/CD Pipeline
**Setup GitHub Actions**:
```yaml
# .github/workflows/main.yml
name: CI/CD
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
```

**Effort**: 0.5 days  
**Impact**: Automated quality checks

---

## 🟢 MEDIUM (Week 3-4)

### 8. Component Testing
**Setup Vitest**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Priority Components**:
1. Button (highest usage)
2. Card
3. CourseCard
4. Input/Form fields

**Target**: 80% coverage  
**Effort**: 3 days

---

### 9. Performance Monitoring
**Setup Vercel Analytics** (free):
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Add Web Vitals tracking**:
```typescript
export function reportWebVitals(metric) {
  console.log(metric);
  // Send to analytics
}
```

**Effort**: 0.5 days  
**Impact**: Real-time performance insights

---

### 10. Security Headers
**Add to `next.config.js`**:
```javascript
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  }
};
```

**Effort**: 0.5 days  
**Impact**: Enhanced security

---

## Measurement & Validation

### Before Starting
```bash
# Run baseline tests
npx lighthouse https://seitechinternational.org.uk --output html --output-path ./baseline-report.html

# Check bundle size
npm run build
du -sh .next/static/chunks/*.js
```

### After Implementation
```bash
# Compare improvements
npx lighthouse https://seitechinternational.org.uk --output html --output-path ./improved-report.html

# Verify bundle size reduction
npm run analyze
```

---

## Priority Order (First 2 Weeks)

**Week 1**:
1. ✅ Monday: Design system fix (Critical)
2. ✅ Tuesday: Bundle analysis & optimization
3. ✅ Wednesday: Accessibility audit & fixes
4. ✅ Thursday: SEO metadata
5. ✅ Friday: API batching

**Week 2**:
6. ✅ Monday: Image optimization
7. ✅ Tuesday: CI/CD setup
8. ✅ Wednesday: Component testing setup
9. ✅ Thursday: Performance monitoring
10. ✅ Friday: Security headers + review

---

## Expected Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Lighthouse Performance | ? | > 90 | +? |
| First Contentful Paint | ? | < 1.8s | -? |
| Bundle Size | ? | < 200KB | -40% |
| Accessibility Score | ? | 100 | +? |
| SEO Score | ? | > 95 | +? |

---

## Commands Reference

```bash
# Development
npm run dev

# Build & analyze
ANALYZE=true npm run build

# Testing
npm run lint
npm run type-check
npm test
npm run test:e2e

# Performance
npx lighthouse http://localhost:3000

# Accessibility
npx playwright test tests/accessibility.spec.ts
```

---

## Resources

- Full Plan: `docs/FRONTEND_IMPROVEMENT_PLAN.md`
- Design Tokens: Will create in `config/design-tokens.ts`
- Bundle Analyzer: Run `ANALYZE=true npm run build`
- Lighthouse CI: Setup in GitHub Actions

---

**Last Updated**: December 24, 2024  
**Owner**: Development Team
