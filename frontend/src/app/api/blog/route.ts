import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedOdooClient } from '@/lib/api/odoo-client';
import type { ApiResponse, BlogListResponse, BlogPost, BlogCategory } from '@/types';

export const dynamic = 'force-dynamic';

const BlogFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  category: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  featured: z.coerce.boolean().optional(),
});

// Mock blog posts for development
const mockBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'The Importance of Fire Risk Assessments for UK Businesses',
    slug: 'importance-of-fire-risk-assessments',
    excerpt: 'Understanding why fire risk assessments are legally required and how they protect your workforce and premises.',
    content: '',
    imageUrl: '/images/blog/fire-risk-assessment.jpg',
    author: {
      id: 1,
      name: 'Sarah Mitchell',
      avatar: '/images/team/sarah-mitchell.jpg',
      role: 'Fire Safety Consultant',
      bio: 'Sarah has over 15 years of experience in fire safety consulting.',
    },
    category: 'Fire Safety',
    categorySlug: 'fire-safety',
    publishedAt: '2024-12-15T10:00:00Z',
    readTime: 8,
    tags: ['fire safety', 'compliance', 'risk assessment', 'UK regulations'],
    isFeatured: true,
  },
  {
    id: 2,
    title: 'IOSH Managing Safely: A Complete Guide for 2024',
    slug: 'iosh-managing-safely-guide',
    excerpt: 'Everything you need to know about the IOSH Managing Safely qualification and how it can benefit your career.',
    content: '',
    imageUrl: '/images/blog/iosh-managing-safely.jpg',
    author: {
      id: 2,
      name: 'James Thompson',
      avatar: '/images/team/james-thompson.jpg',
      role: 'Health & Safety Trainer',
      bio: 'James is an accredited IOSH trainer with extensive industry experience.',
    },
    category: 'IOSH Training',
    categorySlug: 'iosh-training',
    publishedAt: '2024-12-10T14:30:00Z',
    readTime: 12,
    tags: ['IOSH', 'management training', 'health and safety', 'certification'],
    isFeatured: false,
  },
  {
    id: 3,
    title: 'NEBOSH vs IOSH: Which Qualification is Right for You?',
    slug: 'nebosh-vs-iosh-which-is-right',
    excerpt: 'A comprehensive comparison of NEBOSH and IOSH qualifications to help you choose the right path for your health and safety career.',
    content: '',
    imageUrl: '/images/blog/nebosh-vs-iosh.jpg',
    author: {
      id: 1,
      name: 'Sarah Mitchell',
      avatar: '/images/team/sarah-mitchell.jpg',
      role: 'Fire Safety Consultant',
    },
    category: 'Career Guidance',
    categorySlug: 'career-guidance',
    publishedAt: '2024-12-05T09:00:00Z',
    readTime: 10,
    tags: ['NEBOSH', 'IOSH', 'career', 'qualifications', 'comparison'],
    isFeatured: false,
  },
  {
    id: 4,
    title: 'Mental Health First Aid in the Workplace: Why It Matters',
    slug: 'mental-health-first-aid-workplace',
    excerpt: 'Learn how Mental Health First Aid training can transform your workplace culture and support employee wellbeing.',
    content: '',
    imageUrl: '/images/blog/mental-health-workplace.jpg',
    author: {
      id: 3,
      name: 'Dr. Emily Roberts',
      avatar: '/images/team/emily-roberts.jpg',
      role: 'Mental Health Specialist',
      bio: 'Dr. Roberts is a certified mental health practitioner and workplace wellbeing consultant.',
    },
    category: 'Workplace Wellbeing',
    categorySlug: 'workplace-wellbeing',
    publishedAt: '2024-11-28T11:00:00Z',
    readTime: 7,
    tags: ['mental health', 'first aid', 'workplace', 'wellbeing', 'training'],
    isFeatured: true,
  },
  {
    id: 5,
    title: 'Manual Handling Training: Reducing Workplace Injuries',
    slug: 'manual-handling-training-reducing-injuries',
    excerpt: 'Discover how proper manual handling training can significantly reduce workplace injuries and associated costs.',
    content: '',
    imageUrl: '/images/blog/manual-handling.jpg',
    author: {
      id: 2,
      name: 'James Thompson',
      avatar: '/images/team/james-thompson.jpg',
      role: 'Health & Safety Trainer',
    },
    category: 'Health & Safety',
    categorySlug: 'health-and-safety',
    publishedAt: '2024-11-20T15:00:00Z',
    readTime: 6,
    tags: ['manual handling', 'workplace safety', 'injuries', 'training'],
    isFeatured: false,
  },
  {
    id: 6,
    title: 'Understanding COSHH Regulations: A Practical Guide',
    slug: 'understanding-coshh-regulations',
    excerpt: 'A practical guide to understanding and implementing COSHH regulations in your workplace.',
    content: '',
    imageUrl: '/images/blog/coshh-regulations.jpg',
    author: {
      id: 1,
      name: 'Sarah Mitchell',
      avatar: '/images/team/sarah-mitchell.jpg',
      role: 'Fire Safety Consultant',
    },
    category: 'Compliance',
    categorySlug: 'compliance',
    publishedAt: '2024-11-15T10:00:00Z',
    readTime: 9,
    tags: ['COSHH', 'regulations', 'compliance', 'hazardous substances'],
    isFeatured: false,
  },
  {
    id: 7,
    title: 'First Aid at Work: Legal Requirements for UK Employers',
    slug: 'first-aid-work-legal-requirements',
    excerpt: 'Understanding the legal requirements for first aid provision in UK workplaces.',
    content: '',
    imageUrl: '/images/blog/first-aid-work.jpg',
    author: {
      id: 3,
      name: 'Dr. Emily Roberts',
      avatar: '/images/team/emily-roberts.jpg',
      role: 'Mental Health Specialist',
    },
    category: 'First Aid',
    categorySlug: 'first-aid',
    publishedAt: '2024-11-10T14:00:00Z',
    readTime: 8,
    tags: ['first aid', 'legal requirements', 'employers', 'UK law'],
    isFeatured: false,
  },
  {
    id: 8,
    title: 'Environmental Management ISO 14001: Getting Started',
    slug: 'environmental-management-iso-14001',
    excerpt: 'An introduction to ISO 14001 environmental management systems and how to implement them in your organization.',
    content: '',
    imageUrl: '/images/blog/iso-14001.jpg',
    author: {
      id: 2,
      name: 'James Thompson',
      avatar: '/images/team/james-thompson.jpg',
      role: 'Health & Safety Trainer',
    },
    category: 'Environmental',
    categorySlug: 'environmental',
    publishedAt: '2024-11-05T09:30:00Z',
    readTime: 11,
    tags: ['ISO 14001', 'environmental management', 'sustainability', 'certification'],
    isFeatured: false,
  },
];

