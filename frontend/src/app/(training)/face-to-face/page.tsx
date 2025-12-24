import { Metadata } from 'next';
import Link from 'next/link';
import {
  Users,
  MapPin,
  Calendar,
  Award,
  CheckCircle,
  Coffee,
  MessageCircle,
  ArrowRight,
  Clock,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Face-to-Face Training | Classroom Health & Safety Courses',
  // TODO: Re-enable NEBOSH once licensing agreement is in place
  // description: 'Join our expert-led classroom training courses for hands-on health and safety learning. IOSH, NEBOSH, and Qualsafe accredited courses at venues across the UK.',
  description:
    'Join our expert-led classroom training courses for hands-on health and safety learning. IOSH and Qualsafe accredited courses at venues across the UK.',
  openGraph: {
    title: 'Face-to-Face Training - SEI Tech International',
    description: 'Expert-led classroom training at venues across the UK.',
  },
};

const benefits = [
  {
    icon: Users,
    title: 'Expert-Led Sessions',
    description: 'Learn directly from experienced trainers with real-world industry expertise.',
  },
  {
    icon: MessageCircle,
    title: 'Interactive Learning',
    description: 'Engage in discussions, group activities, and practical exercises.',
  },
  {
    icon: Coffee,
    title: 'Networking Opportunities',
    description: 'Connect with other professionals and share experiences.',
  },
  {
    icon: Award,
    title: 'Immediate Feedback',
    description: 'Get your questions answered in real-time by qualified trainers.',
  },
  {
    icon: MapPin,
    title: 'UK-Wide Venues',
    description: 'Training sessions available at convenient locations across the country.',
  },
  {
    icon: Calendar,
    title: 'Scheduled Sessions',
    description: 'Regular course dates to fit around your business needs.',
  },
];

const upcomingCourses = [
  {
    id: 1,
    name: 'IOSH Managing Safely',
    slug: 'iosh-managing-safely',
    location: 'London',
    date: '15-18 January 2025',
    price: 495,
    accreditation: 'IOSH',
    spotsLeft: 6,
  },
  // TODO: Re-enable NEBOSH once licensing agreement is in place
  // {
  //   id: 2,
  //   name: 'NEBOSH General Certificate',
  //   slug: 'nebosh-national-general-certificate',
  //   location: 'Birmingham',
  //   date: '20-31 January 2025',
  //   price: 1295,
  //   accreditation: 'NEBOSH',
  //   spotsLeft: 4,
  // },
  {
    id: 3,
    name: 'First Aid at Work (3-day)',
    slug: 'first-aid-at-work-3-day',
    location: 'Manchester',
    date: '22-24 January 2025',
    price: 295,
    accreditation: 'Qualsafe',
    spotsLeft: 8,
  },
  {
    id: 4,
    name: 'Fire Warden Training',
    slug: 'fire-warden-training',
    location: 'Leeds',
    date: '27 January 2025',
    price: 145,
    accreditation: 'CPD',
    spotsLeft: 12,
  },
];

const venues = [
  { city: 'London', region: 'South East' },
  { city: 'Birmingham', region: 'West Midlands' },
  { city: 'Manchester', region: 'North West' },
  { city: 'Leeds', region: 'Yorkshire' },
  { city: 'Glasgow', region: 'Scotland' },
  { city: 'Bristol', region: 'South West' },
  { city: 'Newcastle', region: 'North East' },
  { city: 'Cardiff', region: 'Wales' },
];

export default function FaceToFacePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white py-20 lg:py-28 overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="max-w-3xl">
            <Badge variant="secondary" size="lg" className="mb-6">
              <Users className="h-4 w-4 mr-2" />
              Classroom Training
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Face-to-Face{' '}
              <span className="text-primary-200">Training</span>
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Expert-led classroom training with hands-on practical exercises.
              Join scheduled sessions at convenient venues across the UK.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" size="lg" asChild>
                <Link href="/courses?delivery=face-to-face">View Upcoming Courses</Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 border-white text-white hover:bg-white/20" asChild>
                <Link href="/contact">Request Group Booking</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 mt-10 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Expert Trainers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>UK-Wide Venues</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Small Group Sizes</span>
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
              Why Choose Classroom Training?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nothing beats the experience of learning directly from expert trainers
              in a focused, interactive environment.
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

      {/* Upcoming Courses */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Upcoming Training Dates
              </h2>
              <p className="text-lg text-gray-600">
                Book your place on our next classroom courses
              </p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link href="/courses?delivery=face-to-face">
                View Full Schedule
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {upcomingCourses.map((course) => (
              <Card key={course.id} hover className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge variant="success" size="sm" className="mb-2">
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
                      <MapPin className="h-4 w-4" />
                      {course.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {course.date}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant={course.spotsLeft <= 5 ? 'danger' : 'secondary'} size="sm">
                      {course.spotsLeft} spots left
                    </Badge>
                    <Button size="sm" asChild>
                      <Link href={`/courses/${course.slug}`}>Book Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Button variant="outline" asChild>
              <Link href="/courses?delivery=face-to-face">
                View Full Schedule
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Venues */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Training Venues Across the UK
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We deliver classroom training at professional venues in major cities
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {venues.map((venue, index) => (
              <Card key={index} variant="bordered" className="text-center hover:border-primary-300 transition-colors">
                <CardContent className="py-6">
                  <MapPin className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900">{venue.city}</h3>
                  <p className="text-sm text-gray-500">{venue.region}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need Training for Your Team?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            We offer group bookings and can deliver training at your premises.
            Contact us for a customized quote.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/in-house-training">In-House Training</Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 border-white text-white hover:bg-white/20" asChild>
              <Link href="/free-consultation">Request Quote</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
