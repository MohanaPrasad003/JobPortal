import { supabase } from '../lib/supabase';
import { JobCrawler } from './JobCrawler';
import { v4 as uuidv4 } from 'uuid';

const INITIAL_KEYWORDS = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Product Manager',
  'UI/UX Designer'
];

export class InitializationService {
  private crawler: JobCrawler;

  constructor() {
    this.crawler = new JobCrawler();
  }

  async initialize() {
    try {
      console.log('Starting initialization...');
      
      // Clear all existing data
      await this.clearDatabase();
      
      // Perform initial crawl
      await this.performInitialCrawl();
      
      console.log('Initialization completed successfully');
    } catch (error) {
      console.error('Initialization failed:', error);
      throw error;
    }
  }

  private async clearDatabase() {
    try {
      console.log('Clearing database...');
      
      // Delete all jobs - don't use dummy check
      const { error: jobsError } = await supabase
        .from('jobs')
        .delete()
        .not('id', 'is', null);  // Delete all records
        
      if (jobsError) throw jobsError;
      
      // Delete all applications - don't use dummy check
      const { error: appsError } = await supabase
        .from('applications')
        .delete()
        .not('id', 'is', null);  // Delete all records
        
      if (appsError) throw appsError;
      
      console.log('Database cleared');
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }

  private async performInitialCrawl() {
    try {
      console.log('Starting initial crawl...');
      
      for (const keyword of INITIAL_KEYWORDS) {
        console.log(`Crawling for keyword: ${keyword}`);
        const jobs = await this.crawler.crawlJobs(keyword);
        if (jobs.length > 0) {
          await this.crawler.saveJobs(jobs);
        }
      }
      
      const totalJobs = await this.getTotalJobCount();
      console.log(`Total jobs after crawl: ${totalJobs}`);

      // Update last crawl time
      const { error: updateError } = await supabase
        .from('system_status')
        .upsert([{
          id: uuidv4(),
          last_crawl_time: new Date().toISOString(),
          total_jobs_last_crawl: totalJobs
        }]);
        
      if (updateError) throw updateError;
      
      console.log('Initial crawl completed');
    } catch (error) {
      console.error('Error during initial crawl:', error);
      throw error;
    }
  }

  private async getTotalJobCount(): Promise<number> {
    const { count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact' });
    return count || 0;
  }
} 