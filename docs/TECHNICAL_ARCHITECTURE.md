# SEI Tech International - Technical Architecture Document

## Version: 1.0
## Date: December 2024

---

## 1. System Overview

### 1.1 Architecture Philosophy

The SEI Tech International platform follows a **Headless CMS Architecture** pattern where:
- **Next.js Frontend** handles all user-facing interactions, SSR/SSG, and SEO
- **Odoo Backend** serves as the headless CMS, LMS, and e-commerce engine
- **API Layer** provides clean separation between frontend and backend concerns

### 1.2 Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js App Router | Latest React patterns, Server Components, streaming |
| TypeScript | Type safety, better DX, fewer runtime errors |
| Tailwind CSS | Rapid styling, consistent design system, small bundle |
| Odoo JSON-RPC | Native Odoo protocol, full model access |
| Vercel Hosting | Zero-config deployment, global CDN, edge functions |
| ISR Strategy | Fresh content without full rebuilds |

---

## 2. Odoo API Integration

### 2.1 Authentication Flow

```
┌─────────┐         ┌───────────────┐         ┌─────────────┐
│  User   │────────▶│   Next.js     │────────▶│    Odoo     │
│ Browser │         │   API Route   │         │   Server    │
└─────────┘         └───────────────┘         └─────────────┘
     │                     │                        │
     │ 1. Login Request    │                        │
     │ (email, password)   │                        │
     │────────────────────▶│                        │
     │                     │ 2. JSON-RPC Auth       │
     │                     │────────────────────────▶
     │                     │                        │
     │                     │ 3. Session + User Data │
     │                     │◀────────────────────────
     │                     │                        │
     │ 4. Set HTTP-only    │                        │
     │    Cookie + Return  │                        │
     │◀────────────────────│                        │
```

### 2.2 Odoo JSON-RPC Client Implementation

```typescript
// lib/api/odoo-client.ts

export interface OdooConfig {
  url: string;
  database: string;
}

export interface OdooSession {
  uid: number;
  sessionId: string;
  partnerId: number;
  username: string;
  name: string;
}

export type Domain = [string, string, any];

export interface SearchOptions {
  offset?: number;
  limit?: number;
  order?: string;
}

class OdooClient {
  private config: OdooConfig;
  private session: OdooSession | null = null;

  constructor(config: OdooConfig) {
    this.config = config;
  }

  private async jsonRpc(
    endpoint: string,
    method: string,
    params: Record<string, any>
  ): Promise<any> {
    const response = await fetch(`${this.config.url}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: new Date().getTime(),
      }),
      credentials: 'include',
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.data?.message || 'Odoo API Error');
    }

    return data.result;
  }

  async authenticate(email: string, password: string): Promise<OdooSession> {
    const result = await this.jsonRpc('/web/session/authenticate', 'call', {
      db: this.config.database,
      login: email,
      password: password,
    });

    if (!result.uid) {
      throw new Error('Invalid credentials');
    }

    this.session = {
      uid: result.uid,
      sessionId: result.session_id,
      partnerId: result.partner_id,
      username: result.username,
      name: result.name,
    };

    return this.session;
  }

  async call(
    model: string,
    method: string,
    args: any[] = [],
    kwargs: Record<string, any> = {}
  ): Promise<any> {
    return this.jsonRpc('/web/dataset/call_kw', 'call', {
      model,
      method,
      args,
      kwargs,
    });
  }

  async searchRead<T>(
    model: string,
    domain: Domain[] = [],
    fields: string[] = [],
    options: SearchOptions = {}
  ): Promise<T[]> {
    return this.call(model, 'search_read', [], {
      domain,
      fields,
      offset: options.offset || 0,
      limit: options.limit || 80,
      order: options.order || 'id desc',
    });
  }

  async read<T>(model: string, ids: number[], fields: string[] = []): Promise<T[]> {
    return this.call(model, 'read', [ids, fields]);
  }

  async create(model: string, values: Record<string, any>): Promise<number> {
    return this.call(model, 'create', [values]);
  }

  async write(model: string, ids: number[], values: Record<string, any>): Promise<boolean> {
    return this.call(model, 'write', [ids, values]);
  }

  async searchCount(model: string, domain: Domain[] = []): Promise<number> {
    return this.call(model, 'search_count', [domain]);
  }
}

