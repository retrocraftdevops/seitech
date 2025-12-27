'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, GripVertical, Search, Sparkles, AlertCircle, Save, Loader2 } from 'lucide-react';
import type { LearningPath, PathType, Skill, CourseInfo } from '@/types/adaptive-learning';

interface PathBuilderProps {
  pathId?: number;
  onSave?: (path: LearningPath) => void;
  onCancel?: () => void;
}

interface PathNode {
  sequence: number;
  courseId: number;
  courseName: string;
  optional: boolean;
}

export function PathBuilder({ pathId, onSave, onCancel }: PathBuilderProps) {
  const [isLoading, setIsLoading] = useState(!!pathId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [pathType, setPathType] = useState<PathType>('custom');
  const [deadline, setDeadline] = useState('');
  const [nodes, setNodes] = useState<PathNode[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);

  // Search state
  const [courseSearch, setCourseSearch] = useState('');
  const [availableCourses, setAvailableCourses] = useState<CourseInfo[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (pathId) {
      loadPath(pathId);
    }
    loadSkills();
  }, [pathId]);

  const loadPath = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/learning-paths/${id}`);
      if (!response.ok) throw new Error('Failed to load path');
      
      const path: LearningPath = await response.json();
      setName(path.name);
      setGoal(path.goal || '');
      setPathType(path.path_type);
      setDeadline(path.deadline || '');
      if (path.skills) setSelectedSkills(path.skills);
      if (path.nodes) {
        setNodes(
          path.nodes.map((node) => ({
            sequence: node.sequence,
            courseId: Array.isArray(node.channel_id) ? node.channel_id[0] : node.channel_id,
            courseName: (node as any).course_name || 'Course',
            optional: !node.is_required,
          }))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load path');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSkills = async () => {
    try {
      const response = await fetch('/api/skills');
      if (!response.ok) throw new Error('Failed to load skills');
      const data = await response.json();
      setAvailableSkills(data.skills);
    } catch (err) {
      console.error('Failed to load skills:', err);
    }
  };

  const searchCourses = async (query: string) => {
    if (!query.trim()) {
      setAvailableCourses([]);
      return;
    }
    setIsSearching(true);
    try {
      // Call Odoo search API (you'll need to create this endpoint)
      const response = await fetch(`/api/courses/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setAvailableCourses(data.courses);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const addCourse = (course: CourseInfo) => {
    if (nodes.find((n) => n.courseId === course.id)) {
      return; // Already added
    }
    setNodes([
      ...nodes,
      {
        sequence: nodes.length + 1,
        courseId: course.id,
        courseName: course.name,
        optional: false,
      },
    ]);
    setCourseSearch('');
    setAvailableCourses([]);
  };

  const removeCourse = (courseId: number) => {
    const filtered = nodes.filter((n) => n.courseId !== courseId);
    setNodes(filtered.map((n, i) => ({ ...n, sequence: i + 1 })));
  };

  const toggleOptional = (courseId: number) => {
    setNodes(nodes.map((n) => (n.courseId === courseId ? { ...n, optional: !n.optional } : n)));
  };

  const moveNode = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= nodes.length) return;
    const reordered = [...nodes];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setNodes(reordered.map((n, i) => ({ ...n, sequence: i + 1 })));
  };

  const toggleSkill = (skill: Skill) => {
    if (selectedSkills.find((s) => s.id === skill.id)) {
      setSelectedSkills(selectedSkills.filter((s) => s.id !== skill.id));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a path name');
      return;
    }
    if (nodes.length === 0) {
      setError('Please add at least one course');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        name,
        goal,
        path_type: pathType,
        deadline: deadline || null,
        skill_ids: selectedSkills.map((s) => s.id),
        nodes: nodes.map((n) => ({
          course_id: n.courseId,
          sequence: n.sequence,
          is_optional: n.optional,
        })),
      };

      const url = pathId ? `/api/learning-paths/${pathId}` : '/api/learning-paths';
      const method = pathId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save path');
      }

      const savedPath: LearningPath = await response.json();
      if (onSave) onSave(savedPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save path');
    } finally {
      setIsSaving(false);
    }
  };

  const generateAIPath = async () => {
    if (!name.trim() || selectedSkills.length === 0) {
      setError('Please enter a path name and select at least one skill');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      // First create the path
      const response = await fetch('/api/learning-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          goal,
          path_type: 'adaptive',
          skill_ids: selectedSkills.map((s) => s.id),
        }),
      });

      if (!response.ok) throw new Error('Failed to create path');
      const path: LearningPath = await response.json();

      // Then generate AI content
      const aiResponse = await fetch(`/api/learning-paths/${path.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_ai',
          algorithm: 'skill_based',
        }),
      });

      if (!aiResponse.ok) throw new Error('AI generation failed');
      const updatedPath = await aiResponse.json();
      if (onSave) onSave(updatedPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI path');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="bg-red-50 border-red-200 text-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{pathId ? 'Edit Learning Path' : 'Create Learning Path'}</CardTitle>
          <CardDescription>
            Build a personalized learning journey tailored to your goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Path Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Full Stack Web Development"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Learning Goal</Label>
              <Textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Describe what you want to achieve..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Path Type</Label>
                <Select value={pathType} onValueChange={(v) => setPathType(v as PathType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="adaptive">AI Adaptive</SelectItem>
                    <SelectItem value="structured">Structured</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Skills Selection */}
          <div className="space-y-3">
            <Label>Target Skills</Label>
            <div className="flex flex-wrap gap-2">
              {availableSkills.slice(0, 20).map((skill) => (
                <Badge
                  key={skill.id}
                  variant={selectedSkills.find((s) => s.id === skill.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill.name}
                </Badge>
              ))}
            </div>
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-sm text-muted-foreground">Selected:</span>
                {selectedSkills.map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                    <button
                      onClick={() => toggleSkill(skill)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Course Builder */}
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Add Courses Manually</TabsTrigger>
              <TabsTrigger value="ai">Generate with AI</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              {/* Course Search */}
              <div className="space-y-2">
                <Label>Search and Add Courses</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={courseSearch}
                    onChange={(e) => {
                      setCourseSearch(e.target.value);
                      searchCourses(e.target.value);
                    }}
                    placeholder="Search for courses..."
                    className="pl-9"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                  )}
                </div>
                {availableCourses.length > 0 && (
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    {availableCourses.map((course) => (
                      <div
                        key={course.id}
                        onClick={() => addCourse(course)}
                        className="p-3 hover:bg-accent cursor-pointer border-b last:border-0"
                      >
                        <div className="font-medium">{course.name}</div>
                        {course.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {course.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Course List */}
              {nodes.length > 0 && (
                <div className="space-y-2">
                  <Label>Course Sequence ({nodes.length})</Label>
                  <div className="space-y-2">
                    {nodes.map((node, index) => (
                      <div
                        key={node.courseId}
                        className="flex items-center gap-2 p-3 border rounded-lg bg-card"
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                        <span className="font-semibold text-muted-foreground w-8">
                          {node.sequence}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium">{node.courseName}</div>
                        </div>
                        <Button
                          size="sm"
                          variant={node.optional ? 'outline' : 'secondary'}
                          onClick={() => toggleOptional(node.courseId)}
                        >
                          {node.optional ? 'Optional' : 'Required'}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => moveNode(index, index - 1)}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => moveNode(index, index + 1)}
                          disabled={index === nodes.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeCourse(node.courseId)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <div className="text-center p-6 border-2 border-dashed rounded-lg">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI-Powered Path Generation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Let our AI create an optimal learning path based on your selected skills and goals
                </p>
                <Button
                  onClick={generateAIPath}
                  disabled={isSaving || !name || selectedSkills.length === 0}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Path
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {pathId ? 'Update Path' : 'Create Path'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
