import { Metadata } from 'next';
import Link from 'next/link';
import {
  Award,
  Target,
  Users,
  Heart,
  Shield,
  TrendingUp,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'About Us - Leading Health & Safety Training Provider',
  description:
    'Learn about SEI Tech International, a trusted provider of health, safety, and environmental training with over 15 years of experience. Accredited by IOSH, Qualsafe, NEBOSH, and ProQual.',
  openGraph: {
    title: 'About SEI Tech International',
    description:
      'Leading provider of health, safety, and environmental training with over 15 years of experience.',
  },
};

const values = [
  {
    icon: Shield,
    title: 'Safety First',
    description:
      'We prioritize the safety and well-being of every individual in the workplace through comprehensive training.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description:
      'We maintain the highest standards in all our training programs, ensuring quality and effectiveness.',
  },
  {
    icon: Heart,
    title: 'Care & Support',
    description:
      'We provide ongoing support to our clients, ensuring they have the resources needed for success.',
  },
  {
    icon: TrendingUp,
    title: 'Continuous Improvement',
    description:
      'We constantly update our courses and methods to reflect the latest industry standards and regulations.',
  },
];

const statistics = [
  { value: '5,000+', label: 'Certified Professionals' },
  { value: '15+', label: 'Years of Experience' },
  { value: '98%', label: 'Pass Rate' },
  { value: '500+', label: 'Corporate Clients' },
];

const accreditations = [
  {
    name: 'IOSH',
    fullName: 'Institution of Occupational Safety & Health',
  },
  {
    name: 'Qualsafe',
    fullName: 'Qualsafe Awards',
  },
  {
    name: 'NEBOSH',
    fullName: 'National Examination Board in Occupational Safety and Health',
  },
  {
    name: 'ProQual',
    fullName: 'ProQual Awarding Body',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20 lg:py-28">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-3xl">
            <span className="inline-block text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">
              About SEI Tech International
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              See the Risks. Secure the Workplace
            </h1>
            <p className="text-xl text-white/90 mb-8">
              For over 15 years, we've been empowering organizations and individuals with
              world-class health, safety, and environmental training.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" size="lg" asChild>
                <Link href="/contact">Get in Touch</Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 border-white text-white" asChild>
                <Link href="/about/team">Meet Our Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
                Our Mission
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Creating Safer Workplaces Through Expert Training
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                At SEI Tech International, our mission is to provide high-quality, accessible
                health and safety training that empowers individuals and organizations to create
                safer, more compliant workplaces.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We believe that every worker deserves to return home safely at the end of each
                day. Through our comprehensive training programs and expert consultancy services,
                we help organizations identify risks, implement best practices, and build a
                culture of safety.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    Accredited by leading UK health and safety organizations
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    Flexible training delivery: classroom, online, and on-site
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    Expert trainers with real-world industry experience
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 rounded-3xl flex items-center justify-center">
                <Target className="h-48 w-48 text-primary-600 opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
              Our Values
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Drives Us Forward
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our core values guide everything we do, from course development to client support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} variant="elevated" className="text-center">
                  <CardContent className="pt-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Impact in Numbers</h2>
            <p className="text-xl text-white/90">
              Delivering excellence in health and safety training since 2009
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {statistics.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl md:text-6xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accreditations Preview */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
              Industry Recognition
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Accredited by Leading Bodies
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our courses are recognised and accredited by the UK's leading health, safety, and
              training organisations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {accreditations.map((accreditation, index) => (
              <Card key={index} variant="ghost" hover className="text-center">
                <CardContent className="py-8">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary-600">
                      {accreditation.name}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">{accreditation.fullName}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="primary" size="lg" asChild>
              <Link href="/about/accreditations">
                View All Accreditations
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Team Preview CTA */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-12 md:p-16 text-center text-white">
            <Users className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Expert Team</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Our trainers and consultants bring decades of combined experience in health, safety,
              and environmental management.
            </p>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/about/team">
                Meet the Team
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Contact us today to discuss your training needs or request a quote for our services.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="primary" size="lg" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/training">Browse Courses</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
