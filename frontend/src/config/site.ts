export const siteConfig = {
  name: 'SEI Tech International',
  tagline: 'See the Risks. Secure the Workplace',
  description:
    'Professional health, safety, and environmental training and consultancy services. Accredited by IOSH and Qualsafe.',
  url: 'https://seitechinternational.org.uk',
  ogImage: 'https://seitechinternational.org.uk/images/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/seitech',
    linkedin: 'https://linkedin.com/company/seitech-international',
    facebook: 'https://facebook.com/seitechinternational',
  },
  contact: {
    phone: '+44 1233 438817',
    email: 'info@seitechinternational.org.uk',
    address: {
      street: 'Park Street',
      city: 'Ashford',
      county: 'Kent',
      postcode: 'TN24 8DF',
      country: 'United Kingdom',
    },
  },
  businessHours: {
    weekdays: '9:00 AM - 5:30 PM',
    saturday: 'By appointment',
    sunday: 'Closed',
  },
} as const;

export const metadataDefaults = {
  title: {
    default: 'SEI Tech International - Health & Safety Training & Consultancy',
    template: '%s | SEI Tech International',
  },
  description: siteConfig.description,
  keywords: [
    'health and safety training',
    'IOSH training',
    'Qualsafe courses',
    // TODO: Re-enable NEBOSH once licensing agreement is in place
    // 'NEBOSH certification',
    'fire risk assessment',
    'workplace safety',
    'consultancy services',
    'ISO management',
    'e-learning courses',
    'UK safety training',
  ],
  authors: [{ name: 'SEI Tech International' }],
  creator: 'SEI Tech International',
  publisher: 'SEI Tech International',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};
