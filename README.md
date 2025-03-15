Let me explain the complete workflow and technical implementation:

Core Functionality: The Job Crawler application is a full-stack system that:
Scrapes job listings from multiple sources
Stores them in a PostgreSQL database via Supabase
Provides a React-based UI for viewing/applying to jobs
Manages applications with resume uploads
Key Components & Flow:
A. Crawling System (Backend):

Triggered via /api/crawl endpoint (Next.js API route)
Uses JobCrawler service class
Scrapes job listings for "software engineer" position
Stores results in Supabase database
Updates system status table with crawl metrics
B. Database Layer:

PostgreSQL tables via Supabase:
jobs: Stores scraped job listings
applications: Tracks user applications
system_status: Maintains crawl history/metrics
C. Frontend UI Components:

JobCrawlerUI (Main Dashboard):

Displays real-time job listings
Shows crawl system status
Pagination controls
Search/filter functionality
Manual crawl trigger
JobCard (Individual Listing):

Displays job details
Handles application process
Resume upload capability
Application status tracking
ApplyModal:

Handles resume file upload
Integrates with Supabase Storage
Shows upload progress/status
Technical Implementation Details:
A. State Management:

Uses React hooks (useState, useEffect)
Custom hooks (useJobs) for data fetching
Real-time updates via Supabase subscriptions
B. File Upload Flow:

User selects resume file in ApplyModal
File uploaded to Supabase Storage bucket "resumes"
File stored with path: public/<job_id>/<timestamp>.<ext>
Public URL generated for resume
Application record created in database
C. Error Handling:

Global error boundaries
Error states in UI components
Database transaction rollbacks
Storage cleanup on failed uploads
Development Setup:
cd project  # The React app is in the project subdirectory
npm install
npm run dev
Key Dependencies:
Frontend: React, TypeScript, Tailwind CSS
Backend: Next.js API routes
Database: Supabase (PostgreSQL)
Storage: Supabase Storage
UI: Lucide React Icons
