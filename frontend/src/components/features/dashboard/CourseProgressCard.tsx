import Link from 'next/link';
import Image from 'next/image';
import { Card, CardImage, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Enrollment } from '@/types/user';
import { Clock, PlayCircle } from 'lucide-react';

interface CourseProgressCardProps {
  enrollment: Enrollment;
}

export function CourseProgressCard({ enrollment }: CourseProgressCardProps) {
  const getStatusVariant = (state: Enrollment['state']) => {
    switch (state) {
      case 'completed':
        return 'success';
      case 'active':
        return 'primary';
      case 'expired':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (state: Enrollment['state']) => {
    return state.charAt(0).toUpperCase() + state.slice(1);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card hover variant="default">
      <CardImage className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100">
        <Image
          src={enrollment.courseImage || '/placeholder-course.jpg'}
          alt={enrollment.courseName}
          fill
          className="object-cover"
        />
      </CardImage>

      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
            {enrollment.courseName}
          </h3>
          <Badge variant={getStatusVariant(enrollment.state)} size="sm">
            {getStatusLabel(enrollment.state)}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">{enrollment.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all"
                style={{ width: `${enrollment.progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(enrollment.totalTimeSpent)}</span>
            </div>
            {enrollment.lastAccessDate && (
              <span>Last accessed: {formatDate(enrollment.lastAccessDate)}</span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50">
        <Link href={`/courses/${enrollment.courseSlug}`} className="flex-1">
          <Button variant="primary" className="w-full" leftIcon={<PlayCircle className="w-4 h-4" />}>
            {enrollment.progress > 0 ? 'Continue Learning' : 'Start Course'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
