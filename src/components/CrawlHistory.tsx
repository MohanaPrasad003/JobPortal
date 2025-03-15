import React, { useEffect, useState } from 'react';
import { getCrawlHistory } from '../server/initCrawler';

interface CrawlRecord {
  id: string;
  start_time: string;
  end_time: string | null;
  status: 'running' | 'completed' | 'failed';
  total_jobs_found: number;
  jobs_by_source: Record<string, number>;
  keywords_crawled: string[];
  error_message: string | null;
}

export function CrawlHistory() {
  const [history, setHistory] = useState<CrawlRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      const data = await getCrawlHistory();
      setHistory(data);
      setLoading(false);
    };

    loadHistory();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading crawl history...</div>;
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Crawl History</h2>
      <div className="space-y-4">
        {history.map(record => (
          <div key={record.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <span className={`inline-block px-2 py-1 rounded text-sm ${
                  record.status === 'completed' ? 'bg-green-100 text-green-800' :
                  record.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {record.status}
                </span>
                <p className="mt-2 text-sm text-gray-600">
                  Started: {new Date(record.start_time).toLocaleString()}
                </p>
                {record.end_time && (
                  <p className="text-sm text-gray-600">
                    Ended: {new Date(record.end_time).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">{record.total_jobs_found} jobs found</p>
              </div>
            </div>
            {record.jobs_by_source && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Jobs by Source:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(record.jobs_by_source).map(([source, count]) => (
                    <div key={source} className="text-sm">
                      {source}: {count} jobs
                    </div>
                  ))}
                </div>
              </div>
            )}
            {record.error_message && (
              <p className="mt-2 text-sm text-red-600">{record.error_message}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 