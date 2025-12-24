import Link from 'next/link';
import Image from 'next/image';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { siteConfig } from '@/config/site';
import { footerNavigation } from '@/config/navigation';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 max-w-7xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <Image
                src="/logos/emblem.png"
                alt="SEI Tech"
                width={50}
                height={50}
                className="h-12 w-auto"
              />
              <Image
                src="/logos/logo-light.png"
                alt="SEI Tech International"
                width={160}
                height={36}
                className="h-9 w-auto"
              />
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {siteConfig.tagline}. Professional health, safety, and environmental
              training and consultancy services since 2010.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
              >
                <Phone className="h-5 w-5 text-primary-400" />
                {siteConfig.contact.phone}
              </a>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5 text-primary-400" />
                {siteConfig.contact.email}
              </a>
              <div className="flex items-start gap-3 text-gray-300">
                <MapPin className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <address className="not-italic">
                  {siteConfig.contact.address.street}
                  <br />
                  {siteConfig.contact.address.city}, {siteConfig.contact.address.county}
                  <br />
                  {siteConfig.contact.address.postcode}
                </address>
              </div>
            </div>
          </div>

          {/* Training Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Training</h3>
            <ul className="space-y-3">
              {footerNavigation.training.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Consultancy Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Consultancy</h3>
            <ul className="space-y-3">
              {footerNavigation.consultancy.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerNavigation.company.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-white mb-4">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get the latest updates on training courses and safety tips.
            </p>
            <form className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Accreditations */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500 mb-4 text-center">
            Accredited by leading industry bodies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="h-16 px-4 bg-white rounded-lg flex items-center justify-center">
              <Image
                src="/accreditations/iosh.png"
                alt="IOSH - Institution of Occupational Safety and Health"
                width={60}
                height={60}
                className="h-12 w-auto"
              />
            </div>
            <div className="h-16 px-4 bg-white rounded-lg flex items-center justify-center">
              <Image
                src="/accreditations/qualsafe.png"
                alt="Qualsafe Awards"
                width={60}
                height={60}
                className="h-12 w-auto"
              />
            </div>
            {/* TODO: Re-enable NEBOSH once licensing agreement is in place */}
            <div className="h-16 px-4 bg-white rounded-lg flex items-center justify-center">
              <Image
                src="/accreditations/oshcr.png"
                alt="OSHCR - Occupational Safety and Health Consultants Register"
                width={60}
                height={60}
                className="h-12 w-auto"
              />
            </div>
            <div className="h-16 px-4 bg-white rounded-lg flex items-center justify-center">
              <Image
                src="/accreditations/ifsm.png"
                alt="IFSM - Institute of Fire Safety Managers"
                width={60}
                height={60}
                className="h-12 w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 max-w-7xl py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} SEI Tech International. All rights reserved.
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-6">
              {footerNavigation.legal.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  {link.title}
                </Link>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href={siteConfig.links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href={siteConfig.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
