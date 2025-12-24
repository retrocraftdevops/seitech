import type { NavItem } from '@/types';

export const mainNavigation: NavItem[] = [
  {
    title: 'Training',
    href: '/courses',
    children: [
      {
        title: 'By Delivery Method',
        href: '#',
        children: [
          {
            title: 'E-Learning',
            href: '/e-learning',
            description: 'Self-paced online courses available 24/7',
            icon: 'Monitor',
          },
          {
            title: 'Face-to-Face Training',
            href: '/face-to-face',
            description: 'Classroom training at our venues or your site',
            icon: 'Users',
          },
          {
            title: 'Virtual Classroom',
            href: '/virtual-learning',
            description: 'Live online sessions with expert trainers',
            icon: 'Video',
          },
          {
            title: 'In-House Training',
            href: '/in-house-training',
            description: 'Tailored training delivered at your premises',
            icon: 'Building2',
          },
        ],
      },
      {
        title: 'By Accreditation',
        href: '#',
        children: [
          {
            title: 'IOSH Courses',
            href: '/courses?accreditation=iosh',
            description: 'Institution of Occupational Safety & Health',
            icon: 'Award',
          },
          {
            title: 'Qualsafe Courses',
            href: '/courses?accreditation=qualsafe',
            description: 'Qualsafe Awards accredited training',
            icon: 'Award',
          },
          // TODO: Re-enable NEBOSH once licensing agreement is in place
          // {
          //   title: 'NEBOSH Courses',
          //   href: '/courses?accreditation=nebosh',
          //   description: 'National Examination Board certifications',
          //   icon: 'Award',
          // },
          {
            title: 'NVQ Qualifications',
            href: '/courses?accreditation=nvq',
            description: 'ProQual NVQ programmes',
            icon: 'GraduationCap',
          },
        ],
      },
      {
        title: 'By Category',
        href: '#',
        children: [
          {
            title: 'Health & Safety',
            href: '/categories/health-safety',
            description: 'Core workplace safety training',
            icon: 'Shield',
          },
          {
            title: 'Fire Safety',
            href: '/categories/fire-safety',
            description: 'Fire warden and awareness courses',
            icon: 'Flame',
          },
          {
            title: 'First Aid',
            href: '/categories/first-aid',
            description: 'Emergency response training',
            icon: 'HeartPulse',
          },
          {
            title: 'Mental Health',
            href: '/categories/mental-health',
            description: 'Workplace wellbeing courses',
            icon: 'Brain',
          },
          {
            title: 'Environmental',
            href: '/categories/environmental',
            description: 'Environmental management training',
            icon: 'Leaf',
          },
        ],
      },
      {
        title: 'Quick Links',
        href: '#',
        children: [
          {
            title: 'View All Courses',
            href: '/courses',
            description: 'Browse our complete course catalog',
            icon: 'BookOpen',
          },
          {
            title: 'Upcoming Schedules',
            href: '/schedules',
            description: 'See our training calendar',
            icon: 'Calendar',
          },
          {
            title: 'Corporate Training',
            href: '/corporate-training',
            description: 'Group booking discounts available',
            icon: 'Briefcase',
          },
        ],
      },
    ],
  },
  {
    title: 'Consultancy',
    href: '/services',
    children: [
      {
        title: 'Compliance Services',
        href: '#',
        children: [
          {
            title: 'Fire Risk Assessment',
            href: '/services/fire-risk-assessment',
            description: 'Comprehensive fire safety evaluations',
            icon: 'Flame',
          },
          {
            title: 'Health & Safety Audit',
            href: '/services/health-safety-audit',
            description: 'GAP analysis and compliance reviews',
            icon: 'ClipboardCheck',
          },
          {
            title: 'Risk Assessment',
            href: '/services/risk-assessment',
            description: 'Workplace hazard identification',
            icon: 'AlertTriangle',
          },
          {
            title: 'Face Fit Testing',
            href: '/services/face-fit-testing',
            description: 'RPE compliance testing',
            icon: 'ShieldCheck',
          },
          {
            title: 'Site Inspections',
            href: '/services/site-inspections',
            description: 'On-site safety assessments',
            icon: 'Search',
          },
          {
            title: 'DSE Assessments',
            href: '/services/dse-assessments',
            description: 'Display Screen Equipment evaluations',
            icon: 'Monitor',
          },
          {
            title: 'Legionella Assessment',
            href: '/services/legionella-assessment',
            description: 'Water system safety checks',
            icon: 'Droplets',
          },
          {
            title: 'Workplace Audits',
            href: '/services/workplace-audits',
            description: 'Full workplace compliance audits',
            icon: 'FileSearch',
          },
        ],
      },
      {
        title: 'ISO Management',
        href: '#',
        children: [
          {
            title: 'ISO 45001',
            href: '/services/iso-45001',
            description: 'Occupational Health & Safety Management',
            icon: 'ShieldCheck',
          },
          {
            title: 'ISO 14001',
            href: '/services/iso-14001',
            description: 'Environmental Management Systems',
            icon: 'Leaf',
          },
          {
            title: 'ISO 9001',
            href: '/services/iso-9001',
            description: 'Quality Management Systems',
            icon: 'CheckCircle',
          },
        ],
      },
      {
        title: 'Specialist Services',
        href: '#',
        children: [
          {
            title: 'Policy Writing',
            href: '/services/policy-writing',
            description: 'Custom H&S policies and procedures',
            icon: 'FileText',
          },
          {
            title: 'Compliance Support',
            href: '/services/compliance-support',
            description: 'Ongoing regulatory guidance',
            icon: 'LifeBuoy',
          },
        ],
      },
    ],
  },
  {
    title: 'About',
    href: '/about',
    children: [
      {
        title: 'Company',
        href: '#',
        children: [
          {
            title: 'About Us',
            href: '/about',
            description: 'Learn about SEI Tech International',
            icon: 'Building2',
          },
          {
            title: 'Our Team',
            href: '/about/team',
            description: 'Meet our expert trainers and consultants',
            icon: 'Users',
          },
          {
            title: 'Accreditations',
            href: '/about/accreditations',
            description: 'Our industry certifications',
            icon: 'Award',
          },
          {
            title: 'Testimonials',
            href: '/about/testimonials',
            description: 'What our clients say',
            icon: 'MessageSquare',
          },
        ],
      },
    ],
  },
  {
    title: 'Blog',
    href: '/blog',
  },
  {
    title: 'Contact',
    href: '/contact',
  },
];

