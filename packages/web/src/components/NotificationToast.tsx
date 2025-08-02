import React, { useState, useEffect } from 'react';
import { notificationService, type Notification } from '../utils/notifications';

export default function NotificationToast() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Subscribe to notifications
    const unsubscribe = notificationService.subscribe(setNotifications);
    
    // Initialize with current notifications
    setNotifications(notificationService.getAll());

    return unsubscribe;
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  const getNotificationStyle = (type: Notification['type']) => {
    const baseStyle = {
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '8px',
      border: '2px solid',
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      animation: 'slideInRight 0.3s ease-out',
      cursor: 'pointer',
      minWidth: '300px',
      maxWidth: '400px',
    };

    switch (type) {
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: '#FFE4E1',
          borderColor: '#DC143C',
          color: '#8B0000',
        };
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: '#FFF8DC',
          borderColor: '#DAA520',
          color: '#B8860B',
        };
      case 'info':
        return {
          ...baseStyle,
          backgroundColor: '#E6F3FF',
          borderColor: '#4A90E2',
          color: '#2E5C8A',
        };
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: '#E8F5E8',
          borderColor: '#4CAF50',
          color: '#2E7D32',
        };
      default:
        return baseStyle;
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return '📋';
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes fadeOut {
            from {
              opacity: 1;
              transform: translateX(0);
            }
            to {
              opacity: 0;
              transform: translateX(100%);
            }
          }
        `}
      </style>
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          pointerEvents: 'none',
        }}
      >
        {notifications.map((notification) => (
          <div
            key={notification.id}
            style={{
              ...getNotificationStyle(notification.type),
              pointerEvents: 'auto',
            }}
            onClick={() => notificationService.remove(notification.id)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>
                {getIcon(notification.type)}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {notification.title}
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                  {notification.message}
                </div>
              </div>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  color: 'inherit',
                  opacity: 0.7,
                  padding: '0',
                  marginLeft: '8px',
                  flexShrink: 0,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  notificationService.remove(notification.id);
                }}
                title="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}