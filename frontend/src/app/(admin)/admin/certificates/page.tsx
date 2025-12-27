'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Award, Plus, Download, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { createCertificateColumns, getStatusBadge } from '@/components/features/admin/certificates/CertificateTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/textarea';
import type { AdminCertificate, CertificateStatus } from '@/types/admin';

// Demo data
const demoCertificates: AdminCertificate[] = [
  {
    id: 1,
    certificateCode: 'CERT-2024-001',
    studentId: 1,
    studentName: 'John Smith',
    studentEmail: 'john.smith@example.com',
    courseId: 1,
    courseName: 'Fire Safety Awareness',
    courseSlug: 'fire-safety-awareness',
    enrollmentId: 1,
    templateName: 'Standard Certificate',
    status: 'valid',
    issuedDate: '2024-01-15',
    downloadUrl: '/api/certificates/1/download',
    verificationUrl: 'https://seitech.com/verify/CERT-2024-001',
    qrCodeUrl: '/api/certificates/1/qr',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    certificateCode: 'CERT-2024-002',
    studentId: 2,
    studentName: 'Jane Doe',
    studentEmail: 'jane.doe@example.com',
    courseId: 2,
    courseName: 'Manual Handling Training',
    courseSlug: 'manual-handling-training',
    enrollmentId: 2,
    templateName: 'Standard Certificate',
    status: 'valid',
    issuedDate: '2024-02-20',
    expiryDate: '2025-02-20',
    downloadUrl: '/api/certificates/2/download',
    verificationUrl: 'https://seitech.com/verify/CERT-2024-002',
    qrCodeUrl: '/api/certificates/2/qr',
    createdAt: '2024-02-20T14:30:00Z',
    updatedAt: '2024-02-20T14:30:00Z',
  },
  {
    id: 3,
    certificateCode: 'CERT-2023-050',
    studentId: 3,
    studentName: 'Bob Wilson',
    studentEmail: 'bob.wilson@example.com',
    courseId: 1,
    courseName: 'Fire Safety Awareness',
    courseSlug: 'fire-safety-awareness',
    enrollmentId: 3,
    templateName: 'Standard Certificate',
    status: 'expired',
    issuedDate: '2023-01-10',
    expiryDate: '2024-01-10',
    downloadUrl: '/api/certificates/3/download',
    verificationUrl: 'https://seitech.com/verify/CERT-2023-050',
    qrCodeUrl: '/api/certificates/3/qr',
    createdAt: '2023-01-10T09:00:00Z',
    updatedAt: '2023-01-10T09:00:00Z',
  },
  {
    id: 4,
    certificateCode: 'CERT-2024-003',
    studentId: 4,
    studentName: 'Alice Johnson',
    studentEmail: 'alice.johnson@example.com',
    courseId: 3,
    courseName: 'First Aid at Work',
    courseSlug: 'first-aid-at-work',
    enrollmentId: 4,
    templateName: 'Premium Certificate',
    status: 'revoked',
    issuedDate: '2024-03-05',
    revokedDate: '2024-03-15',
    revokedReason: 'Course completion disputed',
    downloadUrl: '/api/certificates/4/download',
    verificationUrl: 'https://seitech.com/verify/CERT-2024-003',
    qrCodeUrl: '/api/certificates/4/qr',
    createdAt: '2024-03-05T11:00:00Z',
    updatedAt: '2024-03-15T16:00:00Z',
  },
];

export default function CertificatesPage() {
  const [certificates] = useState<AdminCertificate[]>(demoCertificates);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CertificateStatus | ''>('');
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<AdminCertificate | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  const handleRevoke = (certificate: AdminCertificate) => {
    setSelectedCertificate(certificate);
    setRevokeDialogOpen(true);
  };

  const handleReissue = (certificate: AdminCertificate) => {
    console.log('Reissue certificate:', certificate.id);
  };

  const confirmRevoke = () => {
    console.log('Revoking certificate:', selectedCertificate?.id, 'Reason:', revokeReason);
    setRevokeDialogOpen(false);
    setRevokeReason('');
    setSelectedCertificate(null);
  };

  const columns = createCertificateColumns(handleRevoke, handleReissue);

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.certificateCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: certificates.length,
    valid: certificates.filter((c) => c.status === 'valid').length,
    expired: certificates.filter((c) => c.status === 'expired').length,
    revoked: certificates.filter((c) => c.status === 'revoked').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate Management</h1>
          <p className="text-gray-600 mt-1">Issue, view, and manage course completion certificates</p>
        </div>
        <Link href="/admin/certificates/issue">
          <Button leftIcon={<Plus className="h-4 w-4" />}>Issue Certificate</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Certificates</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.valid}</div>
              <div className="text-sm text-gray-500">Valid</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.expired}</div>
              <div className="text-sm text-gray-500">Expired</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Award className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.revoked}</div>
              <div className="text-sm text-gray-500">Revoked</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, code, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-40">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as CertificateStatus | '')}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="valid">Valid</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>
          </div>
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
            Export
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <DataTable columns={columns} data={filteredCertificates} />
      </Card>

      {/* Revoke Dialog */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Certificate</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to revoke certificate{' '}
              <strong>{selectedCertificate?.certificateCode}</strong> for{' '}
              <strong>{selectedCertificate?.studentName}</strong>?
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Revocation Reason
            </label>
            <Textarea
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Enter the reason for revoking this certificate..."
              rows={3}
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmRevoke} disabled={!revokeReason}>
              Revoke Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
