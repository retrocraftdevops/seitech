'use client';

import { ColumnDef } from '@tanstack/react-table';
import { AdminCertificate, CertificateStatus } from '@/types/admin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MoreVertical, Download, Ban, RefreshCw, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { useState } from 'react';

interface CertificateActionsProps {
  certificate: AdminCertificate;
  onRevoke: (certificate: AdminCertificate) => void;
  onReissue: (certificate: AdminCertificate) => void;
}

function CertificateActions({ certificate, onRevoke, onReissue }: CertificateActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button variant="ghost" size="icon-sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Certificate Actions</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 p-2">
          <Link href={`/certificates/${certificate.id}`} onClick={() => setIsOpen(false)}>
            <Button variant="ghost" className="w-full justify-start" leftIcon={<Eye className="h-4 w-4" />}>
              View Details
            </Button>
          </Link>
          <a href={certificate.downloadUrl} download onClick={() => setIsOpen(false)}>
            <Button variant="ghost" className="w-full justify-start" leftIcon={<Download className="h-4 w-4" />}>
              Download PDF
            </Button>
          </a>
          {certificate.status === 'valid' && (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={() => {
                  onReissue(certificate);
                  setIsOpen(false);
                }}
              >
                Re-issue
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700"
                leftIcon={<Ban className="h-4 w-4" />}
                onClick={() => {
                  onRevoke(certificate);
                  setIsOpen(false);
                }}
              >
                Revoke
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function getStatusBadge(status: CertificateStatus) {
  const variants: Record<CertificateStatus, 'success' | 'warning' | 'danger'> = {
    valid: 'success',
    expired: 'warning',
    revoked: 'danger',
  };

  const labels: Record<CertificateStatus, string> = {
    valid: 'Valid',
    expired: 'Expired',
    revoked: 'Revoked',
  };

  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

export function createCertificateColumns(
  onRevoke: (certificate: AdminCertificate) => void,
  onReissue: (certificate: AdminCertificate) => void
): ColumnDef<AdminCertificate>[] {
  return [
    {
      accessorKey: 'certificateCode',
      header: 'Certificate Code',
      cell: ({ row }) => (
        <Link
          href={`/certificates/${row.original.id}`}
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          {row.original.certificateCode}
        </Link>
      ),
    },
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.studentAvatar && (
            <img
              src={row.original.studentAvatar}
              alt={row.original.studentName}
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{row.original.studentName}</div>
            <div className="text-sm text-gray-500">{row.original.studentEmail}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'courseName',
      header: 'Course',
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.courseName}>
          {row.original.courseName}
        </div>
      ),
    },
    {
      accessorKey: 'issuedDate',
      header: 'Issued Date',
      cell: ({ row }) => formatDate(row.original.issuedDate),
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expires',
      cell: ({ row }) =>
        row.original.expiryDate ? formatDate(row.original.expiryDate) : (
          <span className="text-gray-400">No expiry</span>
        ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <CertificateActions
          certificate={row.original}
          onRevoke={onRevoke}
          onReissue={onReissue}
        />
      ),
    },
  ];
}
