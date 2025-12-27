/**
 * Odoo Data Service
 * Centralized service for fetching all data from Odoo backend
 * Replaces all mock/fake data with real Odoo data
 */

import { getAuthenticatedOdooClient } from '../api/odoo-client';
import type { OdooClient, Domain } from '../api/odoo-client';
import { generateUniqueSlug } from '../utils/slug';

// ===== COURSE SERVICE =====
export interface OdooCourse {
  id: number;
  name: string;
  website_slug: string;
  description: string;
  image_1024: string;
  channel_type: string;
  total_slides: number;
  total_time: number;
  rating_avg: number;
  rating_count: number;
  members_count: number;
  category_id: [number, string] | false;
  user_id: [number, string] | false;
  tag_ids: number[];
  enroll_msg: string;
  enroll_group_ids: number[];
  website_published: boolean;
  is_member: boolean;
  completed: boolean;
  completion: number;
}

export class CourseService {
  private odoo: OdooClient | null = null;

  async getClient(): Promise<OdooClient> {
    if (!this.odoo) {
      this.odoo = await getAuthenticatedOdooClient();
    }
    return this.odoo;
  }

  async getAllCourses(filters: {
    category?: string;
    level?: string;
    search?: string;
    featured?: boolean;
    popular?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    const odoo = await this.getClient();
    const domain: Domain[] = [['website_published', '=', true]];

    if (filters.category) {
      domain.push(['category_id.name', 'ilike', filters.category]);
    }

    if (filters.search) {
      domain.push('|' as any, ['name', 'ilike', filters.search], ['description', 'ilike', filters.search]);
    }

    const fields = [
      'id', 'name', 'description', 'image_1024',
      'channel_type', 'total_slides', 'total_time', 'rating_avg',
      'rating_count', 'members_count', 'category_id', 'user_id',
      'tag_ids', 'enroll_msg', 'enroll_group_ids', 'website_published',
      'is_member', 'completed', 'completion'
    ];

    const total = await odoo.searchCount('slide.channel', domain);
    const courses = await odoo.searchRead<OdooCourse>(
      'slide.channel',
      domain,
      fields,
      {
        offset: filters.offset || 0,
        limit: filters.limit || 80,
        order: 'create_date desc'
      }
    );

    // Generate slugs for all courses
    courses.forEach(course => {
      course.website_slug = generateUniqueSlug(course.name, course.id);
    });

    return { courses, total };
  }

  async getCourseById(id: number) {
    const odoo = await this.getClient();
    const fields = [
      'id', 'name', 'description', 'image_1024',
      'channel_type', 'total_slides', 'total_time', 'rating_avg',
      'rating_count', 'members_count', 'category_id', 'user_id',
      'tag_ids', 'enroll_msg', 'enroll_group_ids', 'website_published',
      'is_member', 'completed', 'completion', 'slide_ids'
    ];

    const courses = await odoo.read<OdooCourse>('slide.channel', [id], fields);
    if (courses[0]) {
      courses[0].website_slug = generateUniqueSlug(courses[0].name, courses[0].id);
    }
    return courses[0] || null;
  }

  async getCourseBySlug(slug: string) {
    const odoo = await this.getClient();
    // Extract ID from slug (format: name-id)
    const idMatch = slug.match(/-(\d+)$/);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      return this.getCourseById(id);
    }
    
    // Fallback: search by name similarity
    const nameFromSlug = slug.replace(/-\d+$/, '').replace(/-/g, ' ');
    const domain: Domain[] = [['name', 'ilike', nameFromSlug]];
    const fields = [
      'id', 'name', 'description', 'image_1024',
      'channel_type', 'total_slides', 'total_time', 'rating_avg',
      'rating_count', 'members_count', 'category_id', 'user_id',
      'tag_ids', 'enroll_msg', 'enroll_group_ids', 'website_published',
      'is_member', 'completed', 'completion', 'slide_ids'
    ];

    const courses = await odoo.searchRead<OdooCourse>('slide.channel', domain, fields, { limit: 1 });
    if (courses[0]) {
      courses[0].website_slug = generateUniqueSlug(courses[0].name, courses[0].id);
    }
    return courses[0] || null;
  }

  async getCategories() {
    const odoo = await this.getClient();
    const categories = await odoo.searchRead<{ id: number; name: string; sequence: number }>(
      'slide.channel.category',
      [],
      ['id', 'name', 'sequence'],
      { order: 'sequence asc' }
    );
    return categories;
  }
}

// ===== USER SERVICE =====
export interface OdooUser {
  id: number;
  name: string;
  login: string;
  email: string;
  partner_id: [number, string];
  groups_id: number[];
  active: boolean;
  create_date: string;
  login_date: string;
}

export class UserService {
  private odoo: OdooClient | null = null;

  async getClient(): Promise<OdooClient> {
    if (!this.odoo) {
      this.odoo = await getAuthenticatedOdooClient();
    }
    return this.odoo;
  }

