'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { canAccessRoute, canAccessAdminPanel } from '@/lib/utils/permissions';
import { AdminSidebar } from '@/components/features/admin/AdminSidebar';
import { AdminHeader } from '@/components/features/admin/AdminHeader';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=' + encodeURIComponent(pathname || '/admin'));
        return;
      }
      if (!canAccessAdminPanel(user?.role || 'student')) {
        router.push('/dashboard');
        return;
      }
      if (pathname && !canAccessRoute(user?.role || 'student', pathname)) {
        router.push('/admin');
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading || !isAuthenticated || !canAccessAdminPanel(user?.role || 'student')) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader />
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
