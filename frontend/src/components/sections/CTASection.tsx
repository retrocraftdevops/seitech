'use client';

import Link from 'next/link';
import { ArrowRight, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { siteConfig } from '@/config/site';
import { useSection } from '@/hooks/use-cms';
import { stripHtml } from '@/lib/utils';

// Default content (fallback when API is unavailable)
const defaultContent = {
  title: 'Ready to Elevate Your Safety Standards?',
  description: "Whether you need training for your team or expert consultancy support, we're here to help. Book a free consultation to discuss your requirements.",
  ctaText: 'Book Free Consultation',
  secondaryCtaText: siteConfig.contact.phone,
};

export function CTASection() {
  const { section } = useSection('home-cta');

  // Use CMS data or fallback to defaults
  const content = {
    title: stripHtml(section?.title) || defaultContent.title,
    description: stripHtml(section?.description) || defaultContent.description,
    ctaText: stripHtml(section?.ctaText) || defaultContent.ctaText,
    secondaryCtaText: stripHtml(section?.secondaryCtaText) || defaultContent.secondaryCtaText,
  };

  // Split title for styling (assumes format like "Ready to Elevate Your Safety Standards?")
  const titleMatch = content.title.match(/^(.+?\s)([\w\s]+[?!]?)$/);
  const titlePart1 = titleMatch ? titleMatch[1] : content.title;
  const titlePart2 = titleMatch ? titleMatch[2] : '';

  return (
    <section className="py-20 lg:py-28 bg-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] bg-repeat" />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-secondary-500/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          {content.title}
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          {content.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/contact">
            <Button
              size="xl"
              rightIcon={<Calendar className="h-5 w-5" />}
            >
              {content.ctaText}
            </Button>
          </Link>
          <Button
            variant="outline"
            size="xl"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
            leftIcon={<Phone className="h-5 w-5" />}
          >
            <a href={`tel:${content.secondaryCtaText.replace(/\s/g, '')}`}>
              {content.secondaryCtaText}
            </a>
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <span>No obligation consultation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <span>Response within 24 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <span>Tailored recommendations</span>
          </div>
        </div>
      </div>
    </section>
  );
}
