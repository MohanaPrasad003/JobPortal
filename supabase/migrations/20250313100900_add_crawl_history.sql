-- Create crawl_history table to track detailed crawl information
CREATE TABLE IF NOT EXISTS crawl_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_time TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'running', -- running, completed, failed
    total_jobs_found INTEGER DEFAULT 0,
    jobs_by_source JSONB,
    keywords_crawled TEXT[],
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE crawl_history ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users"
ON crawl_history
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow read operations for anonymous users
CREATE POLICY "Enable read for anonymous users"
ON crawl_history
FOR SELECT
TO anon
USING (true);

-- Create index for faster queries
CREATE INDEX idx_crawl_history_start_time ON crawl_history(start_time DESC);
CREATE INDEX idx_crawl_history_status ON crawl_history(status); 