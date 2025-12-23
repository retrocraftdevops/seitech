'use client';

import Link from 'next/link';
import {
  BookOpen,
  ClipboardCheck,
  Monitor,
  Users,
  Video,
  Building2,
  Flame,
  Shield,
  FileSearch,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useSection } from '@/hooks/use-cms';
import { stripHtml } from '@/lib/utils';

// Default content (fallback when API is unavailable)
const defaultContent = {
  subtitle: 'Our Services',
  title: 'Two Pillars of Excellence',
  description: 'Whether you need to upskill your team or ensure workplace compliance, SEI Tech delivers world-class training and consultancy solutions.',
  ctaText: 'Explore Courses',
  secondaryCtaText: 'View All Services',
};

export function ServicesOverview() {
  const { section } = useSection('home-services');

  // Use CMS data or fallback to defaults
  const content = {
    subtitle: stripHtml(section?.subtitle) || defaultContent.subtitle,
    title: stripHtml(section?.title) || defaultContent.title,
    description: stripHtml(section?.description) || defaultContent.description,
    ctaText: stripHtml(section?.ctaText) || defaultContent.ctaText,
    secondaryCtaText: stripHtml(section?.secondaryCtaText) || defaultContent.secondaryCtaText,
  };

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
            {content.subtitle}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {content.description}
          </p>
        </div>

        {/* Two-Column Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Training Pillar */}
          <Card className="relative overflow-hidden border-2 border-primary-100 bg-gradient-to-br from-primary-50/50 to-white">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="h-7 w-7 text-primary-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Training Services
              </h3>
              <p className="text-gray-600 mb-6">
                Accredited courses delivered through multiple formats to suit your
                learning preferences and schedule.
              </p>

              {/* Delivery Methods */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <Monitor className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">E-Learning</p>
                    <p className="text-xs text-gray-500">Self-paced online</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Face-to-Face</p>
                    <p className="text-xs text-gray-500">Classroom training</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <Video className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Virtual</p>
                    <p className="text-xs text-gray-500">Live online sessions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <Building2 className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">In-House</p>
                    <p className="text-xs text-gray-500">At your premises</p>
                  </div>
                </div>
              </div>

              {/* Accreditations */}
              <div className="flex items-center gap-4 mb-6">
                <Award className="h-5 w-5 text-amber-500" />
                <span className="text-sm text-gray-600">
                  IOSH, Qualsafe, NEBOSH & ProQual Accredited
                </span>
              </div>

              <Button rightIcon={<ArrowRight className="h-4 w-4" />} asChild>
                <Link href="/courses">{content.ctaText}</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Consultancy Pillar */}
          <Card className="relative overflow-hidden border-2 border-secondary-100 bg-gradient-to-br from-secondary-50/50 to-white">
            <CardContent className="p-8">
              <div className="w-14 h-14 bg-secondary-100 rounded-2xl flex items-center justify-center mb-6">
                <ClipboardCheck className="h-7 w-7 text-secondary-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Consultancy Services
              </h3>
              <p className="text-gray-600 mb-6">
                Expert compliance support and safety assessments to protect your
                business and workforce.
              </p>

              {/* Key Services */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <Flame className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Fire Risk</p>
                    <p className="text-xs text-gray-500">Assessments</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">H&S Audits</p>
                    <p className="text-xs text-gray-500">GAP analysis</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <FileSearch className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">ISO Systems</p>
                    <p className="text-xs text-gray-500">45001, 14001, 9001</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <ClipboardCheck className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Site Audits</p>
                    <p className="text-xs text-gray-500">Workplace reviews</p>
                  </div>
                </div>
              </div>

              {/* USP */}
              <div className="flex items-center gap-4 mb-6">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600">
                  UK Nationwide Coverage & Free Initial Consultation
                </span>
              </div>

              <Button
                variant="secondary"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                asChild
              >
                <Link href="/services">{content.secondaryCtaText}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
