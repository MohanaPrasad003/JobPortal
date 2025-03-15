-- Create ENUM type for job types
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_type_enum') THEN
    CREATE TYPE job_type_enum AS ENUM (
      'full_time',
      'part_time',
      'contract',
      'remote',
      'onsite',
      'hybrid',
      'unknown'  -- Add unknown type for handling invalid values
    );
  END IF;
END $$;

-- Drop existing table and recreate with ENUM type
DROP TABLE IF EXISTS jobs;

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  job_type job_type_enum DEFAULT 'unknown',  -- Allow null by removing NOT NULL
  experience TEXT NOT NULL,
  description TEXT NOT NULL,
  application_link TEXT NOT NULL,
  source TEXT NOT NULL,
  posted_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date DESC);

-- Update any invalid job types to 'unknown'
UPDATE jobs 
SET job_type = 'unknown'::job_type_enum 
WHERE job_type::text NOT IN (
  'full_time', 'part_time', 'contract', 'remote', 'onsite', 'hybrid'
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow read access to everyone"
ON jobs FOR SELECT
TO public
USING (true);

-- Allow insert/update for authenticated users
CREATE POLICY "Allow insert for authenticated users"
ON jobs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add job_type column if it doesn't exist
DO $$ 
BEGIN 
    -- Only add job_type if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'job_type'
    ) THEN
        ALTER TABLE jobs 
        ADD COLUMN job_type job_type_enum NOT NULL DEFAULT 'full_time';
    END IF;
END $$;

-- Create index for job_type if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);

-- Add not null constraint to job_type
ALTER TABLE jobs 
ALTER COLUMN job_type SET NOT NULL,
ALTER COLUMN job_type SET DEFAULT 'full_time';

-- Update any null values to 'full_time'
UPDATE jobs 
SET job_type = 'full_time'::job_type_enum 
WHERE job_type IS NULL;

-- Update job_type constraint to match all valid types
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS job_type_check;
ALTER TABLE jobs ADD CONSTRAINT job_type_check 
  CHECK (job_type IN ('full_time', 'part_time', 'contract', 'remote', 'onsite', 'hybrid'));

-- Set default value
ALTER TABLE jobs ALTER COLUMN job_type SET DEFAULT 'full_time';

-- Update any existing invalid values
UPDATE jobs 
SET job_type = 'full_time'::job_type_enum 
WHERE job_type::text NOT IN ('full_time', 'part_time', 'contract', 'remote', 'onsite', 'hybrid');

-- Make sure public read access is enabled for jobs table
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to jobs
CREATE POLICY "Allow public read access to jobs"
ON jobs FOR SELECT
TO public
USING (true);

-- Enable real-time for jobs table
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;

-- Enable real-time for specific columns (optional)
ALTER TABLE jobs REPLICA IDENTITY FULL; 