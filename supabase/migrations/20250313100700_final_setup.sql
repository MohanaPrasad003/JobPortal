-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop existing tables and indexes
DROP TABLE IF EXISTS jobs CASCADE;
DROP INDEX IF EXISTS idx_jobs_title;
DROP INDEX IF EXISTS idx_jobs_posted_date;
DROP INDEX IF EXISTS idx_jobs_title_gin;
DROP INDEX IF EXISTS idx_jobs_location_gin;
DROP INDEX IF EXISTS idx_jobs_title_trgm;
DROP INDEX IF EXISTS idx_jobs_location_trgm;

-- Create jobs table with TEXT id instead of UUID
CREATE TABLE jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    experience TEXT NOT NULL,
    description TEXT NOT NULL,
    application_link TEXT NOT NULL,
    source TEXT NOT NULL,
    posted_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_crawl_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" 
    ON jobs FOR SELECT 
    TO public 
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
    ON jobs FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- Create all necessary indexes
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date DESC);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_last_crawl ON jobs(last_crawl_at DESC);
CREATE INDEX idx_jobs_title_basic ON jobs(title);
CREATE INDEX idx_jobs_company ON jobs(company);
CREATE INDEX idx_jobs_location_basic ON jobs(location);
CREATE INDEX idx_jobs_source ON jobs(source);

-- Create trigram indexes for better text search
CREATE INDEX idx_jobs_title_trgm ON jobs USING GiST (title gist_trgm_ops);
CREATE INDEX idx_jobs_description_trgm ON jobs USING GiST (description gist_trgm_ops);
CREATE INDEX idx_jobs_location_trgm ON jobs USING GiST (location gist_trgm_ops);

-- Insert some initial sample data
INSERT INTO jobs (
    title,
    company,
    location,
    experience,
    description,
    application_link,
    source,
    posted_date
) VALUES 
(
    'Senior Software Engineer',
    'Google',
    'Mountain View, CA',
    '5-8 years',
    'Join Google as a Senior Software Engineer to work on cutting-edge projects that impact billions of users.',
    'https://careers.google.com/jobs/results/',
    'linkedin',
    now() - interval '2 days'
),
(
    'Full Stack Developer',
    'Microsoft',
    'Remote',
    '3-5 years',
    'Looking for a Full Stack Developer to join our rapidly growing team. Experience with React and Node.js required.',
    'https://careers.microsoft.com/jobs/search/',
    'indeed',
    now() - interval '1 day'
),
(
    'Frontend Engineer',
    'Meta',
    'Seattle, WA',
    '2-4 years',
    'Join Meta as a Frontend Engineer to build the future of social connection. Strong JavaScript and React skills required.',
    'https://www.metacareers.com/',
    'linkedin',
    now()
);

-- Analyze tables for query optimization
ANALYZE jobs;

-- Verify setup
SELECT 
    count(*) as total_jobs,
    count(distinct source) as unique_sources,
    min(posted_date) as earliest_job,
    max(posted_date) as latest_job
FROM jobs;