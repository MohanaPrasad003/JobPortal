// The DTO that represents how we receive the data
export interface ReceivedJobDTO {
  id?: string;  // Make id optional since Supabase will generate it
  title: string;
  company: string;
  job_type: string;  // might be different format from different sources
  experience: string;
  description: string;
  application_link: string;
  source: string;
  posted_date: string;
  // ... any other fields that might come from different sources
}

// The DTO that represents our application's job format
export interface JobDTO {
  id?: string;  // Make id optional for new jobs
  title: string;
  company: string;
  jobType: 'remote' | 'onsite' | 'hybrid';  // strictly typed
  experience: string;
  description: string;
  applicationLink: string;
  source: string;
  postedDate: Date;
  // ... any other standardized fields
} 