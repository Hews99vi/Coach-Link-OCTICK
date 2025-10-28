import React from 'react';
import { Bar } from 'react-chartjs-2';

const AnalyticsChart = ({ analytics }) => {
  if (!analytics || !analytics.dailyCounts) {
    return null;
  }

  const chartData = {
    labels: analytics.dailyCounts.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Requests per Day',
        data: analytics.dailyCounts.map(d => d.count),
        backgroundColor: 'rgba(124, 58, 237, 0.8)',
        borderColor: 'rgba(124, 58, 237, 1)',
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(124, 58, 237, 0.9)',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Request Trends (Last 7 Days)',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#1f2937'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="analytics-card">
      <div style={{ height: '300px' }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default AnalyticsChart;
