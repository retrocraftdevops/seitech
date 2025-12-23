'use client';

import Link from 'next/link';
import { Monitor, Users, Video, Building2, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { useSection } from '@/hooks/use-cms';
import { stripHtml } from '@/lib/utils';

// Default section header content (fallback when API is unavailable)
const defaultContent = {
  subtitle: 'Flexible Learning',
  title: 'Choose Your Learning Style',
  description: 'We offer multiple training delivery methods to suit your schedule, budget, and learning preferences.',
};

const methods = [
  {
    icon: Monitor,
    title: 'E-Learning',
    description:
      'Self-paced online courses available 24/7. Study at your own convenience with interactive content and assessments.',
    href: '/e-learning',
    color: 'blue',
    features: ['Study anytime, anywhere', 'Interactive modules', 'Instant certification'],
  },
  {
    icon: Video,
    title: 'Virtual Classroom',
    description:
      'Live online sessions with expert trainers via Zoom. Interactive learning with real-time Q&A and group activities.',
    href: '/virtual-learning',
    color: 'purple',
    features: ['Live interaction', 'Expert-led sessions', 'Flexible scheduling'],
  },
  {
    icon: Users,
    title: 'Face-to-Face',
    description:
      'Traditional classroom training at our centres or approved venues. Hands-on learning with practical exercises.',
    href: '/face-to-face',
    color: 'green',
    features: ['Hands-on practice', 'Networking opportunities', 'UK-wide venues'],
  },
  {
    icon: Building2,
    title: 'In-House Training',
    description:
      'Tailored training delivered at your premises. Customised content for your teams specific needs and industry.',
    href: '/in-house-training',
    color: 'orange',
    features: ['Customised content', 'Team-focused', 'Cost-effective for groups'],
  },
];

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    hover: 'group-hover:bg-blue-100',
    check: 'text-blue-500',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    hover: 'group-hover:bg-purple-100',
    check: 'text-purple-500',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    hover: 'group-hover:bg-green-100',
    check: 'text-green-500',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-100 text-orange-600',
    hover: 'group-hover:bg-orange-100',
    check: 'text-orange-500',
  },
};

export function TrainingMethods() {
  const { section } = useSection('home-training-methods');

  // Use CMS data or fallback to defaults
  const content = {
    subtitle: stripHtml(section?.subtitle) || defaultContent.subtitle,
    title: stripHtml(section?.title) || defaultContent.title,
    description: stripHtml(section?.description) || defaultContent.description,
  };

  return (
    <section className="py-20 lg:py-28 bg-gray-50">
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

        {/* Methods Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {methods.map((method) => {
            const colors = colorVariants[method.color as keyof typeof colorVariants];
            const Icon = method.icon;

            return (
              <Link key={method.title} href={method.href} className="group">
                <Card hover className="h-full">
                  <CardContent className="p-6">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors ${colors.icon} ${colors.hover}`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                      {method.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                      {method.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2 mb-5">
                      {method.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className={`h-4 w-4 ${colors.check}`} />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Link */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary-600 group-hover:gap-3 transition-all">
                      <span>Learn more</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
