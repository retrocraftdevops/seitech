import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Calendar,
  Clock,
  ArrowLeft,
  ChevronRight,
  Tag,
  BookOpen,
} from 'lucide-react';
import { ShareButtons } from '@/components/features/blog/ShareButtons';
import { Card, CardContent, CardImage } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
    role: string;
  };
  category: string;
  tags: string[];
  readTime: number;
  publishedAt: string;
  updatedAt?: string;
}

// Mock blog posts data - in production, this would come from an API/CMS
const blogPosts: Record<string, BlogPost> = {
  'importance-of-fire-risk-assessments': {
    id: '1',
    slug: 'importance-of-fire-risk-assessments',
    title: 'The Importance of Fire Risk Assessments for UK Businesses',
    excerpt:
      'Learn why fire risk assessments are a legal requirement and how they can protect your business, employees, and premises from fire hazards.',
    content: `
      <h2>What is a Fire Risk Assessment?</h2>
      <p>A fire risk assessment is a systematic evaluation of your premises to identify potential fire hazards, the people at risk, and the measures needed to prevent fires and protect people in case of a fire. Under the Regulatory Reform (Fire Safety) Order 2005, it is a legal requirement for all non-domestic premises in England and Wales.</p>

      <h2>Legal Requirements</h2>
      <p>As a business owner or employer, you are legally responsible for fire safety in your premises. This includes:</p>
      <ul>
        <li>Carrying out a fire risk assessment and reviewing it regularly</li>
        <li>Implementing fire safety measures identified in the assessment</li>
        <li>Appointing a competent person to assist with fire safety duties</li>
        <li>Providing fire safety training to employees</li>
        <li>Planning for emergencies and maintaining escape routes</li>
      </ul>

      <h2>Key Elements of a Fire Risk Assessment</h2>
      <p>A comprehensive fire risk assessment should cover the following areas:</p>

      <h3>1. Identify Fire Hazards</h3>
      <p>This involves identifying potential sources of ignition, fuel, and oxygen within your premises. Common fire hazards include electrical equipment, heating systems, cooking appliances, flammable materials, and poor housekeeping.</p>

      <h3>2. Identify People at Risk</h3>
      <p>Consider who might be at risk if a fire occurs, including employees, visitors, contractors, and vulnerable individuals such as those with disabilities or mobility issues.</p>

      <h3>3. Evaluate, Remove, or Reduce Risks</h3>
      <p>Based on the hazards and people identified, implement appropriate fire prevention measures and ensure adequate fire detection, warning systems, and means of escape.</p>

      <h3>4. Record, Plan, and Train</h3>
      <p>Document your findings, develop an emergency plan, and ensure all staff receive appropriate fire safety training.</p>

      <h3>5. Review</h3>
      <p>Regularly review and update your fire risk assessment, especially when there are significant changes to your premises, processes, or staff.</p>

      <h2>Consequences of Non-Compliance</h2>
      <p>Failure to comply with fire safety legislation can result in:</p>
      <ul>
        <li>Enforcement notices requiring you to take action</li>
        <li>Prohibition notices preventing use of all or part of your premises</li>
        <li>Criminal prosecution with unlimited fines</li>
        <li>Prison sentences for serious breaches</li>
        <li>Personal liability for directors and managers</li>
      </ul>

      <h2>How We Can Help</h2>
      <p>At SEI Tech International, our qualified fire safety professionals can help you:</p>
      <ul>
        <li>Conduct thorough fire risk assessments</li>
        <li>Develop fire safety policies and procedures</li>
        <li>Provide staff training on fire safety awareness</li>
        <li>Install and maintain fire detection and alarm systems</li>
        <li>Review and update existing fire risk assessments</li>
      </ul>

      <p>Contact us today to discuss your fire safety requirements and ensure your business is fully compliant with current legislation.</p>
    `,
    image: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=1200&h=600&fit=crop',
    author: {
      name: 'David Thompson',
      avatar: '',
      bio: 'David is a certified fire safety consultant with over 15 years of experience in fire risk management and assessment.',
      role: 'Fire Safety Consultant',
    },
    category: 'Fire Safety',
    tags: ['Fire Safety', 'Risk Assessment', 'Compliance', 'Legal Requirements', 'UK Regulations'],
    readTime: 8,
    publishedAt: '2024-12-15',
    updatedAt: '2024-12-18',
  },
  'iosh-managing-safely-guide': {
    id: '2',
    slug: 'iosh-managing-safely-guide',
    title: 'Complete Guide to IOSH Managing Safely Certification',
    excerpt:
      'Everything you need to know about the IOSH Managing Safely course, including benefits, course content, and career advancement opportunities.',
    content: `
      <h2>What is IOSH Managing Safely?</h2>
      <p>IOSH Managing Safely is a globally recognized health and safety qualification designed for managers and supervisors in any sector. Developed by the Institution of Occupational Safety and Health (IOSH), it provides essential knowledge and skills to manage workplace health and safety effectively.</p>

      <h2>Who Should Take This Course?</h2>
      <p>This qualification is ideal for:</p>
      <ul>
        <li>Managers and supervisors across all industries</li>
        <li>Team leaders responsible for staff safety</li>
        <li>Small business owners</li>
        <li>Anyone looking to understand health and safety management</li>
        <li>Professionals seeking career advancement</li>
      </ul>

      <h2>Course Content</h2>
      <p>The IOSH Managing Safely course covers eight comprehensive modules:</p>

      <h3>Module 1: Introducing Managing Safely</h3>
      <p>Understanding the importance of safety management and your legal responsibilities.</p>

      <h3>Module 2: Assessing Risks</h3>
      <p>Learning systematic approaches to identify hazards and assess workplace risks.</p>

      <h3>Module 3: Controlling Risks</h3>
      <p>Implementing effective control measures using the hierarchy of controls.</p>

      <h3>Module 4: Understanding Your Responsibilities</h3>
      <p>Exploring legal frameworks and employer/employee duties.</p>

      <h3>Module 5: Understanding Hazards</h3>
      <p>Recognizing common workplace hazards and their potential consequences.</p>

      <h3>Module 6: Investigating Incidents</h3>
      <p>Learning effective incident investigation techniques and root cause analysis.</p>

      <h3>Module 7: Measuring Performance</h3>
      <p>Using proactive and reactive measures to monitor safety performance.</p>

      <h3>Module 8: Protecting Our Environment</h3>
      <p>Understanding environmental responsibilities and sustainable practices.</p>

      <h2>Benefits of IOSH Managing Safely</h2>
      <ul>
        <li>Internationally recognized qualification</li>
        <li>Demonstrates commitment to safety</li>
        <li>Practical skills applicable to any workplace</li>
        <li>Career advancement opportunities</li>
        <li>Helps reduce workplace incidents</li>
        <li>Valid for 3 years with easy refresher options</li>
      </ul>

      <h2>Assessment</h2>
      <p>The qualification includes:</p>
      <ul>
        <li>Multi-choice assessment testing knowledge</li>
        <li>Practical workplace risk assessment project</li>
        <li>Both must be passed to achieve certification</li>
      </ul>

      <h2>Get Started Today</h2>
      <p>SEI Tech International offers IOSH Managing Safely through multiple delivery methods including classroom, virtual, and e-learning options. Contact us to find the best option for you.</p>
    `,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop',
    author: {
      name: 'Sarah Mitchell',
      avatar: '',
      bio: 'Sarah is an IOSH-certified trainer with extensive experience delivering health and safety qualifications across multiple industries.',
      role: 'Lead Training Consultant',
    },
    category: 'Training',
    tags: ['IOSH', 'Training', 'Management', 'Certification', 'Health & Safety'],
    readTime: 10,
    publishedAt: '2024-12-10',
  },
  'nebosh-vs-iosh-which-is-right': {
    id: '3',
    slug: 'nebosh-vs-iosh-which-is-right',
    title: 'NEBOSH vs IOSH: Which Health & Safety Course is Right for You?',
    excerpt:
      'A comprehensive comparison of NEBOSH and IOSH qualifications to help you choose the right path for your career in health and safety.',
    content: `
      <h2>Introduction</h2>
      <p>Choosing between NEBOSH and IOSH qualifications can be challenging. Both are highly respected in the health and safety industry, but they serve different purposes and career paths. This guide will help you understand the differences and choose the right qualification for your needs.</p>

      <h2>Understanding IOSH</h2>
      <p>The Institution of Occupational Safety and Health (IOSH) offers practical, accessible qualifications aimed at managers and employees who need to understand health and safety in their daily roles.</p>

      <h3>Key IOSH Qualifications:</h3>
      <ul>
        <li><strong>IOSH Managing Safely</strong> - For managers and supervisors</li>
        <li><strong>IOSH Working Safely</strong> - For all employees</li>
        <li><strong>IOSH Leading Safely</strong> - For directors and senior leaders</li>
      </ul>

      <h2>Understanding NEBOSH</h2>
      <p>The National Examination Board in Occupational Safety and Health (NEBOSH) offers more in-depth, academic qualifications for those pursuing a career in health and safety.</p>

      <h3>Key NEBOSH Qualifications:</h3>
      <ul>
        <li><strong>NEBOSH National General Certificate</strong> - Foundation qualification</li>
        <li><strong>NEBOSH National Diploma</strong> - Advanced practitioner level</li>
        <li><strong>NEBOSH Environmental Certificate</strong> - Environmental management focus</li>
      </ul>

      <h2>Key Differences</h2>

      <table>
        <tr>
          <th>Aspect</th>
          <th>IOSH</th>
          <th>NEBOSH</th>
        </tr>
        <tr>
          <td>Duration</td>
          <td>1-4 days</td>
          <td>Weeks to months</td>
        </tr>
        <tr>
          <td>Depth</td>
          <td>Awareness/practical</td>
          <td>Comprehensive/academic</td>
        </tr>
        <tr>
          <td>Career focus</td>
          <td>General management</td>
          <td>H&S profession</td>
        </tr>
        <tr>
          <td>Assessment</td>
          <td>Multi-choice + project</td>
          <td>Written exams + practical</td>
        </tr>
      </table>

      <h2>Which Should You Choose?</h2>

      <h3>Choose IOSH if:</h3>
      <ul>
        <li>You are a manager who needs practical safety knowledge</li>
        <li>You want a shorter, focused course</li>
        <li>Your primary role is not in health and safety</li>
        <li>You need to demonstrate compliance quickly</li>
      </ul>

      <h3>Choose NEBOSH if:</h3>
      <ul>
        <li>You want a career in health and safety</li>
        <li>You need comprehensive technical knowledge</li>
        <li>You are seeking GRAD IOSH or CMIOSH status</li>
        <li>Your role requires advanced competency</li>
      </ul>

      <h2>Can You Do Both?</h2>
      <p>Absolutely! Many professionals complete both qualifications. IOSH courses are excellent starting points, while NEBOSH qualifications provide the depth needed for specialist roles. They complement each other well in a health and safety career journey.</p>

      <h2>Get Expert Advice</h2>
      <p>Not sure which qualification is right for you? Contact our training advisors for personalized guidance based on your career goals and current role.</p>
    `,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=600&fit=crop',
    author: {
      name: 'James Patterson',
      avatar: '',
      bio: 'James is a career advisor specializing in health and safety professional development with 12 years of industry experience.',
      role: 'Senior Career Advisor',
    },
    category: 'Career Advice',
    tags: ['NEBOSH', 'IOSH', 'Career', 'Qualifications', 'Comparison'],
    readTime: 12,
    publishedAt: '2024-12-05',
  },
  'workplace-mental-health-first-aid': {
    id: '4',
    slug: 'workplace-mental-health-first-aid',
    title: 'Mental Health First Aid in the Workplace: A Complete Guide',
    excerpt:
      'Discover how mental health first aid training can transform your workplace culture and support employee wellbeing.',
    content: `
      <h2>The Growing Importance of Mental Health at Work</h2>
      <p>Mental health has become a critical workplace concern. With 1 in 4 people experiencing mental health issues each year, employers have a responsibility and opportunity to create supportive environments that promote wellbeing.</p>

      <h2>What is Mental Health First Aid?</h2>
      <p>Mental Health First Aid (MHFA) is an evidence-based training program that teaches people how to identify, understand, and respond to signs of mental health issues. Just as physical first aiders support people with injuries, mental health first aiders provide initial support for mental health challenges.</p>

      <h2>Benefits for Organizations</h2>
      <ul>
        <li>Reduced stigma around mental health</li>
        <li>Earlier intervention and support</li>
        <li>Improved employee retention</li>
        <li>Decreased absenteeism</li>
        <li>Enhanced workplace culture</li>
        <li>Better support during crises</li>
      </ul>

      <h2>What MHFA Training Covers</h2>
      <h3>Core Skills:</h3>
      <ul>
        <li>Recognizing signs and symptoms of common mental health issues</li>
        <li>Providing initial help and reassurance</li>
        <li>Guiding toward appropriate professional support</li>
        <li>Managing crisis situations</li>
        <li>Self-care for mental health first aiders</li>
      </ul>

      <h3>Mental Health Topics:</h3>
      <ul>
        <li>Depression and anxiety disorders</li>
        <li>Stress and burnout</li>
        <li>Substance misuse</li>
        <li>Eating disorders</li>
        <li>Self-harm and suicidal thoughts</li>
        <li>Psychosis</li>
      </ul>

      <h2>Implementing MHFA in Your Workplace</h2>
      <p>Successful implementation involves:</p>
      <ol>
        <li><strong>Leadership commitment</strong> - Visible support from senior management</li>
        <li><strong>Training selection</strong> - Choose appropriate course levels</li>
        <li><strong>Strategic placement</strong> - Ensure first aiders across departments</li>
        <li><strong>Clear procedures</strong> - Establish referral pathways</li>
        <li><strong>Ongoing support</strong> - Provide refresher training and supervision</li>
      </ol>

      <h2>Course Options</h2>
      <p>We offer several MHFA training options:</p>
      <ul>
        <li><strong>MHFA Champion</strong> - 1-day awareness course</li>
        <li><strong>MHFA 2-day</strong> - Full mental health first aider certification</li>
        <li><strong>MHFA Lite</strong> - Half-day introduction</li>
        <li><strong>Refresher courses</strong> - For existing first aiders</li>
      </ul>

      <h2>Take Action Today</h2>
      <p>Investing in mental health training shows your employees you care about their wellbeing. Contact us to discuss training options for your organization.</p>
    `,
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&h=600&fit=crop',
    author: {
      name: 'Emma Richardson',
      avatar: '',
      bio: 'Emma is a certified Mental Health First Aid instructor and workplace wellbeing specialist.',
      role: 'Wellbeing Consultant',
    },
    category: 'Mental Health',
    tags: ['Mental Health', 'MHFA', 'Wellbeing', 'Employee Support', 'Training'],
    readTime: 7,
    publishedAt: '2024-11-28',
  },
  'iso-45001-implementation-guide': {
    id: '5',
    slug: 'iso-45001-implementation-guide',
    title: 'ISO 45001 Implementation: A Step-by-Step Guide',
    excerpt:
      'Learn how to successfully implement ISO 45001 in your organization and achieve certification with our expert guidance.',
    content: `
      <h2>What is ISO 45001?</h2>
      <p>ISO 45001 is the international standard for occupational health and safety management systems. It provides a framework for organizations to proactively improve their OH&S performance, prevent work-related injuries and ill-health, and provide safe workplaces.</p>

      <h2>Key Benefits of ISO 45001</h2>
      <ul>
        <li>Reduced workplace incidents and injuries</li>
        <li>Improved regulatory compliance</li>
        <li>Enhanced reputation and credibility</li>
        <li>Better risk management</li>
        <li>Increased employee engagement</li>
        <li>Competitive advantage in tenders</li>
      </ul>

      <h2>Implementation Steps</h2>

      <h3>Step 1: Gap Analysis</h3>
      <p>Assess your current OH&S management against ISO 45001 requirements to identify areas needing development.</p>

      <h3>Step 2: Project Planning</h3>
      <p>Develop a clear implementation plan with timelines, resources, and responsibilities.</p>

      <h3>Step 3: Context and Scope</h3>
      <p>Define the scope of your OH&S management system and understand your organizational context.</p>

      <h3>Step 4: Leadership and Worker Participation</h3>
      <p>Ensure top management commitment and involve workers in OH&S decisions.</p>

      <h3>Step 5: Planning</h3>
      <p>Identify hazards, assess risks, determine legal requirements, and set objectives.</p>

      <h3>Step 6: Support</h3>
      <p>Provide necessary resources, competence, awareness, and communication.</p>

      <h3>Step 7: Operation</h3>
      <p>Implement operational controls, emergency preparedness, and change management.</p>

      <h3>Step 8: Performance Evaluation</h3>
      <p>Monitor, measure, analyze, and evaluate OH&S performance.</p>

      <h3>Step 9: Improvement</h3>
      <p>Address incidents, nonconformities, and drive continual improvement.</p>

      <h3>Step 10: Certification</h3>
      <p>Engage an accredited certification body for external audit.</p>

      <h2>Common Challenges</h2>
      <ul>
        <li>Gaining leadership commitment</li>
        <li>Changing organizational culture</li>
        <li>Resource constraints</li>
        <li>Documentation requirements</li>
        <li>Maintaining momentum</li>
      </ul>

      <h2>How We Can Help</h2>
      <p>Our experienced consultants can support your ISO 45001 journey through:</p>
      <ul>
        <li>Gap analysis and readiness assessment</li>
        <li>Implementation project management</li>
        <li>Documentation development</li>
        <li>Internal auditor training</li>
        <li>Pre-certification audits</li>
        <li>Ongoing support and maintenance</li>
      </ul>

      <p>Contact us today to discuss your ISO 45001 implementation needs.</p>
    `,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=600&fit=crop',
    author: {
      name: 'Michael Chen',
      avatar: '',
      bio: 'Michael is a lead auditor for ISO 45001 and ISO 14001 with over 20 years of management systems experience.',
      role: 'Principal Consultant',
    },
    category: 'ISO Standards',
    tags: ['ISO 45001', 'Management Systems', 'Certification', 'Compliance', 'Implementation'],
    readTime: 15,
    publishedAt: '2024-11-20',
  },
  'e-learning-vs-classroom-training': {
    id: '6',
    slug: 'e-learning-vs-classroom-training',
    title: 'E-Learning vs Classroom Training: Pros and Cons',
    excerpt:
      'Explore the benefits and challenges of different training delivery methods to choose the best option for your team.',
    content: `
      <h2>The Evolution of Training Delivery</h2>
      <p>The way we deliver training has transformed significantly. While classroom training remains valuable, e-learning has become an essential part of modern learning strategies. Understanding the strengths of each approach helps you make informed decisions.</p>

      <h2>Classroom Training</h2>

      <h3>Advantages:</h3>
      <ul>
        <li><strong>Direct interaction</strong> - Face-to-face engagement with trainers and peers</li>
        <li><strong>Immediate feedback</strong> - Questions answered in real-time</li>
        <li><strong>Practical exercises</strong> - Hands-on activities and demonstrations</li>
        <li><strong>Networking</strong> - Build relationships with other learners</li>
        <li><strong>Focused environment</strong> - Fewer distractions</li>
      </ul>

      <h3>Challenges:</h3>
      <ul>
        <li>Fixed schedules and locations</li>
        <li>Travel time and costs</li>
        <li>Limited scalability</li>
        <li>Pace may not suit all learners</li>
      </ul>

      <h2>E-Learning</h2>

      <h3>Advantages:</h3>
      <ul>
        <li><strong>Flexibility</strong> - Learn anytime, anywhere</li>
        <li><strong>Self-paced</strong> - Progress at your own speed</li>
        <li><strong>Cost-effective</strong> - No travel or accommodation costs</li>
        <li><strong>Consistent content</strong> - Same quality for all learners</li>
        <li><strong>Trackable progress</strong> - Easy monitoring and reporting</li>
      </ul>

      <h3>Challenges:</h3>
      <ul>
        <li>Limited practical application</li>
        <li>Self-discipline required</li>
        <li>Less personal interaction</li>
        <li>Technical requirements</li>
      </ul>

      <h2>Blended Learning: The Best of Both</h2>
      <p>Many organizations find that blended learning - combining online and classroom elements - provides the optimal solution. This approach allows for:</p>
      <ul>
        <li>Theory delivery online</li>
        <li>Practical sessions face-to-face</li>
        <li>Flexible pre-work and assessments</li>
        <li>Reduced classroom time</li>
      </ul>

      <h2>Choosing the Right Approach</h2>

      <h3>Consider E-Learning when:</h3>
      <ul>
        <li>Training knowledge-based content</li>
        <li>Reaching geographically dispersed teams</li>
        <li>Compliance training with annual refreshers</li>
        <li>Flexible timing is important</li>
      </ul>

      <h3>Consider Classroom when:</h3>
      <ul>
        <li>Practical skills are essential</li>
        <li>Discussion and debate add value</li>
        <li>Building team relationships</li>
        <li>Complex topics need clarification</li>
      </ul>

      <h2>Our Training Options</h2>
      <p>At SEI Tech International, we offer all delivery methods:</p>
      <ul>
        <li><strong>Classroom</strong> - At our training centres or your premises</li>
        <li><strong>Virtual</strong> - Live online sessions with interaction</li>
        <li><strong>E-Learning</strong> - Self-paced online courses</li>
        <li><strong>Blended</strong> - Combining approaches for best results</li>
      </ul>

      <p>Contact us to discuss the best training approach for your organization.</p>
    `,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=600&fit=crop',
    author: {
      name: 'Lisa Morgan',
      avatar: '',
      bio: 'Lisa is an instructional designer with expertise in developing engaging learning experiences across multiple platforms.',
      role: 'Learning Development Manager',
    },
    category: 'Training',
    tags: ['E-Learning', 'Classroom', 'Training Methods', 'Blended Learning', 'L&D'],
    readTime: 6,
    publishedAt: '2024-11-15',
  },
};

