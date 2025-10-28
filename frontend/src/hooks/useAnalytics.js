import { useState, useEffect } from 'react';
import axios from 'axios';

const useAnalytics = (API_URL) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch analytics data
      const [dailyResponse, statusResponse] = await Promise.all([
        axios.get(`${API_URL}/analytics/daily`, getAuthHeaders()),
        axios.get(`${API_URL}/analytics/status`, getAuthHeaders())
      ]);

      if (dailyResponse.data.success && statusResponse.data.success) {
        setAnalytics({
          dailyCounts: dailyResponse.data.data,
          statusCounts: statusResponse.data.data
        });
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.error || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [API_URL]);

  return {
    analytics,
    loading,
    error,
    refetchAnalytics: fetchAnalytics
  };
};

export default useAnalytics;
