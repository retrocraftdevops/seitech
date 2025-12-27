'use client';

import { ColumnDef } from '@tanstack/react-table';
import { AdminInstructor } from '@/types/admin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MoreHorizontal, Edit, Trash2, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface InstructorTableActionsProps {
  instructor: AdminInstructor;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

function InstructorTableActions({ instructor, onEdit, onDelete }: InstructorTableActionsProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setShowMenu(!showMenu)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-8 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
            <button
              onClick={() => {
                onEdit(instructor.id);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => {
                onDelete(instructor.id);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
}

export function createInstructorColumns(
  onEdit: (id: number) => void,
  onDelete: (id: number) => void
): ColumnDef<AdminInstructor>[] {
  return [
    {
      accessorKey: 'avatar',
      header: 'Photo',
      cell: ({ row }) => {
        const instructor = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200">
              {instructor.avatar ? (
                <Image
                  src={instructor.avatar}
                  alt={instructor.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-500 font-semibold text-sm">
                  {instructor.firstName[0]}
                  {instructor.lastName[0]}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const instructor = row.original;
        return (
          <div>
            <Link
              href={`/admin/instructors/${instructor.id}`}
              className="font-medium text-gray-900 hover:text-primary-600"
            >
              {instructor.name}
            </Link>
            {instructor.title && (
              <p className="text-sm text-gray-500">{instructor.title}</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-gray-600">{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'specializations',
      header: 'Specializations',
      cell: ({ row }) => {
        const specializations = row.original.specializations;
        if (specializations.length === 0) {
          return <span className="text-gray-400">-</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {specializations.slice(0, 2).map((spec) => (
              <Badge key={spec} variant="primary" size="sm">
                {spec}
              </Badge>
            ))}
            {specializations.length > 2 && (
              <Badge variant="outline" size="sm">
                +{specializations.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'totalCourses',
      header: 'Courses',
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">
          {row.original.totalCourses}
        </span>
      ),
    },
    {
      accessorKey: 'totalStudents',
      header: 'Students',
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">
          {row.original.totalStudents.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => <RatingStars rating={row.original.rating} />,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'danger'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <InstructorTableActions
          instructor={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ];
}
