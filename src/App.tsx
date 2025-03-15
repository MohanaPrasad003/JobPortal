import React, { useState, useEffect } from 'react';
import { Briefcase as BriefcaseSearch } from 'lucide-react';
import { JobCard } from './components/JobCard';
import { SearchFilters } from './components/SearchFilters';
import { JobFilters } from './types/job';
import { useJobs } from './hooks/useJobs';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { useBackgroundCrawler } from './hooks/useBackgroundCrawler';
import { Pagination } from './components/Pagination';
import { DebugView } from './components/DebugView';
import { CrawlHistory } from './components/CrawlHistory';
import { JobDescription } from './components/JobDescription';

interface ApplicationState {
  [jobId: string]: {
    id: string;
    resume_url: string;
  } | null;
}

function App() {
  const [filters, setFilters] = useState<JobFilters>({});
  const { 
    jobs, 
    loading, 
    error, 
    page, 
    setPage, 
    totalPages, 
    totalJobs 
  } = useJobs(filters);
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<ApplicationState>({});
  
  // Start background crawler
  useBackgroundCrawler();

  const handleApplicationUpdate = (jobId: string, applicationData: { id: string; resume_url: string; } | null) => {
    setApplications(prev => ({
      ...prev,
      [jobId]: applicationData
    }));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Jobs</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Loading Jobs...</h2>
          <p className="text-gray-600">Please wait while we fetch the latest jobs.</p>
        </div>
      </div>
    );
  }

  if (selectedJob) {
    return (
      <JobDescription 
        job={selectedJob} 
        onClose={() => setSelectedJob(null)}
        applicationData={applications[selectedJob.id]}
        onApplicationUpdate={handleApplicationUpdate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BriefcaseSearch className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">JobBoard</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchFilters filters={filters} onFilterChange={setFilters} />
        
        <div className="mt-4 text-gray-600">
          Found {totalJobs} jobs
        </div>
        
        <div className="mt-8">
          {error && (
            <div className="text-center text-red-600 mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-4">Loading jobs...</div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {jobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onSelect={setSelectedJob}
                    applicationData={applications[job.id]}
                    onApplicationUpdate={handleApplicationUpdate}
                  />
                ))}
              </div>

              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No jobs found matching your criteria.</p>
                </div>
              ) : (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>

        {/* Add Crawl History */}
        <CrawlHistory />
      </main>
    </div>
  );
}

export default App;