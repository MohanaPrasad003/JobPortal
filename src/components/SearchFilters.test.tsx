import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { SearchFilters } from './SearchFilters';

describe('SearchFilters', () => {
  const mockFilters = {
    search: '',
    location: '',
    experience: '',
  };

  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('renders all filter inputs', () => {
    render(<SearchFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />);
    
    expect(screen.getByPlaceholderText(/search job titles/i)).toBeDefined();
    expect(screen.getByRole('combobox', { name: /location/i })).toBeDefined();
    expect(screen.getByRole('combobox', { name: /experience/i })).toBeDefined();
  });

  it('calls onFilterChange when search input changes', () => {
    render(<SearchFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />);
    
    const searchInput = screen.getByPlaceholderText(/search job titles/i);
    fireEvent.change(searchInput, { target: { value: 'engineer' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockFilters,
      search: 'engineer',
    });
  });

  it('calls onFilterChange when location filter changes', () => {
    render(<SearchFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />);
    
    const locationSelect = screen.getByRole('combobox', { name: /location/i });
    fireEvent.change(locationSelect, { target: { value: 'remote' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockFilters,
      location: 'remote',
    });
  });

  it('calls onFilterChange when experience filter changes', () => {
    render(<SearchFilters filters={mockFilters} onFilterChange={mockOnFilterChange} />);
    
    const experienceSelect = screen.getByRole('combobox', { name: /experience/i });
    fireEvent.change(experienceSelect, { target: { value: '2-5' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockFilters,
      experience: '2-5',
    });
  });
});