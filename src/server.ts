import express from 'express';
import { JobCrawler } from './services/JobCrawler';
import { supabase } from './lib/supabase';

const app = express();
const port = process.env.PORT || 3000;

// Initialize crawler
const crawler = new JobCrawler();

// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Add crawler status endpoint
app.get('/crawler/status', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('system_status')
      .select('*')
      .order('last_crawl_time', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get crawler status' });
  }
});

// Graceful shutdown
const shutdown = () => {
  console.log('\nShutting down...');
  crawler.stopCrawlSchedule();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 