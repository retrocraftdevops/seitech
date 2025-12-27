'use client';

import { AdminCertificate } from '@/types/admin';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Download, Share2, Award, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getStatusBadge } from './CertificateTable';
import Image from 'next/image';

interface CertificatePreviewProps {
  certificate: AdminCertificate;
  onDownload?: () => void;
  className?: string;
}

export function CertificatePreview({ certificate, onDownload, className }: CertificatePreviewProps) {
  return (
    <Card className={className}>
      <div className="p-6">
        {/* Certificate Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Certificate of Completion</h3>
            </div>
            <p className="text-sm text-gray-500">Certificate Code: {certificate.certificateCode}</p>
          </div>
          {getStatusBadge(certificate.status)}
        </div>

        {/* Certificate Visual Preview */}
        <div className="relative bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-8 mb-6 border-2 border-primary-200">
          <div className="absolute top-4 right-4">
            <CheckCircle2 className="h-12 w-12 text-primary-600 opacity-20" />
          </div>

          <div className="text-center space-y-4">
            <div className="text-sm font-medium text-primary-600 uppercase tracking-wide">
              This certifies that
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {certificate.studentName}
            </div>
            <div className="text-sm text-gray-600">
              has successfully completed
            </div>
            <div className="text-xl font-semibold text-primary-700">
              {certificate.courseName}
            </div>
            <div className="flex items-center justify-center gap-8 pt-4 text-sm text-gray-600">
              <div>
                <div className="font-medium text-gray-900">Issued</div>
                <div>{formatDate(certificate.issuedDate)}</div>
              </div>
              {certificate.expiryDate && (
                <div>
                  <div className="font-medium text-gray-900">Expires</div>
                  <div>{formatDate(certificate.expiryDate)}</div>
                </div>
              )}
            </div>
          </div>

          {/* QR Code */}
          {certificate.qrCodeUrl && (
            <div className="absolute bottom-4 left-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <Image
                  src={certificate.qrCodeUrl}
                  alt="Verification QR Code"
                  width={64}
                  height={64}
                  className="h-16 w-16"
                />
              </div>
            </div>
          )}
        </div>

        {/* Certificate Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Template</div>
            <div className="text-sm text-gray-900">{certificate.templateName}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
            <div className="text-sm text-gray-900 capitalize">{certificate.status}</div>
          </div>
          {certificate.revokedDate && (
            <>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Revoked Date</div>
                <div className="text-sm text-gray-900">{formatDate(certificate.revokedDate)}</div>
              </div>
              {certificate.revokedReason && (
                <div className="col-span-2">
                  <div className="text-sm font-medium text-gray-500 mb-1">Revocation Reason</div>
                  <div className="text-sm text-gray-900">{certificate.revokedReason}</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            className="flex-1"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={onDownload}
          >
            <a href={certificate.downloadUrl} download>
              Download PDF
            </a>
          </Button>
          <Button
            variant="outline"
            leftIcon={<Share2 className="h-4 w-4" />}
            onClick={() => {
              navigator.clipboard.writeText(certificate.verificationUrl);
            }}
          >
            Copy Link
          </Button>
        </div>

        {/* Verification URL */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs font-medium text-gray-500 mb-1">Verification URL</div>
          <div className="text-sm text-gray-900 break-all font-mono">
            {certificate.verificationUrl}
          </div>
        </div>
      </div>
    </Card>
  );
}
