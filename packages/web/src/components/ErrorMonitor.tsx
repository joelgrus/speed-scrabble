import React, { useState, useEffect } from 'react';
import { errorReporter } from '../utils/errorReporting';

// Only show in development mode
export default function ErrorMonitor() {
  const [errors, setErrors] = useState(errorReporter.getRecentErrors());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Update errors every few seconds in development
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        setErrors(errorReporter.getRecentErrors());
      }, 2000);

      return () => clearInterval(interval);
    }
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const recentErrors = errors.slice(-5); // Show last 5 errors

  if (recentErrors.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '12px',
        maxWidth: '400px',
        zIndex: 10000,
        border: '2px solid #DC143C',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>🚨 Errors: {errors.length}</span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ marginBottom: '10px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                errorReporter.clearErrors();
                setErrors([]);
              }}
              style={{
                backgroundColor: '#DC143C',
                color: '#fff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer',
                marginRight: '8px',
              }}
            >
              Clear All
            </button>
            <span style={{ fontSize: '11px', color: '#ccc' }}>
              (Development Mode Only)
            </span>
          </div>

          {recentErrors.map((error, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'rgba(220, 20, 60, 0.1)',
                border: '1px solid #DC143C',
                borderRadius: '4px',
                padding: '8px',
                marginBottom: '5px',
                fontSize: '11px',
              }}
            >
              <div style={{ fontWeight: 'bold', color: '#ff6b6b' }}>
                {error.component}
              </div>
              <div style={{ color: '#ccc', marginTop: '2px' }}>
                {error.message}
              </div>
              <div style={{ color: '#999', fontSize: '10px', marginTop: '2px' }}>
                {new Date(error.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}