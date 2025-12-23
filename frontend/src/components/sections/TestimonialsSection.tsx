'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTestimonials, useSection } from '@/hooks/use-cms';
import { stripHtml } from '@/lib/utils';
import type { CmsTestimonial } from '@/types';

// Default section header content
const defaultHeaderContent = {
  title: 'What Our Clients Say',
  description: 'Trusted by leading organizations across the UK for professional training and consultancy services.',
};

// Fallback testimonials for when API is unavailable
const fallbackTestimonials: CmsTestimonial[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    title: 'HSE Manager',
    company: 'Construction Solutions Ltd',
    avatar: null,
    content: 'SEI Tech provided exceptional NEBOSH training for our team. The instructors were knowledgeable, engaging, and the material was highly relevant to our industry. Our safety culture has improved significantly.',
    rating: 5,
    courseId: null,
    courseName: null,
    serviceType: 'training',
    isFeatured: true,
    source: 'google',
    sourceUrl: '',
    date: null,
  },
  {
    id: 2,
    name: 'Michael Chen',
    title: 'Operations Director',
    company: 'Manufacturing Excellence UK',
    avatar: null,
    content: 'The consultancy services from SEI Tech transformed our approach to workplace safety. Their team conducted thorough audits and provided actionable recommendations that exceeded our expectations.',
    rating: 5,
    courseId: null,
    courseName: null,
    serviceType: 'consultancy',
    isFeatured: true,
    source: 'linkedin',
    sourceUrl: '',
    date: null,
  },
  {
    id: 3,
    name: 'Emma Williams',
    title: 'Learning & Development Lead',
    company: 'Global Logistics Group',
    avatar: null,
    content: "Outstanding training delivery! The e-learning platform is user-friendly and the course content is comprehensive. We've trained over 200 staff members with a 100% pass rate.",
    rating: 5,
    courseId: null,
    courseName: null,
    serviceType: 'elearning',
    isFeatured: true,
    source: 'trustpilot',
    sourceUrl: '',
    date: null,
  },
];

export function TestimonialsSection() {
  const { testimonials: apiTestimonials, loading } = useTestimonials({ featured: true, limit: 10 });
  const { section } = useSection('home-testimonials');
  const testimonials = apiTestimonials.length > 0 ? apiTestimonials : fallbackTestimonials;

  // Use CMS data or fallback to defaults for header
  const headerContent = {
    title: stripHtml(section?.title) || defaultHeaderContent.title,
    description: stripHtml(section?.description) || defaultHeaderContent.description,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-white">
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
              {headerContent.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {headerContent.description}
            </p>
          </motion.div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg p-8 h-full flex flex-col relative">
                    {/* Quote Icon */}
                    <div className="absolute top-6 right-6 opacity-10">
                      <Quote className="h-16 w-16 text-primary-600" />
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-gray-700 mb-6 flex-grow relative z-10">
                      "{testimonial.content}"
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                      {testimonial.avatar ? (
                        <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-semibold text-primary-600">
                            {testimonial.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-gray-600">{testimonial.title}</p>
                        <p className="text-sm text-primary-600 font-medium">
                          {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="hidden md:block">
            <button
              onClick={scrollPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 z-10"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6 text-gray-900" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 z-10"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6 text-gray-900" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index === selectedIndex
                    ? 'bg-primary-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
