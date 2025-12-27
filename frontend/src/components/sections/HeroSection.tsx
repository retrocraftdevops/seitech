'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play, Shield, Award, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSection } from '@/hooks/use-cms';
import { stripHtml } from '@/lib/utils';

// Default content (fallback when API is unavailable)
const defaultContent = {
  // TODO: Re-enable NEBOSH once licensing agreement is in place
  // subtitle: 'IOSH, Qualsafe & NEBOSH Accredited',
  subtitle: 'IOSH & Qualsafe Accredited',
  title: 'See the Risks. Secure the Workplace.',
  description: 'Professional health, safety, and environmental training and consultancy services. Empowering professionals with cutting-edge knowledge and compliance solutions.',
  ctaText: 'Explore Training',
  ctaUrl: '/courses',
  secondaryCtaText: 'View Consultancy',
  secondaryCtaUrl: '/services',
};

export function HeroSection() {
  const { section, loading } = useSection('home-hero');

  // Use CMS data or fallback to defaults
  const content = {
    subtitle: stripHtml(section?.subtitle) || defaultContent.subtitle,
    title: stripHtml(section?.title) || defaultContent.title,
    description: stripHtml(section?.description) || defaultContent.description,
    ctaText: stripHtml(section?.ctaText) || defaultContent.ctaText,
    ctaUrl: section?.ctaUrl || defaultContent.ctaUrl,
    secondaryCtaText: stripHtml(section?.secondaryCtaText) || defaultContent.secondaryCtaText,
    secondaryCtaUrl: section?.secondaryCtaUrl || defaultContent.secondaryCtaUrl,
  };

  // Split title for styling (assumes format "First part. Second part.")
  const titleParts = content.title.split('.');
  const titleFirst = titleParts[0] + '.';
  const titleSecond = titleParts.slice(1).join('.').trim();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] bg-repeat" />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 max-w-7xl py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white/90 mb-6">
              <Award className="h-4 w-4 text-primary-400" />
              <span>{content.subtitle}</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {titleFirst}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                {titleSecond}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
              {content.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link href={content.ctaUrl}>
                <Button
                  size="lg"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  {content.ctaText}
                </Button>
              </Link>
              <Link href={content.secondaryCtaUrl}>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  {content.secondaryCtaText}
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>5,000+ Professionals Trained</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>UK Nationwide Service</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>98% Pass Rate</span>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Professional safety training"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />

              {/* Play Button Overlay */}
              <button className="absolute inset-0 flex items-center justify-center group">
                <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Play className="h-8 w-8 text-primary-600 ml-1" />
                </div>
              </button>
            </div>

            {/* Floating Cards */}
            <div className="absolute -left-4 lg:-left-8 top-1/4 bg-white rounded-xl shadow-xl p-4 animate-float hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Training</p>
                  <p className="text-sm text-gray-500">E-Learning & Classroom</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 lg:-right-8 bottom-1/4 bg-white rounded-xl shadow-xl p-4 animate-float animate-delay-200 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-secondary-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Consultancy</p>
                  <p className="text-sm text-gray-500">Compliance & Audits</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
