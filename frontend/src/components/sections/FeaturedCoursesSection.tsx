'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, Users, ArrowRight, Star } from 'lucide-react';
import { Card, CardContent, CardImage } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

interface Course {
  id: number;
  name: string;
  shortDescription: string;
  imageUrl: string | null;
  categoryName: string;
  duration: number;
  enrollmentCount: number;
  ratingAvg: number;
  listPrice: number;
  slug: string;
  isFeatured?: boolean;
}

function formatDuration(hours: number): string {
  if (hours < 8) return `${hours} hours`;
  const days = Math.round(hours / 8);
  return `${days} day${days > 1 ? 's' : ''}`;
}

export function FeaturedCoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/courses?limit=6&sortBy=popularity');
        const data = await response.json();
        if (data.success && data.data?.courses) {
          setCourses(data.data.courses.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Featured{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                Training Courses
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Industry-leading health, safety, and environmental training programs
              delivered by certified professionals
            </p>
          </motion.div>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))
          ) : courses.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-600">No courses available at the moment.</p>
            </div>
          ) : (
            courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/courses/${course.slug || course.id}`}>
                  <Card hover className="h-full flex flex-col group cursor-pointer">
                    {/* Image */}
                    <CardImage className="h-48 relative">
                      {course.imageUrl ? (
                        <Image
                          src={course.imageUrl}
                          alt={course.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                      {course.isFeatured && (
                        <div className="absolute top-4 left-4">
                          <Badge variant="secondary" className="shadow-lg">
                            Featured
                          </Badge>
                        </div>
                      )}
                      {course.categoryName && (
                        <div className="absolute bottom-4 left-4">
                          <Badge className="bg-white/90 text-gray-900 hover:bg-white">
                            {course.categoryName}
                          </Badge>
                        </div>
                      )}
                    </CardImage>

                    <CardContent className="flex-grow flex flex-col">
                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {course.name}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 mb-4 flex-grow line-clamp-2"
                         dangerouslySetInnerHTML={{ __html: course.shortDescription || '' }} />

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                        {course.duration > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(course.duration)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{(course.enrollmentCount || 0).toLocaleString()}</span>
                        </div>
                        {course.ratingAvg > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{course.ratingAvg.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-2xl font-bold text-primary-600">
                            £{course.listPrice?.toFixed(0) || '0'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
                          <span>Learn More</span>
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* View All CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link href="/courses">
            <Button
              size="lg"
              variant="outline"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Browse All Courses
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
