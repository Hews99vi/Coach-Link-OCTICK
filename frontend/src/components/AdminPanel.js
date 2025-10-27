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
    <div className="container-fluid py-4">
      {/* Real-time notification */}
      {notification && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
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
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <i className="bi bi-speedometer2 me-2"></i>
                Admin Dashboard
              </h2>
              <div className="mt-2">
                <span className={`badge ${isCoordinator ? 'bg-primary' : 'bg-info'} fs-6`}>
                  <i className={`bi ${isCoordinator ? 'bi-person-check-fill' : 'bi-eye-fill'} me-1`}></i>
                  {isCoordinator ? 'Coordinator' : 'Viewer'} - {user.username}
                </span>
                {isViewer && (
                  <span className="ms-2 text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Read-only access
                  </span>
                )}
                <span className={`ms-2 badge ${sseConnected ? 'bg-success' : 'bg-secondary'}`}>
                  <i className={`bi ${sseConnected ? 'bi-wifi' : 'bi-wifi-off'} me-1`}></i>
                  {sseConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
            <button className="btn btn-outline-danger" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      {analytics && (
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body">
                <div style={{ height: '200px' }}>
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Summary</h5>
                <p className="mb-2">
                  <strong>Total Requests:</strong> {analytics.summary.totalRequests}
                </p>
                <p className="mb-2">
                  <strong>Average/Day:</strong> {analytics.summary.averagePerDay}
                </p>
                <p className="mb-0">
                  <strong>Period:</strong> {analytics.summary.period}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-4">
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
        <div className="col-md-3">
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
        <div className="col-md-5 text-end">
          <span className="text-muted">
            Showing {requests.length} of {totalCount} requests
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Requests Table */}
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Pickup</th>
                      <th>Dropoff</th>
                      <th>Pickup Time</th>
                      <th>Passengers</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center text-muted">
                          No requests found
                        </td>
                      </tr>
                    ) : (
                      requests.map((request) => (
                        <tr key={request.id}>
                          <td>{request.id}</td>
                          <td>{request.customer_name}</td>
                          <td>{request.phone}</td>
                          <td>{request.pickup_location || '-'}</td>
                          <td>{request.dropoff_location || '-'}</td>
                          <td>
                            {new Date(request.pickup_time).toLocaleString()}
                          </td>
                          <td>{request.passengers || '-'}</td>
                          <td>
                            <span className={`badge bg-${
                              request.status === 'pending' ? 'warning' :
                              request.status === 'approved' ? 'info' :
                              request.status === 'scheduled' ? 'success' :
                              'danger'
                            }`}>
                              {request.status}
                            </span>
                          </td>
                          <td>
                            {isCoordinator ? (
                              <div className="btn-group btn-group-sm">
                                {request.status === 'pending' && (
                                  <>
                                    <button
                                      className="btn btn-success"
                                      onClick={() => handleStatusUpdate(request.id, 'approved')}
                                      title="Approve"
                                    >
                                      <i className="bi bi-check-lg"></i>
                                    </button>
                                    <button
                                      className="btn btn-danger"
                                      onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                      title="Reject"
                                    >
                                      <i className="bi bi-x-lg"></i>
                                    </button>
                                  </>
                                )}
                                {(request.status === 'approved' || request.status === 'pending') && (
                                  <button
                                    className="btn btn-primary"
                                    onClick={() => openScheduleModal(request)}
                                    title="Schedule"
                                  >
                                    <i className="bi bi-calendar-check"></i>
                                  </button>
                                )}
                                <button
                                  className="btn btn-outline-danger"
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
                <nav>
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
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
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Schedule Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>Customer:</strong> {selectedRequest?.customer_name}</p>
                <p><strong>Phone:</strong> {selectedRequest?.phone}</p>
                
                <div className="mb-3">
                  <label className="form-label">Select Driver</label>
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
                  <label className="form-label">Select Vehicle</label>
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
                  <label className="form-label">Scheduled Time</label>
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
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSchedule}
                >
                  <i className="bi bi-calendar-check me-2"></i>
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
