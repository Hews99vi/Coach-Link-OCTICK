import React from 'react';
import { render, screen } from '@testing-library/react';
import StatsCards from '../StatsCards';

describe('StatsCards Component', () => {
  const mockAnalytics = {
    statusCounts: [
      { status: 'pending', count: 5 },
      { status: 'approved', count: 3 },
      { status: 'scheduled', count: 2 },
      { status: 'completed', count: 10 }
    ]
  };

  it('renders without crashing', () => {
    render(
      <StatsCards 
        totalCount={20}
        analytics={mockAnalytics}
        userRole="coordinator"
      />
    );
  });

  it('displays total count correctly', () => {
    render(
      <StatsCards 
        totalCount={20}
        analytics={mockAnalytics}
        userRole="coordinator"
      />
    );

    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Total Requests')).toBeInTheDocument();
  });

  it('displays status counts correctly', () => {
    render(
      <StatsCards 
        totalCount={20}
        analytics={mockAnalytics}
        userRole="coordinator"
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument(); // Pending
    expect(screen.getByText('3')).toBeInTheDocument(); // Approved
    expect(screen.getByText('2')).toBeInTheDocument(); // Scheduled
    expect(screen.getByText('10')).toBeInTheDocument(); // Completed
  });

  it('displays user role', () => {
    render(
      <StatsCards 
        totalCount={20}
        analytics={mockAnalytics}
        userRole="coordinator"
      />
    );

    expect(screen.getByText('coordinator')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
  });

  it('shows 0 for missing status counts', () => {
    const partialAnalytics = {
      statusCounts: [
        { status: 'pending', count: 5 }
      ]
    };

    render(
      <StatsCards 
        totalCount={5}
        analytics={partialAnalytics}
        userRole="viewer"
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument(); // Pending
    expect(screen.getAllByText('0').length).toBeGreaterThan(0); // Others should be 0
  });

  it('handles null analytics gracefully', () => {
    render(
      <StatsCards 
        totalCount={0}
        analytics={null}
        userRole="viewer"
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Total Requests')).toBeInTheDocument();
  });

  it('renders all stat cards', () => {
    render(
      <StatsCards 
        totalCount={20}
        analytics={mockAnalytics}
        userRole="coordinator"
      />
    );

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});
