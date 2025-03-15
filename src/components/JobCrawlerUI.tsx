import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { SystemStatus } from '../types/system';
import { Job, JobFilters } from '../types/job';
import { useJobs } from '../hooks/useJobs';

export function JobCrawlerUI() {
  const [filters, setFilters] = useState<JobFilters>({});
  const { 
    jobs, 
    loading, 
    error, 
    page, 
    setPage, 
    totalPages,
    totalJobs,
    isEmpty 
  } = useJobs(filters);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log('🎨 Rendering JobCrawlerUI:', { 
    totalJobs, 
    loading, 
    error, 
    isEmpty 
  });

  useEffect(() => {
    loadStatus();

    // Set up real-time subscription
    const channel = supabase.channel('jobs-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        (payload) => {
          console.log('Jobs table changed:', payload);
          refetch(); // Reload jobs when changes occur
        }
      )
      .subscribe();

    // Poll for status updates every 30 seconds
    const statusInterval = setInterval(loadStatus, 30000);

    // Cleanup
    return () => {
      channel.unsubscribe();
      clearInterval(statusInterval);
    };
  }, [refetch]);

  const loadStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('system_status')
        .select('*')
        .order('last_crawl_time', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setStatus(data);
    } catch (err) {
      console.error('Error loading status:', err);
    }
  };

  const handleManualCrawl = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/crawl', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Crawl request failed');
      }

      // Wait for crawl to complete and reload data
      await loadStatus();
      await refetch();
    } catch (err) {
      setError('Failed to start crawl');
      console.error('Crawl error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add filter handlers
  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const handleJobTypeFilter = (job_type: string) => {
    setFilters(prev => ({ ...prev, job_type }));
  };

  const handleExperienceFilter = (experience: string) => {
    setFilters(prev => ({ ...prev, experience }));
  };

  const handleSourceFilter = (source: string) => {
    setFilters(prev => ({ ...prev, source }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg">Loading jobs...</p>
        <p className="text-sm text-gray-500">Please wait while we fetch the data</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p className="text-lg">Error loading jobs</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={refetch}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg">No jobs found</p>
        <p className="text-sm text-gray-500">Try starting a new crawl</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Add filter controls */}
      <div className="mb-4 bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search jobs..."
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className="border rounded p-2"
          />
          {/* Add other filter controls */}
        </div>
        {Object.keys(filters).length > 0 && (
          <button
            onClick={clearFilters}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Job Crawler Status</h2>
          <button
            onClick={handleManualCrawl}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Crawling...' : 'Start Crawl'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {status && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-gray-600">Last Crawl</div>
              <div>{new Date(status.last_crawl_time).toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-gray-600">Jobs Found</div>
              <div>{status.total_jobs_last_crawl}</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Recent Jobs</h3>
            <p className="text-sm text-gray-600">
              {isLoading ? 'Loading...' : 
                `Showing ${jobs.length} of ${totalJobs} jobs (Page ${page} of ${totalPages})`
              }
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 text-red-600">
            {error}
          </div>
        )}

        {!isLoading && jobs.length === 0 ? (
          <div className="p-4 text-gray-500">
            No jobs found. Try starting a crawl.
          </div>
        ) : (
          <>
            <div className="divide-y">
              {jobs.map(job => (
                <div key={job.id} className="p-4 hover:bg-gray-50">
                  <pre className="text-xs text-gray-500 mb-2">
                    {JSON.stringify(job, null, 2)}
                  </pre>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{job.title}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(job.posted_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {job.company}
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      {job.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t flex justify-between items-center">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || loading}
                className={`px-4 py-2 rounded ${
                  page === 1 || loading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || loading}
                className={`px-4 py-2 rounded ${
                  page === totalPages || loading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 