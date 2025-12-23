'use client';

import Link from 'next/link';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

interface MegaMenuProps {
  items: NavItem[];
  title: string;
}

export function MegaMenu({ items, title }: MegaMenuProps) {
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{
      className?: string;
    }>;
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };

  // Check if this is a Training or Consultancy menu (has sub-sections)
  const hasSubSections = items.every((item) => item.children && item.children.length > 0);

  if (!hasSubSections) {
    // Simple dropdown for About, etc.
    return (
      <div className="absolute top-full left-0 pt-2 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 min-w-64">
          <div className="space-y-1">
            {items.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                {item.icon && (
                  <span className="text-gray-400 group-hover:text-primary-600 transition-colors mt-0.5">
                    {getIcon(item.icon)}
                  </span>
                )}
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Full mega menu for Training/Consultancy
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-[900px]">
        <div className="grid grid-cols-4 divide-x divide-gray-100">
          {items.map((section) => (
            <div key={section.title} className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.children?.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    {item.icon && (
                      <span className="text-gray-400 group-hover:text-primary-600 transition-colors mt-0.5">
                        {getIcon(item.icon)}
                      </span>
                    )}
                    <div>
                      <p className="font-medium text-gray-700 group-hover:text-primary-600 transition-colors text-sm">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
          <p className="text-sm text-gray-600">
            {title === 'Training'
              ? 'Not sure which course? We can help!'
              : 'Need expert guidance on compliance?'}
          </p>
          <Link
            href="/free-consultation"
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Book Free Consultation &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
