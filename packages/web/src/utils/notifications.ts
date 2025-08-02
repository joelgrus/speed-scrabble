export type NotificationType = 'error' | 'warning' | 'info' | 'success';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  duration?: number; // ms, undefined means permanent until dismissed
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private nextId = 1;

  /**
   * Add a notification
   */
  notify(type: NotificationType, title: string, message: string, duration?: number): string {
    const notification: Notification = {
      id: `notification-${this.nextId++}`,
      type,
      title,
      message,
      timestamp: Date.now(),
      duration,
    };

    this.notifications.push(notification);
    this.notifyListeners();

    // Auto-remove after duration if specified
    if (duration) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }

    return notification.id;
  }

  /**
   * Remove a notification by ID
   */
  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Get all current notifications
   */
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.notifications]);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  // Convenience methods for common notification types
  error(title: string, message: string, duration = 5000): string {
    return this.notify('error', title, message, duration);
  }

  warning(title: string, message: string, duration = 4000): string {
    return this.notify('warning', title, message, duration);
  }

  info(title: string, message: string, duration = 3000): string {
    return this.notify('info', title, message, duration);
  }

  success(title: string, message: string, duration = 3000): string {
    return this.notify('success', title, message, duration);
  }
}

// Singleton instance
export const notificationService = new NotificationService();