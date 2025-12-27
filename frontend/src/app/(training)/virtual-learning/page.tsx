import { Metadata } from 'next';
import Link from 'next/link';
import {
  Video,
  Users,
  Clock,
  Award,
  CheckCircle,
  MessageCircle,
  Monitor,
  ArrowRight,
  Calendar,
  Mic,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Virtual Learning | Live Online Health & Safety Training',
  description:
    'Join live instructor-led training sessions from anywhere. Interactive virtual classrooms with real-time Q&A, group activities, and expert trainers.',
  openGraph: {
    title: 'Virtual Learning - SEI Tech International',
    description: 'Live instructor-led training from the comfort of your home or office.',
  },
};

const benefits = [
  {
    icon: Video,
    title: 'Live Instructor-Led',
    description: 'Real trainers delivering interactive sessions in real-time.',
  },
  {
    icon: MessageCircle,
    title: 'Real-Time Interaction',
    description: 'Ask questions, participate in discussions, and get immediate feedback.',
  },
  {
    icon: Users,
    title: 'Virtual Breakout Rooms',
    description: 'Collaborate with peers in group exercises and activities.',
  },
  {
    icon: Monitor,
    title: 'No Travel Required',
    description: 'Join from your home or office - all you need is an internet connection.',
  },
  {
    icon: Calendar,
    title: 'Scheduled Sessions',
    description: 'Fixed session times to help you stay accountable and focused.',
  },
  {
    icon: Award,
    title: 'Same Certification',
    description: 'Receive the same accredited certificate as classroom courses.',
  },
];

const upcomingCourses = [
  {
    id: 1,
    name: 'IOSH Managing Safely (Virtual)',
    slug: 'iosh-managing-safely',
    dates: 'Mon-Thu, 9am-1pm',
    startDate: '13 January 2025',
    price: 395,
    accreditation: 'IOSH',
    spotsLeft: 8,
  },
  // TODO: Re-enable NEBOSH once licensing agreement is in place
  // {
  //   id: 2,
  //   name: 'NEBOSH General Certificate (Virtual)',
  //   slug: 'nebosh-national-general-certificate',
  //   dates: 'Mon-Fri, 9am-5pm (2 weeks)',
  //   startDate: '20 January 2025',
  //   price: 1195,
  //   accreditation: 'NEBOSH',
  //   spotsLeft: 5,
  // },
  {
    id: 3,
    name: 'Fire Safety Awareness (Virtual)',
    slug: 'fire-safety-awareness',
    dates: 'Half-day session',
    startDate: '15 January 2025',
    price: 75,
    accreditation: 'CPD',
    spotsLeft: 15,
  },
  {
    id: 4,
    name: 'Mental Health First Aid (Virtual)',
    slug: 'mental-health-first-aid',
    dates: '2-day course, 9am-5pm',
    startDate: '22 January 2025',
    price: 295,
    accreditation: 'MHFA',
    spotsLeft: 6,
  },
];

const howItWorks = [
  {
    step: 1,
    title: 'Book Your Place',
    description: 'Choose your course and select a convenient date from our schedule.',
  },
  {
    step: 2,
    title: 'Receive Access',
    description: 'Get your joining link and course materials sent to your email.',
  },
  {
    step: 3,
    title: 'Join the Session',
    description: 'Click the link at the scheduled time and join the live class.',
  },
  {
    step: 4,
    title: 'Get Certified',
    description: 'Complete the course and receive your accredited certificate.',
  },
];

const requirements = [
  'Stable internet connection (minimum 5 Mbps)',
  'Computer, laptop, or tablet with webcam',
  'Microphone and speakers (or headset)',
  'Quiet, distraction-free environment',
  'Latest version of Chrome, Firefox, or Edge',
];

export default function VirtualLearningPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-primary-600 to-secondary-600 text-white py-20 lg:py-28 overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" size="lg" className="mb-6">
                <Video className="h-4 w-4 mr-2" />
                Virtual Classroom
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Live Online{' '}
                <span className="text-purple-200">Training</span>
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Experience the benefits of classroom training from anywhere. Join live
                instructor-led sessions with real-time interaction and collaboration.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/courses?delivery=virtual">
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
                  <span>Live Trainers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Interactive Sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Same Certification</span>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="aspect-video bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 p-4">
                <div className="grid grid-cols-2 gap-3 h-full">
                  <div className="bg-white/20 rounded-xl flex items-center justify-center">
                    <Users className="h-12 w-12 text-white/60" />
                  </div>
                  <div className="bg-white/20 rounded-xl flex items-center justify-center">
                    <Video className="h-12 w-12 text-white/60" />
                  </div>
                  <div className="col-span-2 bg-white/20 rounded-xl flex items-center justify-center gap-4">
                    <Mic className="h-8 w-8 text-white/60" />
                    <MessageCircle className="h-8 w-8 text-white/60" />
                    <Monitor className="h-8 w-8 text-white/60" />
                  </div>
                </div>
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
              The Best of Both Worlds
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Virtual learning combines the flexibility of online training with the
              engagement and interaction of classroom sessions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} variant="ghost" hover className="text-center">
                  <CardContent className="pt-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
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
              How Virtual Learning Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started with our virtual classroom is simple
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-300 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Courses */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Upcoming Virtual Sessions
              </h2>
              <p className="text-lg text-gray-600">
                Live instructor-led training you can join from anywhere
              </p>
            </div>
            <Link href="/courses?delivery=virtual">
              <Button>
                View All Courses
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {upcomingCourses.map((course) => (
              <Card key={course.id} hover className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge variant="purple" size="sm" className="mb-2">
                        {course.accreditation}
                      </Badge>
                      <h3 className="text-xl font-bold text-gray-900">{course.name}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">£{course.price}</span>
                      <p className="text-sm text-gray-500">per person</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Starts {course.startDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.dates}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant={course.spotsLeft <= 5 ? 'danger' : 'secondary'} size="sm">
                      {course.spotsLeft} spots left
                    </Badge>
                    <Link href={`/courses/${course.slug}`}>
                      <Button size="sm">Book Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Requirements */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Technical Requirements
              </h2>
              <p className="text-lg text-gray-600">
                To get the most out of your virtual learning experience
              </p>
            </div>

            <Card variant="bordered">
              <CardContent className="p-8">
                <ul className="space-y-4">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-purple-600 to-primary-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Join a Virtual Session?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Experience world-class training from the comfort of your home or office.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/courses?delivery=virtual">
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
