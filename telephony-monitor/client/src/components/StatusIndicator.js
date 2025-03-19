import React from 'react';
import './StatusIndicator.css';

const StatusIndicator = ({ status }) => {
  const getStatusInfo = () => {
    switch (status.toLowerCase()) {
      case 'green':
        return {
          className: 'status-online',
          label: 'Online'
        };
      case 'yellow':
        return {
          className: 'status-degraded',
          label: 'Degraded'
        };
      case 'red':
        return {
          className: 'status-offline',
          label: 'Offline'
        };
      default:
        return {
          className: 'status-unknown',
          label: status || 'Unknown'
        };
    }
  };

  const { className, label } = getStatusInfo();

  return (
    <div className={`status-indicator ${className}`}>
      <span className="status-dot"></span>
      <span className="status-label">{label}</span>
    </div>
  );
};

export default StatusIndicator;