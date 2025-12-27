'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChevronRight,
  ChevronDown,
  Target,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';
import type { Skill, ProficiencyLevel, UserSkill } from '@/types/adaptive-learning';

interface SkillTreeProps {
  rootSkillId?: number;
  categoryFilter?: string;
  showUserProgress?: boolean;
  onSkillSelect?: (skill: Skill) => void;
}

interface SkillNode extends Skill {
  children?: SkillNode[];
  userSkill?: UserSkill;
  isExpanded?: boolean;
}

const levelColors: Record<ProficiencyLevel, string> = {
  awareness: 'bg-gray-500',
  foundational: 'bg-blue-500',
  intermediate: 'bg-yellow-500',
  advanced: 'bg-orange-500',
  expert: 'bg-purple-500',
};

const levelLabels: Record<ProficiencyLevel, string> = {
  awareness: 'Awareness',
  foundational: 'Foundational',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};

export function SkillTree({
  rootSkillId,
  categoryFilter,
  showUserProgress = true,
  onSkillSelect,
}: SkillTreeProps) {
  const [skillTree, setSkillTree] = useState<SkillNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSkills, setUserSkills] = useState<Map<number, UserSkill>>(new Map());

  useEffect(() => {
    loadSkillTree();
    if (showUserProgress) {
      loadUserSkills();
    }
  }, [rootSkillId, categoryFilter]);

  const loadSkillTree = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (rootSkillId) params.append('parent', rootSkillId.toString());

      const response = await fetch(`/api/skills?${params}`);
      if (!response.ok) throw new Error('Failed to load skills');
      
      const data = await response.json();
      const tree = await buildTree(data.skills);
      setSkillTree(tree);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skill tree');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserSkills = async () => {
    try {
      const response = await fetch('/api/skills/user');
      if (!response.ok) throw new Error('Failed to load user skills');
      
      const data = await response.json();
      const skillMap = new Map<number, UserSkill>(data.skills.map((s: UserSkill) => [Array.isArray(s.skill_id) ? s.skill_id[0] : s.skill_id, s]));
      setUserSkills(skillMap);
    } catch (err) {
      console.error('Failed to load user skills:', err);
    }
  };

  const buildTree = async (skills: Skill[]): Promise<SkillNode[]> => {
    const skillMap = new Map<number, SkillNode>(
      skills.map((s) => [s.id, { ...s, children: [] }])
    );

    const roots: SkillNode[] = [];

    for (const skill of skills) {
      const node = skillMap.get(skill.id)!;
      
      const parentId = Array.isArray(skill.parent_id) ? skill.parent_id[0] : skill.parent_id;
      if (parentId && skillMap.has(parentId)) {
        const parent = skillMap.get(parentId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  };

  const toggleNode = (skillId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(skillId)) {
      newExpanded.delete(skillId);
    } else {
      newExpanded.add(skillId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleSetTarget = async (skillId: number, targetLevel: ProficiencyLevel) => {
    try {
      const response = await fetch('/api/skills/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_target',
          skill_id: skillId,
          target_level: targetLevel,
        }),
      });

      if (!response.ok) throw new Error('Failed to set target');
      await loadUserSkills();
    } catch (err) {
      console.error('Failed to set target:', err);
    }
  };

  const renderSkillNode = (node: SkillNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const userSkill = showUserProgress ? userSkills.get(node.id) : undefined;

    return (
      <div key={node.id} style={{ marginLeft: `${depth * 24}px` }} className="mb-2">
        <Card
          className={`hover:shadow-md transition-shadow cursor-pointer ${
            userSkill?.verified ? 'border-green-500 border-2' : ''
          }`}
          onClick={() => onSkillSelect && onSkillSelect(node)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Expand/Collapse Button */}
              {node.children && node.children.length > 0 && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 mt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNode(node.id);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}

              <div className="flex-1 min-w-0">
                {/* Skill Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{node.name}</h4>
                    {userSkill?.verified && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    {node.is_trending && <TrendingUp className="w-4 h-4 text-orange-500" />}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {node.category}
                  </Badge>
                </div>

                {/* Description */}
                {node.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {node.description}
                  </p>
                )}

                {/* User Progress */}
                {userSkill && (
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${
                            levelColors[userSkill.current_level]
                          } text-white border-0`}
                        >
                          {levelLabels[userSkill.current_level]}
                        </Badge>
                        {userSkill.target_level && (
                          <>
                            <span className="text-muted-foreground">→</span>
                            <Badge variant="outline" className="gap-1">
                              <Target className="w-3 h-3" />
                              {levelLabels[userSkill.target_level]}
                            </Badge>
                          </>
                        )}
                      </div>
                      <span className="font-semibold">{userSkill.points} pts</span>
                    </div>

                    {userSkill.target_level && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress to target</span>
                          <span>{Math.round(userSkill.progress_percentage)}%</span>
                        </div>
                        <Progress value={userSkill.progress_percentage} className="h-1.5" />
                      </div>
                    )}
                  </div>
                )}

                {/* Stats and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{node.total_courses || 0} courses</span>
                    </div>
                    {node.children && node.children.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span>{node.children.length} sub-skills</span>
                      </div>
                    )}
                  </div>

                  {showUserProgress && !userSkill && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetTarget(node.id, 'foundational');
                      }}
                    >
                      <Target className="w-3 h-3 mr-1" />
                      Set Target
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children */}
        {isExpanded && node.children && node.children.length > 0 && (
          <div className="mt-2">
            {node.children.map((child) => renderSkillNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
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

  if (skillTree.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Skills Found</CardTitle>
          <CardDescription>
            {categoryFilter
              ? `No skills found in the ${categoryFilter} category`
              : 'No skills available'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {categoryFilter ? `${categoryFilter} Skills` : 'All Skills'}
        </h3>
        <Button variant="outline" size="sm" onClick={loadSkillTree}>
          Refresh
        </Button>
      </div>
      {skillTree.map((node) => renderSkillNode(node))}
    </div>
  );
}
