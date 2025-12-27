'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export type DateRange = {
  from: Date;
  to: Date;
  label: string;
};

export type DateRangePreset = 'last7days' | 'last30days' | 'last90days' | 'year' | 'custom';

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const presets: Record<DateRangePreset, () => DateRange> = {
  last7days: () => ({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
    label: 'Last 7 days',
  }),
  last30days: () => ({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
    label: 'Last 30 days',
  }),
  last90days: () => ({
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    to: new Date(),
    label: 'Last 90 days',
  }),
  year: () => ({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
    label: 'This year',
  }),
  custom: () => ({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
    label: 'Custom range',
  }),
};

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('last30days');
  const [customFrom, setCustomFrom] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [customTo, setCustomTo] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const currentRange = value || presets[selectedPreset]();

  const handlePresetClick = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      const range = presets[preset]();
      onChange(range);
    }
  };

  const handleApplyCustom = () => {
    const range: DateRange = {
      from: new Date(customFrom),
      to: new Date(customTo),
      label: 'Custom range',
    };
    onChange(range);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto justify-start"
      >
        <Calendar className="h-4 w-4 mr-2" />
        {currentRange.label}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Select date range
              </h3>

              <div className="space-y-2 mb-4">
                {(['last7days', 'last30days', 'last90days', 'year', 'custom'] as DateRangePreset[]).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetClick(preset)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                      selectedPreset === preset
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    {presets[preset]().label}
                  </button>
                ))}
              </div>

              {selectedPreset === 'custom' && (
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <Button
                    onClick={handleApplyCustom}
                    className="w-full"
                    size="sm"
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