const mockCategories: BlogCategory[] = [
  { id: 1, name: 'Fire Safety', slug: 'fire-safety', postCount: 8 },
  { id: 2, name: 'IOSH Training', slug: 'iosh-training', postCount: 12 },
  { id: 3, name: 'Career Guidance', slug: 'career-guidance', postCount: 6 },
  { id: 4, name: 'Workplace Wellbeing', slug: 'workplace-wellbeing', postCount: 9 },
  { id: 5, name: 'Health & Safety', slug: 'health-and-safety', postCount: 15 },
  { id: 6, name: 'Compliance', slug: 'compliance', postCount: 7 },
  { id: 7, name: 'First Aid', slug: 'first-aid', postCount: 5 },
  { id: 8, name: 'Environmental', slug: 'environmental', postCount: 4 },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const filters = BlogFiltersSchema.parse(params);

    const odoo = await getAuthenticatedOdooClient();

    // Build domain for Odoo blog.post model
    const domain: [string, string, any][] = [['is_published', '=', true]];

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

    try {
      // Get total count
      const total = await odoo.searchCount('blog.post', domain);

      // Calculate pagination
      const offset = (filters.page - 1) * filters.limit;
      const totalPages = Math.ceil(total / filters.limit);

      // Fetch blog posts
      const fields = [
        'id',
        'name',
        'subtitle',
        'website_slug',
        'teaser',
        'content',
        'cover_properties',
        'blog_id',
        'author_id',
        'tag_ids',
        'published_date',
        'visits',
        'is_published',
        'is_featured',
        'website_meta_title',
        'website_meta_description',
      ];

      const odooRecords = await odoo.searchRead<any>(
        'blog.post',
        domain,
        fields,
        {
          offset,
          limit: filters.limit,
          order: 'published_date desc',
        }
      );

      // Transform Odoo records to BlogPost objects
      const posts: BlogPost[] = odooRecords.map((record: any) => {
        const wordCount = record.content ? record.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));

        return {
          id: record.id,
          title: record.name,
          slug: record.website_slug || String(record.id),
          excerpt: record.teaser || record.subtitle || '',
          content: record.content || '',
          imageUrl: record.cover_properties ? JSON.parse(record.cover_properties).background_image || '' : '',
          author: {
            id: record.author_id?.[0] || 0,
            name: record.author_id?.[1] || 'SEI Tech Team',
            avatar: '',
          },
          category: record.blog_id?.[1] || 'General',
          categorySlug: record.blog_id?.[1]?.toLowerCase().replace(/\s+/g, '-') || 'general',
          publishedAt: record.published_date || new Date().toISOString(),
          readTime,
          tags: [], // Would need additional query to get tag names
          metaTitle: record.website_meta_title || record.name,
          metaDescription: record.website_meta_description || record.teaser || '',
          isFeatured: record.is_featured || false,
        };
      });

      // Fetch blog categories
      const blogRecords = await odoo.searchRead<any>(
        'blog.blog',
        [],
        ['id', 'name', 'subtitle']
      );

      const categories: BlogCategory[] = blogRecords.map((blog: any) => ({
        id: blog.id,
        name: blog.name,
        slug: blog.name.toLowerCase().replace(/\s+/g, '-'),
        postCount: 0, // Would need count query
      }));

      const featuredPost = posts.find(p => p.isFeatured) || posts[0];

      const response: ApiResponse<BlogListResponse> = {
        success: true,
        data: {
          posts,
          pagination: {
            page: filters.page,
            limit: filters.limit,
            total,
            totalPages,
          },
          categories,
          featuredPost,
        },
      };

      return NextResponse.json(response);
    } catch (odooError) {
      // Fallback to mock data if Odoo connection fails
      console.warn('Using mock blog data:', odooError);

      let filteredPosts = [...mockBlogPosts];

      if (filters.category) {
        filteredPosts = filteredPosts.filter(p =>
          p.categorySlug === filters.category ||
          p.category.toLowerCase().includes(filters.category!.toLowerCase())
        );
      }

      if (filters.tag) {
        filteredPosts = filteredPosts.filter(p =>
          p.tags.some(t => t.toLowerCase().includes(filters.tag!.toLowerCase()))
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredPosts = filteredPosts.filter(p =>
          p.title.toLowerCase().includes(searchLower) ||
          p.excerpt.toLowerCase().includes(searchLower)
        );
      }

      if (filters.featured) {
        filteredPosts = filteredPosts.filter(p => p.isFeatured);
      }

      const total = filteredPosts.length;
      const offset = (filters.page - 1) * filters.limit;
      const totalPages = Math.ceil(total / filters.limit);
      const paginatedPosts = filteredPosts.slice(offset, offset + filters.limit);

      const response: ApiResponse<BlogListResponse> = {
        success: true,
        data: {
          posts: paginatedPosts,
          pagination: {
            page: filters.page,
            limit: filters.limit,
            total,
            totalPages,
          },
          categories: mockCategories,
          featuredPost: mockBlogPosts.find(p => p.isFeatured),
        },
      };

      return NextResponse.json(response);
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid query parameters',
          data: null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch blog posts',
        data: null,
      },
      { status: 500 }
    );
  }
}
