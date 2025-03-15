// Define valid job type values
export const JOB_TYPE_VALUES = [
  'full_time',
  'part_time',
  'contract',
  'remote',
  'onsite',
  'hybrid',
  'unknown'
] as const;

export type JobType = typeof JOB_TYPE_VALUES[number] | null;

// Constants for easy reference
export const JOB_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  REMOTE: 'remote',
  ONSITE: 'onsite',
  HYBRID: 'hybrid',
  UNKNOWN: 'unknown'
} as const;

// Categories for UI organization
export const JOB_TYPE_CATEGORIES = {
  EMPLOYMENT: [JOB_TYPES.FULL_TIME, JOB_TYPES.PART_TIME, JOB_TYPES.CONTRACT] as const,
  LOCATION: [JOB_TYPES.REMOTE, JOB_TYPES.ONSITE, JOB_TYPES.HYBRID] as const
} as const;

// Type guard to check if a string is a valid job type
export function isValidJobType(value: string | null): value is JobType {
  if (value === null) return true;
  return JOB_TYPE_VALUES.includes(value as typeof JOB_TYPE_VALUES[number]);
}

export interface Job {
  id?: string;
  title: string;
  company: string;
  job_type: JobType;  // Allow null
  experience: string;
  description: string;
  application_link: string;
  source: string;
  posted_date: string;
  created_at?: string;
  last_crawl_at?: string;
}

export interface JobFilters {
  search?: string;
  job_type?: JobType;
  experience?: string;
}