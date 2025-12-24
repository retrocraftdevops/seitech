'use client';

import { useState, useEffect } from 'react';
import { CertificateCard } from '@/components/features/dashboard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Certificate } from '@/types/user';
import { Award, Download, Search, Loader2, RefreshCw } from 'lucide-react';

// Placeholder data for when API is unavailable
const mockCertificates: Certificate[] = [
  {
    id: 1,
    reference: 'CERT-2024-001234',
    courseName: 'IOSH Managing Safely',
    courseSlug: 'iosh-managing-safely',
    issuedDate: '2024-11-10',
    expiryDate: '2027-11-10',
    downloadUrl: '/certificates/cert-001234.pdf',
    verificationUrl: '/verify/CERT-2024-001234',
    qrCode: '',
    templateName: 'IOSH Certificate',
  },
  {
    id: 2,
    reference: 'CERT-2024-005678',
    courseName: 'First Aid at Work (3 Day)',
    courseSlug: 'first-aid-at-work-3-day',
    issuedDate: '2024-10-30',
    expiryDate: '2027-10-30',
    downloadUrl: '/certificates/cert-005678.pdf',
    verificationUrl: '/verify/CERT-2024-005678',
    qrCode: '',
    templateName: 'Qualsafe Certificate',
  },
  {
    id: 3,
    reference: 'CERT-2024-009012',
    courseName: 'Fire Safety Awareness',
    courseSlug: 'fire-safety-awareness',
    issuedDate: '2024-09-15',
    downloadUrl: '/certificates/cert-009012.pdf',
    verificationUrl: '/verify/CERT-2024-009012',
    qrCode: '',
    templateName: 'CPD Certificate',
  },
  {
    id: 4,
    reference: 'CERT-2024-003456',
    courseName: 'Manual Handling Training',
    courseSlug: 'manual-handling-training',
    issuedDate: '2024-08-20',
    expiryDate: '2027-08-20',
    downloadUrl: '/certificates/cert-003456.pdf',
    verificationUrl: '/verify/CERT-2024-003456',
    qrCode: '',
    templateName: 'Professional Certificate',
  },
  {
    id: 5,
    reference: 'CERT-2024-007890',
    courseName: 'IOSH Working Safely',
    courseSlug: 'iosh-working-safely',
    issuedDate: '2024-07-05',
    expiryDate: '2026-07-05',
    downloadUrl: '/certificates/cert-007890.pdf',
    verificationUrl: '/verify/CERT-2024-007890',
    qrCode: '',
    templateName: 'IOSH Certificate',
  },
];

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCertificates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/certificates');
      const data = await response.json();

      if (data.success && data.data) {
        setCertificates(data.data);
      } else {
        console.warn('Using mock certificate data:', data.message);
        setCertificates(mockCertificates);
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setCertificates(mockCertificates);
      setError('Unable to connect to server. Showing demo data.');
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
          <p className="text-gray-600">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Complete courses to earn certificates'}
          </p>
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
