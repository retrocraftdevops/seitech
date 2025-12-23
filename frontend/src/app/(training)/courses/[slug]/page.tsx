import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clock,
  Users,
  Star,
  Award,
  Play,
  CheckCircle,
  BookOpen,
  FileText,
  Calendar,
  Globe,
  ArrowRight,
  Share2,
  Heart,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatDuration } from '@/lib/utils';
import { AddToCartButton } from '@/components/features/cart/AddToCartButton';
import type { Course } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

// Fetch course from Odoo API
const getCourse = async (slug: string): Promise<Course | null> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000';
    const response = await fetch(`${baseUrl}/api/courses/slug/${slug}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data.success || !data.data) {
      return null;
    }

    // Transform API response to match Course type
    const apiCourse = data.data;
    return {
      id: apiCourse.id,
      name: apiCourse.name,
      slug: apiCourse.slug || slug,
      description: apiCourse.description || '',
      shortDescription: apiCourse.shortDescription || '',
      imageUrl: apiCourse.imageUrl || '/images/placeholder-course.jpg',
      thumbnailUrl: apiCourse.thumbnailUrl || apiCourse.imageUrl || '/images/placeholder-course.jpg',
      listPrice: apiCourse.listPrice || 0,
      discountPrice: apiCourse.discountPrice,
      currency: apiCourse.currency || 'GBP',
      categoryId: apiCourse.categoryId,
      categoryName: apiCourse.categoryName || '',
      deliveryMethod: apiCourse.deliveryMethod || 'e-learning',
      difficultyLevel: apiCourse.difficultyLevel || 'beginner',
      accreditation: apiCourse.accreditation,
      duration: apiCourse.duration || 0,
      totalSlides: apiCourse.totalSlides || 0,
      totalQuizzes: apiCourse.totalQuizzes || 0,
      ratingAvg: apiCourse.ratingAvg || 0,
      ratingCount: apiCourse.ratingCount || 0,
      enrollmentCount: apiCourse.enrollmentCount || 0,
      instructorId: apiCourse.instructorId,
      instructorName: apiCourse.instructorName || 'SEI Tech Training Team',
      instructorAvatar: apiCourse.instructorAvatar,
      instructorBio: apiCourse.instructorBio || '',
      curriculum: apiCourse.curriculum || [],
      outcomes: apiCourse.outcomes || [],
      requirements: apiCourse.requirements || [],
      targetAudience: apiCourse.targetAudience || '',
      faqs: apiCourse.faqs || [],
      metaTitle: apiCourse.metaTitle || apiCourse.name,
      metaDescription: apiCourse.metaDescription || apiCourse.shortDescription,
      keywords: apiCourse.keywords || [],
      isPublished: apiCourse.isPublished ?? true,
      isFeatured: apiCourse.isFeatured ?? false,
      isPaid: apiCourse.isPaid ?? true,
      createdAt: apiCourse.createdAt,
      updatedAt: apiCourse.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    return { title: 'Course Not Found' };
  }

  return {
    title: course.metaTitle || course.name,
    description: course.metaDescription || course.shortDescription,
    keywords: course.keywords,
    openGraph: {
      title: course.name,
      description: course.shortDescription,
      ...(course.imageUrl && {
        images: [{ url: course.imageUrl, width: 1200, height: 630 }],
      }),
      type: 'website',
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  const deliveryBadgeColors: Record<string, string> = {
    'e-learning': 'bg-blue-50 text-blue-700 border-blue-200',
    'face-to-face': 'bg-green-50 text-green-700 border-green-200',
    virtual: 'bg-purple-50 text-purple-700 border-purple-200',
    'in-house': 'bg-orange-50 text-orange-700 border-orange-200',
  };

  // JSON-LD Schema
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
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gray-900 text-white">
          <div className="container mx-auto px-4 max-w-7xl py-12">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm">
              <ol className="flex items-center gap-2 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/courses" className="hover:text-white">
                    Courses
                  </Link>
                </li>
                <li>/</li>
                <li className="text-white">{course.name}</li>
              </ol>
            </nav>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Course Info */}
              <div className="lg:col-span-2">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={deliveryBadgeColors[course.deliveryMethod]}>
                    {course.deliveryMethod.replace('-', ' ')}
                  </Badge>
                  {course.accreditation && (
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                      <Award className="w-3 h-3 mr-1" />
                      {course.accreditation} Accredited
                    </Badge>
                  )}
                  <Badge className="bg-white/10 text-white border-white/20 capitalize">
                    {course.difficultyLevel}
                  </Badge>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.name}</h1>

                {/* Short Description */}
                <p className="text-lg text-gray-300 mb-6">{course.shortDescription}</p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{course.ratingAvg.toFixed(1)}</span>
                    <span className="text-gray-400">({course.ratingCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Users className="w-5 h-5" />
                    <span>{course.enrollmentCount.toLocaleString()} enrolled</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-5 h-5" />
                    <span>{formatDuration(course.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Globe className="w-5 h-5" />
                    <span>English</span>
                  </div>
                </div>
              </div>

              {/* Enrollment Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 overflow-hidden">
                  {/* Preview Image */}
                  <div className="relative aspect-video bg-gradient-to-br from-primary-500 to-secondary-600">
                    {course.thumbnailUrl ? (
                      <Image
                        src={course.thumbnailUrl}
                        alt={course.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-white/50" />
                      </div>
                    )}
                    <button className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors group">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-primary-600 ml-1" />
                      </div>
                    </button>
                  </div>

                  <CardContent className="p-6">
                    {/* Price */}
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-gray-900">
                        {course.listPrice === 0 ? 'Free' : formatCurrency(course.listPrice)}
                      </span>
                      {course.discountPrice && (
                        <span className="ml-2 text-lg text-gray-400 line-through">
                          {formatCurrency(course.discountPrice)}
                        </span>
                      )}
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3 mb-6">
                      <AddToCartButton course={course} />
                      <Button variant="outline" className="w-full" size="lg">
                        <Heart className="w-5 h-5 mr-2" />
                        Add to Wishlist
                      </Button>
                    </div>

                    {/* Quick Info */}
                    <div className="space-y-4 pt-6 border-t">
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">
                          {formatDuration(course.duration)} total
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <BookOpen className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">
                          {course.totalSlides} lessons
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">
                          {course.totalQuizzes} quiz{course.totalQuizzes !== 1 && 'zes'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Award className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">Certificate on completion</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">12 months access</span>
                      </div>
                    </div>

                    {/* Share */}
                    <div className="pt-6 border-t mt-6">
                      <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                        <Share2 className="w-4 h-4" />
                        Share this course
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="container mx-auto px-4 max-w-7xl py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              {/* What You'll Learn */}
              {course.outcomes && course.outcomes.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    What You'll Learn
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.outcomes.map((outcome, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Course Content */}
              {course.curriculum && course.curriculum.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Course Content
                  </h2>
                  <div className="space-y-3">
                    {course.curriculum.map((section) => (
                      <div
                        key={section.id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                      >
                        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                            <span className="font-semibold text-gray-900">
                              {section.name}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {section.slides?.length || 0} lessons
                          </span>
                        </button>
                        {section.slides && section.slides.length > 0 && (
                          <div className="border-t divide-y">
                            {section.slides.map((slide) => (
                              <div
                                key={slide.id}
                                className="flex items-center gap-3 px-4 py-3 pl-12"
                              >
                                <Play className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700 flex-1">{slide.name}</span>
                                {slide.isPreview && (
                                  <Badge variant="primary" size="sm">
                                    Preview
                                  </Badge>
                                )}
                                <span className="text-sm text-gray-400">
                                  {slide.duration} min
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h2>
                  <ul className="space-y-3">
                    {course.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Description */}
              {course.description && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>
                  <div
                    className="prose prose-gray max-w-none"
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                </section>
              )}

              {/* FAQs */}
              {course.faqs && course.faqs.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-4">
                    {course.faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl border border-gray-200 p-6"
                      >
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {faq.question}
                        </h3>
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar - hidden on mobile, shows instructor */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Instructor Card */}
                {course.instructorName && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Instructor</h3>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold text-primary-600">
                            {course.instructorName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {course.instructorName}
                          </p>
                          <p className="text-sm text-gray-500">Expert Trainer</p>
                        </div>
                      </div>
                      {course.instructorBio && (
                        <p className="text-sm text-gray-600">{course.instructorBio}</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Related Courses CTA */}
                <Card className="bg-primary-50 border-primary-100">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Need Team Training?
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Get group discounts for your organisation.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      asChild
                    >
                      <Link href="/corporate-training">Learn More</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
