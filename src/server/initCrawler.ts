import { JobCrawler } from '../services/JobCrawler';
import { supabase } from '../lib/supabase';

const KEYWORDS = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Product Manager',
  'UI/UX Designer'
];

export async function initializeCrawler() {
  try {
    console.log('🚀 Starting server initialization crawl...');
    
    // Create crawl history record
    const { data: crawlRecord, error: crawlError } = await supabase
      .from('crawl_history')
      .insert({
        status: 'running',
        start_time: new Date().toISOString(),
        keywords_crawled: KEYWORDS,
        jobs_by_source: {},
        total_jobs_found: 0
      })
      .select()
      .single();

    if (crawlError) {
      console.error('Failed to create crawl history record:', crawlError);
      // Continue anyway - don't let history recording failure stop the crawl
    }

    // First, check last crawl time from database
    const { data: lastCrawl } = await supabase
      .from('system_status')
      .select('last_crawl_time')
      .single();

    const now = new Date();
    const lastCrawlTime = lastCrawl?.last_crawl_time ? new Date(lastCrawl.last_crawl_time) : null;
    const hoursSinceLastCrawl = lastCrawlTime 
      ? (now.getTime() - lastCrawlTime.getTime()) / (1000 * 60 * 60)
      : 24;

    if (hoursSinceLastCrawl < 1) {
      console.log(`⏳ Last crawl was ${hoursSinceLastCrawl.toFixed(2)} hours ago. Skipping.`);
      
      // Update crawl history if we have a record
      if (crawlRecord) {
        await supabase
          .from('crawl_history')
          .update({
            status: 'completed',
            end_time: now.toISOString(),
            total_jobs_found: 0,
            error_message: 'Skipped - Recent crawl detected'
          })
          .eq('id', crawlRecord.id);
      }
      
      return;
    }

    const crawler = new JobCrawler();
    let totalJobs = 0;
    const jobsBySource: Record<string, number> = {};

    // Perform the crawl
    for (const keyword of KEYWORDS) {
      try {
        const jobs = await crawler.crawlJobs(keyword);
        totalJobs += jobs.length;
        
        // Update jobs by source count
        jobs.forEach(job => {
          jobsBySource[job.source] = (jobsBySource[job.source] || 0) + 1;
        });
      } catch (error) {
        console.error(`Error crawling for keyword "${keyword}":`, error);
      }
    }

    // Update crawl history if we have a record
    if (crawlRecord) {
      await supabase
        .from('crawl_history')
        .update({
          status: 'completed',
          end_time: now.toISOString(),
          total_jobs_found: totalJobs,
          jobs_by_source: jobsBySource
        })
        .eq('id', crawlRecord.id);
    }

    console.log('✅ Initialization crawl completed successfully');
  } catch (error) {
    console.error('❌ Initialization crawl failed:', error);
    throw error;
  }
}

// Add a function to get crawl history
export async function getCrawlHistory() {
  const { data, error } = await supabase
    .from('crawl_history')
    .select('*')
    .order('start_time', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Failed to fetch crawl history:', error);
    return [];
  }

  return data;
} 