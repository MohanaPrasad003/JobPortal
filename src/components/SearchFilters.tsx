import React from 'react';
import { JobFilters, JobType } from '../types/job';

interface SearchFiltersProps {
  filters: JobFilters;
  onFilterChange: (filters: JobFilters) => void;
}

const PREDEFINED_SEARCHES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Product Manager',
  'UI/UX Designer'
];

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' }
];

const EXPERIENCE_LEVELS = [
  { value: '0', label: 'Fresh' },
  { value: '1+', label: '1+ years' },
  { value: '2+', label: '2+ years' },
  { value: '3+', label: '3+ years' },
  { value: '5+', label: '5+ years' },
  { value: '8+', label: '8+ years' },
  { value: '10+', label: '10+ years' },
  { value: '15+', label: '15+ years' }
];

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const handleExperienceChange = (value: string) => {
    onFilterChange({ ...filters, experience: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {PREDEFINED_SEARCHES.map(keyword => (
          <button
            key={keyword}
            onClick={() => onFilterChange({ ...filters, search: keyword })}
            className={`px-4 py-2 rounded-full text-sm ${
              filters.search === keyword
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {keyword}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <input
          type="text"
          placeholder="Search jobs..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="p-2 border rounded"
        />
        
        <select
          value={filters.jobType || ''}
          onChange={(e) => onFilterChange({ ...filters, jobType: e.target.value as JobType })}
          className="p-2 border rounded"
        >
          <option value="">Any Job Type</option>
          {JOB_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <select
          value={filters.experience || ''}
          onChange={(e) => handleExperienceChange(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Any Experience</option>
          {EXPERIENCE_LEVELS.map(level => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}