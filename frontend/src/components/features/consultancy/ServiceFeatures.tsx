import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceFeaturesProps {
  features: string[];
  benefits?: string[];
  className?: string;
}

export function ServiceFeatures({ features, benefits, className }: ServiceFeaturesProps) {
  return (
    <section id="details" className={cn('py-16 md:py-24 bg-white', className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Features */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 font-display">
                  What's Included
                </h2>
              </div>

              <p className="text-gray-600 mb-6">
                Our comprehensive service includes everything you need to ensure compliance and
                safety in your organization.
              </p>

              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 group animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-secondary-500 to-primary-500 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 flex-1 group-hover:text-gray-900 transition-colors">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            {benefits && benefits.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 font-display">
                    Key Benefits
                  </h2>
                </div>

                <p className="text-gray-600 mb-6">
                  Experience the advantages of professional health and safety consultancy for
                  your business.
                </p>

                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-primary-200 hover:shadow-soft transition-all duration-300 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-br from-secondary-500 to-primary-500 mt-2" />
                        <p className="text-gray-700 flex-1">{benefit}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-secondary-50 to-primary-50 border border-secondary-100">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">500+</p>
                      <p className="text-sm text-gray-600">Businesses Served</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">98%</p>
                      <p className="text-sm text-gray-600">Client Satisfaction</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
