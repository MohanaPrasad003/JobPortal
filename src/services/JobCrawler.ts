import { v4 as uuidv4 } from 'uuid';
import { Job } from '../types/job';
import { supabase } from '../lib/supabase';
import { JobMapper } from '../utils/JobMapper';
import { ReceivedJobDTO, JobDTO } from '../types/dtos';
import { SystemStatus } from '../types/system';
import { VALID_JOB_TYPES, JobType, JOB_TYPES, JOB_TYPE_CATEGORIES, isValidJobType } from '../types/job';

export class JobCrawler {
  private sources = ['linkedin', 'naukri', 'indeed', 'glassdoor'];
  private readonly JOB_LIMIT = 100;
  private readonly JOBS_PER_SOURCE = 25;
  private readonly CRAWL_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private crawlTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startCrawlSchedule();
  }

  private async startCrawlSchedule(): Promise<void> {
    try {
      // Check if we already have jobs
      const currentCount = await this.getCurrentJobCount();
      
      if (currentCount < this.JOB_LIMIT) {
        console.log(`Starting initial crawl (current jobs: ${currentCount})`);
        await this.scheduledCrawl();
      } else {
        console.log(`Job limit already reached (${currentCount}/${this.JOB_LIMIT})`);
      }

      // Schedule future crawls
      this.crawlTimer = setInterval(async () => {
        const count = await this.getCurrentJobCount();
        if (count < this.JOB_LIMIT) {
          await this.scheduledCrawl();
        } else {
          console.log(`Skipping scheduled crawl - job limit reached (${count}/${this.JOB_LIMIT})`);
        }
      }, this.CRAWL_INTERVAL);

    } catch (error) {
      console.error('Failed to start crawl schedule:', error);
    }
  }

  private async scheduledCrawl(): Promise<void> {
    try {
      console.log('\n=== Starting Scheduled Crawl ===');
      const startTime = new Date();
      
      await this.crawlJobs('software engineer');
      
      const duration = (new Date().getTime() - startTime.getTime()) / 1000;
      console.log(`Scheduled crawl completed in ${duration.toFixed(2)} seconds`);
    } catch (error) {
      console.error('Scheduled crawl failed:', error);
    }
  }

  stopCrawlSchedule(): void {
    if (this.crawlTimer) {
      clearInterval(this.crawlTimer);
      this.crawlTimer = null;
      console.log('Crawl schedule stopped');
    }
  }

  private async getCurrentJobCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting job count:', error);
      return 0;
    }
  }

  private companies = {
    tech: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Uber', 'Airbnb'],
    india: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant', 'Accenture'],
    startups: ['Stripe', 'Notion', 'Figma', 'Canva', 'Databricks', 'Snowflake']
  };

  private locations = {
    us: ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA'],
    india: ['Bangalore', 'Hyderabad', 'Mumbai', 'Pune', 'Delhi NCR'],
    remote: ['Remote', 'Remote - US', 'Remote - India', 'Remote - Global']
  };

  private generateDescription(keyword: string, company: string): string {
    const descriptions = [
      `Exciting opportunity for a ${keyword} at ${company}. Join our team and work on cutting-edge projects that impact millions of users.`,
      `${company} is seeking a talented ${keyword} to join our rapidly growing team. Work with latest technologies.`,
      `Join ${company} as a ${keyword} and help build the future of technology. Competitive salary and benefits.`,
      `${company} is hiring a ${keyword} to lead critical projects and drive technical excellence.`
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private generateExperience(): string {
    const experiences = [
      '0-1 years',
      '1-3 years',
      '2-4 years',
      '3-5 years',
      '5-7 years',
      '7-10 years',
      '10+ years',
      '15+ years'
    ];
    return experiences[Math.floor(Math.random() * experiences.length)];
  }

  private generateJobId(source: string, company: string, title: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${source}-${company}-${title}-${timestamp}-${randomSuffix}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
  }

  private generateJobType(): JobType {
    const categories = Object.keys(JOB_TYPE_CATEGORIES) as Array<keyof typeof JOB_TYPE_CATEGORIES>;
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    const typesInCategory = JOB_TYPE_CATEGORIES[selectedCategory];
    const selectedType = typesInCategory[Math.floor(Math.random() * typesInCategory.length)];
    
    if (!isValidJobType(selectedType)) {
      return JOB_TYPES.FULL_TIME; // fallback
    }
    
    return selectedType;
  }

  private getRandomCompany(): string {
    const companyType = Math.random() > 0.5 ? 'tech' : (Math.random() > 0.5 ? 'india' : 'startups');
    return this.companies[companyType][Math.floor(Math.random() * this.companies[companyType].length)];
  }

  private generateTitle(keyword: string): string {
    const titles = [
      keyword,
      `Senior ${keyword}`,
      `Lead ${keyword}`,
      `${keyword} Manager`,
      `Principal ${keyword}`
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  private generateRecentDate(): string {
    const timestamp = Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000;
    return new Date(timestamp).toISOString();
  }

  private async clearExistingJobs(): Promise<void> {
    try {
      console.log('Starting to clear existing jobs...');
      
      // First, get count of existing jobs
      const { count: beforeCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });
      
      console.log(`Found ${beforeCount} existing jobs`);

      // Delete all jobs using a safer approach
      const { error } = await supabase
        .from('jobs')
        .delete()
        .not('id', 'is', null); // Delete all jobs with non-null IDs

      if (error) {
        console.error('Error during deletion:', error);
        throw error;
      }

      // Verify deletion
      const { count: afterCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });
      
      console.log(`After deletion: ${afterCount} jobs remaining`);
      
    } catch (error) {
      console.error('Failed to clear jobs:', error);
      throw error;
    }
  }

  private async updateSystemStatus(totalJobs: number): Promise<void> {
    try {
      // First, verify the system_status table exists
      const { error: tableError } = await supabase
        .from('system_status')
        .select('id')
        .limit(1);

      if (tableError) {
        console.error('System status table check failed:', tableError);
        throw tableError;
      }

      const systemStatus: SystemStatus = {
        id: uuidv4(),
        last_crawl_time: new Date().toISOString(),
        total_jobs_last_crawl: totalJobs
      };

      // Insert new status
      const { error: insertError } = await supabase
        .from('system_status')
        .insert([systemStatus]);

      if (insertError) {
        console.error('Failed to update system status:', insertError);
        throw insertError;
      }

      console.log('System status updated successfully:', {
        time: systemStatus.last_crawl_time,
        jobs: systemStatus.total_jobs_last_crawl
      });

    } catch (error) {
      console.error('System status update failed:', error);
      // Don't throw the error - we don't want to fail the whole crawl if status update fails
      console.warn('Continuing despite system status update failure');
    }
  }

  async crawlJobs(keyword: string): Promise<Job[]> {
    const startTime = new Date();
    let totalJobs = 0;

    try {
      // Check current job count
      const currentCount = await this.getCurrentJobCount();
      if (currentCount >= this.JOB_LIMIT) {
        console.log(`Job limit reached (${currentCount}/${this.JOB_LIMIT}). Skipping crawl.`);
        return [];
      }

      const remainingSlots = this.JOB_LIMIT - currentCount;
      console.log(`Starting crawl (${remainingSlots} slots available)`);

      // Clear existing jobs if we're starting fresh
      if (currentCount === 0) {
        await this.clearExistingJobs();
      }

      const allJobs: JobDTO[] = [];
      const jobsPerSource = Math.min(
        this.JOBS_PER_SOURCE,
        Math.ceil(remainingSlots / this.sources.length)
      );

      // Crawl jobs from each source
      for (const source of this.sources) {
        if (allJobs.length >= remainingSlots) {
          console.log('Remaining slots filled. Stopping crawl.');
          break;
        }

        const sourceJobs = await this.simulateJobsForSource(
          source,
          keyword,
          Math.min(jobsPerSource, remainingSlots - allJobs.length)
        );
        allJobs.push(...sourceJobs);
      }

      // Save jobs and update status
      if (allJobs.length > 0) {
        await this.saveJobs(allJobs);
        await this.updateSystemStatus(allJobs.length);
      }

      const duration = (new Date().getTime() - startTime.getTime()) / 1000;
      console.log(`\nCrawl completed in ${duration.toFixed(2)} seconds`);
      console.log(`Jobs added: ${allJobs.length}`);
      console.log(`Total jobs: ${currentCount + allJobs.length}/${this.JOB_LIMIT}`);

      return allJobs;
    } catch (error) {
      console.error('Crawl failed:', error);
      await this.updateSystemStatus(totalJobs);
      throw error;
    }
  }

  private async simulateJobsForSource(
    source: string, 
    keyword: string, 
    limit: number
  ): Promise<JobDTO[]> {
    const jobs: ReceivedJobDTO[] = [];

    for (let i = 0; i < limit; i++) {
      const company = this.getRandomCompany();
      const title = this.generateTitle(keyword);
      const receivedJob: ReceivedJobDTO = {
        id: uuidv4(),
        title,
        company,
        job_type: this.generateJobType(),
        experience: this.generateExperience(),
        application_link: `https://${source}.com/jobs/${company.toLowerCase().replace(/\s+/g, '-')}`,
        description: this.generateDescription(keyword, company),
        source,
        posted_date: this.generateRecentDate(),
      };
      jobs.push(receivedJob);
    }

    return jobs.map(job => JobMapper.toJobDTO(job));
  }

  private async saveJobs(jobs: JobDTO[]): Promise<void> {
    try {
      const batchSize = 50;
      const totalBatches = Math.ceil(jobs.length / batchSize);
      
      console.log(`Saving ${jobs.length} jobs in ${totalBatches} batches...`);

      for (let i = 0; i < jobs.length; i += batchSize) {
        const batch = jobs.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        
        console.log(`Processing batch ${batchNumber}/${totalBatches}...`);

        const { error } = await supabase
          .from('jobs')
          .upsert(batch, {
            onConflict: 'id',
            ignoreDuplicates: false
          });

        if (error) {
          console.error(`Error in batch ${batchNumber}:`, error);
          throw error;
        }

        console.log(`Batch ${batchNumber} saved successfully`);
      }
    } catch (error) {
      console.error('Failed to save jobs:', error);
      throw error;
    }
  }
} 