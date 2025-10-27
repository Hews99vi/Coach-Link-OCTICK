// Server-Sent Events (SSE) endpoint for real-time request updates
// Sends updates when request status changes (especially to 'scheduled')

const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');

// Store active SSE connections
const clients = new Set();

/**
 * Add a new SSE client connection
 * @param {Object} client - Client connection object with res and id
 */
const addClient = (client) => {
  clients.add(client);
  console.log(`📡 SSE client connected. Total clients: ${clients.size}`);
};

/**
 * Remove an SSE client connection
 * @param {Object} client - Client connection object
 */
const removeClient = (client) => {
  clients.delete(client);
  console.log(`📡 SSE client disconnected. Total clients: ${clients.size}`);
};

/**
 * Broadcast an event to all connected clients
 * @param {string} event - Event type
 * @param {Object} data - Event data
 */
const broadcastToClients = (event, data) => {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  
  clients.forEach((client) => {
    try {
      client.res.write(message);
    } catch (error) {
      console.error('Error sending SSE message:', error);
      removeClient(client);
    }
  });
  
  console.log(`📢 Broadcasted ${event} to ${clients.size} clients`);
};

/**
 * @route   GET /api/events/requests
 * @desc    SSE endpoint for real-time request updates
 * @access  Protected (Coordinator & Viewer)
 */
router.get('/requests', authMiddleware, requireRole('coordinator', 'viewer'), (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for Nginx

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);

  // Create client object
  const client = {
    id: Date.now(),
    res,
    user: req.user,
  };

  // Add client to active connections
  addClient(client);

  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(`:heartbeat\n\n`);
    } catch (error) {
      clearInterval(heartbeatInterval);
      removeClient(client);
    }
  }, 30000);

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(heartbeatInterval);
    removeClient(client);
  });
});

/**
 * Notify all clients about a request update
 * @param {Object} request - Updated request object
 * @param {string} action - Action type (created, updated, deleted, scheduled)
 */
const notifyRequestUpdate = (request, action = 'updated') => {
  broadcastToClients('requestUpdate', {
    action,
    request,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Notify all clients about a status change
 * @param {number} requestId - Request ID
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @param {Object} additionalData - Additional data (driver, vehicle, etc.)
 */
const notifyStatusChange = (requestId, oldStatus, newStatus, additionalData = {}) => {
  broadcastToClients('statusChange', {
    requestId,
    oldStatus,
    newStatus,
    ...additionalData,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  router,
  notifyRequestUpdate,
  notifyStatusChange,
  broadcastToClients,
};
