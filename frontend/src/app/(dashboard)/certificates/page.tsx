'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CertificateCard } from '@/components/features/dashboard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Certificate } from '@/types/user';
import { Award, Download, Search, Loader2, RefreshCw, LogIn } from 'lucide-react';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCertificates = async () => {
    setIsLoading(true);
    setError(null);
    setIsUnauthorized(false);

    try {
      const response = await fetch('/api/certificates');
      const data = await response.json();

      if (response.status === 401) {
        setIsUnauthorized(true);
        setCertificates([]);
        return;
      }

      if (data.success && data.data) {
        setCertificates(data.data);
      } else {
        setCertificates([]);
        if (data.message) {
          setError(data.message);
        }
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setCertificates([]);
      setError('Unable to load certificates. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const filteredCertificates = certificates.filter((cert) =>
    cert.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCertifications = certificates.filter((c) => {
    if (!c.expiryDate) return true;
    return new Date(c.expiryDate) > new Date();
  });

  const handleDownloadAll = () => {
    alert('Bulk download will be implemented when connected to the backend.');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your certificates...</p>
        </div>
      </div>
    );
  }

  // Show login prompt for unauthorized users
  if (isUnauthorized) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Certificates</h1>
          <p className="text-gray-600">
            View, download, and verify your earned certificates
          </p>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-10 h-10 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Sign in to view your certificates
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Log in to your account to access and download your earned certificates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">Get Help</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Certificates</h1>
          <p className="text-gray-600">
            View, download, and verify your earned certificates
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCertificates}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Download className="w-5 h-5" />}
            onClick={handleDownloadAll}
          >
            Download All
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-2 h-2 bg-amber-500 rounded-full" />
          <p className="text-amber-800 text-sm">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Badge variant="success" size="lg">
            {certificates.length}
          </Badge>
          <span className="text-gray-700">Total Certificates</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="lg">
            {activeCertifications.length}
          </Badge>
          <span className="text-gray-700">Active Certifications</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search certificates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
        />
      </div>

      {/* Certificates List */}
      {filteredCertificates.length > 0 ? (
        <div className="space-y-4">
          {filteredCertificates.map((certificate) => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {searchQuery ? (
              <Search className="w-8 h-8 text-gray-400" />
            ) : (
              <Award className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No certificates found' : 'No certificates yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Complete courses to earn certificates'}
          </p>
          {!searchQuery && (
            <Link href="/courses">
              <Button>Browse Courses</Button>
            </Link>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">About Your Certificates</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              All certificates are digitally signed and can be verified using the
              verification link or QR code
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              {/* TODO: Re-enable NEBOSH once licensing agreement is in place */}
              {/* Professional certificates from IOSH, NEBOSH, and other bodies may require */}
              Professional certificates from IOSH and other bodies may require
              periodic renewal
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Share your certificates on LinkedIn to showcase your achievements</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              Contact us if you need replacement certificates or have verification queries
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
