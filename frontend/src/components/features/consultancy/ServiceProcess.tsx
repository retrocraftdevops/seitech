import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ServiceProcess as ServiceProcessType } from '@/types';

interface ServiceProcessProps {
  process: ServiceProcessType[];
  className?: string;
}

export function ServiceProcess({ process, className }: ServiceProcessProps) {
  return (
    <section className={cn('py-16 md:py-24 bg-gray-50', className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-display">
              Our Process
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We follow a structured approach to deliver exceptional results and ensure complete
              client satisfaction.
            </p>
          </div>

          {/* Process Steps */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary-200 via-primary-200 to-secondary-200" />

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
              {process.map((step, index) => {
                // Dynamically get the icon component
                const IconComponent = step.icon
                  ? (LucideIcons[step.icon as keyof typeof LucideIcons] as React.ComponentType<{
                      className?: string;
                    }>)
                  : null;

                return (
                  <div
                    key={step.step}
                    className="relative animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Step Number & Icon */}
                    <div className="flex flex-col items-center mb-4">
                      {/* Step Number Badge */}
                      <div className="relative z-10 w-16 h-16 rounded-2xl bg-white border-2 border-secondary-300 shadow-soft flex items-center justify-center mb-4">
                        <span className="text-2xl font-bold bg-gradient-to-br from-secondary-600 to-primary-600 bg-clip-text text-transparent">
                          {step.step}
                        </span>
                      </div>

                      {/* Icon */}
                      {IconComponent && (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-100 to-primary-100 flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-secondary-600" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>

                    {/* Arrow (not on last item) */}
                    {index < process.length - 1 && (
                      <div className="hidden md:block absolute top-8 -right-4 text-secondary-300">
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-secondary-50 to-primary-50 border border-secondary-100">
              <p className="text-gray-700 mb-4">
                Ready to get started? Book a free consultation to discuss your requirements.
              </p>
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-secondary-600 to-primary-600 hover:from-secondary-700 hover:to-primary-700 shadow-lg hover:shadow-glow-lg transition-all duration-300"
              >
                Book Free Consultation
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
