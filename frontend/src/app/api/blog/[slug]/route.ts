import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedOdooClient } from '@/lib/api/odoo-client';
import type { ApiResponse, BlogPost } from '@/types';

export const dynamic = 'force-dynamic';

// Full mock blog posts with complete content
const mockBlogPosts: Record<string, BlogPost> = {
  'importance-of-fire-risk-assessments': {
    id: 1,
    title: 'The Importance of Fire Risk Assessments for UK Businesses',
    slug: 'importance-of-fire-risk-assessments',
    excerpt: 'Understanding why fire risk assessments are legally required and how they protect your workforce and premises.',
    content: `
      <h2>What is a Fire Risk Assessment?</h2>
      <p>A fire risk assessment is a legal requirement under the Regulatory Reform (Fire Safety) Order 2005. It's a systematic examination of your premises to identify potential fire hazards and evaluate the risk of fire occurring and affecting people.</p>

      <h2>Who Needs a Fire Risk Assessment?</h2>
      <p>If you're responsible for a business premises or other non-domestic premises, you're the 'responsible person' and must ensure a fire risk assessment is carried out. This includes:</p>
      <ul>
        <li>Offices and shops</li>
        <li>Factories and warehouses</li>
        <li>Premises that provide sleeping accommodation</li>
        <li>Schools and care homes</li>
        <li>Multi-occupancy residential buildings</li>
      </ul>

      <h2>The Five Steps of Fire Risk Assessment</h2>
      <h3>Step 1: Identify Fire Hazards</h3>
      <p>Look for sources of ignition, fuel, and oxygen. Common ignition sources include electrical equipment, heaters, and cooking equipment.</p>

      <h3>Step 2: Identify People at Risk</h3>
      <p>Consider all people who may be at risk, including employees, visitors, contractors, and anyone with disabilities or special needs.</p>

      <h3>Step 3: Evaluate the Risks</h3>
      <p>Having identified the hazards, evaluate how likely a fire is to start and what the consequences might be.</p>

      <h3>Step 4: Record and Plan</h3>
      <p>Record your findings and prepare an emergency plan. If you employ five or more people, you must record the significant findings.</p>

      <h3>Step 5: Review and Update</h3>
      <p>Keep your assessment under review and revise it if circumstances change.</p>

      <h2>Consequences of Non-Compliance</h2>
      <p>Failure to comply with fire safety regulations can result in:</p>
      <ul>
        <li>Unlimited fines</li>
        <li>Enforcement notices</li>
        <li>Prohibition notices</li>
        <li>Prosecution and imprisonment</li>
      </ul>

      <h2>How SEI Tech Can Help</h2>
      <p>Our accredited fire safety courses provide comprehensive training on conducting fire risk assessments, understanding fire safety legislation, and implementing effective fire safety measures.</p>
    `,
    imageUrl: '/images/blog/fire-risk-assessment.jpg',
    author: {
      id: 1,
      name: 'Sarah Mitchell',
      avatar: '/images/team/sarah-mitchell.jpg',
      role: 'Fire Safety Consultant',
      bio: 'Sarah has over 15 years of experience in fire safety consulting and has conducted thousands of fire risk assessments across various industries.',
    },
    category: 'Fire Safety',
    categorySlug: 'fire-safety',
    publishedAt: '2024-12-15T10:00:00Z',
    readTime: 8,
    tags: ['fire safety', 'compliance', 'risk assessment', 'UK regulations'],
    metaTitle: 'Fire Risk Assessments for UK Businesses | SEI Tech',
    metaDescription: 'Learn why fire risk assessments are legally required for UK businesses and how to conduct them effectively.',
    isFeatured: true,
  },
  'iosh-managing-safely-guide': {
    id: 2,
    title: 'IOSH Managing Safely: A Complete Guide for 2024',
    slug: 'iosh-managing-safely-guide',
    excerpt: 'Everything you need to know about the IOSH Managing Safely qualification and how it can benefit your career.',
    content: `
      <h2>What is IOSH Managing Safely?</h2>
      <p>IOSH Managing Safely is a globally recognized health and safety qualification designed for managers and supervisors in any sector. It provides essential knowledge and practical tools to manage safety and health in the workplace effectively.</p>

      <h2>Course Content</h2>
      <p>The IOSH Managing Safely course covers seven key modules:</p>
      <ol>
        <li><strong>Introducing Managing Safely:</strong> Understanding safety management responsibilities</li>
        <li><strong>Assessing Risks:</strong> Learning to identify hazards and control risks</li>
        <li><strong>Controlling Risks:</strong> Implementing effective control measures</li>
        <li><strong>Understanding Responsibilities:</strong> Legal and organizational duties</li>
        <li><strong>Understanding Hazards:</strong> Common workplace hazards</li>
        <li><strong>Investigating Incidents:</strong> Learning from accidents</li>
        <li><strong>Measuring Performance:</strong> Monitoring safety improvements</li>
      </ol>

      <h2>Who Should Take This Course?</h2>
      <p>IOSH Managing Safely is ideal for:</p>
      <ul>
        <li>Team leaders and supervisors</li>
        <li>Line managers</li>
        <li>Project managers</li>
        <li>Department heads</li>
        <li>Anyone who needs to manage health and safety in their area</li>
      </ul>

      <h2>Assessment and Certification</h2>
      <p>The course includes a multiple-choice test and a practical workplace risk assessment project. Upon successful completion, delegates receive an IOSH certificate valid for three years.</p>

      <h2>Benefits of IOSH Managing Safely</h2>
      <ul>
        <li>Internationally recognized qualification</li>
        <li>Practical, hands-on approach to safety management</li>
        <li>Demonstrates commitment to workplace safety</li>
        <li>Helps organizations reduce accidents and improve compliance</li>
        <li>Career progression opportunities</li>
      </ul>

      <h2>Study Options at SEI Tech</h2>
      <p>We offer IOSH Managing Safely through multiple delivery methods:</p>
      <ul>
        <li><strong>E-Learning:</strong> Study at your own pace online</li>
        <li><strong>Virtual Classroom:</strong> Live instructor-led sessions via Zoom</li>
        <li><strong>Face-to-Face:</strong> Traditional classroom-based learning</li>
        <li><strong>In-House:</strong> Training delivered at your premises</li>
      </ul>
    `,
    imageUrl: '/images/blog/iosh-managing-safely.jpg',
    author: {
      id: 2,
      name: 'James Thompson',
      avatar: '/images/team/james-thompson.jpg',
      role: 'Health & Safety Trainer',
      bio: 'James is an accredited IOSH trainer with over a decade of experience in health and safety training across multiple industries.',
    },
    category: 'IOSH Training',
    categorySlug: 'iosh-training',
    publishedAt: '2024-12-10T14:30:00Z',
    readTime: 12,
    tags: ['IOSH', 'management training', 'health and safety', 'certification'],
    metaTitle: 'IOSH Managing Safely Guide 2024 | SEI Tech International',
    metaDescription: 'Complete guide to IOSH Managing Safely qualification - course content, assessment, and career benefits.',
    isFeatured: false,
  },
  'nebosh-vs-iosh-which-is-right': {
    id: 3,
    title: 'NEBOSH vs IOSH: Which Qualification is Right for You?',
    slug: 'nebosh-vs-iosh-which-is-right',
    excerpt: 'A comprehensive comparison of NEBOSH and IOSH qualifications to help you choose the right path.',
    content: `
      <h2>Understanding the Difference</h2>
      <p>NEBOSH (National Examination Board in Occupational Safety and Health) and IOSH (Institution of Occupational Safety and Health) are both leading bodies in health and safety, but they serve different purposes and audiences.</p>

      <h2>IOSH Qualifications</h2>
      <p>IOSH offers practical, accessible training for people who manage safety as part of a broader role:</p>
      <ul>
        <li><strong>IOSH Managing Safely:</strong> For managers and supervisors</li>
        <li><strong>IOSH Working Safely:</strong> For all employees</li>
        <li><strong>IOSH Safety for Executives and Directors:</strong> For senior leadership</li>
      </ul>

      <h2>NEBOSH Qualifications</h2>
      <p>NEBOSH provides more in-depth, technical qualifications for those pursuing health and safety as a career:</p>
      <ul>
        <li><strong>NEBOSH General Certificate:</strong> Foundation-level qualification</li>
        <li><strong>NEBOSH Diploma:</strong> Advanced professional qualification</li>
        <li><strong>NEBOSH International Certificate:</strong> Global recognition</li>
      </ul>

      <h2>Key Differences</h2>
      <table>
        <tr><th>Factor</th><th>IOSH</th><th>NEBOSH</th></tr>
        <tr><td>Duration</td><td>1-3 days</td><td>Weeks to months</td></tr>
        <tr><td>Depth</td><td>Awareness/practical</td><td>Technical/academic</td></tr>
        <tr><td>Audience</td><td>Managers, employees</td><td>H&S professionals</td></tr>
        <tr><td>Assessment</td><td>Test + project</td><td>Exams + practical</td></tr>
      </table>

      <h2>Which Should You Choose?</h2>
      <p><strong>Choose IOSH if:</strong></p>
      <ul>
        <li>You manage safety as part of a broader role</li>
        <li>You need quick, practical training</li>
        <li>Your organization requires safety awareness</li>
      </ul>

      <p><strong>Choose NEBOSH if:</strong></p>
      <ul>
        <li>You want a career in health and safety</li>
        <li>You need technical depth and expertise</li>
        <li>You're pursuing CMIOSH or other professional memberships</li>
      </ul>
    `,
    imageUrl: '/images/blog/nebosh-vs-iosh.jpg',
    author: {
      id: 1,
      name: 'Sarah Mitchell',
      avatar: '/images/team/sarah-mitchell.jpg',
      role: 'Fire Safety Consultant',
      bio: 'Sarah has over 15 years of experience in fire safety consulting.',
    },
    category: 'Career Guidance',
    categorySlug: 'career-guidance',
    publishedAt: '2024-12-05T09:00:00Z',
    readTime: 10,
    tags: ['NEBOSH', 'IOSH', 'career', 'qualifications', 'comparison'],
    metaTitle: 'NEBOSH vs IOSH Comparison | Which Qualification to Choose',
    metaDescription: 'Compare NEBOSH and IOSH qualifications - understand the differences and choose the right health and safety path.',
    isFeatured: false,
  },
  'mental-health-first-aid-workplace': {
    id: 4,
    title: 'Mental Health First Aid in the Workplace: Why It Matters',
    slug: 'mental-health-first-aid-workplace',
    excerpt: 'Learn how Mental Health First Aid training can transform your workplace culture.',
    content: `
      <h2>The Growing Need for Mental Health Support</h2>
      <p>Mental health issues affect 1 in 4 people each year, and the workplace is where many people spend the majority of their waking hours. Creating a mentally healthy workplace isn't just good ethics—it's good business.</p>

      <h2>What is Mental Health First Aid?</h2>
      <p>Mental Health First Aid (MHFA) is a training program that teaches people how to identify, understand, and respond to signs of mental illness and substance use disorders.</p>

      <h2>Benefits for Organizations</h2>
      <ul>
        <li>Reduced absenteeism and presenteeism</li>
        <li>Improved employee engagement</li>
        <li>Better retention rates</li>
        <li>Enhanced workplace culture</li>
        <li>Demonstrated duty of care</li>
      </ul>

      <h2>What MHFA Training Covers</h2>
      <ul>
        <li>Depression and mood disorders</li>
        <li>Anxiety and panic attacks</li>
        <li>Substance abuse</li>
        <li>Eating disorders</li>
        <li>Self-harm and suicidal thoughts</li>
        <li>Trauma and PTSD</li>
      </ul>

      <h2>The ALGEE Action Plan</h2>
      <p>Mental Health First Aiders learn the ALGEE approach:</p>
      <ul>
        <li><strong>A</strong>pproach, assess, and assist with any crisis</li>
        <li><strong>L</strong>isten and communicate non-judgmentally</li>
        <li><strong>G</strong>ive support and information</li>
        <li><strong>E</strong>ncourage appropriate professional help</li>
        <li><strong>E</strong>ncourage other supports</li>
      </ul>
    `,
    imageUrl: '/images/blog/mental-health-workplace.jpg',
    author: {
      id: 3,
      name: 'Dr. Emily Roberts',
      avatar: '/images/team/emily-roberts.jpg',
      role: 'Mental Health Specialist',
      bio: 'Dr. Roberts is a certified mental health practitioner and workplace wellbeing consultant with over 20 years of clinical experience.',
    },
    category: 'Workplace Wellbeing',
    categorySlug: 'workplace-wellbeing',
    publishedAt: '2024-11-28T11:00:00Z',
    readTime: 7,
    tags: ['mental health', 'first aid', 'workplace', 'wellbeing', 'training'],
    metaTitle: 'Mental Health First Aid Training for Workplaces | SEI Tech',
    metaDescription: 'Discover how MHFA training can transform your workplace culture and support employee mental wellbeing.',
    isFeatured: true,
  },
  'manual-handling-training-reducing-injuries': {
    id: 5,
    title: 'Manual Handling Training: Reducing Workplace Injuries',
    slug: 'manual-handling-training-reducing-injuries',
    excerpt: 'Discover how proper manual handling training can significantly reduce workplace injuries.',
    content: `
      <h2>The Scale of Manual Handling Injuries</h2>
      <p>Musculoskeletal disorders account for over 7 million lost working days in the UK each year, with manual handling injuries being a primary cause. Proper training is essential for prevention.</p>

      <h2>Legal Requirements</h2>
      <p>Under the Manual Handling Operations Regulations 1992, employers must:</p>
      <ul>
        <li>Avoid hazardous manual handling where possible</li>
        <li>Assess risks that cannot be avoided</li>
        <li>Reduce the risk of injury as far as reasonably practicable</li>
        <li>Provide training and information</li>
      </ul>

      <h2>Core Principles of Safe Lifting</h2>
      <ul>
        <li>Plan the lift and clear the route</li>
        <li>Stand with feet apart for stability</li>
        <li>Bend at the knees, not the waist</li>
        <li>Keep the load close to your body</li>
        <li>Avoid twisting—move your feet instead</li>
        <li>Know your limits and ask for help</li>
      </ul>

      <h2>Benefits of Training</h2>
      <ul>
        <li>Fewer workplace injuries</li>
        <li>Reduced absenteeism</li>
        <li>Lower compensation claims</li>
        <li>Improved productivity</li>
        <li>Better employee confidence</li>
      </ul>
    `,
    imageUrl: '/images/blog/manual-handling.jpg',
    author: {
      id: 2,
      name: 'James Thompson',
      avatar: '/images/team/james-thompson.jpg',
      role: 'Health & Safety Trainer',
      bio: 'James is an accredited trainer with extensive experience in manual handling and workplace safety.',
    },
    category: 'Health & Safety',
    categorySlug: 'health-and-safety',
    publishedAt: '2024-11-20T15:00:00Z',
    readTime: 6,
    tags: ['manual handling', 'workplace safety', 'injuries', 'training'],
    metaTitle: 'Manual Handling Training UK | Reduce Workplace Injuries',
    metaDescription: 'Learn how proper manual handling training reduces workplace injuries and meets legal requirements.',
    isFeatured: false,
  },
  'understanding-coshh-regulations': {
    id: 6,
    title: 'Understanding COSHH Regulations: A Practical Guide',
    slug: 'understanding-coshh-regulations',
    excerpt: 'A practical guide to understanding and implementing COSHH regulations.',
    content: `
      <h2>What is COSHH?</h2>
      <p>COSHH stands for Control of Substances Hazardous to Health. The COSHH Regulations 2002 require employers to control substances that can harm workers' health.</p>

      <h2>Hazardous Substances Covered</h2>
      <ul>
        <li>Chemicals and chemical products</li>
        <li>Fumes and vapors</li>
        <li>Dusts and particles</li>
        <li>Biological agents</li>
        <li>Nanotechnology</li>
      </ul>

      <h2>Eight Steps to COSHH Compliance</h2>
      <ol>
        <li>Assess the risks</li>
        <li>Decide what precautions are needed</li>
        <li>Prevent or adequately control exposure</li>
        <li>Ensure control measures are used and maintained</li>
        <li>Monitor exposure</li>
        <li>Carry out health surveillance</li>
        <li>Prepare plans and procedures for accidents</li>
        <li>Ensure employees are properly informed and trained</li>
      </ol>

      <h2>COSHH Assessment Requirements</h2>
      <p>A COSHH assessment must:</p>
      <ul>
        <li>Identify hazardous substances used or created</li>
        <li>Assess who could be harmed and how</li>
        <li>Evaluate existing controls</li>
        <li>Document significant findings</li>
        <li>Be regularly reviewed and updated</li>
      </ul>
    `,
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
    metaTitle: 'COSHH Regulations Guide | Control of Hazardous Substances',
    metaDescription: 'Practical guide to COSHH regulations - understanding and implementing hazardous substance controls.',
    isFeatured: false,
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const odoo = await getAuthenticatedOdooClient();

    try {
      // Try to fetch from Odoo first
      const domain: [string, string, any][] = [
        ['website_slug', '=', slug],
        ['is_published', '=', true],
      ];

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

      const records = await odoo.searchRead<any>('blog.post', domain, fields, { limit: 1 });

      if (records.length === 0) {
        // Check mock data
        const mockPost = mockBlogPosts[slug];
        if (mockPost) {
          return NextResponse.json({
            success: true,
            data: mockPost,
          } as ApiResponse<BlogPost>);
        }

        return NextResponse.json(
          {
            success: false,
            message: 'Blog post not found',
            data: null,
          },
          { status: 404 }
        );
      }

      const record = records[0];
      const wordCount = record.content ? record.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));

      const post: BlogPost = {
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

      const response: ApiResponse<BlogPost> = {
        success: true,
        data: post,
      };

      return NextResponse.json(response);
    } catch (odooError) {
      // Fallback to mock data
      console.warn('Using mock blog post data:', odooError);

      const mockPost = mockBlogPosts[slug];
      if (mockPost) {
        return NextResponse.json({
          success: true,
          data: mockPost,
        } as ApiResponse<BlogPost>);
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Blog post not found',
          data: null,
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error fetching blog post:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch blog post',
        data: null,
      },
      { status: 500 }
    );
  }
}
