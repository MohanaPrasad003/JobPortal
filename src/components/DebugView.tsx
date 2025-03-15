import React from 'react';
import { Job } from '../types/job';

interface DebugViewProps {
  jobs: Job[];
}

export function DebugView({ jobs }: DebugViewProps) {
  // Group jobs by source
  const jobsBySource = jobs.reduce((acc, job) => {
    if (!acc[job.source]) {
      acc[job.source] = [];
    }
    acc[job.source].push(job);
    return acc;
  }, {} as Record<string, Job[]>);

  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Debug View - Jobs by Source</h2>
      {Object.entries(jobsBySource).map(([source, sourceJobs]) => (
        <div key={source} className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-600">
            {source} ({sourceJobs.length} jobs)
          </h3>
          <pre className="bg-white p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(sourceJobs, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
} 