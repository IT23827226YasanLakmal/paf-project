import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResourceCard from './ResourceCard';

describe('ResourceCard Component', () => {
  const mockResource = {
    id: 1,
    name: 'Test Resource',
    type: 'LAB',
    capacity: 30,
    status: 'ACTIVE',
    location: 'Building A',
    availabilityWindows: '08:00 - 17:00'
  };

  const mockOnStatusUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  it('renders resource details correctly', () => {
    render(
      <ResourceCard 
        resource={mockResource} 
        onStatusUpdate={mockOnStatusUpdate} 
        onDelete={mockOnDelete} 
      />
    );

    expect(screen.getByText('Test Resource')).toBeInTheDocument();
    expect(screen.getByText('LAB')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('Capacity: 30')).toBeInTheDocument();
  });

  it('calls onStatusUpdate when toggle button is clicked', () => {
    render(
      <ResourceCard 
        resource={mockResource} 
        onStatusUpdate={mockOnStatusUpdate} 
        onDelete={mockOnDelete} 
      />
    );

    const toggleButton = screen.getByText('Toggle Status');
    fireEvent.click(toggleButton);

    expect(mockOnStatusUpdate).toHaveBeenCalledWith(1, 'OUT_OF_SERVICE');
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <ResourceCard 
        resource={mockResource} 
        onStatusUpdate={mockOnStatusUpdate} 
        onDelete={mockOnDelete} 
      />
    );

    // Lucide icons are often rendered as SVG, so we target the button by its role or container
    // The delete button is the second button in the list
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons[1];
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });
});
