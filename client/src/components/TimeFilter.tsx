import { useState, useRef, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import type { FilterPreset, FilterState } from '../lib/filterUtils';
import { computeDateRange } from '../lib/filterUtils';

interface TimeFilterProps {
  value: FilterState;
  onChange: (filter: FilterState) => void;
  align?: 'left' | 'right';
}

export default function TimeFilter({ value, onChange, align = 'right' }: TimeFilterProps) {
  const { t } = useSettings();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filterPresets: { value: FilterPreset; label: string }[] = [
    { value: 'all', label: t('filter_all_time') },
    { value: 'today', label: t('filter_today') },
    { value: 'week', label: t('filter_week') },
    { value: 'month', label: t('filter_month') },
    { value: 'year', label: t('filter_year') },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const selectedLabel = filterPresets.find(p => p.value === value.preset)?.label || t('filter_all_time');

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-text-secondary shadow-card border border-border-light hover:bg-gray-50 transition-colors"
      >
        <span>{selectedLabel}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute top-12 z-[100] w-56 rounded-[20px] bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-border-light py-2 ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {filterPresets.map(preset => (
            <button
              key={preset.value}
              type="button"
              onClick={() => {
                const range = preset.value === 'all'
                  ? { from: null, to: null }
                  : computeDateRange(preset.value);
                onChange({ preset: preset.value, range });
                setOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                value.preset === preset.value
                  ? 'bg-brand/10 text-brand'
                  : 'text-text-primary hover:bg-gray-50'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
