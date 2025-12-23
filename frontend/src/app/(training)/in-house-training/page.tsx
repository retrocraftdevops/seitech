import { Metadata } from 'next';
import Link from 'next/link';
import {
  Building2,
  Users,
  Clock,
  Award,
  CheckCircle,
  MapPin,
  Calendar,
  ArrowRight,
  Settings,
  Target,
  PoundSterling,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'In-House Training | Bespoke Health & Safety Training at Your Premises',
  description:
    'Customized health and safety training delivered at your workplace. Tailored courses to meet your specific needs with flexible scheduling and group rates.',
  openGraph: {
    title: 'In-House Training - SEI Tech International',
    description: 'Bespoke training delivered at your premises.',
  },
};

const benefits = [
  {
    icon: Building2,
    title: 'Your Location',
    description: 'Training delivered at your premises - no travel required for your team.',
  },
  {
    icon: Settings,
    title: 'Customized Content',
    description: 'Courses tailored to your industry, workplace hazards, and specific needs.',
  },
  {
    icon: Users,
    title: 'Team Building',
    description: 'Train your team together for consistent knowledge and shared understanding.',
  },
  {
    icon: PoundSterling,
    title: 'Cost-Effective',
    description: 'Group rates often work out cheaper than booking individual places.',
  },
  {
    icon: Calendar,
    title: 'Flexible Scheduling',
    description: 'Choose dates and times that suit your business operations.',
  },
  {
    icon: Target,
    title: 'Focused Learning',
    description: 'Use your own workplace examples and case studies for maximum relevance.',
  },
];

const popularCourses = [
  {
    name: 'IOSH Managing Safely',
    duration: '4 days',
    groupSize: '6-15',
    accreditation: 'IOSH',
  },
  {
    name: 'IOSH Working Safely',
    duration: '1 day',
    groupSize: '6-20',
    accreditation: 'IOSH',
  },
  {
    name: 'Fire Warden Training',
    duration: 'Half day',
    groupSize: '6-20',
    accreditation: 'CPD',
  },
  {
    name: 'First Aid at Work',
    duration: '3 days',
    groupSize: '6-12',
    accreditation: 'Qualsafe',
  },
  {
    name: 'Manual Handling',
    duration: 'Half day',
    groupSize: '6-20',
    accreditation: 'CPD',
  },
  {
    name: 'Health & Safety Induction',
    duration: 'Half day',
    groupSize: '10-30',
    accreditation: 'CPD',
  },
];

const process = [
  {
    step: 1,
    title: 'Consultation',
    description: 'Discuss your training requirements, workplace hazards, and business objectives.',
  },
  {
    step: 2,
    title: 'Proposal',
    description: 'Receive a customized training proposal with tailored content and pricing.',
  },
  {
    step: 3,
    title: 'Customization',
    description: 'We adapt the course materials to incorporate your workplace examples.',
  },
  {
    step: 4,
    title: 'Delivery',
    description: 'Expert trainers deliver the course at your premises on agreed dates.',
  },
];

const industries = [
  'Construction',
  'Manufacturing',
  'Healthcare',
  'Retail',
  'Hospitality',
  'Transport & Logistics',
  'Education',
  'Energy & Utilities',
  'Professional Services',
  'Food & Drink',
  'Engineering',
  'Public Sector',
];

export default function InHouseTrainingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary-600 via-primary-600 to-primary-700 text-white py-20 lg:py-28 overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="max-w-3xl">
            <Badge variant="secondary" size="lg" className="mb-6">
              <Building2 className="h-4 w-4 mr-2" />
              In-House Training
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Training at{' '}
              <span className="text-secondary-200">Your Premises</span>
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Bespoke training solutions delivered at your workplace. Customized content,
              flexible scheduling, and cost-effective group rates for your team.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" size="lg" asChild>
                <Link href="/free-consultation">Request Quote</Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 border-white text-white hover:bg-white/20" asChild>
                <Link href="/contact">Speak to an Expert</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 mt-10 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Tailored Content</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Group Rates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>UK-Wide Delivery</span>
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
              Why Choose In-House Training?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Bringing training to your workplace offers unique advantages that
              public courses simply can't match.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} variant="ghost" hover className="text-center">
                  <CardContent className="pt-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
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

      {/* Process Section */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From initial consultation to delivery, we make the process simple
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-secondary-300 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular In-House Courses
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our most requested training courses for workplace delivery
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCourses.map((course, index) => (
              <Card key={index} variant="bordered" hover>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{course.name}</h3>
                    <Badge variant="success" size="sm">{course.accreditation}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.groupSize} delegates
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Don't see your course? We can deliver most of our training programmes in-house.
            </p>
            <Button variant="outline" asChild>
              <Link href="/courses">
                View All Courses
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Industries We Serve
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We deliver customized training across all sectors
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {industries.map((industry, index) => (
              <Badge
                key={index}
                variant="secondary"
                size="lg"
                className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-default"
              >
                {industry}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Request Form */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-secondary-600 to-primary-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get a Free Quote for Your Team
            </h2>
            <p className="text-xl text-white/90">
              Tell us about your training requirements and we'll provide a tailored proposal
            </p>
          </div>

          <Card variant="elevated" className="bg-white text-gray-900">
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                      placeholder="Your Company Ltd"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                      placeholder="+44 1234 567890"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course(s) of Interest *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                    >
                      <option value="">Select a course...</option>
                      {popularCourses.map((course) => (
                        <option key={course.name} value={course.name}>
                          {course.name}
                        </option>
                      ))}
                      <option value="other">Other - please specify</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Delegates *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                      placeholder="10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Requirements
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                    placeholder="Tell us about any specific requirements, preferred dates, or questions..."
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Request Quote
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
