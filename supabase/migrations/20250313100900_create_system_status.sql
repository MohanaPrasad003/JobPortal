-- Drop existing table if it exists
DROP TABLE IF EXISTS system_status;

-- Create system_status table with proper constraints
CREATE TABLE system_status (
  -- Allow both UUID and string IDs
  id TEXT PRIMARY KEY,
  last_crawl_time TIMESTAMPTZ NOT NULL,
  total_jobs_last_crawl INTEGER NOT NULL CHECK (total_jobs_last_crawl >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX idx_system_status_last_crawl ON system_status(last_crawl_time DESC);
CREATE INDEX idx_system_status_total_jobs ON system_status(total_jobs_last_crawl);

-- Enable RLS
ALTER TABLE system_status ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow read access to everyone"
ON system_status FOR SELECT
TO public
USING (true);

-- Allow insert for authenticated users
CREATE POLICY "Allow insert for authenticated users"
ON system_status FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add function to clean old status entries (keep last 100)
CREATE OR REPLACE FUNCTION clean_old_system_status() RETURNS trigger AS $$
BEGIN
  -- Don't delete the fixed 'crawler' status record
  DELETE FROM system_status
  WHERE id != 'crawler'
  AND id IN (
    SELECT id FROM system_status
    WHERE id != 'crawler'
    ORDER BY last_crawl_time DESC
    OFFSET 100
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to clean old entries
CREATE TRIGGER clean_system_status_trigger
AFTER INSERT ON system_status
FOR EACH ROW
EXECUTE FUNCTION clean_old_system_status(); 