  async getAllUsers(filters: {
    search?: string;
    role?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    const odoo = await this.getClient();
    const domain: Domain[] = [];

    if (filters.search) {
      domain.push('|' as any, ['name', 'ilike', filters.search], ['login', 'ilike', filters.search]);
    }

    if (filters.active !== undefined) {
      domain.push(['active', '=', filters.active]);
    }

    const fields = [
      'id', 'name', 'login', 'email', 'partner_id',
      'groups_id', 'active', 'create_date', 'login_date'
    ];

    const total = await odoo.searchCount('res.users', domain);
    const users = await odoo.searchRead<OdooUser>(
      'res.users',
      domain,
      fields,
      {
        offset: filters.offset || 0,
        limit: filters.limit || 50,
        order: 'create_date desc'
      }
    );

    return { users, total };
  }

  async getUserById(id: number) {
    const odoo = await this.getClient();
    const fields = [
      'id', 'name', 'login', 'email', 'partner_id',
      'groups_id', 'active', 'create_date', 'login_date', 'image_1920'
    ];
    const users = await odoo.read<OdooUser>('res.users', [id], fields);
    return users[0] || null;
  }

  async createUser(data: {
    name: string;
    login: string;
    email: string;
    password: string;
    groups_id?: number[];
  }) {
    const odoo = await this.getClient();
    const userId = await odoo.create('res.users', data);
    return userId;
  }

  async updateUser(id: number, data: Partial<OdooUser>) {
    const odoo = await this.getClient();
    return await odoo.write('res.users', [id], data);
  }

  async deleteUser(id: number) {
    const odoo = await this.getClient();
    return await odoo.write('res.users', [id], { active: false });
  }
}

// ===== BLOG SERVICE =====
export interface OdooBlogPost {
  id: number;
  name: string;
  subtitle: string;
  website_slug: string;
  teaser: string;
  content: string;
  cover_properties: string;
  blog_id: [number, string];
  author_id: [number, string];
  tag_ids: number[];
  published_date: string;
  visits: number;
  is_published: boolean;
  is_featured?: boolean;
  website_meta_title: string;
  website_meta_description: string;
}

export class BlogService {
  private odoo: OdooClient | null = null;

  async getClient(): Promise<OdooClient> {
    if (!this.odoo) {
      this.odoo = await getAuthenticatedOdooClient();
    }
    return this.odoo;
  }

  async getAllPosts(filters: {
    category?: string;
    tag?: string;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    const odoo = await this.getClient();
    const domain: Domain[] = [['is_published', '=', true]];

    if (filters.category) {
      domain.push(['blog_id.name', 'ilike', filters.category]);
    }

    if (filters.tag) {
      domain.push(['tag_ids.name', 'ilike', filters.tag]);
    }

    if (filters.search) {
      domain.push(['name', 'ilike', filters.search]);
    }

    if (filters.featured) {
      domain.push(['is_featured', '=', true]);
    }

    const fields = [
      'id', 'name', 'subtitle', 'teaser', 'content',
      'cover_properties', 'blog_id', 'author_id', 'tag_ids',
      'published_date', 'visits', 'is_published', 'is_featured',
      'website_meta_title', 'website_meta_description'
    ];

    const total = await odoo.searchCount('blog.post', domain);
    const posts = await odoo.searchRead<OdooBlogPost>(
      'blog.post',
      domain,
      fields,
      {
        offset: filters.offset || 0,
        limit: filters.limit || 10,
        order: 'published_date desc'
      }
    );

    // Generate slugs for all posts
    posts.forEach(post => {
      post.website_slug = generateUniqueSlug(post.name, post.id);
    });

    return { posts, total };
  }

  async getPostBySlug(slug: string) {
    const odoo = await this.getClient();
    // Extract ID from slug (format: name-id)
    const idMatch = slug.match(/-(\d+)$/);
    if (idMatch) {
      const id = parseInt(idMatch[1]);
      const fields = [
        'id', 'name', 'subtitle', 'teaser', 'content',
        'cover_properties', 'blog_id', 'author_id', 'tag_ids',
        'published_date', 'visits', 'is_published', 'is_featured',
        'website_meta_title', 'website_meta_description'
      ];
      const posts = await odoo.read<OdooBlogPost>('blog.post', [id], fields);
      if (posts[0]) {
        posts[0].website_slug = generateUniqueSlug(posts[0].name, posts[0].id);
      }
      return posts[0] || null;
    }
    
    // Fallback: search by name similarity
    const nameFromSlug = slug.replace(/-\d+$/, '').replace(/-/g, ' ');
    const domain: Domain[] = [
      ['name', 'ilike', nameFromSlug],
      ['is_published', '=', true]
    ];

    const fields = [
      'id', 'name', 'subtitle', 'teaser', 'content',
      'cover_properties', 'blog_id', 'author_id', 'tag_ids',
      'published_date', 'visits', 'is_published', 'is_featured',
      'website_meta_title', 'website_meta_description'
    ];

    const posts = await odoo.searchRead<OdooBlogPost>('blog.post', domain, fields, { limit: 1 });
    if (posts[0]) {
      posts[0].website_slug = generateUniqueSlug(posts[0].name, posts[0].id);
    }
    return posts[0] || null;
  }

  async getCategories() {
    const odoo = await this.getClient();
    const categories = await odoo.searchRead<{ id: number; name: string; subtitle: string }>(
      'blog.blog',
      [],
      ['id', 'name', 'subtitle']
    );
    return categories;
  }
}

// ===== INSTRUCTOR SERVICE =====
export interface OdooInstructor {
  id: number;
  name: string;
  email: string;
  phone: string;
  image_1920: string;
  user_id: [number, string] | false;
  channel_ids: number[];
  active: boolean;
  create_date: string;
}

export class InstructorService {
  private odoo: OdooClient | null = null;

