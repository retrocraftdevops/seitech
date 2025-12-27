'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Settings, Mail, Shield, LucideIcon } from 'lucide-react';

interface SettingsNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

const navItems: SettingsNavItem[] = [
  {
    label: 'General',
    href: '/admin/settings/general',
    icon: Settings,
    description: 'Site settings and branding',
  },
  {
    label: 'Email',
    href: '/admin/settings/emails',
    icon: Mail,
    description: 'Email configuration and templates',
  },
  {
    label: 'Security',
    href: '/admin/settings/security',
    icon: Shield,
    description: 'Security and authentication settings',
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-start gap-3 px-4 py-3 rounded-lg transition-colors',
              isActive
                ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
            )}
          >
            <Icon
              className={cn(
                'w-5 h-5 mt-0.5 flex-shrink-0',
                isActive ? 'text-primary-600' : 'text-gray-400'
              )}
            />
            <div>
              <div className={cn('font-medium', isActive && 'text-primary-700')}>
                {item.label}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">{item.description}</div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
