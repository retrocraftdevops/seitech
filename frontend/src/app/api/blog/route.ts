import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { blogService } from '@/lib/services/odoo-data-service';
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const filters = BlogFiltersSchema.parse(params);

    // Calculate pagination
    const offset = (filters.page - 1) * filters.limit;

    // Fetch from Odoo using service
    const { posts: odooRecords, total } = await blogService.getAllPosts({
      category: filters.category,
      tag: filters.tag,
      search: filters.search,
      featured: filters.featured,
      limit: filters.limit,
      offset
    });

    const totalPages = Math.ceil(total / filters.limit);

    // Transform Odoo records to BlogPost objects
    const posts: BlogPost[] = odooRecords.map((record) => {
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
        tags: [],
        metaTitle: record.website_meta_title || record.name,
        metaDescription: record.website_meta_description || record.teaser || '',
        isFeatured: record.is_featured || false,
      };
    });

    // Fetch blog categories
    const blogRecords = await blogService.getCategories();
    const categories: BlogCategory[] = blogRecords.map((blog) => ({
      id: blog.id,
      name: blog.name,
      slug: blog.name.toLowerCase().replace(/\s+/g, '-'),
      postCount: 0,
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
