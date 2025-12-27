import { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">SEI Tech</h1>
              <p className="text-gray-600">Professional Training & Development</p>
            </div>
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
