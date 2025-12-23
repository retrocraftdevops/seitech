export * from './course';
export * from './schedule';
export * from './service';
export * from './user';
export * from './cms';

// Common types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface NavItem {
  title: string;
  href: string;
  description?: string;
  icon?: string;
  children?: NavItem[];
  isExternal?: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  content: string;
  rating: number;
}

export interface BlogAuthor {
  id: number;
  name: string;
  avatar: string;
  role?: string;
  bio?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: BlogAuthor;
  category: string;
  categorySlug?: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  isFeatured?: boolean;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  postCount: number;
}

export interface BlogListResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  categories: BlogCategory[];
  featuredPost?: BlogPost;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}
