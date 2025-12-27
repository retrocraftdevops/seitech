'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { hasPermission } from '@/lib/utils/permissions';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  Award,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import type { Permission } from '@/types/admin';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users, permission: 'users.view' },
  { name: 'Instructors', href: '/admin/instructors', icon: GraduationCap, permission: 'instructors.view' },
  { name: 'Courses', href: '/admin/courses', icon: BookOpen, permission: 'courses.view' },
  { name: 'Enrollments', href: '/admin/enrollments', icon: UserCheck, permission: 'enrollments.view' },
  { name: 'Certificates', href: '/admin/certificates', icon: Award, permission: 'certificates.view' },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, permission: 'analytics.view' },
  { name: 'Settings', href: '/admin/settings', icon: Settings, permission: 'settings.view' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filter navigation items based on permissions
  const filteredNavigation = navigation.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(user?.role || 'student', item.permission);
  });

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return (pathname || '').startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Logo/Brand */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">SEI Tech</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                ${active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-blue-700' : 'text-gray-500'}`} />
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      {user && (
        <div className="border-t border-gray-200 p-4">
          <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
            {!collapsed && (
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col">
          <SidebarContent />
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:bg-white lg:border-r lg:border-gray-200
          transition-all duration-300
          ${collapsed ? 'lg:w-16' : 'lg:w-64'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Mobile menu button - this will be imported by AdminHeader */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-30 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
        aria-label="Open menu"
      >
        <LayoutDashboard className="h-6 w-6" />
      </button>
    </>
  );
}
