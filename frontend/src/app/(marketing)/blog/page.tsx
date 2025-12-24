'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowRight, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  author: {
    id: number;
    name: string;
    avatar: string;
    role?: string;
  };
  category: string;
  categorySlug?: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
  isFeatured?: boolean;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  postCount: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '12',
        });

        if (selectedCategory !== 'all') {
          params.set('category', selectedCategory);
        }

        if (searchQuery) {
          params.set('search', searchQuery);
        }

        const response = await fetch(`/api/blog?${params.toString()}`);
        const data = await response.json();

        if (data.success && data.data) {
          setPosts(data.data.posts || []);
          setCategories(data.data.categories || []);
          setTotalPages(data.data.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBlogPosts();
  }, [currentPage, selectedCategory, searchQuery]);

  const featuredPosts = posts.filter((post) => post.isFeatured);
  const regularPosts = posts.filter((post) => !post.isFeatured);

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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.slug);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.slug
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.postCount})
              </button>
            ))}
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : posts.length === 0 ? (
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-7xl text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No articles found</h2>
            <p className="text-gray-600 mb-8">
              Try adjusting your search or filter criteria.
            </p>
            <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
              Clear filters
            </Button>
          </div>
        </section>
      ) : (
        <>
          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <section className="py-16 lg:py-20 bg-white">
              <div className="container mx-auto px-4 max-w-7xl">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Featured Articles</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {featuredPosts.slice(0, 2).map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card variant="elevated" hover className="h-full">
                        <Link href={`/blog/${post.slug}`}>
                          <div className="relative h-56 overflow-hidden rounded-t-xl">
                            {post.imageUrl ? (
                              <Image
                                src={post.imageUrl}
                                alt={post.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                                <span className="text-4xl font-bold text-primary-600">
                                  {post.title.charAt(0)}
                                </span>
                              </div>
                            )}
                            <Badge className="absolute top-4 left-4" variant="primary">
                              Featured
                            </Badge>
                          </div>
                          <CardContent className="p-6">
                            <Badge variant="secondary" className="mb-3">
                              {post.category}
                            </Badge>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(post.publishedAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {post.readTime} min read
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* All Posts */}
          <section className="py-16 lg:py-20">
            <div className="container mx-auto px-4 max-w-7xl">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                {selectedCategory === 'all' ? 'Latest Articles' : `${selectedCategory.replace(/-/g, ' ')}`}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Card variant="elevated" hover className="h-full">
                      <Link href={`/blog/${post.slug}`}>
                        <div className="relative h-48 overflow-hidden rounded-t-xl">
                          {post.imageUrl ? (
                            <Image
                              src={post.imageUrl}
                              alt={post.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                              <span className="text-3xl font-bold text-primary-600">
                                {post.title.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-5">
                          <Badge variant="secondary" className="mb-3">
                            {post.category}
                          </Badge>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(post.publishedAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {post.readTime} min
                            </span>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Newsletter CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl text-white/90 mb-8">
            Subscribe to our newsletter for the latest health and safety insights,
            training updates, and industry news.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-12 px-4 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            <Button variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
