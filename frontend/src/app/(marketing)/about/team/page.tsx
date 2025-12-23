import { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Linkedin, Award, GraduationCap } from 'lucide-react';
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

const teamMembers = [
  {
    name: 'David Thompson',
    role: 'Managing Director & Lead Consultant',
    qualifications: ['NEBOSH Diploma', 'IOSH Certified', 'Grad IOSH'],
    bio: 'With over 20 years of experience in health and safety management, David leads our consultancy team and specializes in complex risk assessments and ISO management systems.',
    email: 'david.thompson@seitechinternational.org.uk',
    linkedin: '#',
    expertise: ['Risk Assessment', 'ISO Management', 'Fire Safety'],
  },
  {
    name: 'Sarah Mitchell',
    role: 'Senior Trainer - NEBOSH & IOSH',
    qualifications: ['NEBOSH Certificate', 'IOSH Managing Safely', 'First Aid Instructor'],
    bio: 'Sarah has trained over 2,000 professionals in NEBOSH and IOSH courses. Her engaging teaching style and real-world examples make complex topics accessible.',
    email: 'sarah.mitchell@seitechinternational.org.uk',
    linkedin: '#',
    expertise: ['NEBOSH Training', 'IOSH Courses', 'Leadership'],
  },
  {
    name: 'James Patterson',
    role: 'Fire Safety Specialist',
    qualifications: ['Fire Risk Assessor', 'IOSH Certified', 'Emergency Planning'],
    bio: 'A former fire service professional, James brings practical experience to fire risk assessments and emergency planning consultancy.',
    email: 'james.patterson@seitechinternational.org.uk',
    linkedin: '#',
    expertise: ['Fire Risk Assessment', 'Emergency Planning', 'Fire Warden Training'],
  },
  {
    name: 'Emma Richardson',
    role: 'First Aid & Health Trainer',
    qualifications: ['Qualsafe Instructor', 'Paramedic Cert', 'Mental Health First Aid'],
    bio: 'Emma combines her paramedic background with training expertise to deliver practical, life-saving first aid courses.',
    email: 'emma.richardson@seitechinternational.org.uk',
    linkedin: '#',
    expertise: ['First Aid Training', 'Mental Health', 'Emergency Response'],
  },
  {
    name: 'Michael Chen',
    role: 'Environmental Consultant',
    qualifications: ['NEBOSH Environmental', 'ISO 14001 Lead Auditor', 'BSc Environmental Science'],
    bio: 'Michael specializes in environmental management systems and sustainability consulting, helping organizations minimize their environmental impact.',
    email: 'michael.chen@seitechinternational.org.uk',
    linkedin: '#',
    expertise: ['Environmental Management', 'ISO 14001', 'Sustainability'],
  },
  {
    name: 'Lisa Morgan',
    role: 'Training Coordinator & E-Learning Specialist',
    qualifications: ['Adult Education Cert', 'Digital Learning Specialist', 'IOSH Member'],
    bio: 'Lisa manages our training programs and leads the development of our e-learning platform, ensuring accessible, high-quality online courses.',
    email: 'lisa.morgan@seitechinternational.org.uk',
    linkedin: '#',
    expertise: ['E-Learning', 'Course Development', 'Training Management'],
  },
];

export default function TeamPage() {
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
            {teamMembers.map((member, index) => (
              <Card key={index} variant="elevated" hover>
                <CardContent className="p-0">
                  {/* Avatar Placeholder */}
                  <div className="bg-gradient-to-br from-primary-100 to-secondary-100 h-64 flex items-center justify-center">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary-600">
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-primary-600 font-semibold mb-4">{member.role}</p>

                    <p className="text-gray-600 text-sm mb-4">{member.bio}</p>

                    {/* Qualifications */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          Qualifications
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {member.qualifications.map((qual, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {qual}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Expertise */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-gray-400" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          Expertise
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {member.expertise.map((exp, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        <span className="sr-only">Email {member.name}</span>
                      </a>
                      <a
                        href={member.linkedin}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                      >
                        <Linkedin className="h-4 w-4" />
                        <span className="sr-only">LinkedIn profile</span>
                      </a>
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
              Our trainers and consultants are more than just qualified - they're passionate about
              making workplaces safer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="elevated">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Highly Qualified</h3>
                <p className="text-gray-600">
                  All our trainers hold industry-recognised qualifications and are subject matter
                  experts in their fields.
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
                  Our team brings practical industry experience, not just theoretical knowledge,
                  to every training session.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Ongoing Support</h3>
                <p className="text-gray-600">
                  We provide continued support after training, ensuring you have the guidance
                  needed to apply your learning.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Join Our Team CTA */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Interested in Joining Our Team?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            We're always looking for passionate health and safety professionals to join our growing
            team.
          </p>
          <Button variant="primary" size="lg" asChild>
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
