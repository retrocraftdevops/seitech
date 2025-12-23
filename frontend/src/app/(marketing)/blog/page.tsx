'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowRight, Search, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardImage } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  readTime: number;
  publishedAt: string;
  isFeatured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'importance-of-fire-risk-assessments',
    title: 'The Importance of Fire Risk Assessments for UK Businesses',
    excerpt: 'Learn why fire risk assessments are a legal requirement and how they can protect your business, employees, and premises from fire hazards.',
    image: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=800&h=400&fit=crop',
    author: { name: 'David Thompson', avatar: '' },
    category: 'Fire Safety',
    readTime: 8,
    publishedAt: '2024-12-15',
    isFeatured: true,
  },
  {
    id: '2',
    slug: 'iosh-managing-safely-guide',
    title: 'Complete Guide to IOSH Managing Safely Certification',
    excerpt: 'Everything you need to know about the IOSH Managing Safely course, including benefits, course content, and career advancement opportunities.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop',
    author: { name: 'Sarah Mitchell', avatar: '' },
    category: 'Training',
    readTime: 10,
    publishedAt: '2024-12-10',
    isFeatured: true,
  },
  {
    id: '3',
    slug: 'nebosh-vs-iosh-which-is-right',
    title: 'NEBOSH vs IOSH: Which Health & Safety Course is Right for You?',
    excerpt: 'A comprehensive comparison of NEBOSH and IOSH qualifications to help you choose the right path for your career in health and safety.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop',
    author: { name: 'James Patterson', avatar: '' },
    category: 'Career Advice',
    readTime: 12,
    publishedAt: '2024-12-05',
  },
  {
    id: '4',
    slug: 'workplace-mental-health-first-aid',
    title: 'Mental Health First Aid in the Workplace: A Complete Guide',
    excerpt: 'Discover how mental health first aid training can transform your workplace culture and support employee wellbeing.',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=400&fit=crop',
    author: { name: 'Emma Richardson', avatar: '' },
    category: 'Mental Health',
    readTime: 7,
    publishedAt: '2024-11-28',
  },
  {
    id: '5',
    slug: 'iso-45001-implementation-guide',
    title: 'ISO 45001 Implementation: A Step-by-Step Guide',
    excerpt: 'Learn how to successfully implement ISO 45001 in your organization and achieve certification with our expert guidance.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=400&fit=crop',
    author: { name: 'Michael Chen', avatar: '' },
    category: 'ISO Standards',
    readTime: 15,
    publishedAt: '2024-11-20',
  },
  {
    id: '6',
    slug: 'e-learning-vs-classroom-training',
    title: 'E-Learning vs Classroom Training: Pros and Cons',
    excerpt: 'Explore the benefits and challenges of different training delivery methods to choose the best option for your team.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
    author: { name: 'Lisa Morgan', avatar: '' },
    category: 'Training',
    readTime: 6,
    publishedAt: '2024-11-15',
  },
];

const categories = [
  'All',
  'Fire Safety',
  'Training',
  'Career Advice',
  'Mental Health',
  'ISO Standards',
  'Compliance',
  'Industry News',
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const featuredPosts = blogPosts.filter((post) => post.isFeatured);
  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && !post.isFeatured;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20 lg:py-28">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">
              Resources & Insights
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Health & Safety Blog
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Expert insights, industry updates, and practical guidance for health, safety,
              and environmental professionals.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4 max-w-7xl">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Featured Articles</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <Card hover className="h-full overflow-hidden">
                      <CardImage className="h-56">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <Badge className="absolute top-4 left-4" variant="primary">
                          Featured
                        </Badge>
                      </CardImage>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <Badge variant="secondary" size="sm">{post.category}</Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(post.publishedAt)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {post.author.name.charAt(0)}
                            </div>
                            <span className="text-sm text-gray-700">{post.author.name}</span>
                          </div>
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {post.readTime} min read
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <Card hover className="h-full overflow-hidden">
                    <CardImage className="h-48">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </CardImage>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <Badge variant="secondary" size="sm">{post.category}</Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.readTime} min
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {post.author.name.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-700">{post.author.name}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">{formatDate(post.publishedAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">
                Try adjusting your search or category filter
              </p>
            </div>
          )}

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Articles
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Updated with Industry Insights
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Subscribe to our newsletter for the latest health and safety news, tips, and updates.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 h-14 px-6 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <Button variant="secondary" size="lg" type="submit">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
