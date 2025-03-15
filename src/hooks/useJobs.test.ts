import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useJobs } from './useJobs';
import { supabase } from '../lib/supabase';

// Mock Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          range: vi.fn(() => ({
            ilike: vi.fn(),
            eq: vi.fn(),
          })),
        })),
      })),
    })),
  },
}));

describe('useJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty jobs array and loading state', () => {
    const { result } = renderHook(() => useJobs({}));
    
    expect(result.current.jobs).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should update jobs when filters change', async () => {
    const mockJobs = [
      {
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
      },
    ];

    const mockSupabaseQuery = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: mockJobs, error: null }),
    };

    vi.mocked(supabase.from).mockImplementation(() => mockSupabaseQuery as any);

    const { result } = renderHook(() => useJobs({ search: 'engineer' }));

    // Wait for the hook to update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.jobs).toEqual(mockJobs);
    expect(result.current.loading).toBe(false);
  });

  it('should handle errors', async () => {
    const mockError = new Error('Failed to fetch');
    const mockSupabaseQuery = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    };

    vi.mocked(supabase.from).mockImplementation(() => mockSupabaseQuery as any);

    const { result } = renderHook(() => useJobs({}));

    // Wait for the hook to update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe(mockError.message);
    expect(result.current.loading).toBe(false);
  });
});