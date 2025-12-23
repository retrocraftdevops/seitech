'use client';

import { motion } from 'framer-motion';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFaqs } from '@/hooks/use-cms';
import type { CmsFaq } from '@/types';

// Fallback FAQs for when API is unavailable
const fallbackFaqs: CmsFaq[] = [
  {
    id: 1,
    question: 'What accreditations do you hold?',
    answer:
      '<p>SEI Tech International is accredited by leading health and safety organizations including IOSH (Institution of Occupational Safety and Health), NEBOSH (National Examination Board in Occupational Safety and Health), and Qualsafe Awards. All our courses are recognized and meet industry standards.</p>',
    shortAnswer: 'IOSH, NEBOSH, and Qualsafe accredited.',
    categoryId: null,
    categoryName: 'General Questions',
    categorySlug: 'general',
    isFeatured: true,
    viewCount: 0,
    helpfulCount: 0,
  },
  {
    id: 2,
    question: 'Do you offer both online and in-person training?',
    answer:
      '<p>Yes, we offer flexible training delivery options to suit your needs. Choose from e-learning courses for self-paced online study, virtual classroom sessions with live instructors, or traditional in-person training at our centers or your workplace.</p>',
    shortAnswer: 'Yes, e-learning, virtual, and in-person options.',
    categoryId: null,
    categoryName: 'Courses & Training',
    categorySlug: 'courses-training',
    isFeatured: true,
    viewCount: 0,
    helpfulCount: 0,
  },
  {
    id: 3,
    question: 'How long does it take to receive my certificate?',
    answer:
      '<p>Upon successful completion of your course and passing any required assessments, you will receive your digital certificate within 5-7 working days. Physical certificates are also available and typically arrive within 2-3 weeks.</p>',
    shortAnswer: 'Digital certificates within 5-7 working days.',
    categoryId: null,
    categoryName: 'Certificates',
    categorySlug: 'certificates',
    isFeatured: true,
    viewCount: 0,
    helpfulCount: 0,
  },
  {
    id: 4,
    question: 'Can you deliver training at our workplace?',
    answer:
      '<p>Absolutely! We offer on-site training delivery across the UK. This is ideal for organizations training multiple employees and allows us to tailor the content to your specific workplace and industry requirements. Contact us for a customized quote.</p>',
    shortAnswer: 'Yes, on-site training available UK-wide.',
    categoryId: null,
    categoryName: 'Courses & Training',
    categorySlug: 'courses-training',
    isFeatured: true,
    viewCount: 0,
    helpfulCount: 0,
  },
  {
    id: 5,
    question: 'Do you offer group discounts?',
    answer:
      '<p>Yes, we offer competitive group booking discounts for organizations training multiple employees. Discounts typically start at 10% for 5+ delegates and increase with larger groups. Contact our team for a tailored quote based on your requirements.</p>',
    shortAnswer: 'Yes, discounts from 10% for 5+ delegates.',
    categoryId: null,
    categoryName: 'Booking & Payment',
    categorySlug: 'booking-payment',
    isFeatured: true,
    viewCount: 0,
    helpfulCount: 0,
  },
];

// Helper to strip HTML tags for display
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function FAQSection() {
  const { faqs: apiFaqs, loading } = useFaqs({ featured: true, limit: 8 });
  const faqs = apiFaqs.length > 0 ? apiFaqs : fallbackFaqs;

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
              <HelpCircle className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                Questions
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our training courses and
              consultancy services
            </p>
          </motion.div>
        </div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Accordion.Root type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Accordion.Item
                  value={String(faq.id)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="w-full flex items-center justify-between p-6 text-left group">
                      <span className="text-lg font-semibold text-gray-900 pr-4 group-hover:text-primary-600 transition-colors">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className="h-5 w-5 text-gray-500 flex-shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180"
                        aria-hidden="true"
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <div className="px-6 pb-6 pt-0">
                      <div
                        className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              </motion.div>
            ))}
          </Accordion.Root>
        </motion.div>

        {/* Still Have Questions CTA */}
        <motion.div
          className="text-center mt-12 p-8 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Our team is here to help. Get in touch and we'll respond within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors duration-200"
            >
              Contact Us
            </a>
            <a
              href="tel:01234567890"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 hover:border-primary-300 transition-colors duration-200"
            >
              Call: 0123 456 7890
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
