import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency } from '@/lib/utils';
import type { ConsultancyService } from '@/types';

interface ServiceCardProps {
  service: Partial<ConsultancyService>;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export function ServiceCard({ service, variant = 'default', className }: ServiceCardProps) {
  // Dynamically get the icon component
  const IconComponent = service.iconName
    ? (LucideIcons[service.iconName as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>)
    : null;

  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';

  return (
    <Card
      hover
      className={cn(
        'h-full flex flex-col',
        isFeatured && 'border-2 border-secondary-400 shadow-glow',
        className
      )}
    >
      <CardContent className={cn('flex-1', isCompact ? 'p-4' : 'p-6')}>
        {/* Icon & Name */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={cn(
              'rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-secondary-50 to-primary-50 border border-secondary-100',
              isCompact ? 'w-12 h-12' : 'w-16 h-16'
            )}
          >
            {IconComponent && (
              <IconComponent
                className={cn(
                  'text-secondary-600',
                  isCompact ? 'w-6 h-6' : 'w-8 h-8'
                )}
              />
            )}
          </div>

          <div className="flex-1">
            <h3
              className={cn(
                'font-bold text-gray-900 mb-2',
                isCompact ? 'text-lg' : 'text-xl'
              )}
            >
              {service.name}
            </h3>

            {/* Pricing Badge */}
            <div className="flex gap-2">
              {service.pricingType === 'fixed' && service.priceFrom ? (
                <Badge variant="success" size="sm">
                  From {formatCurrency(service.priceFrom)}
                </Badge>
              ) : (
                <Badge variant="secondary" size="sm">
                  Custom Quote
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className={cn('text-gray-600 mb-4', isCompact ? 'text-sm' : 'text-base')}>
          {service.shortDescription}
        </p>

        {/* Features List */}
        {!isCompact && service.features && service.features.length > 0 && (
          <ul className="space-y-2 mb-4">
            {service.features.slice(0, 4).map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-secondary-600 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
            {service.features.length > 4 && (
              <li className="text-sm text-gray-500 italic">
                +{service.features.length - 4} more features
              </li>
            )}
          </ul>
        )}
      </CardContent>

      <CardFooter className={cn('border-t border-gray-100', isCompact ? 'p-4' : 'p-6')}>
        <Link href={`/services/${service.slug}`} className="w-full">
          <Button
            variant={isFeatured ? 'secondary' : 'outline'}
            className="w-full group"
            size={isCompact ? 'sm' : 'md'}
          >
            Learn More
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
