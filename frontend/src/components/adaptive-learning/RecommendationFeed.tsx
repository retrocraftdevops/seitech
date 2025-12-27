'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { RecommendationCard } from './RecommendationCard';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import type { Recommendation, RecommendationAlgorithm } from '@/types/adaptive-learning';

interface RecommendationFeedProps {
  userId?: number;
  limit?: number;
  showFilters?: boolean;
  algorithm?: RecommendationAlgorithm;
}

export function RecommendationFeed({
  userId,
  limit = 10,
  showFilters = true,
  algorithm,
}: RecommendationFeedProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<RecommendationAlgorithm | undefined>(
    algorithm
  );

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedAlgorithm) params.append('algorithm', selectedAlgorithm);
      params.append('limit', limit.toString());
      params.append('minScore', '0.5');

      const response = await fetch(`/api/recommendations?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendations = async (algo?: RecommendationAlgorithm) => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          algorithm: algo || selectedAlgorithm || 'hybrid',
          limit,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      await fetchRecommendations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRecommendationAction = async (
    recId: number,
    action: 'viewed' | 'enroll' | 'save' | 'dismiss'
  ) => {
    try {
      const response = await fetch(`/api/recommendations/${recId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('Failed to perform action');
      }

      // Refresh recommendations if dismissed
      if (action === 'dismiss') {
        setRecommendations((prev) => prev.filter((r) => r.id !== recId));
      }
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedAlgorithm]);

  if (isLoading && recommendations.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Recommended For You
          </h2>
          <p className="text-muted-foreground">
            Personalized course suggestions based on your learning journey
          </p>
        </div>
        <Button
          onClick={() => generateRecommendations()}
          disabled={isGenerating}
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Algorithm Filter Tabs */}
      {showFilters && (
        <Tabs
          value={selectedAlgorithm || 'all'}
          onValueChange={(v) => setSelectedAlgorithm(v === 'all' ? undefined : v as RecommendationAlgorithm)}
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="hybrid">🤖 AI</TabsTrigger>
            <TabsTrigger value="collaborative">👥 Popular</TabsTrigger>
            <TabsTrigger value="content">📚 Similar</TabsTrigger>
            <TabsTrigger value="skill_gap">🎯 Skill Gap</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Recommendations List */}
      {recommendations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No recommendations yet</CardTitle>
            <CardDescription>
              Complete some courses or set skill targets to get personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => generateRecommendations('hybrid')}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Recommendations
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onAction={handleRecommendationAction}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {recommendations.length >= limit && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchRecommendations()}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
