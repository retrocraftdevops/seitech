import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Linkedin, Award, GraduationCap, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Our Team - Expert Health & Safety Trainers',
  description:
    'Meet the expert team at SEI Tech International. Our trainers and consultants have decades of combined experience in health, safety, and environmental management.',
  openGraph: {
    title: 'Our Team - SEI Tech International',
    description: 'Meet our expert health and safety trainers and consultants.',
  },
};

interface TeamMember {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  jobTitle: string;
  department: string;
  shortBio: string;
  fullBio: string;
  qualifications: string;
  certifications: string;
  specializations: string;
  email: string;
  linkedinUrl: string;
  twitterUrl: string;
  isInstructor: boolean;
  isFeatured: boolean;
}

// Fallback team members for when API is unavailable
const fallbackTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'David Thompson',
    slug: 'david-thompson',
    image: '/team/instructor-1.jpg',
    jobTitle: 'Managing Director & Lead Consultant',
    department: 'leadership',
    shortBio: 'With over 20 years of experience in health and safety management, David leads our consultancy team and specializes in complex risk assessments and ISO management systems.',
    fullBio: '',
    qualifications: 'IOSH Certified, Grad IOSH',
    certifications: '',
    specializations: 'Risk Assessment, ISO Management, Fire Safety',
    email: 'david.thompson@seitechinternational.org.uk',
    linkedinUrl: '#',
    twitterUrl: '',
    isInstructor: false,
    isFeatured: true,
  },
  {
    id: 2,
    name: 'Sarah Mitchell',
    slug: 'sarah-mitchell',
    image: '/team/instructor-2.jpg',
    jobTitle: 'Senior Trainer - IOSH',
    department: 'training',
    shortBio: 'Sarah has trained over 2,000 professionals in IOSH courses. Her engaging teaching style and real-world examples make complex topics accessible.',
    fullBio: '',
    qualifications: 'IOSH Managing Safely, First Aid Instructor',
    certifications: '',
    specializations: 'IOSH Courses, Leadership',
    email: 'sarah.mitchell@seitechinternational.org.uk',
    linkedinUrl: '#',
    twitterUrl: '',
    isInstructor: true,
    isFeatured: true,
  },
  {
    id: 3,
    name: 'James Patterson',
    slug: 'james-patterson',
    image: '/team/instructor-3.jpg',
    jobTitle: 'Fire Safety Specialist',
    department: 'consultancy',
    shortBio: 'A former fire service professional, James brings practical experience to fire risk assessments and emergency planning consultancy.',
    fullBio: '',
    qualifications: 'Fire Risk Assessor, IOSH Certified, Emergency Planning',
    certifications: '',
    specializations: 'Fire Risk Assessment, Emergency Planning, Fire Warden Training',
    email: 'james.patterson@seitechinternational.org.uk',
    linkedinUrl: '#',
    twitterUrl: '',
    isInstructor: true,
    isFeatured: true,
  },
  {
    id: 4,
    name: 'Emma Richardson',
    slug: 'emma-richardson',
    image: null,
    jobTitle: 'First Aid & Health Trainer',
    department: 'training',
    shortBio: 'Emma combines her paramedic background with training expertise to deliver practical, life-saving first aid courses.',
    fullBio: '',
    qualifications: 'Qualsafe Instructor, Paramedic Cert, Mental Health First Aid',
    certifications: '',
    specializations: 'First Aid Training, Mental Health, Emergency Response',
    email: 'emma.richardson@seitechinternational.org.uk',
    linkedinUrl: '#',
    twitterUrl: '',
    isInstructor: true,
    isFeatured: false,
  },
  {
    id: 5,
    name: 'Michael Chen',
    slug: 'michael-chen',
    image: null,
    jobTitle: 'Environmental Consultant',
    department: 'consultancy',
    shortBio: 'Michael specializes in environmental management systems and sustainability consulting, helping organizations minimize their environmental impact.',
    fullBio: '',
    qualifications: 'ISO 14001 Lead Auditor, BSc Environmental Science',
    certifications: '',
    specializations: 'Environmental Management, ISO 14001, Sustainability',
    email: 'michael.chen@seitechinternational.org.uk',
    linkedinUrl: '#',
    twitterUrl: '',
    isInstructor: false,
    isFeatured: false,
  },
  {
    id: 6,
    name: 'Lisa Morgan',
    slug: 'lisa-morgan',
    image: null,
    jobTitle: 'Training Coordinator & E-Learning Specialist',
    department: 'training',
    shortBio: 'Lisa manages our training programs and leads the development of our e-learning platform, ensuring accessible, high-quality online courses.',
    fullBio: '',
    qualifications: 'Adult Education Cert, Digital Learning Specialist, IOSH Member',
    certifications: '',
    specializations: 'E-Learning, Course Development, Training Management',
    email: 'lisa.morgan@seitechinternational.org.uk',
    linkedinUrl: '#',
    twitterUrl: '',
    isInstructor: false,
    isFeatured: false,
  },
];

