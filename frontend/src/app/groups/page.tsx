'use client';

import { useState, useEffect } from 'react';
import { StudyGroup, StudyGroupType, StudyGroupPrivacy } from '@/types/social';
import StudyGroupCard from '@/components/social/StudyGroupCard';
import { Plus, Filter, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    group_type: undefined as StudyGroupType | undefined,
    privacy: undefined as StudyGroupPrivacy | undefined,
    search: '',
    page: 1,
    per_page: 12,
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchGroups();
  }, [filters]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.group_type) params.append('group_type', filters.group_type);
      if (filters.privacy) params.append('privacy', filters.privacy);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page.toString());
      params.append('per_page', filters.per_page.toString());

      const response = await fetch(`/api/study-groups?${params}`);
      if (response.ok) {
        const data = await response.json();
        setGroups(data.items || []);
        setTotalPages(data.total_pages || 1);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupClick = (groupId: number) => {
    router.push(`/groups/${groupId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Study Groups</h1>
              <p className="text-lg opacity-90">Join collaborative learning communities</p>
            </div>
            <Link
              href="/groups/new"
              className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 font-semibold"
            >
              <Plus className="h-5 w-5" />
              <span>Create Group</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group Type</label>
              <select
                value={filters.group_type || ''}
                onChange={(e) => setFilters({ ...filters, group_type: e.target.value as StudyGroupType || undefined, page: 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">All Types</option>
                <option value="course">Course-Based</option>
                <option value="topic">Topic-Based</option>
                <option value="project">Project-Based</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Privacy</label>
              <select
                value={filters.privacy || ''}
                onChange={(e) => setFilters({ ...filters, privacy: e.target.value as StudyGroupPrivacy || undefined, page: 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">All Privacy Levels</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  placeholder="Search groups..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No study groups found</h3>
            <p className="text-gray-600 mb-6">Create a group and start learning together!</p>
            <Link
              href="/groups/new"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Group
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <StudyGroupCard
                  key={group.id}
                  group={group}
                  onClick={() => handleGroupClick(group.id)}
                  onJoin={() => fetchGroups()}
                  onLeave={() => fetchGroups()}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                  onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {filters.page} of {totalPages}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: Math.min(totalPages, filters.page + 1) })}
                  disabled={filters.page === totalPages}
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
