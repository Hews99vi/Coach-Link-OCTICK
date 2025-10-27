// Custom React hook for Server-Sent Events (SSE) connection
// Handles real-time updates from the backend

import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to establish and manage SSE connection
 * @param {string} url - SSE endpoint URL
 * @param {Function} onMessage - Callback function when message is received
 * @param {Object} options - Additional options
 * @returns {Object} - Connection status and methods
 */
const useSSE = (url, onMessage, options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const { 
    autoReconnect = true, 
    reconnectInterval = 3000,
    maxReconnectAttempts = 5 
  } = options;
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    if (!url) return;

    const connect = () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found');
          return;
        }

        // Create EventSource with token in URL (since EventSource doesn't support custom headers)
        const eventSourceUrl = `${url}?token=${encodeURIComponent(token)}`;
        const eventSource = new EventSource(eventSourceUrl);
        
        eventSourceRef.current = eventSource;

        // Connection opened
        eventSource.onopen = () => {
          console.log('✅ SSE connection established');
          setIsConnected(true);
          setError(null);
          reconnectAttemptsRef.current = 0;
        };

        // Message received (default handler)
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 SSE message received:', data);
            if (onMessage) {
              onMessage(data);
            }
          } catch (err) {
            console.error('Error parsing SSE message:', err);
          }
        };

        // Custom event handlers
        eventSource.addEventListener('requestUpdate', (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('🔄 Request update:', data);
            if (onMessage) {
              onMessage({ type: 'requestUpdate', ...data });
            }
          } catch (err) {
            console.error('Error parsing requestUpdate:', err);
          }
        });

        eventSource.addEventListener('statusChange', (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📊 Status change:', data);
            if (onMessage) {
              onMessage({ type: 'statusChange', ...data });
            }
          } catch (err) {
            console.error('Error parsing statusChange:', err);
          }
        });

        // Connection error
        eventSource.onerror = (err) => {
          console.error('❌ SSE connection error:', err);
          setIsConnected(false);
          
          // Close the connection
          eventSource.close();

          // Attempt to reconnect
          if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current += 1;
            console.log(`🔄 Reconnecting... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, reconnectInterval);
          } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            setError('Maximum reconnection attempts reached');
          }
        };

      } catch (err) {
        console.error('Error creating SSE connection:', err);
        setError(err.message);
      }
    };

    // Initial connection
    connect();

    // Cleanup function
    return () => {
      if (eventSourceRef.current) {
        console.log('🔌 Closing SSE connection');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [url, onMessage, autoReconnect, reconnectInterval, maxReconnectAttempts]);

  // Manual reconnect function
  const reconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    reconnectAttemptsRef.current = 0;
  };

  // Manual disconnect function
  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  };

  return {
    isConnected,
    error,
    reconnect,
    disconnect,
  };
};

export default useSSE;
