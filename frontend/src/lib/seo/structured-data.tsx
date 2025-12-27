/**
 * Agent 6: SEO - Structured Data
 */

import * as React from 'react';

export function generateCourseSchema(course: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.shortDescription,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'SEI Tech International',
      url: 'https://seitechinternational.org.uk',
    },
    image: course.imageUrl,
    offers: {
      '@type': 'Offer',
      price: course.listPrice,
      priceCurrency: 'GBP',
    },
  };
}

export function StructuredData({ data }: { data: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
