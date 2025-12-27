'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  GripVertical,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
} from 'lucide-react';
import { LessonItem, Lesson } from './LessonItem';

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface ModuleCardProps {
  module: Module;
  onUpdate: (module: Module) => void;
  onDelete: (id: string) => void;
  onAddLesson: (moduleId: string, lesson: Lesson) => void;
  onUpdateLesson: (moduleId: string, lesson: Lesson) => void;
  onDeleteLesson: (moduleId: string, lessonId: string) => void;
  dragHandleProps?: any;
}

export function ModuleCard({
  module,
  onUpdate,
  onDelete,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  dragHandleProps,
}: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(module.title);
  const [editedDescription, setEditedDescription] = useState(module.description);

  const handleSave = () => {
    onUpdate({
      ...module,
      title: editedTitle,
      description: editedDescription,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(module.title);
    setEditedDescription(module.description);
    setIsEditing(false);
  };

  const handleAddLesson = () => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: 'New Lesson',
      type: 'video',
      duration: 0,
      order: module.lessons.length,
      content: '',
    };
    onAddLesson(module.id, newLesson);
  };

  const totalDuration = module.lessons.reduce((sum, lesson) => sum + lesson.duration, 0);

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-start gap-3">
          <div {...dragHandleProps} className="cursor-move pt-1">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Module title"
                />
                <Input
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Module description"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} leftIcon={<Save className="h-4 w-4" />}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    leftIcon={<X className="h-4 w-4" />}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{module.title}</h3>
                  <Badge variant="default" size="sm">
                    {module.lessons.length} lessons
                  </Badge>
                  <Badge variant="primary" size="sm">
                    {totalDuration} min
                  </Badge>
                </div>
                {module.description && (
                  <p className="text-sm text-gray-600">{module.description}</p>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsEditing(true)}
                  title="Edit module"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDelete(module.id)}
                  title="Delete module"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-2">
          {module.lessons.length > 0 ? (
            <div className="space-y-2">
              {module.lessons.map((lesson) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  onUpdate={(updatedLesson) => onUpdateLesson(module.id, updatedLesson)}
                  onDelete={(lessonId) => onDeleteLesson(module.id, lessonId)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
              <p className="text-sm text-gray-500 mb-3">No lessons yet</p>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddLesson}
            leftIcon={<Plus className="h-4 w-4" />}
            className="w-full"
          >
            Add Lesson
          </Button>
        </div>
      )}
    </div>
  );
}
