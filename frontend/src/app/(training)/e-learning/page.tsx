import { Metadata } from 'next';
import Link from 'next/link';
import {
  Monitor,
  Clock,
  Award,
  CheckCircle,
  PlayCircle,
  Smartphone,
  Shield,
  ArrowRight,
  Star,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'E-Learning Courses | Flexible Online Health & Safety Training',
  description:
    'Complete your health and safety training online with our accredited e-learning courses. Learn at your own pace with IOSH, Qualsafe, and CPD certified courses.',
  openGraph: {
    title: 'E-Learning Courses - SEI Tech International',
    description: 'Flexible online health and safety training. Learn at your own pace.',
  },
};

const benefits = [
  {
    icon: Clock,
    title: 'Learn at Your Own Pace',
    description: 'Complete courses when it suits you, with 12 months access to all materials.',
  },
  {
    icon: Monitor,
    title: 'Interactive Content',
    description: 'Engaging videos, quizzes, and practical scenarios to reinforce learning.',
  },
  {
    icon: Smartphone,
    title: 'Multi-Device Access',
    description: 'Learn on desktop, tablet, or mobile - your progress syncs across all devices.',
  },
  {
    icon: Award,
    title: 'Instant Certification',
    description: 'Download your digital certificate immediately upon successful completion.',
  },
  {
    icon: Shield,
    title: 'Fully Accredited',
    // TODO: Re-enable NEBOSH once licensing agreement is in place
    // description: 'All courses are accredited by IOSH, Qualsafe, NEBOSH, or CPD certified.',
    description: 'All courses are accredited by IOSH, Qualsafe, or CPD certified.',
  },
  {
    icon: PlayCircle,
    title: 'Bite-Sized Modules',
    description: 'Learn in manageable chunks that fit around your busy schedule.',
  },
];

const howItWorks = [
  {
    step: 1,
    title: 'Choose Your Course',
    description: 'Browse our catalogue and select the course that matches your training needs.',
  },
  {
    step: 2,
    title: 'Create Your Account',
    description: 'Register and gain instant access to your personal learning dashboard.',
  },
  {
    step: 3,
    title: 'Learn at Your Pace',
    description: 'Work through interactive modules, videos, and assessments when it suits you.',
  },
  {
    step: 4,
    title: 'Get Certified',
    description: 'Pass the final assessment and download your accredited certificate instantly.',
  },
];

interface Course {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  listPrice: number;
  duration: number;
  ratingAvg: number;
  ratingCount: number;
  accreditation?: string;
}

async function getCourses(): Promise<Course[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000';
    const response = await fetch(`${baseUrl}/api/courses?limit=4&sortBy=popularity`, {
      cache: 'no-store',
    });
    const data = await response.json();
    if (data.success && data.data?.courses) {
      return data.data.courses.slice(0, 4);
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
  return [];
}

function formatDuration(hours: number): string {
  if (hours === 0) return '2-4 hours';
  if (hours < 8) return `${hours} hours`;
  const days = Math.round(hours / 8);
  return `${days} day${days > 1 ? 's' : ''}`;
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

export default async function ELearningPage() {
  const courses = await getCourses();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white py-20 lg:py-28 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-repeat" />
        </div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" size="lg" className="mb-6">
                <Monitor className="h-4 w-4 mr-2" />
                E-Learning Courses
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Learn Health & Safety{' '}
                <span className="text-primary-200">Online</span>
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Flexible, accredited e-learning courses that fit around your schedule.
                Complete your training anytime, anywhere, at your own pace.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/courses">
                  <Button size="lg">Browse Courses</Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 border-white text-white">
                    Get in Touch
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 mt-10 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Fully Accredited</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>12 Months Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Instant Certificates</span>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="aspect-video bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 p-8 flex items-center justify-center">
                <PlayCircle className="h-24 w-24 text-white opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose E-Learning?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our online courses combine flexibility with quality, ensuring you get
              the best training experience without leaving your desk.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} variant="ghost" hover className="text-center">
                  <CardContent className="pt-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started with our e-learning platform is quick and easy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-300 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Popular E-Learning Courses
              </h2>
              <p className="text-lg text-gray-600">
                Our most in-demand online training courses
              </p>
            </div>
            <Link href="/courses">
              <Button>
                View All Courses
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>

          {courses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.slug}`}>
                  <Card hover className="h-full">
                    <div className="relative h-40 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-primary-400" />
                      <Badge className="absolute top-3 left-3" variant="info">
                        E-Learning
                      </Badge>
                      {course.accreditation && (
                        <Badge className="absolute top-3 right-3" variant="success">
                          {course.accreditation}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{course.name}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {stripHtml(course.shortDescription)}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(course.duration)}</span>
                        {course.ratingAvg > 0 && (
                          <>
                            <span className="text-gray-300">|</span>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{course.ratingAvg.toFixed(1)} ({course.ratingCount})</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatCurrency(course.listPrice)}
                        </span>
                        <Button size="sm">View Course</Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading courses...</p>
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link href="/courses">
              <Button>
                View All Courses
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of professionals who have completed their training with our
            flexible e-learning platform.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg">Browse Courses</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 border-white text-white">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
