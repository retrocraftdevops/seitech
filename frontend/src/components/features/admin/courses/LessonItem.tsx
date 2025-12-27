'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/Badge';
import { GripVertical, Edit, Trash2, Save, X, Video, FileText, HelpCircle, BookOpen } from 'lucide-react';

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'document' | 'quiz' | 'article';
  duration: number; // in minutes
  order: number;
  content: string;
  videoUrl?: string;
  documentUrl?: string;
}

interface LessonItemProps {
  lesson: Lesson;
  onUpdate: (lesson: Lesson) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: any;
}

export function LessonItem({ lesson, onUpdate, onDelete, dragHandleProps }: LessonItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLesson, setEditedLesson] = useState(lesson);

  const handleSave = () => {
    onUpdate(editedLesson);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedLesson(lesson);
    setIsEditing(false);
  };

  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />;
      case 'article':
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: Lesson['type']) => {
    const variants: Record<Lesson['type'], any> = {
      video: 'primary',
      document: 'info',
      quiz: 'warning',
      article: 'success',
    };
    return (
      <Badge variant={variants[type]} size="sm">
        {type}
      </Badge>
    );
  };

  if (isEditing) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
        <Input
          value={editedLesson.title}
          onChange={(e) => setEditedLesson({ ...editedLesson, title: e.target.value })}
          placeholder="Lesson title"
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            value={editedLesson.type}
            onValueChange={(value) => setEditedLesson({ ...editedLesson, type: value as Lesson['type'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="article">Article</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            value={editedLesson.duration}
            onChange={(e) => setEditedLesson({ ...editedLesson, duration: parseInt(e.target.value) || 0 })}
            placeholder="Duration (min)"
          />
        </div>

        {editedLesson.type === 'video' && (
          <Input
            value={editedLesson.videoUrl || ''}
            onChange={(e) => setEditedLesson({ ...editedLesson, videoUrl: e.target.value })}
            placeholder="Video URL"
          />
        )}

        {editedLesson.type === 'document' && (
          <Input
            value={editedLesson.documentUrl || ''}
            onChange={(e) => setEditedLesson({ ...editedLesson, documentUrl: e.target.value })}
            placeholder="Document URL"
          />
        )}

        <Input
          value={editedLesson.content}
          onChange={(e) => setEditedLesson({ ...editedLesson, content: e.target.value })}
          placeholder="Content description"
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
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div {...dragHandleProps} className="cursor-move">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {getLessonIcon(lesson.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-sm text-gray-900 truncate">{lesson.title}</h4>
          {getTypeBadge(lesson.type)}
        </div>
        {lesson.content && (
          <p className="text-xs text-gray-600 truncate">{lesson.content}</p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs text-gray-500">{lesson.duration} min</span>
        <Button variant="ghost" size="icon-sm" onClick={() => setIsEditing(true)} title="Edit lesson">
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(lesson.id)}
          title="Delete lesson"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    </div>
  );
}
