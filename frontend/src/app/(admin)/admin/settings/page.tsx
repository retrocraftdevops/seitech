'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Mail, Shield, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/stores/auth-store';
import { hasPermission } from '@/lib/utils/permissions';

interface SettingsCard {
  title: string;
  description: string;
  href: string;
  icon: typeof Settings;
  permission?: string;
}

const settingsCards: SettingsCard[] = [
  {
    title: 'General Settings',
    description: 'Manage site name, branding, logo, favicon, and timezone',
    href: '/admin/settings/general',
    icon: Settings,
  },
  {
    title: 'Email Settings',
    description: 'Configure SMTP, email templates, and notification preferences',
    href: '/admin/settings/emails',
    icon: Mail,
  },
  {
    title: 'Security Settings',
    description: 'Manage password policies, session timeout, and authentication',
    href: '/admin/settings/security',
    icon: Shield,
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    // Check if user has settings.view permission
    if (user && !hasPermission(user.role, 'settings.view')) {
      router.push('/admin');
    }
  }, [user, router]);

  const handleCardClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your application settings and configurations
        </p>
      </div>

      {/* Settings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card
              key={card.href}
              variant="bordered"
              className="cursor-pointer hover:shadow-lg transition-all hover:border-primary-300 group"
              onClick={() => handleCardClick(card.href)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Info */}
      <Card variant="bordered" className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Administrator Access Required
              </h3>
              <p className="text-sm text-blue-700">
                Only users with administrator privileges can modify system settings. Changes
                made here will affect all users and should be done carefully.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
