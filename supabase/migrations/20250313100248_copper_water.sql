/*
  # Create jobs table and security policies

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `company` (text)
      - `location` (text)
      - `experience` (text)
      - `description` (text)
      - `application_link` (text)
      - `source` (text)
      - `posted_date` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `jobs` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS jobs (
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

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON jobs
  FOR SELECT
  TO public
  USING (true);