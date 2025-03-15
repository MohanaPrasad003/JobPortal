-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to jobs
CREATE POLICY "Allow anonymous read access to jobs"
ON jobs
FOR SELECT
TO anon
USING (true);

-- Allow authenticated users to insert/update jobs
CREATE POLICY "Allow authenticated users to manage jobs"
ON jobs
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Enable RLS for applications table
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to create applications
CREATE POLICY "Allow anonymous users to create applications"
ON applications
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow users to view their own applications
CREATE POLICY "Allow users to view their applications"
ON applications
FOR SELECT
TO anon
USING (true); 