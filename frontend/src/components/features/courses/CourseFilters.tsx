'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { CourseFilters as FilterType } from '@/types';

interface CourseFiltersProps {
  currentFilters: FilterType;
}

const categories = [
  { id: '1', name: 'Fire Safety', count: 12 },
  { id: '2', name: 'IOSH Courses', count: 8 },
  { id: '3', name: 'Health & Safety', count: 24 },
  { id: '4', name: 'First Aid', count: 10 },
  { id: '5', name: 'Mental Health', count: 6 },
  { id: '6', name: 'Environmental', count: 5 },
];

const deliveryMethods = [
  { id: 'e-learning', name: 'E-Learning', count: 35 },
  { id: 'virtual', name: 'Virtual Classroom', count: 18 },
  { id: 'face-to-face', name: 'Face-to-Face', count: 22 },
  { id: 'in-house', name: 'In-House', count: 15 },
];

const levels = [
  { id: 'beginner', name: 'Beginner', count: 28 },
  { id: 'intermediate', name: 'Intermediate', count: 24 },
  { id: 'advanced', name: 'Advanced', count: 12 },
];

const accreditations = [
  { id: 'iosh', name: 'IOSH', count: 8 },
  { id: 'qualsafe', name: 'Qualsafe', count: 12 },
  // TODO: Re-enable NEBOSH once licensing agreement is in place
  // { id: 'nebosh', name: 'NEBOSH', count: 6 },
  { id: 'cpd', name: 'CPD', count: 25 },
];

export function CourseFilters({ currentFilters }: CourseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'category',
    'delivery',
    'level',
    'accreditation',
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset pagination
    router.push(`/courses?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/courses');
  };

  const activeFilterCount = Object.keys(currentFilters).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <span className="font-semibold text-gray-900">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-primary-100 text-primary-600 text-xs font-medium px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="divide-y divide-gray-100">
        {/* Category Filter */}
        <FilterSection
          title="Category"
          isExpanded={expandedSections.includes('category')}
          onToggle={() => toggleSection('category')}
        >
          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={currentFilters.category === category.id}
                    onChange={() => updateFilter('category', category.id)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{category.count}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Delivery Method Filter */}
        <FilterSection
          title="Delivery Method"
          isExpanded={expandedSections.includes('delivery')}
          onToggle={() => toggleSection('delivery')}
        >
          <div className="space-y-2">
            {deliveryMethods.map((method) => (
              <label
                key={method.id}
                className="flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="delivery"
                    value={method.id}
                    checked={currentFilters.delivery === method.id}
                    onChange={() => updateFilter('delivery', method.id)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-primary-600 transition-colors">
                    {method.name}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{method.count}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Level Filter */}
        <FilterSection
          title="Difficulty Level"
          isExpanded={expandedSections.includes('level')}
          onToggle={() => toggleSection('level')}
        >
          <div className="space-y-2">
            {levels.map((level) => (
              <label
                key={level.id}
                className="flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="level"
                    value={level.id}
                    checked={currentFilters.level === level.id}
                    onChange={() => updateFilter('level', level.id)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-primary-600 transition-colors capitalize">
                    {level.name}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{level.count}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Accreditation Filter */}
        <FilterSection
          title="Accreditation"
          isExpanded={expandedSections.includes('accreditation')}
          onToggle={() => toggleSection('accreditation')}
        >
          <div className="space-y-2">
            {accreditations.map((acc) => (
              <label
                key={acc.id}
                className="flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={acc.id}
                    checked={currentFilters.accreditation === acc.id}
                    onChange={() =>
                      updateFilter(
                        'accreditation',
                        currentFilters.accreditation === acc.id ? '' : acc.id
                      )
                    }
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-primary-600 transition-colors">
                    {acc.name}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{acc.count}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ title, isExpanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className="py-4 px-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-gray-400 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </button>
      {isExpanded && <div className="mt-4">{children}</div>}
    </div>
  );
}
