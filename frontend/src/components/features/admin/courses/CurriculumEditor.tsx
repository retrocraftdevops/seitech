'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { ModuleCard, Module } from './ModuleCard';
import { Lesson } from './LessonItem';

interface CurriculumEditorProps {
  modules: Module[];
  onChange: (modules: Module[]) => void;
}

export function CurriculumEditor({ modules, onChange }: CurriculumEditorProps) {
  const addModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: 'New Module',
      description: '',
      order: modules.length,
      lessons: [],
    };
    onChange([...modules, newModule]);
  };

  const updateModule = (updatedModule: Module) => {
    onChange(modules.map((m) => (m.id === updatedModule.id ? updatedModule : m)));
  };

  const deleteModule = (id: string) => {
    onChange(modules.filter((m) => m.id !== id));
  };

  const addLesson = (moduleId: string, lesson: Lesson) => {
    onChange(
      modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: [...m.lessons, lesson] }
          : m
      )
    );
  };

  const updateLesson = (moduleId: string, updatedLesson: Lesson) => {
    onChange(
      modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === updatedLesson.id ? updatedLesson : l
              ),
            }
          : m
      )
    );
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    onChange(
      modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
          : m
      )
    );
  };

  const moveModule = (fromIndex: number, toIndex: number) => {
    const newModules = [...modules];
    const [removed] = newModules.splice(fromIndex, 1);
    newModules.splice(toIndex, 0, removed);
    // Update order
    const reorderedModules = newModules.map((m, index) => ({ ...m, order: index }));
    onChange(reorderedModules);
  };

  const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const totalDuration = modules.reduce(
    (sum, module) =>
      sum + module.lessons.reduce((lessonSum, lesson) => lessonSum + lesson.duration, 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Curriculum</h2>
          <p className="text-sm text-gray-600 mt-1">
            {modules.length} modules • {totalLessons} lessons • {totalDuration} minutes total
          </p>
        </div>
        <Button onClick={addModule} leftIcon={<Plus className="h-4 w-4" />}>
          Add Module
        </Button>
      </div>

      <div className="space-y-4">
        {modules.map((module, index) => (
          <ModuleCard
            key={module.id}
            module={module}
            onUpdate={updateModule}
            onDelete={deleteModule}
            onAddLesson={addLesson}
            onUpdateLesson={updateLesson}
            onDeleteLesson={deleteLesson}
          />
        ))}
      </div>

      {modules.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No modules yet</h3>
          <p className="text-gray-600 mb-6">
            Start building your course curriculum by adding your first module
          </p>
          <Button onClick={addModule} leftIcon={<Plus className="h-4 w-4" />}>
            Create First Module
          </Button>
        </div>
      )}
    </div>
  );
}
