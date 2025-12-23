import { NextRequest, NextResponse } from 'next/server';
// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';


export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seitech.co.uk';

  const robotsTxt = `# robots.txt for SEI Tech
# https://seitech.co.uk

User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /dashboard/

# Disallow authentication pages
Disallow: /login
Disallow: /register
Disallow: /forgot-password

# Disallow cart and checkout
Disallow: /cart
Disallow: /checkout

# Allow specific pages
Allow: /courses
Allow: /consultancy
Allow: /about
Allow: /contact
Allow: /certificates/verify

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Sitemap location
Sitemap: ${baseUrl}/api/sitemap

# Specific bot instructions
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

# Block bad bots
User-agent: SemrushBot
Crawl-delay: 5

User-agent: AhrefsBot
Crawl-delay: 5

User-agent: DotBot
Crawl-delay: 5
`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
    },
  });
}
