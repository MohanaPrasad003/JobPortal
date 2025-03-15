import { JobCrawlerUI } from '../components/JobCrawlerUI';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Job Crawler Dashboard</h1>
        <JobCrawlerUI />
      </main>
    </div>
  );
} 