// Admin table: Fetch GET /requests with axios (use token in headers). 
// Display table with columns for all fields, status dropdown/action buttons (approve, reject, schedule). 
// For schedule, open modal with selects for drivers/vehicles (fetch GET /drivers, /vehicles), datetime picker. 
// On action, PUT /requests/:id. Add search input for name/phone, status filter dropdown, pagination controls. 
// Use loading spinner.
//
// In AdminPanel, fetch GET /analytics/daily, render Chart.js bar chart with dates on x, counts on y. 
// Keep it small/sparkline style.

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import useSSE from '../hooks/useSSE';
import './AdminPanel.css';
import SkipLink from './SkipLink';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminPanel = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'viewer';
  const isCoordinator = userRole === 'coordinator';
  const isViewer = userRole === 'viewer';

  // State management
  const [requests, setRequests] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    driver_id: '',
    vehicle_id: '',
    scheduled_time: '',
  });

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: currentPage,
        limit: limit,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await axios.get(
        `${API_URL}/requests`,
        { ...getAuthHeaders(), params }
      );

      if (response.data.success) {
        setRequests(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.pagination.totalCount);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError('Failed to load requests');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch drivers and vehicles
  const fetchDriversAndVehicles = async () => {
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        axios.get(`${API_URL}/drivers`, getAuthHeaders()),
        axios.get(`${API_URL}/vehicles`, getAuthHeaders())
      ]);

      if (driversRes.data.success) {
        setDrivers(driversRes.data.data);
      }

      if (vehiclesRes.data.success) {
        setVehicles(vehiclesRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching drivers/vehicles:', error);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/analytics/daily`,
        getAuthHeaders()
      );

      if (response.data.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Handle SSE messages for real-time updates
  const handleSSEMessage = useCallback((data) => {
    if (data.type === 'requestUpdate' || data.type === 'statusChange') {
      console.log('📡 Real-time update received:', data);
      
      // Update the requests list with the new data
      if (data.request) {
        setRequests(prevRequests => {
          const index = prevRequests.findIndex(r => r.id === data.request.id);
          if (index !== -1) {
            const updated = [...prevRequests];
            updated[index] = data.request;
            return updated;
          }
          return prevRequests;
        });
      }
      
      // Show notification
      if (data.type === 'statusChange') {
        const statusColors = {
          pending: 'warning',
          approved: 'info',
          scheduled: 'success',
          rejected: 'danger'
        };
        
        setNotification({
          message: `Request #${data.requestId} status changed: ${data.oldStatus} → ${data.newStatus}`,
          type: statusColors[data.newStatus] || 'info',
          timestamp: Date.now()
        });
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          setNotification(null);
        }, 5000);
        
        // Refresh analytics
        fetchAnalytics();
      }
    }
  }, []);

  // Setup SSE connection
  const { isConnected: sseConnected } = useSSE(
    `${API_URL}/events/requests`,
    handleSSEMessage,
    {
      autoReconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5
    }
  );

  // Initial load
  useEffect(() => {
    fetchRequests();
    fetchDriversAndVehicles();
    fetchAnalytics();
  }, [currentPage, searchTerm, statusFilter]);

  // Handle status update (approve/reject)
  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const response = await axios.put(
        `${API_URL}/requests/${requestId}`,
        { status: newStatus },
        getAuthHeaders()
      );

      if (response.data.success) {
        fetchRequests();
        alert(`Request ${newStatus} successfully!`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  // Open schedule modal
  const openScheduleModal = (request) => {
    setSelectedRequest(request);
    setScheduleData({
      driver_id: '',
      vehicle_id: '',
      scheduled_time: request.pickup_time || '',
    });
    setShowModal(true);
  };

  // Handle schedule submission
  const handleSchedule = async () => {
    if (!scheduleData.driver_id || !scheduleData.vehicle_id || !scheduleData.scheduled_time) {
      alert('Please fill all schedule fields');
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/requests/${selectedRequest.id}`,
        {
          status: 'scheduled',
          driver_id: parseInt(scheduleData.driver_id),
          vehicle_id: parseInt(scheduleData.vehicle_id),
          scheduled_time: scheduleData.scheduled_time,
        },
        getAuthHeaders()
      );

      if (response.data.success) {
        setShowModal(false);
        fetchRequests();
        alert('Request scheduled successfully!');
      }
    } catch (error) {
      console.error('Error scheduling request:', error);
      alert(error.response?.data?.message || 'Failed to schedule request');
    }
  };

  // Handle delete
  const handleDelete = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_URL}/requests/${requestId}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        fetchRequests();
        alert('Request deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Failed to delete request');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Chart configuration
  const chartData = analytics ? {
    labels: analytics.data.map(d => d.date),
    datasets: [
      {
        label: 'Requests per Day',
        data: analytics.data.map(d => d.count),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Last 7 Days Activity',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <>
      <SkipLink />
      <div className="admin-dashboard">
      <div className="container-fluid py-4" id="main-content">
        {/* Real-time notification */}
        {notification && (
          <div className="position-fixed top-0 end-0 p-3 notification-toast" style={{ zIndex: 9999 }}>
            <div className={`alert alert-${notification.type} alert-dismissible fade show shadow-lg`} role="alert">
              <i className="bi bi-broadcast me-2"></i>
              <strong>Live Update:</strong> {notification.message}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setNotification(null)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="row mb-4">
          <div className="col">
            <div className="dashboard-header">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                  <h1 className="dashboard-title">
                    <i className="bi bi-speedometer2 me-3"></i>
                    Admin Dashboard
                  </h1>
                  <div className="user-badge-group">
                    <span className={`user-badge ${isCoordinator ? 'bg-primary' : 'bg-info'}`}>
                      <i className={`bi ${isCoordinator ? 'bi-person-check-fill' : 'bi-eye-fill'} me-2`}></i>
                      {isCoordinator ? 'Coordinator' : 'Viewer'} • {user.username}
                    </span>
                    {isViewer && (
                      <span className="user-badge bg-secondary">
                        <i className="bi bi-lock-fill me-2"></i>
                        Read-only access
                      </span>
                    )}
                    <span className={`user-badge connection-badge ${sseConnected ? 'bg-success live' : 'bg-secondary'}`}>
                      <i className={`bi ${sseConnected ? 'bi-wifi' : 'bi-wifi-off'} me-2`}></i>
                      {sseConnected ? 'Live' : 'Offline'}
                    </span>
                  </div>
                </div>
                <button className="btn logout-btn" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Chart */}
        {analytics && (
          <div className="row mb-4">
            {/* Stats Cards */}
            <div className="col-md-4 mb-3">
              <div className="card stats-card">
                <div className="stats-icon text-primary">
                  <i className="bi bi-journal-text"></i>
                </div>
                <h3 className="stats-value">{analytics.summary.totalRequests}</h3>
                <p className="stats-label">Total Requests</p>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card stats-card">
                <div className="stats-icon text-success">
                  <i className="bi bi-graph-up-arrow"></i>
                </div>
                <h3 className="stats-value">{analytics.summary.averagePerDay}</h3>
                <p className="stats-label">Average per Day</p>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card stats-card">
                <div className="stats-icon text-info">
                  <i className="bi bi-calendar-range"></i>
                </div>
                <h3 className="stats-value">{analytics.summary.period}</h3>
                <p className="stats-label">Tracking Period</p>
              </div>
            </div>

            {/* Chart */}
            <div className="col-12">
              <div className="card chart-card">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-bar-chart-line me-2"></i>
                    Last 7 Days Activity
                  </h5>
                  <div style={{ height: '300px' }}>
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filter-section">
          <div className="row align-items-center">
            <div className="col-md-4 mb-3 mb-md-0">
              <div className="filter-input-group">
                <i className="bi bi-search filter-icon"></i>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <div className="filter-input-group">
                <i className="bi bi-funnel filter-icon"></i>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
            </div>
            <div className="col-md-5 text-md-end">
              <div className="results-counter">
                <i className="bi bi-list-check me-2"></i>
                Showing <strong>{requests.length}</strong> of <strong>{totalCount}</strong> requests
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger border-0 shadow-sm">{error}</div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="loading-container" role="status" aria-live="polite" aria-label="Loading requests">
            <div className="loading-spinner" aria-hidden="true"></div>
            <p className="mt-3 text-muted">Loading requests...</p>
          </div>
        ) : (
          <>
            {/* Requests Table */}
            <div className="card table-card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table admin-table">
                    <thead>
                      <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Customer</th>
                        <th scope="col">Phone</th>
                        <th scope="col">Pickup</th>
                        <th scope="col">Dropoff</th>
                        <th scope="col">Pickup Time</th>
                        <th scope="col">Passengers</th>
                        <th scope="col">Status</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.length === 0 ? (
                        <tr>
                          <td colSpan="9">
                            <div className="empty-state">
                              <div className="empty-state-icon">
                                <i className="bi bi-inbox"></i>
                              </div>
                              <p className="empty-state-text">No requests found</p>
                              <small>Try adjusting your filters</small>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        requests.map((request) => (
                          <tr key={request.id}>
                            <td><strong>#{request.id}</strong></td>
                            <td>{request.customer_name}</td>
                            <td>
                              <i className="bi bi-telephone me-1" aria-hidden="true"></i>
                              {request.phone}
                            </td>
                            <td>
                              <i className="bi bi-geo-alt me-1" aria-hidden="true"></i>
                              {request.pickup_location || '-'}
                            </td>
                            <td>
                              <i className="bi bi-geo-alt-fill me-1" aria-hidden="true"></i>
                              {request.dropoff_location || '-'}
                            </td>
                            <td>
                              <i className="bi bi-clock me-1" aria-hidden="true"></i>
                              {new Date(request.pickup_time).toLocaleString()}
                            </td>
                            <td>
                              <i className="bi bi-people me-1" aria-hidden="true"></i>
                              {request.passengers || '-'}
                            </td>
                            <td>
                              <span className={`status-badge status-${request.status}`}>
                                {request.status}
                              </span>
                            </td>
                            <td>
                              {isCoordinator ? (
                                <div className="action-btn-group">
                                  {request.status === 'pending' && (
                                    <>
                                      <button
                                        className="action-btn action-btn-approve"
                                        onClick={() => handleStatusUpdate(request.id, 'approved')}
                                        title="Approve"
                                      >
                                        <i className="bi bi-check-lg"></i>
                                      </button>
                                      <button
                                        className="action-btn action-btn-reject"
                                        onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                        title="Reject"
                                      >
                                        <i className="bi bi-x-lg"></i>
                                      </button>
                                    </>
                                  )}
                                  {(request.status === 'approved' || request.status === 'pending') && (
                                    <button
                                      className="action-btn action-btn-schedule"
                                      onClick={() => openScheduleModal(request)}
                                      title="Schedule"
                                    >
                                      <i className="bi bi-calendar-check"></i>
                                    </button>
                                  )}
                                  <button
                                    className="action-btn action-btn-delete"
                                    onClick={() => handleDelete(request.id)}
                                    title="Delete"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              ) : (
                                <span className="badge bg-secondary">
                                  <i className="bi bi-eye-fill me-1"></i>
                                  View Only
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-4">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <i className="bi bi-chevron-left me-1"></i>
                          Previous
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, index) => (
                        <li
                          key={index + 1}
                          className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(index + 1)}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <i className="bi bi-chevron-right ms-1"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            </div>
          </>
        )}

        {/* Schedule Modal */}
        {showModal && (
          <div 
            className="modal show d-block schedule-modal" 
            tabIndex="-1" 
            role="dialog"
            aria-labelledby="scheduleModalTitle"
            aria-modal="true"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="scheduleModalTitle">
                    <i className="bi bi-calendar-check me-2" aria-hidden="true"></i>
                    Schedule Request
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                    aria-label="Close modal"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="customer-info">
                    <p><i className="bi bi-person-fill me-2"></i><strong>Customer:</strong> {selectedRequest?.customer_name}</p>
                    <p className="mb-0"><i className="bi bi-telephone-fill me-2"></i><strong>Phone:</strong> {selectedRequest?.phone}</p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-person-badge me-2"></i>
                      Select Driver
                    </label>
                    <select
                      className="form-select"
                      value={scheduleData.driver_id}
                      onChange={(e) => setScheduleData({...scheduleData, driver_id: e.target.value})}
                    >
                      <option value="">Choose driver...</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name} ({driver.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-truck me-2"></i>
                      Select Vehicle
                    </label>
                    <select
                      className="form-select"
                      value={scheduleData.vehicle_id}
                      onChange={(e) => setScheduleData({...scheduleData, vehicle_id: e.target.value})}
                    >
                      <option value="">Choose vehicle...</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.plate} (Capacity: {vehicle.capacity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-calendar-event me-2"></i>
                      Scheduled Time
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={scheduleData.scheduled_time}
                      onChange={(e) => setScheduleData({...scheduleData, scheduled_time: e.target.value})}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    <i className="bi bi-x-lg me-2"></i>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSchedule}
                  >
                    <i className="bi bi-calendar-check me-2"></i>
                    Schedule Trip
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default AdminPanel;
