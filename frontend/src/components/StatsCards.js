import React from 'react';

const StatsCards = ({ totalCount, analytics, userRole }) => {
  // Calculate status counts
  const pendingCount = analytics?.statusCounts?.find(s => s.status === 'pending')?.count || 0;
  const approvedCount = analytics?.statusCounts?.find(s => s.status === 'approved')?.count || 0;
  const scheduledCount = analytics?.statusCounts?.find(s => s.status === 'scheduled')?.count || 0;
  const completedCount = analytics?.statusCounts?.find(s => s.status === 'completed')?.count || 0;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">
          <i className="bi bi-list-task"></i>
        </div>
        <div className="stat-content">
          <div className="stat-value">{totalCount}</div>
          <div className="stat-label">Total Requests</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon pending">
          <i className="bi bi-clock-history"></i>
        </div>
        <div className="stat-content">
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon approved">
          <i className="bi bi-check-circle"></i>
        </div>
        <div className="stat-content">
          <div className="stat-value">{approvedCount}</div>
          <div className="stat-label">Approved</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon scheduled">
          <i className="bi bi-calendar-check"></i>
        </div>
        <div className="stat-content">
          <div className="stat-value">{scheduledCount}</div>
          <div className="stat-label">Scheduled</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon completed">
          <i className="bi bi-check-all"></i>
        </div>
        <div className="stat-content">
          <div className="stat-value">{completedCount}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <i className="bi bi-person-badge"></i>
        </div>
        <div className="stat-content">
          <div className="stat-value">{userRole}</div>
          <div className="stat-label">Role</div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
