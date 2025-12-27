'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/Dropdown';
import { MoreVertical, Edit, Eye, Archive, Trash2, CheckCircle } from 'lucide-react';

export interface Course {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  instructor: string;
  category: string;
  price: number;
  enrollments: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

interface CourseTableProps {
  courses: Course[];
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onPublish?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  selectedIds?: string[];
  onSelectChange?: (ids: string[]) => void;
}

export function CourseTable({
  courses,
  onEdit,
  onView,
  onPublish,
  onArchive,
  onDelete,
  selectedIds = [],
  onSelectChange,
}: CourseTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (onSelectChange) {
      onSelectChange(checked ? courses.map((c) => c.id) : []);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (onSelectChange) {
      onSelectChange(
        checked ? [...selectedIds, id] : selectedIds.filter((selectedId) => selectedId !== id)
      );
    }
  };

  const getStatusBadge = (status: Course['status']) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">Published</Badge>;
      case 'draft':
        return <Badge variant="warning">Draft</Badge>;
      case 'archived':
        return <Badge variant="default">Archived</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-400"
                checked={selectedIds.length === courses.length && courses.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Course
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Instructor
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Enrollments
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {courses.map((course) => (
            <tr key={course.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-400"
                  checked={selectedIds.includes(course.id)}
                  onChange={(e) => handleSelectOne(course.id, e.target.checked)}
                />
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  {course.thumbnail ? (
                    <div className="relative h-12 w-20 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={course.thumbnail}
                        alt={course.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-20 flex-shrink-0 rounded-lg bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-400">No image</span>
                    </div>
                  )}
                  <div>
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="font-medium text-gray-900 hover:text-primary-600"
                    >
                      {course.name}
                    </Link>
                    <p className="text-sm text-gray-500">{course.slug}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-700">{course.instructor}</td>
              <td className="px-4 py-4">
                <Badge variant="primary">{course.category}</Badge>
              </td>
              <td className="px-4 py-4 text-sm font-medium text-gray-900">
                ${course.price.toFixed(2)}
              </td>
              <td className="px-4 py-4 text-sm text-gray-700">{course.enrollments}</td>
              <td className="px-4 py-4">{getStatusBadge(course.status)}</td>
              <td className="px-4 py-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView?.(course.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(course.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {course.status === 'draft' && (
                      <DropdownMenuItem onClick={() => onPublish?.(course.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Publish
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onArchive?.(course.id)}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete?.(course.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No courses found</p>
        </div>
      )}
    </div>
  );
}
