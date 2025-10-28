import { useState, useCallback } from 'react';
import axios from 'axios';

const useRequests = (API_URL) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const fetchRequests = useCallback(async (searchTerm = '', statusFilter = '') => {
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

      const response = await axios.get(`${API_URL}/requests`, {
        ...getAuthHeaders(),
        params
      });

      if (response.data.success) {
        setRequests(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.pagination.totalCount);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.response?.data?.error || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, [API_URL, currentPage]);

  const updateRequestStatus = async (id, status) => {
    try {
      const response = await axios.put(
        `${API_URL}/requests/${id}`,
        { status },
        getAuthHeaders()
      );

      if (response.data.success) {
        // Update local state
        setRequests(prev => 
          prev.map(req => 
            req.id === id ? { ...req, status } : req
          )
        );
        return { success: true };
      }
    } catch (err) {
      console.error('Error updating request status:', err);
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to update status' 
      };
    }
  };

  const scheduleRequest = async (id, scheduleData) => {
    try {
      const response = await axios.put(
        `${API_URL}/requests/${id}`,
        {
          status: 'scheduled',
          driver_id: scheduleData.driver_id,
          vehicle_id: scheduleData.vehicle_id,
          scheduled_time: scheduleData.scheduled_time,
        },
        getAuthHeaders()
      );

      if (response.data.success) {
        // Refresh requests to get updated assignment data
        await fetchRequests();
        return { success: true };
      }
    } catch (err) {
      console.error('Error scheduling request:', err);
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to schedule trip' 
      };
    }
  };

  const deleteRequest = async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/requests/${id}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        // Remove from local state
        setRequests(prev => prev.filter(req => req.id !== id));
        setTotalCount(prev => prev - 1);
        return { success: true };
      }
    } catch (err) {
      console.error('Error deleting request:', err);
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to delete request' 
      };
    }
  };

  return {
    requests,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    setCurrentPage,
    fetchRequests,
    updateRequestStatus,
    scheduleRequest,
    deleteRequest,
    setRequests
  };
};

export default useRequests;
