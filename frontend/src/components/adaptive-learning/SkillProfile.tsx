'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Award, BookOpen, TrendingUp, Users, CheckCircle2, Target } from 'lucide-react';
import type { UserSkillProfile, ProficiencyLevel } from '@/types/adaptive-learning';

interface SkillProfileProps {
  profile: UserSkillProfile;
  compact?: boolean;
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

const categoryIcons: Record<string, any> = {
  technical: '💻',
  soft: '🤝',
  business: '📊',
  language: '🌐',
  other: '📚',
};

export function SkillProfile({ profile, compact = false }: SkillProfileProps) {
  const { skills, profile: summary } = profile;

  const topSkills = skills
    .sort((a, b) => b.points - a.points)
    .slice(0, compact ? 5 : 10);

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Your Skills
          </CardTitle>
          <CardDescription>
            {summary.total_skills} skills · {summary.verified_skills} verified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {topSkills.map((skill) => (
            <div key={skill.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div className={`w-2 h-2 rounded-full ${levelColors[skill.current_level]}`} />
                <span className="text-sm font-medium truncate">{skill.skill_name}</span>
                {skill.verified && (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">{skill.points}pts</span>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.total_skills}</p>
                <p className="text-xs text-muted-foreground">Total Skills</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.verified_skills}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Award className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.expert_skills}</p>
                <p className="text-xs text-muted-foreground">Expert Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary.total_points}</p>
                <p className="text-xs text-muted-foreground">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills by Category */}
      {Object.entries(summary.categories).map(([category, data]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="text-2xl">{categoryIcons[category] || '📚'}</span>
              {category.charAt(0).toUpperCase() + category.slice(1)} Skills
            </CardTitle>
            <CardDescription>
              {data.count} skills · {data.verified} verified · {data.points} points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skills
                .filter((s) => s.skill_category === category)
                .slice(0, 5)
                .map((skill) => (
                  <div key={skill.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{skill.skill_name}</span>
                        {skill.verified && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                        <Badge
                          variant="outline"
                          className={`text-xs ${levelColors[skill.current_level]} text-white border-0`}
                        >
                          {levelLabels[skill.current_level]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {skill.target_level && (
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {levelLabels[skill.target_level]}
                          </div>
                        )}
                        <span className="font-semibold">{skill.points}pts</span>
                      </div>
                    </div>
                    {skill.target_level && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress to target</span>
                          <span>{Math.round(skill.progress_percentage)}%</span>
                        </div>
                        <Progress value={skill.progress_percentage} className="h-1.5" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BookOpen className="w-3 h-3" />
                      <span>{skill.acquired_count} courses completed</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
