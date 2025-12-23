import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedOdooClient } from '@/lib/api/odoo-client';
// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  try {
    const odoo = await getAuthenticatedOdooClient();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seitech.co.uk';

    // Fetch all published courses
    const courses = await odoo.searchRead<any>(
      'slide.channel',
      [['is_published', '=', true]],
      ['id', 'website_slug', 'write_date'],
      { order: 'write_date desc' }
    );

    // Fetch all categories
    const categories = await odoo.searchRead<any>(
      'slide.channel.category',
      [],
      ['id', 'slug', 'write_date'],
      { order: 'write_date desc' }
    );

    // Build sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- Static Pages -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>${baseUrl}/courses</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/consultancy</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>${baseUrl}/certificates/verify</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Course Categories -->
  ${categories
    .map(
      (category: any) => `
  <url>
    <loc>${baseUrl}/courses?category=${category.slug}</loc>
    <lastmod>${category.write_date || new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}

  <!-- Course Pages -->
  ${courses
    .map(
      (course: any) => `
  <url>
    <loc>${baseUrl}/courses/${course.website_slug}</loc>
    <lastmod>${course.write_date || new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('')}

</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);

    // Return a basic sitemap on error
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seitech.co.uk';
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(fallbackSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600',
      },
    });
  }
}
