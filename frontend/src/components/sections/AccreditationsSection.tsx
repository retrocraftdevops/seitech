'use client';

import { Award, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { usePartners, useSection } from '@/hooks/use-cms';
import { stripHtml } from '@/lib/utils';
import type { CmsPartner } from '@/types';

// Default section header content
const defaultHeaderContent = {
  subtitle: 'Industry Recognition',
  title: 'Accredited by Leading Bodies',
  description: "Our courses are recognised and accredited by the UK's leading health, safety, and training organisations.",
};

// Fallback accreditations for when API is unavailable
const fallbackAccreditations: CmsPartner[] = [
  {
    id: 1,
    name: 'IOSH',
    logo: null,
    logoDark: null,
    websiteUrl: 'https://www.iosh.com',
    description: 'Approved training provider for IOSH Managing Safely and Working Safely courses.',
    partnerType: 'accreditation',
    accreditationNumber: '',
    accreditationExpiry: null,
    certificateUrl: '',
    isFeatured: true,
  },
  {
    id: 2,
    name: 'Qualsafe',
    logo: null,
    logoDark: null,
    websiteUrl: 'https://www.qualsafeawards.org',
    description: 'Approved centre for first aid, health & safety and social care qualifications.',
    partnerType: 'accreditation',
    accreditationNumber: '',
    accreditationExpiry: null,
    certificateUrl: '',
    isFeatured: true,
  },
  // TODO: Re-enable NEBOSH once licensing agreement is in place
  // {
  //   id: 3,
  //   name: 'NEBOSH',
  //   logo: null,
  //   logoDark: null,
  //   websiteUrl: 'https://www.nebosh.org.uk',
  //   description: 'Delivering NEBOSH General and Construction certificates.',
  //   partnerType: 'accreditation',
  //   accreditationNumber: '',
  //   accreditationExpiry: null,
  //   certificateUrl: '',
  //   isFeatured: true,
  // },
  {
    id: 4,
    name: 'ProQual',
    logo: null,
    logoDark: null,
    websiteUrl: '',
    description: 'NVQ qualifications in occupational health and safety.',
    partnerType: 'accreditation',
    accreditationNumber: '',
    accreditationExpiry: null,
    certificateUrl: '',
    isFeatured: true,
  },
];

export function AccreditationsSection() {
  const { partners: apiPartners, loading } = usePartners({ type: 'accreditation', featured: true });
  const { section } = useSection('home-accreditations');
  const accreditations = apiPartners.length > 0 ? apiPartners : fallbackAccreditations;

  // Use CMS data or fallback to defaults for header
  const headerContent = {
    subtitle: stripHtml(section?.subtitle) || defaultHeaderContent.subtitle,
    title: stripHtml(section?.title) || defaultHeaderContent.title,
    description: stripHtml(section?.description) || defaultHeaderContent.description,
  };

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
            {headerContent.subtitle}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {headerContent.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {headerContent.description}
          </p>
        </div>

        {/* Accreditations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {accreditations.map((accreditation) => (
            <div
              key={accreditation.id}
              className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                {accreditation.logo ? (
                  <Image
                    src={accreditation.logo}
                    alt={accreditation.name}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary-600">
                    {accreditation.name}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{accreditation.name}</h3>
              <p className="text-sm text-gray-600">{accreditation.description}</p>
            </div>
          ))}
        </div>

        {/* Benefits Bar */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-4 gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-white/80 text-sm">Accredited Courses</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">98%</p>
                <p className="text-white/80 text-sm">Pass Rate</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">5,000+</p>
                <p className="text-white/80 text-sm">Certified Professionals</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">15+</p>
                <p className="text-white/80 text-sm">Years Experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
