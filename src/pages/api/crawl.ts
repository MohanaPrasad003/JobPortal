import { NextApiRequest, NextApiResponse } from 'next';
import { JobCrawler } from '../../services/JobCrawler';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const crawler = new JobCrawler();
    const jobs = await crawler.crawlJobs('software engineer');
    res.status(200).json({ success: true, jobsCount: jobs.length });
  } catch (error) {
    console.error('Crawl API error:', error);
    res.status(500).json({ error: 'Failed to start crawl' });
  }
} 