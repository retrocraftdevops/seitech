import * as LucideIcons from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn, formatCurrency } from '@/lib/utils';

interface ServiceHeroProps {
  name: string;
  shortDescription: string;
  iconName?: string;
  pricingType: 'fixed' | 'quote' | 'hourly' | 'free' | 'package';
  priceFrom?: number;
  className?: string;
}

export function ServiceHero({
  name,
  shortDescription,
  iconName,
  pricingType,
  priceFrom,
  className,
}: ServiceHeroProps) {
  // Dynamically get the icon component
  const IconComponent = iconName
    ? (LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>)
    : null;

  return (
    <section
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50',
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          {IconComponent && (
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-secondary-500 to-primary-500 text-white mb-6 shadow-glow">
              <IconComponent className="w-10 h-10" />
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-display">
            {name}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {shortDescription}
          </p>

          {/* Pricing */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {pricingType === 'fixed' && priceFrom ? (
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-500">Starting from</span>
                <span className="text-3xl md:text-4xl font-bold text-gray-900">
                  {formatCurrency(priceFrom)}
                </span>
                <span className="text-sm text-gray-500">per person</span>
              </div>
            ) : (
              <Badge variant="secondary" size="lg" className="text-base px-6 py-2">
                Custom Quote Available
              </Badge>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-secondary-600 to-primary-600 hover:from-secondary-700 hover:to-primary-700 shadow-lg hover:shadow-glow-lg transition-all duration-300"
            >
              Book Consultation
            </a>
            <a
              href="#details"
              className="inline-flex items-center justify-center px-8 py-3 rounded-xl text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 hover:border-primary-300 hover:bg-gray-50 transition-all duration-300"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-8 md:h-12 fill-current text-white"
          viewBox="0 0 1440 48"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 48h1440V0c-240 48-480 48-720 48S240 48 0 0v48z" />
        </svg>
      </div>
    </section>
  );
}