export const footerNavigation = {
  training: [
    { title: 'All Courses', href: '/courses' },
    { title: 'E-Learning', href: '/e-learning' },
    { title: 'Face-to-Face Training', href: '/face-to-face' },
    { title: 'Virtual Classroom', href: '/virtual-learning' },
    { title: 'Training Schedules', href: '/schedules' },
    { title: 'Corporate Training', href: '/corporate-training' },
  ],
  consultancy: [
    { title: 'All Services', href: '/services' },
    { title: 'Fire Risk Assessment', href: '/services/fire-risk-assessment' },
    { title: 'Health & Safety Audit', href: '/services/health-safety-audit' },
    { title: 'ISO Management', href: '/services/iso-management' },
    { title: 'Free Consultation', href: '/free-consultation' },
  ],
  accreditations: [
    { title: 'IOSH Courses', href: '/courses?accreditation=iosh' },
    { title: 'Qualsafe Courses', href: '/courses?accreditation=qualsafe' },
    // TODO: Re-enable NEBOSH once licensing agreement is in place
    // { title: 'NEBOSH Courses', href: '/courses?accreditation=nebosh' },
    { title: 'Our Accreditations', href: '/about/accreditations' },
  ],
  company: [
    { title: 'About Us', href: '/about' },
    { title: 'Our Team', href: '/about/team' },
    { title: 'Blog', href: '/blog' },
    { title: 'Contact', href: '/contact' },
    { title: 'Careers', href: '/about/careers' },
  ],
  legal: [
    { title: 'Terms & Conditions', href: '/terms' },
    { title: 'Privacy Policy', href: '/privacy' },
    { title: 'Cookie Policy', href: '/cookies' },
    { title: 'Accessibility', href: '/accessibility' },
  ],
};
