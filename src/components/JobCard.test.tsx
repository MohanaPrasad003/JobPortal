import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { JobCard } from './JobCard';

describe('JobCard', () => {
  const mockJob = {
    id: '1',
    title: 'Software Engineer',
    company: 'Tech Corp',
    location: 'Remote',
    experience: '2-5 years',
    description: 'Great job opportunity',
    application_link: 'https://example.com',
    source: 'LinkedIn',
    posted_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  it('renders job details correctly', () => {
    render(<JobCard job={mockJob} />);
    
    expect(screen.getByText(mockJob.title)).toBeInTheDocument();
    expect(screen.getByText(mockJob.company)).toBeInTheDocument();
    expect(screen.getByText(mockJob.location)).toBeInTheDocument();
    expect(screen.getByText(mockJob.experience)).toBeInTheDocument();
    expect(screen.getByText(mockJob.description)).toBeInTheDocument();
  });

  it('includes application link', () => {
    render(<JobCard job={mockJob} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', mockJob.application_link);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});