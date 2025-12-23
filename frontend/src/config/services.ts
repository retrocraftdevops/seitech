import type { ConsultancyService } from '@/types';

export const consultancyServices: Partial<ConsultancyService>[] = [
  {
    id: 1,
    name: 'Fire Risk Assessment',
    slug: 'fire-risk-assessment',
    shortDescription:
      'Comprehensive fire safety evaluations ensuring compliance with the Regulatory Reform (Fire Safety) Order 2005.',
    iconName: 'Flame',
    features: [
      'Full premises fire risk evaluation',
      'Identification of fire hazards',
      'Review of existing fire safety measures',
      'Emergency escape route assessment',
      'Detailed written report with recommendations',
      'Ongoing compliance support',
    ],
    benefits: [
      'Legal compliance assurance',
      'Reduced insurance premiums',
      'Staff and visitor safety',
      'Protection of business assets',
    ],
    pricingType: 'quote',
  },
  {
    id: 2,
    name: 'Health & Safety GAP Audit',
    slug: 'health-safety-audit',
    shortDescription:
      'Thorough assessment of your current H&S practices against regulatory requirements and best practices.',
    iconName: 'ClipboardCheck',
    features: [
      'Documentation review',
      'Site inspection',
      'Staff interviews',
      'Risk assessment evaluation',
      'Policy and procedure analysis',
      'Prioritised action plan',
    ],
    benefits: [
      'Identify compliance gaps',
      'Reduce workplace incidents',
      'Improve safety culture',
      'Demonstrate due diligence',
    ],
    pricingType: 'quote',
  },
  {
    id: 3,
    name: 'Risk Assessment Services',
    slug: 'risk-assessment',
    shortDescription:
      'Professional identification and evaluation of workplace hazards with practical control measures.',
    iconName: 'AlertTriangle',
    features: [
      'Workplace hazard identification',
      'Risk evaluation and scoring',
      'Control measure recommendations',
      'Documentation and records',
      'Review scheduling',
      'Staff training recommendations',
    ],
    benefits: [
      'Prevent workplace accidents',
      'Meet legal obligations',
      'Protect employees and visitors',
      'Reduce liability exposure',
    ],
    pricingType: 'quote',
  },
  {
    id: 4,
    name: 'Face Fit Testing',
    slug: 'face-fit-testing',
    shortDescription:
      'Ensure your respiratory protective equipment (RPE) provides adequate protection with certified testing.',
    iconName: 'ShieldCheck',
    features: [
      'Qualitative fit testing',
      'Quantitative fit testing available',
      'Test result documentation',
      'Fit test certificates issued',
      'Equipment recommendations',
      'Retest scheduling',
    ],
    benefits: [
      'Ensure RPE effectiveness',
      'Comply with COSHH regulations',
      'Protect worker health',
      'Documented compliance evidence',
    ],
    pricingType: 'fixed',
    priceFrom: 25,
  },
  {
    id: 5,
    name: 'Site Inspections',
    slug: 'site-inspections',
    shortDescription:
      'Comprehensive on-site safety assessments to identify hazards and ensure regulatory compliance.',
    iconName: 'Search',
    features: [
      'Full site walkthrough',
      'Hazard identification',
      'Compliance verification',
      'Photographic evidence',
      'Immediate recommendations',
      'Detailed inspection report',
    ],
    benefits: [
      'Early hazard detection',
      'Demonstrate safety commitment',
      'Independent expert view',
      'Continuous improvement',
    ],
    pricingType: 'quote',
  },
  {
    id: 6,
    name: 'DSE Assessments',
    slug: 'dse-assessments',
    shortDescription:
      'Display Screen Equipment workstation assessments to prevent musculoskeletal issues and eye strain.',
    iconName: 'Monitor',
    features: [
      'Individual workstation assessment',
      'Ergonomic evaluation',
      'Equipment recommendations',
      'User training advice',
      'Follow-up review',
      'Compliance documentation',
    ],
    benefits: [
      'Reduce MSK disorders',
      'Improve productivity',
      'Meet DSE regulations',
      'Enhance employee wellbeing',
    ],
    pricingType: 'fixed',
    priceFrom: 35,
  },
  {
    id: 7,
    name: 'Legionella Risk Assessment',
    slug: 'legionella-assessment',
    shortDescription:
      "Protect building occupants from Legionnaires' disease with comprehensive water system assessments.",
    iconName: 'Droplets',
    features: [
      'Water system survey',
      'Temperature monitoring review',
      'Risk identification',
      'Control scheme development',
      'Testing recommendations',
      'Management programme advice',
    ],
    benefits: [
      'Prevent legionella outbreaks',
      'Comply with HSE guidance',
      'Protect occupant health',
      'Avoid enforcement action',
    ],
    pricingType: 'quote',
  },
  {
    id: 8,
    name: 'Workplace Audits',
    slug: 'workplace-audits',
    shortDescription:
      'Full-scope workplace compliance audits covering all aspects of health and safety management.',
    iconName: 'FileSearch',
    features: [
      'Management system review',
      'Documentation audit',
      'Site inspection',
      'Staff competency assessment',
      'Incident investigation review',
      'Comprehensive report with actions',
    ],
    benefits: [
      'Holistic compliance view',
      'Identify system weaknesses',
      'Benchmark performance',
      'Drive improvements',
    ],
    pricingType: 'quote',
  },
  {
    id: 9,
    name: 'ISO 45001 Consultancy',
    slug: 'iso-45001',
    shortDescription:
      'Expert guidance for implementing and maintaining ISO 45001 Occupational Health & Safety Management Systems.',
    iconName: 'ShieldCheck',
    features: [
      'Gap analysis',
      'System design and documentation',
      'Implementation support',
      'Internal audit training',
      'Management review facilitation',
      'Certification preparation',
    ],
    benefits: [
      'International recognition',
      'Systematic safety management',
      'Continuous improvement',
      'Tender eligibility',
    ],
    pricingType: 'quote',
  },
  {
    id: 10,
    name: 'ISO 14001 Consultancy',
    slug: 'iso-14001',
    shortDescription:
      'Professional support for Environmental Management System implementation and certification.',
    iconName: 'Leaf',
    features: [
      'Environmental aspects review',
      'Legal compliance evaluation',
      'System documentation',
      'Objectives and targets setting',
      'Operational control procedures',
      'Audit and certification support',
    ],
    benefits: [
      'Demonstrate environmental commitment',
      'Reduce environmental impact',
      'Cost savings through efficiency',
      'Enhanced reputation',
    ],
    pricingType: 'quote',
  },
  {
    id: 11,
    name: 'ISO 9001 Consultancy',
    slug: 'iso-9001',
    shortDescription:
      'Quality Management System consultancy to enhance organisational performance and customer satisfaction.',
    iconName: 'CheckCircle',
    features: [
      'Process mapping and analysis',
      'Quality policy development',
      'Procedure documentation',
      'Risk-based thinking implementation',
      'Performance metrics',
      'Certification support',
    ],
    benefits: [
      'Improved customer satisfaction',
      'Consistent quality delivery',
      'Process efficiency',
      'Market differentiation',
    ],
    pricingType: 'quote',
  },
  {
    id: 12,
    name: 'Policy & Procedure Writing',
    slug: 'policy-writing',
    shortDescription:
      'Custom health and safety policies and procedures tailored to your organisation and industry.',
    iconName: 'FileText',
    features: [
      'Bespoke policy development',
      'Procedure documentation',
      'Form and checklist creation',
      'Management system manuals',
      'Review and update service',
      'Staff guidance documents',
    ],
    benefits: [
      'Legally compliant documentation',
      'Clear staff guidance',
      'Consistent practices',
      'Audit-ready records',
    ],
    pricingType: 'quote',
  },
];

export const serviceCategories = [
  {
    id: 'compliance',
    name: 'Compliance Services',
    description: 'Essential safety assessments and compliance support',
    services: consultancyServices.filter((s) =>
      [
        'fire-risk-assessment',
        'health-safety-audit',
        'risk-assessment',
        'face-fit-testing',
        'site-inspections',
        'dse-assessments',
        'legionella-assessment',
        'workplace-audits',
      ].includes(s.slug || '')
    ),
  },
  {
    id: 'iso',
    name: 'ISO Management',
    description: 'International standard implementation and certification',
    services: consultancyServices.filter((s) =>
      ['iso-45001', 'iso-14001', 'iso-9001'].includes(s.slug || '')
    ),
  },
  {
    id: 'specialist',
    name: 'Specialist Services',
    description: 'Tailored documentation and ongoing support',
    services: consultancyServices.filter((s) => s.slug === 'policy-writing'),
  },
];
