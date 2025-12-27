'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LearningPathCard } from './LearningPathCard';
import { Search, Filter, Plus, AlertCircle } from 'lucide-react';
import type { LearningPath, PathType, PathState } from '@/types/adaptive-learning';
import Link from 'next/link';

interface LearningPathListProps {
  userId?: number;
  showFilters?: boolean;
  showCreateButton?: boolean;
  limit?: number;
  state?: PathState;
  pathType?: PathType;
}

export function LearningPathList({
  userId,
  showFilters = true,
  showCreateButton = true,
  limit = 20,
  state,
  pathType,
}: LearningPathListProps) {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<PathState | 'all'>(state || 'all');
  const [typeFilter, setTypeFilter] = useState<PathType | 'all'>(pathType || 'all');
  const [showTemplates, setShowTemplates] = useState(false);

  const fetchPaths = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (stateFilter && stateFilter !== 'all') params.append('state', stateFilter);
      if (typeFilter && typeFilter !== 'all') params.append('type', typeFilter);
      if (showTemplates) params.append('templates', 'true');
      params.append('limit', limit.toString());

      const response = await fetch(`/api/learning-paths?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch learning paths');
      }
      const data = await response.json();
      setPaths(data.paths);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load learning paths');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePathAction = async (pathId: number, action: string) => {
    try {
      const response = await fetch(`/api/learning-paths/${pathId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('Action failed');
      }

      // Refresh the list
      await fetchPaths();
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  useEffect(() => {
    fetchPaths();
  }, [stateFilter, typeFilter, showTemplates]);

  const filteredPaths = searchQuery
    ? paths.filter(
        (path) =>
          path.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          path.goal?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : paths;

  if (isLoading && paths.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200 text-red-800">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Learning Paths</h2>
          <p className="text-muted-foreground">
            {total} {total === 1 ? 'path' : 'paths'} found
          </p>
        </div>
        {showCreateButton && (
          <Link href="/dashboard/learning-paths/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Path
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search paths..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={stateFilter} onValueChange={(v) => setStateFilter(v as PathState | 'all')}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as PathType | 'all')}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
              <SelectItem value="adaptive">AI Adaptive</SelectItem>
              <SelectItem value="structured">Structured</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showTemplates ? 'default' : 'outline'}
            onClick={() => setShowTemplates(!showTemplates)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Templates
          </Button>
        </div>
      )}

      {/* Path Grid */}
      {filteredPaths.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold mb-2">No learning paths found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Create your first learning path to get started'}
          </p>
          {showCreateButton && (
            <Link href="/dashboard/learning-paths/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Path
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPaths.map((path) => (
            <LearningPathCard key={path.id} path={path} onAction={handlePathAction} />
          ))}
        </div>
      )}

      {/* Load More */}
      {paths.length < total && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchPaths()}>
            Load More ({total - paths.length} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