// Get related posts (same category, different post)
function getRelatedPosts(currentPost: BlogPost): BlogPost[] {
  return Object.values(blogPosts)
    .filter((post) => post.category === currentPost.category && post.id !== currentPost.id)
    .slice(0, 3);
}

interface BlogPostPageProps {
  params: { slug: string };
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  // In production, fetch from API/CMS
  return blogPosts[slug] || null;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found | SEI Tech International',
    };
  }

  return {
    title: `${post.title} | SEI Tech Blog`,
    description: post.excerpt,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author.name],
      images: [{ url: post.image }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({ slug }));
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post);
  const shareUrl = `https://seitech.co.uk/blog/${post.slug}`;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <section className="relative h-[400px] lg:h-[500px]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-8 left-0 right-0">
          <div className="container mx-auto px-4 max-w-7xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>

        {/* Post Meta Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <Badge className="mb-4" variant="primary">
              {post.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-medium">
                  {post.author.name.charAt(0)}
                </div>
                <span>{post.author.name}</span>
              </div>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime} min read
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <article className="lg:col-span-2">
              <Card>
                <CardContent className="p-8 lg:p-12">
                  <div
                    className="prose prose-lg prose-gray max-w-none
                      prose-headings:font-bold prose-headings:text-gray-900
                      prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                      prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                      prose-p:text-gray-600 prose-p:leading-relaxed
                      prose-li:text-gray-600
                      prose-ul:my-4 prose-ol:my-4
                      prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-gray-900
                      prose-table:border-collapse prose-th:bg-gray-100 prose-th:p-3 prose-td:p-3 prose-td:border"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {/* Tags */}
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="w-5 h-5 text-gray-400" />
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Share */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-4">Share this article:</p>
                    <ShareButtons url={shareUrl} title={post.title} />
                  </div>
                </CardContent>
              </Card>

              {/* Author Bio */}
              <Card className="mt-8">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {post.author.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-primary-600 font-medium mb-1">Written by</p>
                      <h3 className="text-xl font-bold text-gray-900">{post.author.name}</h3>
                      <p className="text-gray-600 mb-2">{post.author.role}</p>
                      <p className="text-gray-600">{post.author.bio}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </article>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost) => (
                      <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                        <Card hover className="overflow-hidden">
                          <div className="flex">
                            <div className="relative w-24 h-24 flex-shrink-0">
                              <Image
                                src={relatedPost.image}
                                alt={relatedPost.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <CardContent className="p-3 flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-primary-600">
                                {relatedPost.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {relatedPost.readTime} min read
                              </p>
                            </CardContent>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
                  <div className="space-y-2">
                    {['Fire Safety', 'Training', 'Career Advice', 'Mental Health', 'ISO Standards'].map(
                      (category) => (
                        <Link
                          key={category}
                          href={`/blog?category=${encodeURIComponent(category)}`}
                          className="flex items-center justify-between py-2 text-gray-600 hover:text-primary-600 transition-colors"
                        >
                          <span>{category}</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter CTA */}
              <Card className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
                <CardContent className="p-6">
                  <BookOpen className="w-10 h-10 mb-4 opacity-90" />
                  <h3 className="text-lg font-bold mb-2">Stay Updated</h3>
                  <p className="text-white/90 text-sm mb-4">
                    Get the latest health & safety insights delivered to your inbox.
                  </p>
                  <form className="space-y-3">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <Button variant="secondary" className="w-full">
                      Subscribe
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Training CTA */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Need Training?</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Explore our range of accredited health and safety courses.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </section>

      {/* More Articles CTA */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Want to read more?</h2>
          <p className="text-gray-600 mb-6">
            Explore our full library of health and safety articles and resources.
          </p>
          <Button asChild size="lg">
            <Link href="/blog">View All Articles</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