  async getClient(): Promise<OdooClient> {
    if (!this.odoo) {
      this.odoo = await getAuthenticatedOdooClient();
    }
    return this.odoo;
  }

  async getAllInstructors(filters: {
    search?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    const odoo = await this.getClient();
    const domain: Domain[] = [];

    if (filters.search) {
      domain.push('|' as any, ['name', 'ilike', filters.search], ['email', 'ilike', filters.search]);
    }

    if (filters.active !== undefined) {
      domain.push(['active', '=', filters.active]);
    }

    const fields = [
      'id', 'name', 'email', 'phone', 'image_1920',
      'user_id', 'channel_ids', 'active', 'create_date'
    ];

    const total = await odoo.searchCount('seitech.instructor', domain);
    const instructors = await odoo.searchRead<OdooInstructor>(
      'seitech.instructor',
      domain,
      fields,
      {
        offset: filters.offset || 0,
        limit: filters.limit || 50,
        order: 'create_date desc'
      }
    );

    return { instructors, total };
  }

  async getInstructorById(id: number) {
    const odoo = await this.getClient();
    const fields = [
      'id', 'name', 'email', 'phone', 'image_1920',
      'user_id', 'channel_ids', 'active', 'create_date'
    ];
    const instructors = await odoo.read<OdooInstructor>('seitech.instructor', [id], fields);
    return instructors[0] || null;
  }

  async createInstructor(data: {
    name: string;
    email: string;
    phone?: string;
    user_id?: number;
  }) {
    const odoo = await this.getClient();
    const instructorId = await odoo.create('seitech.instructor', data);
    return instructorId;
  }

  async updateInstructor(id: number, data: Partial<OdooInstructor>) {
    const odoo = await this.getClient();
    return await odoo.write('seitech.instructor', [id], data);
  }

  async deleteInstructor(id: number) {
    const odoo = await this.getClient();
    return await odoo.write('seitech.instructor', [id], { active: false });
  }
}

// ===== ANALYTICS SERVICE =====
export interface OdooAnalytics {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  activeUsers: number;
  completionRate: number;
}

export class AnalyticsService {
  private odoo: OdooClient | null = null;

  async getClient(): Promise<OdooClient> {
    if (!this.odoo) {
      this.odoo = await getAuthenticatedOdooClient();
    }
    return this.odoo;
  }

  async getOverview(): Promise<OdooAnalytics> {
    const odoo = await this.getClient();

    const [totalUsers, totalCourses, totalEnrollments] = await Promise.all([
      odoo.searchCount('res.users', [['active', '=', true]]),
      odoo.searchCount('slide.channel', [['website_published', '=', true]]),
      odoo.searchCount('seitech.enrollment', [])
    ]);

    // Get revenue from payments
    const payments = await odoo.searchRead<{ amount: number }>(
      'account.payment',
      [['state', '=', 'posted']],
      ['amount']
    );
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Get active users (logged in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await odoo.searchCount('res.users', [
      ['login_date', '>=', thirtyDaysAgo.toISOString().split('T')[0]]
    ]);

    // Get completion rate
    const completedEnrollments = await odoo.searchCount('seitech.enrollment', [
      ['state', '=', 'completed']
    ]);
    const completionRate = totalEnrollments > 0
      ? (completedEnrollments / totalEnrollments) * 100
      : 0;

    return {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      activeUsers,
      completionRate
    };
  }

  async getRecentEnrollments(limit = 10) {
    const odoo = await this.getClient();
    const enrollments = await odoo.searchRead<any>(
      'seitech.enrollment',
      [],
      ['id', 'student_id', 'channel_id', 'enrollment_date', 'state', 'progress'],
      { limit, order: 'enrollment_date desc' }
    );
    return enrollments;
  }

  async getTopCourses(limit = 10) {
    const odoo = await this.getClient();
    const courses = await odoo.searchRead<OdooCourse>(
      'slide.channel',
      [['website_published', '=', true]],
      ['id', 'name', 'members_count', 'rating_avg'],
      { limit, order: 'members_count desc' }
    );
    return courses;
  }
}

// Export singleton instances
export const courseService = new CourseService();
export const userService = new UserService();
export const blogService = new BlogService();
export const instructorService = new InstructorService();
export const analyticsService = new AnalyticsService();
