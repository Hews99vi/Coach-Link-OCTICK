import React from 'react';

const RequestsTable = ({ 
  requests, 
  loading, 
  isCoordinator, 
  onStatusUpdate, 
  onSchedule, 
  onDelete 
}) => {
  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: 'badge-pending',
      approved: 'badge-approved',
      scheduled: 'badge-scheduled',
      completed: 'badge-completed',
      rejected: 'badge-rejected'
    };
    return statusClasses[status] || 'badge-secondary';
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <i className="bi bi-inbox empty-icon"></i>
        <h3>No Requests Found</h3>
        <p>There are no transportation requests at the moment.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="requests-table" role="table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Customer</th>
            <th scope="col">Phone</th>
            <th scope="col">Pickup Location</th>
            <th scope="col">Dropoff Location</th>
            <th scope="col">Pickup Time</th>
            <th scope="col">Passengers</th>
            <th scope="col">Status</th>
            <th scope="col">Driver/Vehicle</th>
            <th scope="col">Scheduled Time</th>
            {isCoordinator && <th scope="col">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {requests.map(request => (
            <tr key={request.id}>
              <td data-label="ID">{request.id}</td>
              <td data-label="Customer">{request.customer_name}</td>
              <td data-label="Phone">{request.phone}</td>
              <td data-label="Pickup">{request.pickup_location}</td>
              <td data-label="Dropoff">{request.dropoff_location}</td>
              <td data-label="Pickup Time">{formatDateTime(request.pickup_time)}</td>
              <td data-label="Passengers">{request.passengers}</td>
              <td data-label="Status">
                <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </td>
              <td data-label="Driver/Vehicle">
                {request.assignment ? (
                  <>
                    <div>
                      <i className="bi bi-person-fill"></i> {request.assignment.driver?.name || 'N/A'}
                    </div>
                    <div className="text-muted small">
                      <i className="bi bi-bus-front"></i> {request.assignment.vehicle?.license_plate || 'N/A'}
                    </div>
                  </>
                ) : (
                  <span className="text-muted">Not assigned</span>
                )}
              </td>
              <td data-label="Scheduled Time">
                {request.assignment?.scheduled_time 
                  ? formatDateTime(request.assignment.scheduled_time)
                  : <span className="text-muted">Not scheduled</span>
                }
              </td>
              {isCoordinator && (
                <td data-label="Actions">
                  <div className="action-buttons">
                    {request.status === 'pending' && (
                      <>
                        <button
                          className="btn-action btn-approve"
                          onClick={() => onStatusUpdate(request.id, 'approved')}
                          title="Approve request"
                          aria-label={`Approve request ${request.id}`}
                        >
                          <i className="bi bi-check-circle"></i>
                        </button>
                        <button
                          className="btn-action btn-reject"
                          onClick={() => onStatusUpdate(request.id, 'rejected')}
                          title="Reject request"
                          aria-label={`Reject request ${request.id}`}
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      </>
                    )}
                    {request.status === 'approved' && (
                      <button
                        className="btn-action btn-schedule"
                        onClick={() => onSchedule(request)}
                        title="Schedule trip"
                        aria-label={`Schedule trip for request ${request.id}`}
                      >
                        <i className="bi bi-calendar-plus"></i>
                      </button>
                    )}
                    {request.status === 'scheduled' && (
                      <button
                        className="btn-action btn-complete"
                        onClick={() => onStatusUpdate(request.id, 'completed')}
                        title="Mark as completed"
                        aria-label={`Mark request ${request.id} as completed`}
                      >
                        <i className="bi bi-check-all"></i>
                      </button>
                    )}
                    <button
                      className="btn-action btn-delete"
                      onClick={() => onDelete(request.id)}
                      title="Delete request"
                      aria-label={`Delete request ${request.id}`}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestsTable;
