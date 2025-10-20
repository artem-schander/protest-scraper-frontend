import { writable } from 'svelte/store';

function createNotificationStore() {
  const { subscribe, update } = writable([]);

  let id = 0;

  return {
    subscribe,
    /**
     * Add a notification
     * @param {Object} notification
     * @param {string} notification.type - 'success' | 'error' | 'info' | 'warning'
     * @param {string} notification.title - Notification title
     * @param {string} [notification.message] - Optional message
     * @param {number} [notification.duration] - Duration in ms (default: 5000, 0 = no auto-dismiss)
     */
    add(notification) {
      const newNotification = {
        id: id++,
        type: notification.type || 'info',
        title: notification.title,
        message: notification.message || '',
        duration: notification.duration !== undefined ? notification.duration : 5000
      };

      update(notifications => [...notifications, newNotification]);

      // Auto-dismiss if duration > 0
      if (newNotification.duration > 0) {
        setTimeout(() => {
          this.remove(newNotification.id);
        }, newNotification.duration);
      }

      return newNotification.id;
    },
    /**
     * Remove a notification by ID
     */
    remove(id) {
      update(notifications => notifications.filter(n => n.id !== id));
    },
    /**
     * Clear all notifications
     */
    clear() {
      update(() => []);
    }
  };
}

export const notificationStore = createNotificationStore();
