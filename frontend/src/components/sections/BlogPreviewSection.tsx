'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { Card, CardContent, CardImage } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  slug: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'New Health & Safety Regulations Coming in 2025',
    excerpt:
      'Stay ahead of compliance requirements with our comprehensive guide to the latest health and safety regulations affecting UK businesses.',
    image:
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop',
    category: 'Regulations',
    author: 'Sarah Johnson',
    date: '2024-12-15',
    readTime: '5 min read',
    slug: 'new-health-safety-regulations-2025',
  },
  {
    id: '2',
    title: 'Best Practices for Workplace Fire Safety',
    excerpt:
      'Essential fire safety tips every employer should know. Learn how to prevent fires and protect your employees.',
    image:
      'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=800&h=600&fit=crop',
    category: 'Fire Safety',
    author: 'Michael Chen',
    date: '2024-12-10',
    readTime: '4 min read',
    slug: 'workplace-fire-safety-best-practices',
  },
  {
    id: '3',
    title: 'The Importance of Mental Health in the Workplace',
    excerpt:
      'Discover why mental health support is crucial for employee wellbeing and how to create a supportive work environment.',
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop',
    category: 'Wellbeing',
    author: 'Emma Williams',
    date: '2024-12-05',
    readTime: '6 min read',
    slug: 'mental-health-workplace-importance',
  },
];

export function BlogPreviewSection() {
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
              Latest{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                Insights & News
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stay informed with expert articles, industry updates, and safety tips
              from our team
            </p>
          </motion.div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <Card hover className="h-full flex flex-col group cursor-pointer">
                  {/* Image */}
                  <CardImage className="h-56 relative">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-gray-900 hover:bg-white">
                        {post.category}
                      </Badge>
                    </div>
                  </CardImage>

                  <CardContent className="flex-grow flex flex-col">
                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(post.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
                        <span className="text-sm">Read More</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button
            size="lg"
            variant="outline"
            rightIcon={<ArrowRight className="h-5 w-5" />}
            asChild
          >
            <Link href="/blog">View All Articles</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
