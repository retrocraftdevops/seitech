'use client';

import { ColumnDef } from '@tanstack/react-table';
import { AdminEnrollment, EnrollmentStatus } from '@/types/admin';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MoreVertical, Eye, Edit, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';
import Image from 'next/image';

interface EnrollmentTableProps {
  data: AdminEnrollment[];
  isLoading?: boolean;
  onViewDetails?: (enrollment: AdminEnrollment) => void;
  onEditStatus?: (enrollment: AdminEnrollment) => void;
  onCancel?: (enrollment: AdminEnrollment) => void;
}

const getStatusBadge = (status: EnrollmentStatus) => {
  const config = {
    active: { variant: 'success' as const, label: 'Active' },
    completed: { variant: 'info' as const, label: 'Completed' },
    expired: { variant: 'warning' as const, label: 'Expired' },
    cancelled: { variant: 'danger' as const, label: 'Cancelled' },
  };

  const { variant, label } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
};

const ProgressBar = ({ progress }: { progress: number }) => {
  const percentage = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export function EnrollmentTable({
  data,
  isLoading,
  onViewDetails,
  onEditStatus,
  onCancel,
}: EnrollmentTableProps) {
  const columns: ColumnDef<AdminEnrollment>[] = [
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {row.original.studentAvatar ? (
              <Image
                src={row.original.studentAvatar}
                alt={row.original.studentName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold">
                {row.original.studentName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {row.original.studentName}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {row.original.studentEmail}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'courseName',
      header: 'Course',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.courseThumbnail && (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
              <Image
                src={row.original.courseThumbnail}
                alt={row.original.courseName}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {row.original.courseName}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }) => (
        <div className="w-32">
          <ProgressBar progress={row.original.progress} />
        </div>
      ),
    },
    {
      accessorKey: 'enrolledDate',
      header: 'Enrolled',
      cell: ({ row }) => (
        <div className="text-sm text-gray-900">
          {formatDate(row.original.enrolledDate)}
        </div>
      ),
    },
    {
      accessorKey: 'expiresDate',
      header: 'Expires',
      cell: ({ row }) => (
        <div className="text-sm text-gray-900">
          {row.original.expiresDate ? formatDate(row.original.expiresDate) : 'Never'}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(row.original);
              }}
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onEditStatus && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditStatus(row.original);
              }}
              title="Edit status"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onCancel && row.original.status === 'active' && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onCancel(row.original);
              }}
              title="Cancel enrollment"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      searchKey="studentName"
      searchPlaceholder="Search by student name..."
      emptyMessage="No enrollments found."
      pageSize={10}
    />
  );
}
