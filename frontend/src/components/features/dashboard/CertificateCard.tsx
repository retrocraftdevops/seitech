import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Certificate } from '@/types/user';
import { Download, ExternalLink, Award, Calendar } from 'lucide-react';

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpired = certificate.expiryDate
    ? new Date(certificate.expiryDate) < new Date()
    : false;

  return (
    <Card variant="bordered" hover>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
            <Award className="w-8 h-8 text-amber-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {certificate.courseName}
                </h3>
                <p className="text-sm text-gray-600">
                  Certificate ID: {certificate.reference}
                </p>
              </div>
              {isExpired && (
                <Badge variant="danger" size="sm">
                  Expired
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Issued: {formatDate(certificate.issuedDate)}</span>
              </div>
              {certificate.expiryDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Expires: {formatDate(certificate.expiryDate)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <a
                href={certificate.downloadUrl}
                download
                className="inline-flex"
              >
                <Button variant="primary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                  Download
                </Button>
              </a>
              <Link href={certificate.verificationUrl} target="_blank">
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ExternalLink className="w-4 h-4" />}
                >
                  Verify
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
