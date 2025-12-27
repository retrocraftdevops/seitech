'use client';

import { useState, useEffect } from 'react';
import { Discussion, DiscussionCategory, DiscussionState, DiscussionFilters } from '@/types/social';
import { Plus, Filter, Search, TrendingUp, MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';

export default function ForumsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DiscussionFilters>({
    category: undefined,
    state: undefined,
  });
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDiscussions();
  }, [filters, page]);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.state) params.append('state', filters.state);
      if (filters.search) params.append('search', filters.search);
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());

      const response = await fetch(`/api/discussions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDiscussions(data.items || []);
        setTotalPages(data.total_pages || 1);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: DiscussionCategory) => {
    const colors: Record<DiscussionCategory, string> = {
      question: 'bg-blue-100 text-blue-800',
      discussion: 'bg-purple-100 text-purple-800',
      announcement: 'bg-red-100 text-red-800',
      resource: 'bg-green-100 text-green-800',
      feedback: 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Discussion Forums</h1>
              <p className="text-lg opacity-90">Connect, learn, and share with the community</p>
            </div>
            <Link
              href="/forums/new"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 font-semibold"
            >
              <Plus className="h-5 w-5" />
              <span>New Discussion</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => { setFilters({ ...filters, category: e.target.value as DiscussionCategory || undefined }); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="question">Question</option>
                <option value="discussion">Discussion</option>
                <option value="announcement">Announcement</option>
                <option value="resource">Resource</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.state || ''}
                onChange={(e) => { setFilters({ ...filters, state: (e.target.value as DiscussionState) || undefined }); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
                  placeholder="Search discussions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Discussions List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : discussions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No discussions found</h3>
            <p className="text-gray-600 mb-6">Be the first to start a conversation!</p>
            <Link
              href="/forums/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Discussion
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <Link
                  key={discussion.id}
                  href={`/forums/${discussion.id}`}
                  className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(discussion.category)}`}>
                            {discussion.category}
                          </span>
                          {discussion.is_pinned && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                              📌 Pinned
                            </span>
                          )}
                          {discussion.is_featured && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
                          {discussion.name}
                        </h3>
                        <p className="text-gray-600 line-clamp-2">
                          {discussion.content?.replace(/<[^>]*>/g, '').substring(0, 200)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{discussion.author_name || 'Anonymous'}</span>
                        </div>
                        <span>•</span>
                        <span>{formatDate(discussion.create_date)}</span>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{discussion.upvote_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{discussion.reply_count}</span>
                        </div>
                        <span>👁️ {discussion.view_count}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
