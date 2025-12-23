import Image from 'next/image';
import Link from 'next/link';
import { Clock, Users, Star, Award, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn, formatCurrency, formatDuration } from '@/lib/utils';
import type { Course } from '@/types';

interface CourseCardProps {
  course: Course;
  variant?: 'default' | 'compact' | 'horizontal';
}

const deliveryBadgeColors: Record<string, string> = {
  'e-learning': 'bg-blue-50 text-blue-700 border-blue-200',
  'face-to-face': 'bg-green-50 text-green-700 border-green-200',
  virtual: 'bg-purple-50 text-purple-700 border-purple-200',
  'in-house': 'bg-orange-50 text-orange-700 border-orange-200',
};

export function CourseCard({ course, variant = 'default' }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <Card hover className="h-full group">
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={course.thumbnailUrl || '/images/course-placeholder.jpg'}
            alt={course.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay with Play Button */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-6 h-6 text-primary-600 ml-1" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge
              className={cn(
                deliveryBadgeColors[course.deliveryMethod] || deliveryBadgeColors['e-learning']
              )}
            >
              {course.deliveryMethod.replace('-', ' ')}
            </Badge>
            {course.accreditation && (
              <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                <Award className="w-3 h-3 mr-1" />
                {course.accreditation}
              </Badge>
            )}
          </div>

          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-white text-gray-900 font-bold shadow-sm">
              {course.listPrice === 0 ? 'Free' : formatCurrency(course.listPrice)}
            </Badge>
          </div>
        </div>

        <CardContent className="p-5">
          {/* Category */}
          <p className="text-sm text-primary-600 font-medium mb-2">
            {course.categoryName}
          </p>

          {/* Title */}
          <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {course.name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {course.shortDescription}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDuration(course.duration)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {course.enrollmentCount.toLocaleString()}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-gray-900">
                {course.ratingAvg.toFixed(1)}
              </span>
              <span className="text-gray-500 text-sm">({course.ratingCount})</span>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                {course.instructorName.charAt(0)}
              </div>
              <span className="text-sm text-gray-600">{course.instructorName}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
