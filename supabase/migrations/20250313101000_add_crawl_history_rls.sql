-- Enable RLS for crawl_history table
ALTER TABLE crawl_history ENABLE ROW LEVEL SECURITY;

-- Allow insert access to authenticated users
CREATE POLICY "Allow insert access to crawl_history"
ON crawl_history
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow read access to everyone
CREATE POLICY "Allow read access to crawl_history"
ON crawl_history
FOR SELECT
TO public
USING (true);

-- Allow update access to authenticated users
CREATE POLICY "Allow update access to crawl_history"
ON crawl_history
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_crawl_history_status ON crawl_history(status);
CREATE INDEX IF NOT EXISTS idx_crawl_history_start_time ON crawl_history(start_time DESC); 