'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, Loader2, ArrowRight, BookOpen } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SearchResult {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnail: string;
  price: number;
  category: {
    name: string;
  };
  level: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Debounced search
  const searchCourses = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/courses?search=${encodeURIComponent(searchQuery)}&limit=6`);
      const data = await response.json();

      if (data.success && data.data?.courses) {
        setResults(data.data.courses);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchCourses(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchCourses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/courses?search=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  const handleResultClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for courses..."
              className="w-full h-14 pl-12 pr-12 text-lg border-b border-gray-200 focus:outline-none focus:border-primary-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </form>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-3">
                  Found {results.length} course{results.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-3">
                  {results.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.slug}`}
                      onClick={handleResultClick}
                      className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {course.thumbnail ? (
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-600">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 line-clamp-1">
                          {course.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <span>{course.category?.name || 'Training'}</span>
                          <span>•</span>
                          <span className="capitalize">{course.level}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">
                          {formatCurrency(course.price)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* View All Results */}
                <button
                  onClick={() => {
                    router.push(`/courses?search=${encodeURIComponent(query)}`);
                    onClose();
                  }}
                  className="w-full mt-4 py-3 text-center text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-2"
                >
                  View all results
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {!isLoading && hasSearched && results.length === 0 && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600">
                  Try searching with different keywords
                </p>
              </div>
            )}

            {!isLoading && !hasSearched && (
              <div className="p-6">
                <p className="text-sm text-gray-500 mb-4">Popular searches</p>
                <div className="flex flex-wrap gap-2">
                  {['Fire Safety', 'Manual Handling', 'Risk Assessment', 'IOSH', 'First Aid'].map(
                    (term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                      >
                        {term}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SearchModal;
