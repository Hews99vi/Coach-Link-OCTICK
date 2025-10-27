// GET /analytics/daily: Use Sequelize to query count of service_requests 
// grouped by date(created_at) for last 7 days. 
// Return array of {date: 'YYYY-MM-DD', count: N}.

const express = require('express');
const { QueryTypes } = require('sequelize');
const router = express.Router();

const db = require('../models');

// Helper function to get date range for last N days
const getDateRange = (days) => {
  const dates = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]); // Format: YYYY-MM-DD
  }
  
  return dates;
};

// GET /api/analytics/daily - Get daily counts for last 7 days
router.get('/daily', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7; // Default to 7 days
    
    // Calculate date 7 days ago
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    // Query to count requests grouped by date
    // Using raw query for better date handling across different SQL dialects
    const results = await db.sequelize.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM service_requests
      WHERE DATE(created_at) >= DATE(:startDate)
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      {
        replacements: { startDate: startDate.toISOString() },
        type: QueryTypes.SELECT,
      }
    );

    // Create a map of existing data
    const dataMap = new Map();
    results.forEach(row => {
      dataMap.set(row.date, parseInt(row.count));
    });

    // Generate array with all dates (including zeros)
    const dateRange = getDateRange(days);
    const dailyData = dateRange.map(date => ({
      date,
      count: dataMap.get(date) || 0,
    }));

    res.json({
      success: true,
      data: dailyData,
      summary: {
        totalRequests: dailyData.reduce((sum, day) => sum + day.count, 0),
        averagePerDay: (dailyData.reduce((sum, day) => sum + day.count, 0) / days).toFixed(2),
        period: `Last ${days} days`,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/status - Get counts by status
router.get('/status', async (req, res, next) => {
  try {
    const results = await db.ServiceRequest.findAll({
      attributes: [
        'status',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    // Transform results into object
    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      scheduled: 0,
    };

    results.forEach(row => {
      statusCounts[row.status] = parseInt(row.count);
    });

    res.json({
      success: true,
      data: statusCounts,
      total: Object.values(statusCounts).reduce((sum, count) => sum + count, 0),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analytics/overview - Get general overview statistics
router.get('/overview', async (req, res, next) => {
  try {
    const [
      totalRequests,
      totalDrivers,
      totalVehicles,
      totalAssignments,
      pendingRequests,
      scheduledRequests,
    ] = await Promise.all([
      db.ServiceRequest.count(),
      db.Driver.count(),
      db.Vehicle.count(),
      db.Assignment.count(),
      db.ServiceRequest.count({ where: { status: 'pending' } }),
      db.ServiceRequest.count({ where: { status: 'scheduled' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalRequests,
        totalDrivers,
        totalVehicles,
        totalAssignments,
        pendingRequests,
        scheduledRequests,
        utilizationRate: totalRequests > 0 
          ? ((totalAssignments / totalRequests) * 100).toFixed(2) + '%'
          : '0%',
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
