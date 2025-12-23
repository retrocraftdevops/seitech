'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import type { CmsStatistic } from '@/types';
import { useSection, useStatistics } from '@/hooks/use-cms';
import { stripHtml } from '@/lib/utils';

// Default section header content
const defaultHeaderContent = {
  title: 'Proven Track Record of Excellence',
  description: 'Our numbers speak for themselves - delivering quality training and consultancy services across the UK',
};

interface StatisticDisplay {
  id: string;
  icon: React.ComponentType<any>;
  value: number;
  suffix: string;
  label: string;
  description: string;
}

// Icon mapping from string names to Lucide components
function getIconComponent(iconName: string): React.ComponentType<any> {
  const icons: Record<string, React.ComponentType<any>> = {
    Users: LucideIcons.Users,
    Calendar: LucideIcons.Calendar,
    TrendingUp: LucideIcons.TrendingUp,
    Award: LucideIcons.Award,
    CheckCircle: LucideIcons.CheckCircle,
    Building: LucideIcons.Building,
    BookOpen: LucideIcons.BookOpen,
    Star: LucideIcons.Star,
    MapPin: LucideIcons.MapPin,
    Shield: LucideIcons.Shield,
    Zap: LucideIcons.Zap,
    Target: LucideIcons.Target,
  };
  return icons[iconName] || LucideIcons.BarChart;
}

// Default statistics for fallback
const defaultStatistics: StatisticDisplay[] = [
  {
    id: '1',
    icon: LucideIcons.Users,
    value: 5000,
    suffix: '+',
    label: 'Professionals Trained',
    description: 'Across various industries and sectors',
  },
  {
    id: '2',
    icon: LucideIcons.Calendar,
    value: 15,
    suffix: '+',
    label: 'Years Experience',
    description: 'In health, safety, and environmental training',
  },
  {
    id: '3',
    icon: LucideIcons.TrendingUp,
    value: 98,
    suffix: '%',
    label: 'Pass Rate',
    description: 'Industry-leading success rate',
  },
  {
    id: '4',
    icon: LucideIcons.Award,
    value: 12,
    suffix: '+',
    label: 'Accreditations',
    description: 'Including IOSH, NEBOSH, and Qualsafe',
  },
];

interface StatisticsSectionProps {
  data?: CmsStatistic[];
  location?: 'homepage' | 'about' | 'hero' | 'accreditations';
}

interface AnimatedNumberProps {
  value: number;
  suffix: string;
}

function AnimatedNumber({ value, suffix }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    stiffness: 50,
    damping: 30,
    restDelta: 0.5,
  });

  const display = useTransform(spring, (current) =>
    Math.floor(current).toLocaleString()
  );

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(value);
      setHasAnimated(true);
    }
  }, [isInView, value, spring, hasAnimated]);

  return (
    <span ref={ref}>
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

export function StatisticsSection({ data, location = 'homepage' }: StatisticsSectionProps) {
  // Fetch section header content
  const { section } = useSection('home-statistics');

  // Fetch statistics from API if not provided via props
  const { statistics: apiStatistics } = useStatistics({ location });

  // Use CMS data or fallback to defaults for header
  const headerContent = {
    title: stripHtml(section?.title) || defaultHeaderContent.title,
    description: stripHtml(section?.description) || defaultHeaderContent.description,
  };

  // Convert CMS data to display format, or use defaults
  // Priority: props data > API data > defaults
  const statsData = data && data.length > 0 ? data : apiStatistics;
  const statistics: StatisticDisplay[] = statsData && statsData.length > 0
    ? statsData.map(stat => ({
        id: String(stat.id),
        icon: getIconComponent(stat.icon),
        value: stat.numericValue,
        suffix: stat.suffix,
        label: stat.name,
        description: stat.description,
      }))
    : defaultStatistics;

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] bg-repeat" />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {headerContent.title}
          </h2>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            {headerContent.description}
          </p>
        </motion.div>

        {/* Statistics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statistics.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 h-full">
                  {/* Icon */}
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Number */}
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </div>

                  {/* Label */}
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {stat.label}
                  </h3>

                  {/* Description */}
                  <p className="text-primary-100 text-sm">{stat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-primary-100 text-lg">
            Join thousands of satisfied clients who trust SEI Tech for their training
            and consultancy needs
          </p>
        </motion.div>
      </div>
    </section>
  );
}
