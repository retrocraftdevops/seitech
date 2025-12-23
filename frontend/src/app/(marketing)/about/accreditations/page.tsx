import { Metadata } from 'next';
import Link from 'next/link';
import { Award, CheckCircle, ExternalLink, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Accreditations - Recognised by Leading UK Bodies',
  description:
    'SEI Tech International is accredited by IOSH, Qualsafe, NEBOSH, and ProQual. Our courses meet the highest industry standards for health and safety training.',
  openGraph: {
    title: 'Our Accreditations - SEI Tech International',
    description: 'Accredited by IOSH, Qualsafe, NEBOSH, and ProQual for quality training.',
  },
};

const accreditations = [
  {
    name: 'IOSH',
    fullName: 'Institution of Occupational Safety & Health',
    description:
      'IOSH is the world\'s leading professional body for health and safety practitioners. As an approved training provider, we deliver IOSH Managing Safely and Working Safely courses that are recognised globally.',
    benefits: [
      'Internationally recognised qualifications',
      'Evidence-based training content',
      'Regular course updates to reflect legislation',
      'Quality assurance and monitoring',
    ],
    courses: [
      'IOSH Managing Safely',
      'IOSH Working Safely',
      'IOSH Safety for Executives and Directors',
    ],
    website: 'https://iosh.com',
    logo: 'IOSH',
  },
  {
    name: 'Qualsafe',
    fullName: 'Qualsafe Awards',
    description:
      'Qualsafe Awards is a UK-based awarding organisation specialising in health, safety, and compliance qualifications. As an approved centre, we deliver a wide range of Qualsafe-accredited courses.',
    benefits: [
      'Ofqual-regulated qualifications',
      'Comprehensive first aid and health & safety courses',
      'Flexible learning options',
      'Industry-leading quality standards',
    ],
    courses: [
      'First Aid at Work',
      'Emergency First Aid at Work',
      'Fire Safety courses',
      'Health & Safety in the Workplace',
    ],
    website: 'https://qualsafe.com',
    logo: 'QA',
  },
  {
    name: 'NEBOSH',
    fullName: 'National Examination Board in Occupational Safety and Health',
    description:
      'NEBOSH is the world\'s leading provider of health, safety, and environmental qualifications. Our NEBOSH-accredited courses are trusted by employers worldwide.',
    benefits: [
      'Gold standard in health & safety qualifications',
      'Globally recognised certifications',
      'Career-advancing credentials',
      'Regular updates to reflect best practices',
    ],
    courses: [
      'NEBOSH General Certificate',
      'NEBOSH Construction Certificate',
      'NEBOSH Fire Safety Certificate',
      'NEBOSH Environmental Certificate',
    ],
    website: 'https://nebosh.org.uk',
    logo: 'NEBOSH',
  },
  {
    name: 'ProQual',
    fullName: 'ProQual Awarding Body',
    description:
      'ProQual is a national awarding organisation providing qualifications across various sectors. We are approved to deliver ProQual NVQ qualifications in occupational health and safety.',
    benefits: [
      'Ofqual-regulated NVQ qualifications',
      'Work-based assessment options',
      'Flexible delivery methods',
      'Recognised across UK industries',
    ],
    courses: [
      'Level 3 NVQ Diploma in Occupational Health and Safety',
      'Level 5 NVQ Diploma in Occupational Health and Safety Practice',
      'Level 6 NVQ Diploma in Occupational Health and Safety Practice',
    ],
    website: 'https://proqualab.com',
    logo: 'ProQual',
  },
];

const statistics = [
  { value: '100%', label: 'Accredited Courses' },
  { value: '4', label: 'Major Accreditations' },
  { value: '98%', label: 'Pass Rate' },
  { value: '15+', label: 'Years Accredited' },
];

export default function AccreditationsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20 lg:py-28">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-3xl">
            <span className="inline-block text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">
              Accreditations
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Recognised by Leading UK Bodies
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Our accreditations ensure that every course we deliver meets the highest industry
              standards and is recognised by employers across the UK and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {statistics.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Accreditations */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Accrediting Bodies
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Each accreditation represents our commitment to delivering quality training that
              meets rigorous industry standards.
            </p>
          </div>

          <div className="space-y-12">
            {accreditations.map((accreditation, index) => (
              <Card key={index} variant="elevated" className="overflow-hidden">
                <div className="grid lg:grid-cols-3 gap-0">
                  {/* Logo Section */}
                  <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-8 lg:p-12 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl font-bold text-primary-600">
                          {accreditation.logo}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {accreditation.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">{accreditation.fullName}</p>
                      <a
                        href={accreditation.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold"
                      >
                        Visit Website
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="lg:col-span-2 p-8 lg:p-12">
                    <p className="text-gray-700 mb-6">{accreditation.description}</p>

                    {/* Benefits */}
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary-600" />
                        Key Benefits
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {accreditation.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Courses */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary-600" />
                        Available Courses
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {accreditation.courses.map((course, idx) => (
                          <Badge key={idx} variant="secondary">
                            {course}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Accreditation Matters */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Accreditation Matters
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our accreditations provide assurance that our training meets industry standards and
              delivers real value.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="elevated">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Assurance</h3>
                <p className="text-gray-600">
                  Accredited courses undergo regular quality checks and updates to ensure they meet
                  the latest standards and regulations.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Employer Recognition</h3>
                <p className="text-gray-600">
                  Qualifications from accredited providers are recognised and valued by employers
                  across the UK and internationally.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Career Advancement</h3>
                <p className="text-gray-600">
                  Accredited qualifications can boost your career prospects and demonstrate your
                  commitment to professional development.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Earn an Accredited Qualification?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Browse our range of accredited courses and take the next step in your health and safety
            career.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/training">View All Courses</Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 border-white text-white" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
