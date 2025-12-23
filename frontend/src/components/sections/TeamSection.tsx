'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Linkedin, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { useTeam } from '@/hooks/use-cms';
import type { CmsTeamMember } from '@/types';

// Fallback team members for when API is unavailable
const fallbackTeamMembers: CmsTeamMember[] = [
  {
    id: 1,
    name: 'Dr. James Morrison',
    slug: 'james-morrison',
    jobTitle: 'Managing Director & Lead Consultant',
    image: null,
    shortBio: 'Over 20 years of experience in health and safety management. Former HSE inspector with expertise in risk management and compliance.',
    fullBio: '',
    department: 'leadership',
    qualifications: 'NEBOSH Diploma, IOSH, Chartered MIIRSM',
    certifications: '',
    specializations: '',
    email: 'james.morrison@seitech.com',
    linkedinUrl: 'https://linkedin.com/in/jamesmorrison',
    twitterUrl: '',
    isInstructor: false,
    isFeatured: true,
  },
  {
    id: 2,
    name: 'Sarah Thompson',
    slug: 'sarah-thompson',
    jobTitle: 'Head of Training & Development',
    image: null,
    shortBio: 'Passionate about education with 15+ years delivering professional training. Specializes in NEBOSH and IOSH qualifications.',
    fullBio: '',
    department: 'training',
    qualifications: 'NEBOSH Certificate, PGCE, IOSH Managing Safely',
    certifications: '',
    specializations: '',
    email: 'sarah.thompson@seitech.com',
    linkedinUrl: 'https://linkedin.com/in/sarahthompson',
    twitterUrl: '',
    isInstructor: true,
    isFeatured: true,
  },
  {
    id: 3,
    name: 'Michael Chen',
    slug: 'michael-chen',
    jobTitle: 'Senior Health & Safety Consultant',
    image: null,
    shortBio: 'Construction and manufacturing specialist with deep knowledge of industry-specific regulations and best practices.',
    fullBio: '',
    department: 'consultancy',
    qualifications: 'NEBOSH Construction, IOSH, CDM Regulations',
    certifications: '',
    specializations: '',
    email: 'michael.chen@seitech.com',
    linkedinUrl: 'https://linkedin.com/in/michaelchen',
    twitterUrl: '',
    isInstructor: false,
    isFeatured: true,
  },
];

// Helper to parse qualifications string into array
function parseQualifications(qualifications: string): string[] {
  if (!qualifications) return [];
  return qualifications.split(',').map((q) => q.trim()).filter(Boolean);
}

export function TeamSection() {
  const { members: apiMembers, loading } = useTeam({ featured: true });
  const teamMembers = apiMembers.length > 0 ? apiMembers : fallbackTeamMembers;

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Meet Our Expert{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                Team
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our team of qualified professionals brings decades of combined
              experience in health, safety, and environmental management
            </p>
          </motion.div>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card hover className="h-full">
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                        <span className="text-6xl font-bold text-primary-600">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />

                    {/* Social Links - Overlay on image */}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      {member.linkedinUrl && (
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors duration-200 group"
                          aria-label={`${member.name} LinkedIn profile`}
                        >
                          <Linkedin className="h-4 w-4 text-gray-700 group-hover:text-primary-600" />
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors duration-200 group"
                          aria-label={`Email ${member.name}`}
                        >
                          <Mail className="h-4 w-4 text-gray-700 group-hover:text-primary-600" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Name & Role */}
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary-600 font-medium mb-4">{member.jobTitle}</p>

                    {/* Bio */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {member.shortBio}
                    </p>

                    {/* Qualifications */}
                    {member.qualifications && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Qualifications
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {parseQualifications(member.qualifications).map((qual) => (
                            <span
                              key={qual}
                              className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-medium"
                            >
                              {qual}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16 p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Join Our Team of Experts
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We're always looking for talented health and safety professionals to join
            our growing team. If you're passionate about making workplaces safer, we'd
            love to hear from you.
          </p>
          <a
            href="/careers"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-200"
          >
            View Career Opportunities
          </a>
        </motion.div>
      </div>
    </section>
  );
}