async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/cms/team`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return fallbackTeamMembers;
    }

    const data = await response.json();
    if (data.success && data.data && data.data.length > 0) {
      return data.data;
    }

    return fallbackTeamMembers;
  } catch (error) {
    console.error('Error fetching team members:', error);
    return fallbackTeamMembers;
  }
}

export default async function TeamPage() {
  const teamMembers = await getTeamMembers();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20 lg:py-28">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-3xl">
            <span className="inline-block text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">
              Our Team
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Expert Trainers & Consultants
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Meet the dedicated professionals who make workplace safety their passion. Our team
              brings decades of combined experience and real-world expertise to every training
              session and consultancy project.
            </p>
          </div>
        </div>
      </section>

      {/* Team Members Grid */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <Card key={member.id} variant="elevated" hover>
                <CardContent className="p-0">
                  {/* Avatar */}
                  <div className="bg-gradient-to-br from-primary-100 to-secondary-100 h-64 flex items-center justify-center overflow-hidden">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={256}
                        height={256}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary-600">
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-primary-600 font-semibold mb-4">{member.jobTitle}</p>

                    <p className="text-gray-600 text-sm mb-4">{member.shortBio}</p>

                    {/* Qualifications */}
                    {member.qualifications && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <GraduationCap className="h-4 w-4 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-500 uppercase">
                            Qualifications
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {member.qualifications.split(',').map((qual, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {qual.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expertise/Specializations */}
                    {member.specializations && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="h-4 w-4 text-gray-400" />
                          <span className="text-xs font-semibold text-gray-500 uppercase">
                            Expertise
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {member.specializations.split(',').map((exp, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {exp.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                          <span className="sr-only">Email {member.name}</span>
                        </a>
                      )}
                      {member.linkedinUrl && member.linkedinUrl !== '#' && (
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                        >
                          <Linkedin className="h-4 w-4" />
                          <span className="sr-only">LinkedIn profile</span>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Team */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Team?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our trainers and consultants are more than just qualified - they&apos;re passionate about
              making workplaces safer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="elevated">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Industry Certified</h3>
                <p className="text-gray-600">
                  All our trainers hold current certifications from IOSH, Qualsafe, and other
                  leading accreditation bodies.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Real-World Experience</h3>
                <p className="text-gray-600">
                  Our team includes former emergency service professionals, safety officers, and
                  industry experts.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Dedicated Support</h3>
                <p className="text-gray-600">
                  We don&apos;t just train - we provide ongoing support to help you maintain
                  compliance and safety standards.
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
            Ready to Work with Our Experts?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Whether you need training, consultancy, or both, our team is ready to help you
            achieve your health and safety goals.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg">Get in Touch</Button>
            </Link>
            <Link href="/training">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 hover:bg-white/20 border-white text-white"
              >
                View Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
