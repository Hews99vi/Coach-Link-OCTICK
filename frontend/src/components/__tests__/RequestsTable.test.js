import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RequestsTable from '../RequestsTable';

describe('RequestsTable Component', () => {
  const mockRequests = [
    {
      id: 1,
      customer_name: 'John Doe',
      phone: '555-1234',
      pickup_location: 'Downtown',
      dropoff_location: 'Airport',
      pickup_time: '2025-10-30T10:00:00',
      passengers: 2,
      status: 'pending',
      assignment: null
    },
    {
      id: 2,
      customer_name: 'Jane Smith',
      phone: '555-5678',
      pickup_location: 'Hotel',
      dropoff_location: 'Convention Center',
      pickup_time: '2025-10-31T14:00:00',
      passengers: 4,
      status: 'scheduled',
      assignment: {
        driver: { name: 'Mike Driver' },
        vehicle: { license_plate: 'ABC-123' },
        scheduled_time: '2025-10-31T14:00:00'
      }
    }
  ];

  const mockHandlers = {
    onStatusUpdate: jest.fn(),
    onSchedule: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <RequestsTable
        requests={mockRequests}
        loading={false}
        isCoordinator={true}
        {...mockHandlers}
      />
    );
  });

  it('displays loading state', () => {
    render(
      <RequestsTable
        requests={[]}
        loading={true}
        isCoordinator={true}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Loading requests...')).toBeInTheDocument();
  });

  it('displays empty state when no requests', () => {
    render(
      <RequestsTable
        requests={[]}
        loading={false}
        isCoordinator={true}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('No Requests Found')).toBeInTheDocument();
  });

  it('displays request data correctly', () => {
    render(
      <RequestsTable
        requests={mockRequests}
        loading={false}
        isCoordinator={true}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('555-1234')).toBeInTheDocument();
    expect(screen.getByText('Downtown')).toBeInTheDocument();
    expect(screen.getByText('Airport')).toBeInTheDocument();
  });

  it('displays status badges', () => {
    render(
      <RequestsTable
        requests={mockRequests}
        loading={false}
        isCoordinator={true}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('displays driver/vehicle info for scheduled requests', () => {
    render(
      <RequestsTable
        requests={mockRequests}
        loading={false}
        isCoordinator={true}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Mike Driver')).toBeInTheDocument();
    expect(screen.getByText('ABC-123')).toBeInTheDocument();
  });

  it('shows action buttons for coordinator', () => {
    render(
      <RequestsTable
        requests={mockRequests}
        loading={false}
        isCoordinator={true}
        {...mockHandlers}
      />
    );

    // Pending request should have Approve and Reject buttons
    const actionButtons = screen.getAllByRole('button');
    expect(actionButtons.length).toBeGreaterThan(0);
  });

  it('hides action buttons for viewer', () => {
    render(
      <RequestsTable
        requests={mockRequests}
        loading={false}
        isCoordinator={false}
        {...mockHandlers}
      />
    );

    // Should not have Actions column
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
  });

  it('calls onStatusUpdate when approve button clicked', () => {
    render(
      <RequestsTable
        requests={mockRequests}
        loading={false}
        isCoordinator={true}
        {...mockHandlers}
      />
    );

    const approveButtons = screen.getAllByLabelText(/Approve request/i);
    fireEvent.click(approveButtons[0]);

    expect(mockHandlers.onStatusUpdate).toHaveBeenCalledWith(1, 'approved');
  });

  it('calls onSchedule when schedule button clicked', () => {
    const approvedRequest = {
      ...mockRequests[0],
      status: 'approved'
    };

    render(
      <RequestsTable
        requests={[approvedRequest]}
        loading={false}
        isCoordinator={true}
        {...mockHandlers}
      />
    );

    const scheduleButton = screen.getByLabelText(/Schedule trip for request/i);
    fireEvent.click(scheduleButton);

    expect(mockHandlers.onSchedule).toHaveBeenCalledWith(approvedRequest);
  });

  it('calls onDelete when delete button clicked', () => {
    render(
      <RequestsTable
        requests={mockRequests}
        loading={false}
        isCoordinator={true}
        {...mockHandlers}
      />
    );

    const deleteButtons = screen.getAllByLabelText(/Delete request/i);
    fireEvent.click(deleteButtons[0]);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(1);
  });

  it('formats dates correctly', () => {
    render(
      <RequestsTable
        requests={mockRequests}
        loading={false}
        isCoordinator={true}
        {...mockHandlers}
      />
    );

    // Check that dates are formatted (not raw ISO strings)
    expect(screen.queryByText('2025-10-30T10:00:00')).not.toBeInTheDocument();
  });
});
