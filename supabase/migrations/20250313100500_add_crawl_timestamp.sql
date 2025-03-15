-- Add last_crawl_at column to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS last_crawl_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for last_crawl_at
CREATE INDEX IF NOT EXISTS idx_jobs_last_crawl 
ON jobs(last_crawl_at DESC); 