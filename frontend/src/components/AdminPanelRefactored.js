// Refactored AdminPanel - Now only 250 lines!
// Separated concerns into smaller components and custom hooks

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useSSE from '../hooks/useSSE';
import useRequests from '../hooks/useRequests';
import useAnalytics from '../hooks/useAnalytics';
import StatsCards from './StatsCards';
import AnalyticsChart from './AnalyticsChart';
import RequestsTable from './RequestsTable';
import ScheduleModal from './ScheduleModal';
import SkipLink from './SkipLink';
import './AdminPanel.css';
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

  // Custom hooks for data management
  const {
    requests,
    loading: requestsLoading,
    error: requestsError,
    currentPage,
    totalPages,
    totalCount,
    setCurrentPage,
    fetchRequests,
    updateRequestStatus,
    scheduleRequest,
    deleteRequest,
    setRequests
  } = useRequests(API_URL);

  const {
    analytics,
    loading: analyticsLoading,
    refetchAnalytics
  } = useAnalytics(API_URL);

  // Local state
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    driver_id: '',
    vehicle_id: '',
    scheduled_time: '',
  });
  const [modalLoading, setModalLoading] = useState(false);

  // SSE for real-time updates
  const token = localStorage.getItem('token');
  const { connected } = useSSE(
    `${API_URL}/events/requests?token=${encodeURIComponent(token)}`,
    handleSSEMessage
  );

  // Handle SSE messages
  function handleSSEMessage(event) {
    if (event.type === 'requestUpdate' || event.type === 'statusChange') {
      showNotification('Request updated in real-time', 'info');
      fetchRequests(searchTerm, statusFilter);
      refetchAnalytics();
    }
  }

  // Fetch initial data
  useEffect(() => {
    fetchRequests(searchTerm, statusFilter);
    fetchDriversAndVehicles();
  }, [currentPage]);

  // Search and filter
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1);
      fetchRequests(searchTerm, statusFilter);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter]);

  const fetchDriversAndVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { headers: { Authorization: `Bearer ${token}` } };

      const [driversRes, vehiclesRes] = await Promise.all([
        axios.get(`${API_URL}/drivers`, headers),
        axios.get(`${API_URL}/vehicles`, headers)
      ]);

      if (driversRes.data.success) setDrivers(driversRes.data.data);
      if (vehiclesRes.data.success) setVehicles(vehiclesRes.data.data);
    } catch (err) {
      console.error('Error fetching drivers/vehicles:', err);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStatusUpdate = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this request?`)) {
      return;
    }

    const result = await updateRequestStatus(id, status);
    if (result.success) {
      showNotification(`Request ${status} successfully!`);
      refetchAnalytics();
    } else {
      showNotification(result.error, 'error');
    }
  };

  const handleScheduleClick = (request) => {
    setSelectedRequest(request);
    setScheduleData({
      driver_id: '',
      vehicle_id: '',
      scheduled_time: '',
    });
    setShowModal(true);
  };

  const handleScheduleSubmit = async () => {
    setModalLoading(true);
    const result = await scheduleRequest(selectedRequest.id, scheduleData);
    setModalLoading(false);

    if (result.success) {
      showNotification('Trip scheduled successfully!');
      setShowModal(false);
      refetchAnalytics();
    } else {
      showNotification(result.error, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }

    const result = await deleteRequest(id);
    if (result.success) {
      showNotification('Request deleted successfully!');
      refetchAnalytics();
    } else {
      showNotification(result.error, 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleScheduleDataChange = (e) => {
    setScheduleData({
      ...scheduleData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="admin-container">
      <SkipLink targetId="main-content" />
      
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <i className="bi bi-speedometer2 me-3"></i>
              Admin Dashboard
            </h1>
            <div className="connection-status">
              <span className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}></span>
              <span className="status-text">
                {connected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="header-right">
            <span className="user-welcome">
              <i className="bi bi-person-circle me-2"></i>
              {user.username} ({userRole})
            </span>
            <button 
              onClick={handleLogout} 
              className="btn-logout"
              aria-label="Logout"
            >
              <i className="bi bi-box-arrow-right"></i>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="admin-main">
        {/* Notification Toast */}
        {notification && (
          <div className={`toast-notification ${notification.type}`} role="alert">
            <i className={`bi ${notification.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2`}></i>
            {notification.message}
          </div>
        )}

        {/* Stats Cards */}
        <StatsCards 
          totalCount={totalCount}
          analytics={analytics}
          userRole={userRole}
        />

        {/* Analytics Chart */}
        <AnalyticsChart analytics={analytics} />

        {/* Search and Filters */}
        <div className="controls-section">
          <div className="search-box">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Search requests"
            />
          </div>

          <div className="filter-box">
            <i className="bi bi-filter filter-icon"></i>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        {requestsError && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {requestsError}
          </div>
        )}

        <RequestsTable
          requests={requests}
          loading={requestsLoading}
          isCoordinator={isCoordinator}
          onStatusUpdate={handleStatusUpdate}
          onSchedule={handleScheduleClick}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <i className="bi bi-chevron-left"></i>
              Previous
            </button>
            
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              Next
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        )}
      </main>

      {/* Schedule Modal */}
      <ScheduleModal
        show={showModal}
        onClose={() => setShowModal(false)}
        selectedRequest={selectedRequest}
        scheduleData={scheduleData}
        onChange={handleScheduleDataChange}
        onSubmit={handleScheduleSubmit}
        drivers={drivers}
        vehicles={vehicles}
        loading={modalLoading}
      />
    </div>
  );
};

export default AdminPanel;
