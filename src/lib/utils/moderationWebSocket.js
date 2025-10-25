import { browser } from '$app/environment';

const WS_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('http', 'ws').replace('/api', '/ws/moderation')
  : 'ws://localhost:3000/ws/moderation';

/**
 * WebSocket client for real-time moderation coordination.
 * Handles event locking to prevent multiple moderators working on same event.
 */
export class ModerationWebSocketClient {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.eventHandlers = {
      open: [],
      close: [],
      error: [],
      event_locked: [],
      event_unlocked: [],
      event_updated: [],
      event_deleted: [],
      event_created: [],
      pong: []
    };
    this.viewingEvents = new Set();
    this.isConnected = false;
    this.pingInterval = null;
  }

  /**
   * Connect to WebSocket server
   * Authentication uses HTTP-only cookies, no token parameter needed
   */
  connect() {
    if (!browser) return;

    const url = WS_URL;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected to moderation server');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.emit('open');

        // Start ping/pong to keep connection alive
        this.startPing();
      };

      this.ws.onclose = (event) => {
        console.log(`[WebSocket] Disconnected (code: ${event.code})`);
        this.isConnected = false;
        this.stopPing();
        this.emit('close', event);

        // Attempt to reconnect unless it was a clean close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
          console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => this.connect(), delay);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        this.emit('error', error);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      this.emit('error', error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.ws) {
      // Stop reconnect attempts
      this.reconnectAttempts = this.maxReconnectAttempts;
      this.stopPing();

      // Unview all events before disconnecting
      for (const eventId of this.viewingEvents) {
        this.unviewEvent(eventId);
      }

      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
      this.isConnected = false;
    }
  }

  /**
   * Notify server that user is viewing an event
   * @param {string} eventId - Event ID
   */
  viewEvent(eventId) {
    if (!this.isConnected) return;

    this.viewingEvents.add(eventId);
    this.send({
      type: 'view_event',
      eventId
    });
  }

  /**
   * Notify server that user stopped viewing an event
   * @param {string} eventId - Event ID
   */
  unviewEvent(eventId) {
    if (!this.isConnected) return;

    this.viewingEvents.delete(eventId);
    this.send({
      type: 'unview_event',
      eventId
    });
  }

  /**
   * Notify server that an event was updated
   * @param {string} eventId - Event ID
   */
  notifyEventUpdated(eventId) {
    if (!this.isConnected) return;

    this.send({
      type: 'event_updated',
      eventId
    });
  }

  /**
   * Notify server that an event was deleted
   * @param {string} eventId - Event ID
   */
  notifyEventDeleted(eventId) {
    if (!this.isConnected) return;

    this.send({
      type: 'event_deleted',
      eventId
    });
  }

  /**
   * Request current locks from server
   */
  requestCurrentLocks() {
    if (!this.isConnected) return;

    this.send({
      type: 'request_locks'
    });
  }

  /**
   * Send message to server
   * @param {Object} message - Message object
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Handle incoming messages from server
   * @param {Object} message - Parsed message object
   */
  handleMessage(message) {
    switch (message.type) {
      case 'event_locked':
        this.emit('event_locked', {
          eventId: message.eventId,
          lockedBy: message.lockedBy
        });
        break;

      case 'event_unlocked':
        this.emit('event_unlocked', {
          eventId: message.eventId
        });
        break;

      case 'event_updated':
        this.emit('event_updated', {
          eventId: message.eventId
        });
        break;

      case 'event_deleted':
        this.emit('event_deleted', {
          eventId: message.eventId
        });
        break;

      case 'event_created':
        this.emit('event_created', {
          eventId: message.eventId
        });
        break;

      case 'pong':
        this.emit('pong');
        break;

      default:
        console.warn(`[WebSocket] Unknown message type: ${message.type}`);
    }
  }

  /**
   * Register event handler
   * @param {string} event - Event name
   * @param {Function} handler - Handler function
   */
  on(event, handler) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].push(handler);
    }
  }

  /**
   * Remove event handler
   * @param {string} event - Event name
   * @param {Function} handler - Handler function to remove
   */
  off(event, handler) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
    }
  }

  /**
   * Emit event to all registered handlers
   * @param {string} event - Event name
   * @param {*} data - Data to pass to handlers
   */
  emit(event, data) {
    if (this.eventHandlers[event]) {
      for (const handler of this.eventHandlers[event]) {
        try {
          handler(data);
        } catch (error) {
          console.error(`[WebSocket] Error in ${event} handler:`, error);
        }
      }
    }
  }

  /**
   * Start periodic ping to keep connection alive
   */
  startPing() {
    this.pingInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'ping' });
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Stop periodic ping
   */
  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Get connection status
   * @returns {boolean}
   */
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Singleton instance
let instance = null;

/**
 * Get or create WebSocket client instance
 * @returns {ModerationWebSocketClient}
 */
export function getModerationWebSocket() {
  if (!instance) {
    instance = new ModerationWebSocketClient();
  }
  return instance;
}