// Singleton instance
let odooClient: OdooClient | null = null;

export function getOdooClient(): OdooClient {
  if (!odooClient) {
    odooClient = new OdooClient({
      url: process.env.NEXT_PUBLIC_ODOO_URL!,
      database: process.env.ODOO_DATABASE!,
    });
  }
  return odooClient;
}

export { OdooClient };
```

### 2.3 API Routes Structure

```typescript
// app/api/courses/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getOdooClient } from '@/lib/api/odoo-client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const level = searchParams.get('level');
  const delivery = searchParams.get('delivery');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');

  const odoo = getOdooClient();

  // Build domain filters
  const domain: Domain[] = [
    ['is_published', '=', true],
  ];

  if (category) {
    domain.push(['category_id', '=', parseInt(category)]);
  }

  if (level) {
    domain.push(['difficulty_level', '=', level]);
  }

  if (delivery) {
    domain.push(['delivery_method', '=', delivery]);
  }

  try {
    const [courses, total] = await Promise.all([
      odoo.searchRead<Course>(
        'slide.channel',
        domain,
        [
          'id', 'name', 'description', 'image_url', 'total_time',
          'difficulty_level', 'delivery_method', 'list_price',
          'rating_avg', 'rating_count', 'total_slides',
          'category_id', 'user_id', 'website_meta_title',
          'website_meta_description', 'create_date'
        ],
        {
          offset: (page - 1) * limit,
          limit,
          order: 'sequence asc, id desc',
        }
      ),
      odoo.searchCount('slide.channel', domain),
    ]);

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
```

---

## 3. Data Models & Types

### 3.1 TypeScript Type Definitions

```typescript
// types/course.ts

export interface Course {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  thumbnailUrl: string;

  // Pricing
  listPrice: number;
  discountPrice?: number;
  currency: string;

  // Classification
  categoryId: number;
  categoryName: string;
  deliveryMethod: 'e-learning' | 'face-to-face' | 'virtual' | 'in-house';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  accreditation?: string;

  // Metrics
  duration: number; // in hours
  totalSlides: number;
  totalQuizzes: number;
  ratingAvg: number;
  ratingCount: number;
  enrollmentCount: number;

  // Instructor
  instructorId: number;
  instructorName: string;
  instructorAvatar: string;

  // Content
  curriculum: CourseCurriculum[];
  outcomes: string[];
  requirements: string[];
  faqs: CourseFAQ[];

  // Meta
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseCurriculum {
  id: number;
  name: string;
  sequence: number;
  slides: CourseSlide[];
}

export interface CourseSlide {
  id: number;
  name: string;
  slideType: 'video' | 'document' | 'infographic' | 'quiz' | 'webpage';
  duration: number;
  isPreview: boolean;
  completionTime: number;
}

export interface CourseFAQ {
  question: string;
  answer: string;
}

export interface CourseReview {
  id: number;
  rating: number;
  comment: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  helpful: number;
}

// types/enrollment.ts

export interface Enrollment {
  id: number;
  courseId: number;
  courseName: string;
  courseImage: string;
  userId: number;

  state: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled' | 'expired';
  progress: number; // 0-100

  enrollmentDate: string;
  expirationDate?: string;
  completionDate?: string;

  lastAccessDate?: string;
  totalTimeSpent: number;

  certificateId?: number;
  certificateUrl?: string;
}

// types/service.ts

export interface ConsultancyService {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  iconName: string;

  features: string[];
  benefits: string[];
  process: ServiceProcess[];

  priceFrom?: number;
  pricingType: 'fixed' | 'quote' | 'hourly';

  relatedServices: number[];
  faqs: ServiceFAQ[];

  metaTitle: string;
  metaDescription: string;
}

export interface ServiceProcess {
  step: number;
  title: string;
  description: string;
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

// types/user.ts

export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;

  companyName?: string;
  jobTitle?: string;

  enrollments: Enrollment[];
  certificates: Certificate[];
  achievements: Achievement[];

  totalPoints: number;
  level: string;

  createdAt: string;
}

export interface Certificate {
  id: number;
  reference: string;
  courseName: string;
  issuedDate: string;
  expiryDate?: string;
  downloadUrl: string;
  verificationUrl: string;
  qrCode: string;
}

export interface Achievement {
  id: number;
  badgeName: string;
  badgeIcon: string;
  description: string;
  earnedDate: string;
  points: number;
}
```

---

## 4. Component Architecture

### 4.1 Component Categories

```
components/
├── ui/                    # Primitive UI components (atoms)
│   ├── Button/
│   ├── Card/
│   ├── Input/
│   └── ...
│
├── layout/                # Layout structure components
│   ├── Header/
│   ├── Footer/
│   ├── MegaMenu/
│   └── Container/
│
├── sections/              # Page section components (organisms)
│   ├── HeroSection/
│   ├── ServicesOverview/
│   └── ...
│
├── features/              # Feature-specific components
│   ├── courses/
│   ├── consultancy/
│   ├── dashboard/
│   └── auth/
│
└── providers/             # Context providers
    ├── AuthProvider.tsx
    ├── CartProvider.tsx
    └── ThemeProvider.tsx
```

### 4.2 Key Component Implementations

```typescript
// components/ui/Button/Button.tsx

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 shadow-sm',
        outline: 'border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-700',
        ghost: 'hover:bg-gray-100 text-gray-700',
        link: 'text-primary-600 underline-offset-4 hover:underline',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

```typescript
// components/ui/Card/Card.tsx

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'ghost';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-gray-100 shadow-sm',
      elevated: 'bg-white shadow-lg',
      bordered: 'bg-white border-2 border-gray-200',
      ghost: 'bg-gray-50',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl overflow-hidden',
          variants[variant],
          hover && 'transition-all duration-300 hover:shadow-lg hover:border-primary-200 hover:-translate-y-1',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pb-0', className)} {...props} />
  )
);

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6', className)} {...props} />
  )
);

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0 flex items-center', className)} {...props} />
  )
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };
```

```typescript
// components/features/courses/CourseCard.tsx

import Image from 'next/image';
import Link from 'next/link';
import { Clock, Users, Star, Award, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Course } from '@/types/course';
import { formatCurrency, formatDuration } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function CourseCard({ course, variant = 'default' }: CourseCardProps) {
  const deliveryBadgeColors = {
    'e-learning': 'bg-blue-50 text-blue-700 border-blue-200',
    'face-to-face': 'bg-green-50 text-green-700 border-green-200',
    'virtual': 'bg-purple-50 text-purple-700 border-purple-200',
    'in-house': 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <Link href={`/courses/${course.slug}`}>
      <Card hover className="h-full group">
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={course.thumbnailUrl || '/images/course-placeholder.jpg'}
            alt={course.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay with Play Button */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-6 h-6 text-primary-600 ml-1" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={deliveryBadgeColors[course.deliveryMethod]}>
              {course.deliveryMethod.replace('-', ' ')}
            </Badge>
            {course.accreditation && (
              <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                <Award className="w-3 h-3 mr-1" />
                {course.accreditation}
              </Badge>
            )}
          </div>

          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-white text-gray-900 font-bold shadow-sm">
              {course.listPrice === 0 ? 'Free' : formatCurrency(course.listPrice)}
            </Badge>
          </div>
        </div>

        <CardContent className="p-5">
          {/* Category */}
          <p className="text-sm text-primary-600 font-medium mb-2">
            {course.categoryName}
          </p>

          {/* Title */}
          <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {course.name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {course.shortDescription}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDuration(course.duration)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {course.enrollmentCount}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-gray-900">{course.ratingAvg.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({course.ratingCount})</span>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-2">
              <Image
                src={course.instructorAvatar || '/images/avatar-placeholder.png'}
                alt={course.instructorName}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-sm text-gray-600">{course.instructorName}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

---

## 5. State Management

### 5.1 Authentication State

```typescript
// lib/stores/auth-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!res.ok) throw new Error('Login failed');

          const { user } = await res.json();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        set({ user: null, isAuthenticated: false });
      },

      refreshUser: async () => {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const { user } = await res.json();
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

### 5.2 Cart State

```typescript
// lib/stores/cart-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: number;
  courseId: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Computed
  totalItems: () => number;
  totalPrice: () => number;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (courseId: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  syncWithServer: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),

      totalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.courseId === item.courseId);

        if (existingItem) {
          // Course already in cart - don't add duplicates
          return;
        }

        set({ items: [...items, { ...item, quantity: 1 }] });
      },

      removeItem: (courseId) => {
        set({ items: get().items.filter((item) => item.courseId !== courseId) });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),

      syncWithServer: async () => {
        // Sync cart with Odoo sale.order on login
        const items = get().items;
        if (items.length === 0) return;

        try {
          await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
          });
        } catch (error) {
          console.error('Failed to sync cart:', error);
        }
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
```

---

## 6. Data Fetching Patterns

### 6.1 Server Components (Default)

```typescript
// app/courses/page.tsx

import { Suspense } from 'react';
import { getCourses } from '@/lib/api/courses';
import { CourseGrid } from '@/components/features/courses/CourseGrid';
import { CourseFilters } from '@/components/features/courses/CourseFilters';
import { Skeleton } from '@/components/ui/Skeleton';

interface CoursesPageProps {
  searchParams: {
    category?: string;
    level?: string;
    delivery?: string;
    page?: string;
    q?: string;
  };
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const { courses, pagination, categories, filters } = await getCourses(searchParams);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <Suspense fallback={<Skeleton className="h-96" />}>
            <CourseFilters
              categories={categories}
              currentFilters={filters}
            />
          </Suspense>
        </aside>

        {/* Course Grid */}
        <main className="flex-1">
          <Suspense fallback={<CourseGridSkeleton />}>
            <CourseGrid courses={courses} pagination={pagination} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-80 rounded-2xl" />
      ))}
    </div>
  );
}
```

### 6.2 Client-Side Data Fetching with SWR

```typescript
// components/features/courses/CourseReviews.tsx

'use client';

import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { CourseReview } from '@/types/course';
import { ReviewCard } from './ReviewCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const getKey = (courseId: number) => (pageIndex: number, previousPageData: any) => {
  if (previousPageData && !previousPageData.reviews.length) return null;
  return `/api/courses/${courseId}/reviews?page=${pageIndex + 1}&limit=5`;
};

interface CourseReviewsProps {
  courseId: number;
  initialData?: CourseReview[];
}

export function CourseReviews({ courseId, initialData }: CourseReviewsProps) {
  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(
    getKey(courseId),
    fetcher,
    { fallbackData: initialData ? [{ reviews: initialData }] : undefined }
  );

  const reviews = data ? data.flatMap((page) => page.reviews) : [];
  const isEmpty = data?.[0]?.reviews?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.reviews?.length < 5);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="text-center py-12 text-gray-500">
        No reviews yet. Be the first to review this course!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      {!isReachingEnd && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setSize(size + 1)}
            isLoading={isValidating}
          >
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
}
```

---

## 7. SEO & Metadata

### 7.1 Dynamic Metadata Generation

```typescript
// app/courses/[slug]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCourseBySlug } from '@/lib/api/courses';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourseBySlug(params.slug);

  if (!course) {
    return {
      title: 'Course Not Found',
    };
  }

  return {
    title: `${course.name} | SEI Tech Training`,
    description: course.metaDescription || course.shortDescription,
    keywords: course.keywords,
    openGraph: {
      title: course.name,
      description: course.shortDescription,
      images: [{ url: course.imageUrl, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: course.name,
      description: course.shortDescription,
      images: [course.imageUrl],
    },
  };
}

export async function generateStaticParams() {
  const courses = await getAllCourseSlugs();
  return courses.map((course) => ({ slug: course.slug }));
}

export default async function CoursePage({ params }: Props) {
  const course = await getCourseBySlug(params.slug);

  if (!course) {
    notFound();
  }

  // JSON-LD Structured Data
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.shortDescription,
    provider: {
      '@type': 'Organization',
      name: 'SEI Tech International',
      url: 'https://seitechinternational.org.uk',
    },
    image: course.imageUrl,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: course.ratingAvg,
      reviewCount: course.ratingCount,
    },
    offers: {
      '@type': 'Offer',
      price: course.listPrice,
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
    },
    courseMode: course.deliveryMethod,
    educationalLevel: course.difficultyLevel,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: course.deliveryMethod,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <CourseDetailPage course={course} />
    </>
  );
}
```

---

## 8. Performance Optimization

### 8.1 Image Optimization

```typescript
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'api.seitechinternational.org.uk',
      'res.cloudinary.com',
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
```

### 8.2 Caching Strategy

```typescript
// lib/api/cache.ts

import { unstable_cache } from 'next/cache';

export const getCachedCourses = unstable_cache(
  async (filters: string) => {
    // Fetch courses from Odoo
    return fetchCoursesFromOdoo(JSON.parse(filters));
  },
  ['courses'],
  {
    revalidate: 60 * 5, // 5 minutes
    tags: ['courses'],
  }
);

export const getCachedCourse = unstable_cache(
  async (slug: string) => {
    return fetchCourseBySlug(slug);
  },
  ['course'],
  {
    revalidate: 60 * 10, // 10 minutes
    tags: ['course'],
  }
);

// Revalidation API route
// app/api/revalidate/route.ts

import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { tag, secret } = await request.json();

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  revalidateTag(tag);
  return NextResponse.json({ revalidated: true });
}
```

---

## 9. Deployment Configuration

### 9.1 Vercel Configuration

```json
// vercel.json

{
  "framework": "nextjs",
  "regions": ["lhr1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "origin-when-cross-origin"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    }
  ]
}
```

### 9.2 Environment Variables (Vercel)

```
# Production Environment Variables

# Odoo API
NEXT_PUBLIC_ODOO_URL=https://api.seitechinternational.org.uk
ODOO_DATABASE=seitech_prod
ODOO_API_KEY=your_production_api_key

# Authentication
NEXTAUTH_URL=https://seitechinternational.org.uk
NEXTAUTH_SECRET=your_nextauth_secret_here

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Payments
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Cache
REVALIDATION_SECRET=your_revalidation_secret

# Image CDN
NEXT_PUBLIC_CLOUDINARY_CLOUD=seitech
```

---

## 10. Testing Strategy

### 10.1 Testing Stack

- **Unit Tests**: Vitest + React Testing Library
- **Integration Tests**: Playwright
- **E2E Tests**: Playwright
- **API Tests**: Vitest

### 10.2 Test Examples

```typescript
// __tests__/components/CourseCard.test.tsx

import { render, screen } from '@testing-library/react';
import { CourseCard } from '@/components/features/courses/CourseCard';
import { mockCourse } from '@/__mocks__/course';

describe('CourseCard', () => {
  it('renders course information correctly', () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText(mockCourse.name)).toBeInTheDocument();
    expect(screen.getByText(mockCourse.categoryName)).toBeInTheDocument();
    expect(screen.getByText(/£/)).toBeInTheDocument();
  });

  it('shows correct delivery method badge', () => {
    render(<CourseCard course={{ ...mockCourse, deliveryMethod: 'e-learning' }} />);

    expect(screen.getByText('e-learning')).toBeInTheDocument();
  });

  it('displays free badge when price is 0', () => {
    render(<CourseCard course={{ ...mockCourse, listPrice: 0 }} />);

    expect(screen.getByText('Free')).toBeInTheDocument();
  });
});
```

---

## Appendix A: API Response Formats

### Courses List Response

```json
{
  "courses": [
    {
      "id": 1,
      "name": "Fire Warden Awareness",
      "slug": "fire-warden-awareness",
      "shortDescription": "Essential training for fire wardens...",
      "imageUrl": "https://api.seitech.../image.jpg",
      "listPrice": 25.00,
      "deliveryMethod": "e-learning",
      "difficultyLevel": "beginner",
      "categoryId": 5,
      "categoryName": "Fire Safety",
      "ratingAvg": 4.8,
      "ratingCount": 127,
      "duration": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4
  },
  "filters": {
    "categories": [...],
    "levels": ["beginner", "intermediate", "advanced"],
    "deliveryMethods": ["e-learning", "face-to-face", "virtual", "in-house"]
  }
}
```

---

*This technical architecture document provides the foundation for implementing the SEI Tech International frontend. All implementations should follow these patterns for consistency and maintainability.*
