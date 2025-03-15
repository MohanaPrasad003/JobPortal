import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Job, JobFilters } from '../types/job';
import { JobCrawler } from '../services/JobCrawler';
import { JobMapper } from '../utils/JobMapper';

function matchesExperience(jobExp: string, filterExp: string): boolean {
  if (!filterExp) return true;
  
  // Handle 'Fresh' case
  if (filterExp === '0') {
    return jobExp.toLowerCase().includes('fresher') || 
           jobExp.startsWith('0') || 
           jobExp.toLowerCase().includes('entry');
  }
  
  // Extract numbers from experience strings
  const jobYears = parseInt(jobExp.match(/\d+/)?.[0] || '0');
  const filterYears = parseInt(filterExp.replace('+', ''));
  
  // For '5+' type filters, job should have at least that many years
  return filterExp.includes('+') 
    ? jobYears >= filterYears 
    : jobYears === filterYears;
}

export function useJobs(filters: JobFilters = {}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const JOBS_PER_PAGE = 20;
  const MAX_JOBS = 100;

  const fetchJobs = async (pageNumber: number) => {
    try {
      console.log('🔄 Fetching jobs for page:', pageNumber, 'with filters:', filters);
      setLoading(true);
      setError(null);

      // Calculate pagination range
      const from = (pageNumber - 1) * JOBS_PER_PAGE;
      const to = from + JOBS_PER_PAGE - 1;

      // Build base query for both count and data
      let baseQuery = supabase
        .from('jobs')
        .select('*');

      // Apply filters
      if (filters.search) {
        baseQuery = baseQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.job_type) {
        baseQuery = baseQuery.eq('job_type', filters.job_type);
      }

      if (filters.source) {
        baseQuery = baseQuery.eq('source', filters.source);
      }

      // Get total count with filters
      const { count, error: countError } = await baseQuery
        .select('*', { count: 'exact', head: true })
        .limit(MAX_JOBS);

      if (countError) throw countError;
      
      setTotalCount(Math.min(count || 0, MAX_JOBS));

      // Get paginated data with filters
      const { data, error: dataError } = await baseQuery
        .order('posted_date', { ascending: false })
        .range(from, to)
        .limit(JOBS_PER_PAGE);

      if (dataError) throw dataError;

      console.log(`✅ Received ${data?.length || 0} jobs for page ${pageNumber}`);
      
      // Apply experience filter in memory since it's more complex
      let filteredJobs = data || [];
      if (filters.experience) {
        filteredJobs = filteredJobs.filter(job => 
          matchesExperience(job.experience, filters.experience!)
        );
      }

      setJobs(filteredJobs);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Error fetching jobs:', err);
      setError(`Failed to load jobs: ${errorMessage}`);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchJobs(newPage);
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    fetchJobs(1);
  }, [filters]);

  // Set up real-time updates
  useEffect(() => {
    const channel = supabase.channel('jobs-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        () => fetchJobs(page)
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [page, filters]);

  return {
    jobs,
    loading,
    error,
    page,
    setPage: handlePageChange,
    totalPages: Math.ceil(totalCount / JOBS_PER_PAGE),
    totalJobs: totalCount,
    isEmpty: !loading && jobs.length === 0,
    filters
  };
}