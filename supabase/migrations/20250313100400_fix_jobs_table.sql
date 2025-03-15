-- Drop existing table and policies
DROP TABLE IF EXISTS jobs CASCADE;

-- Create jobs table with correct schema
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  experience text NOT NULL,
  description text NOT NULL,
  application_link text NOT NULL,
  source text NOT NULL,
  posted_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create read policy
CREATE POLICY "Allow public read access"
  ON jobs
  FOR SELECT
  TO public
  USING (true);

-- Create insert policy for authenticated users
CREATE POLICY "Enable insert for authenticated users only"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_jobs_title ON jobs USING gin(to_tsvector('english', title));
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date DESC);

-- Insert sample data
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
  'TechCorp',
  'Remote',
  '5+ years',
  'Exciting role for a senior engineer...',
  'https://example.com/job1',
  'linkedin',
  now()
); 