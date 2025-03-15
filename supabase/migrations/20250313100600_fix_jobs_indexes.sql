-- Enable the pg_trgm extension first
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop existing indexes if any
DROP INDEX IF EXISTS idx_jobs_title;
DROP INDEX IF EXISTS idx_jobs_posted_date;
DROP INDEX IF EXISTS idx_jobs_title_gin;
DROP INDEX IF EXISTS idx_jobs_location_gin;

-- Create basic indexes
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date DESC);
CREATE INDEX idx_jobs_title_basic ON jobs(title);
CREATE INDEX idx_jobs_location_basic ON jobs(location);

-- Create trigram indexes for better text search
CREATE INDEX idx_jobs_title_trgm ON jobs USING GiST (title gist_trgm_ops);
CREATE INDEX idx_jobs_location_trgm ON jobs USING GiST (location gist_trgm_ops);

-- Analyze the table for better query planning
ANALYZE jobs; 