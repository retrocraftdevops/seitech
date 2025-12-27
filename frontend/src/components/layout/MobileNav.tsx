'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  User,
  BookOpen,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { NavItem } from '@/types';
import { siteConfig } from '@/config/site';
import { useAuthStore } from '@/lib/stores/auth-store';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
}

export function MobileNav({ isOpen, onClose, items }: MobileNavProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, canAccessAdmin, isAdmin, isInstructor } = useAuthStore();

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    router.push('/');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50 lg:hidden overflow-y-auto animate-slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <span className="font-bold text-lg">Menu</span>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              &times;
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {items.map((item) => (
                <div key={item.title}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() => toggleExpanded(item.title)}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3 text-left font-medium rounded-lg transition-colors',
                          expandedItems.includes(item.title)
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        {item.title}
                        <ChevronDown
                          className={cn(
                            'h-5 w-5 transition-transform duration-200',
                            expandedItems.includes(item.title) && 'rotate-180'
                          )}
                        />
                      </button>

                      {expandedItems.includes(item.title) && (
                        <div className="mt-1 ml-4 space-y-1 animate-fade-in">
                          {item.children.map((section) =>
                            section.children ? (
                              <div key={section.title} className="py-2">
                                <p className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  {section.title}
                                </p>
                                <div className="mt-1 space-y-1">
                                  {section.children.map((subItem) => (
                                    <Link
                                      key={subItem.title}
                                      href={subItem.href}
                                      onClick={onClose}
                                      className={cn(
                                        'flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors',
                                        pathname === subItem.href
                                          ? 'bg-primary-50 text-primary-600'
                                          : 'text-gray-600 hover:bg-gray-50'
                                      )}
                                    >
                                      <ChevronRight className="h-3 w-3" />
                                      {subItem.title}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <Link
                                key={section.title}
                                href={section.href}
                                onClick={onClose}
                                className={cn(
                                  'flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors',
                                  pathname === section.href
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                )}
                              >
                                <ChevronRight className="h-3 w-3" />
                                {section.title}
                              </Link>
                            )
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'block px-4 py-3 font-medium rounded-lg transition-colors',
                        pathname === item.href
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      {item.title}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t p-4 space-y-4">
            {/* User Section */}
            {isAuthenticated && user ? (
              <div className="space-y-3">
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                    {`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {user.name || `${user.firstName} ${user.lastName}`}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>

                {/* User Links */}
                <div className="space-y-1">
                  <Link
                    href="/dashboard"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="h-5 w-5 text-gray-400" />
                    Dashboard
                  </Link>
                  <Link
                    href="/my-courses"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <BookOpen className="h-5 w-5 text-gray-400" />
                    My Courses
                  </Link>
                  <Link
                    href="/profile"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <User className="h-5 w-5 text-gray-400" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Settings className="h-5 w-5 text-gray-400" />
                    Settings
                  </Link>
                  {canAccessAdmin() && (
                    <Link
                      href="/admin"
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <ShieldCheck className="h-5 w-5" />
                      {isAdmin() ? 'Admin Panel' : isInstructor() ? 'Instructor Portal' : 'Admin Panel'}
                    </Link>
                  )}
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                {/* Contact Info */}
                <div className="space-y-2">
                  <a
                    href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <Phone className="h-5 w-5" />
                    {siteConfig.contact.phone}
                  </a>
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                    {siteConfig.contact.email}
                  </a>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-2">
                  <Link href="/login">
                    <Button className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/courses">
                    <Button variant="outline" className="w-full">View Courses</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
