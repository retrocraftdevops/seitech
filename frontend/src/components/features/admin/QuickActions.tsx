import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  UserPlus,
  BookOpen,
  Users,
  FileText,
  Settings,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  href: string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'Create Course',
    href: '/admin/courses/new',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    description: 'Add a new course',
  },
  {
    label: 'Add User',
    href: '/admin/users/new',
    icon: UserPlus,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
    description: 'Create new user',
  },
  {
    label: 'Manage Users',
    href: '/admin/users',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    description: 'View all users',
  },
  {
    label: 'View Reports',
    href: '/admin/analytics',
    icon: BarChart3,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    description: 'Analytics & reports',
  },
  {
    label: 'Certificates',
    href: '/admin/certificates',
    icon: FileText,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100',
    description: 'Manage certificates',
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 hover:bg-gray-100',
    description: 'System settings',
  },
];

interface QuickActionsProps {
  isLoading?: boolean;
}

export function QuickActions({ isLoading = false }: QuickActionsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-gray-200 animate-pulse"
              >
                <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                'p-4 rounded-lg border border-gray-200 transition-all duration-200',
                action.bgColor,
                'group'
              )}
            >
              <div className="flex flex-col items-start">
                <div
                  className={cn(
                    'p-2.5 rounded-lg mb-3 transition-transform group-hover:scale-110',
                    action.bgColor.replace('hover:', '')
                  )}
                >
                  <action.icon className={cn('h-5 w-5', action.color)} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {action.label}
                </h3>
                <p className="text-xs text-gray-500">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
