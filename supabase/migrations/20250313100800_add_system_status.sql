-- Create system_status table to track crawler state
CREATE TABLE IF NOT EXISTS system_status (
    id TEXT PRIMARY KEY,
    last_crawl_time TIMESTAMPTZ,
    total_jobs_last_crawl INTEGER,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE system_status ENABLE ROW LEVEL SECURITY;

-- Allow read access to public
CREATE POLICY "Allow public read access to system status"
    ON system_status
    FOR SELECT
    TO public
    USING (true);

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated update to system status"
    ON system_status
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert to system status"
    ON system_status
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Insert initial record
INSERT INTO system_status (id, last_crawl_time, total_jobs_last_crawl)
VALUES ('crawler', null, 0)
ON CONFLICT (id) DO NOTHING; 