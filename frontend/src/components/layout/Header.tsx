'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  Phone,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { MegaMenu } from './MegaMenu';
import { MobileNav } from './MobileNav';
import { mainNavigation } from '@/config/navigation';
import { siteConfig } from '@/config/site';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveMenu(null);
  }, [pathname]);

  return (
    <>
      {/* Top Bar */}
      <div className="hidden lg:block bg-gray-900 text-white text-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-6">
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 hover:text-primary-300 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                {siteConfig.contact.phone}
              </a>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="flex items-center gap-2 hover:text-primary-300 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                {siteConfig.contact.email}
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400">
                Open: {siteConfig.businessHours.weekdays}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-white'
        )}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-18 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 bg-gray-900 rounded-lg px-4 py-2 -my-1">
              <Image
                src="/logos/logo-light.png"
                alt="SEI Tech International"
                width={180}
                height={41}
                className="h-9 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {mainNavigation.map((item) => (
                <div
                  key={item.title}
                  className="relative"
                  onMouseEnter={() => item.children && setActiveMenu(item.title)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  {item.children ? (
                    <button
                      className={cn(
                        'flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                        activeMenu === item.title
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      )}
                    >
                      {item.title}
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          activeMenu === item.title && 'rotate-180'
                        )}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                        pathname === item.href
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      )}
                    >
                      {item.title}
                    </Link>
                  )}

                  {/* Mega Menu Dropdown */}
                  {item.children && activeMenu === item.title && (
                    <MegaMenu
                      items={item.children}
                      title={item.title}
                    />
                  )}
                </div>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="h-5 w-5" />
              </button>

              {/* Cart Button */}
              <button className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-primary-600 text-white text-2xs rounded-full flex items-center justify-center">
                  0
                </span>
              </button>

              {/* User Menu */}
              <div className="hidden sm:block">
                <Button variant="ghost" size="sm" leftIcon={<User className="h-4 w-4" />}>
                  Login
                </Button>
              </div>

              {/* CTA Button */}
              <div className="hidden md:block">
                <Button size="sm" asChild>
                  <Link href="/free-consultation">Get Quote</Link>
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        items={mainNavigation}
      />
    </>
  );
}
