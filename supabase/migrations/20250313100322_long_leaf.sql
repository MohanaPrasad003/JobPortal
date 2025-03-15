/*
  # Update jobs table schema

  1. Changes
    - Rename posted_at to posted_date
    - Add safety checks for existing policy
*/

-- Drop the existing policy if it exists
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public read access" ON jobs;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Rename posted_at to posted_date if it exists
DO $$ 
BEGIN
  ALTER TABLE jobs RENAME COLUMN posted_at TO posted_date;
EXCEPTION
  WHEN undefined_column OR duplicate_column THEN
    NULL;
END $$;

-- Create the policy
CREATE POLICY "Allow public read access"
  ON jobs
  FOR SELECT
  TO public
  USING (true);