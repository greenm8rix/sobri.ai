// Simple analytics utility to track user interactions
// In a production app, you would replace this with a proper analytics service

// Event types
export type EventType =
  | 'page_view'
  | 'chat_message_sent'
  | 'check_in_completed'
  | 'journal_entry_created'
  | 'relapse_recorded'
  | 'streak_milestone'
  | 'trigger_log_created' // Added
  | 'task_created'        // Added
  | 'task_completed';     // Added

// Event properties
export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

interface StoredEventData extends EventProperties {
  event: EventType;
  timestamp: string;
  sessionId: string;
}

class AnalyticsService {
  private enabled: boolean = true;

  constructor() {
    // Check if analytics should be disabled (e.g. user opt-out)
    const analyticsDisabled = localStorage.getItem('Soberi_analytics_disabled') === 'true';
    this.enabled = !analyticsDisabled;

    // Initialize session
    this.trackEvent('page_view', {
      path: window.location.pathname,
      referrer: document.referrer || 'direct',
    });
  }

  // Track an event
  trackEvent(eventType: EventType, properties: EventProperties = {}): void {
    if (!this.enabled) return;

    // Add timestamp and session ID
    const eventData = {
      event: eventType,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      ...properties
    };

    // Log the event (in production, send to server)
    console.log('[Analytics]', eventData);

    // Store locally for debugging/development
    this.storeEvent(eventData);
  }

  // Opt out of analytics
  optOut(): void {
    this.enabled = false;
    localStorage.setItem('Soberi_analytics_disabled', 'true');
  }

  // Opt in to analytics
  optIn(): void {
    this.enabled = true;
    localStorage.removeItem('Soberi_analytics_disabled');
  }

  // Get or create a session ID
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('Soberi_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID ? crypto.randomUUID() : this.generateSimpleId();
      sessionStorage.setItem('Soberi_session_id', sessionId);
    }
    return sessionId;
  }

  // Generate a simple ID as fallback
  private generateSimpleId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Store event in local storage for debugging
  private storeEvent(eventData: StoredEventData): void {
    try {
      const events: StoredEventData[] = JSON.parse(localStorage.getItem('Soberi_analytics_events') || '[]');
      events.push(eventData);

      // Keep only last 100 events to avoid storage issues
      if (events.length > 100) {
        events.shift();
      }

      localStorage.setItem('Soberi_analytics_events', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to store analytics event:', error);
    }
  }
}

// Create a singleton instance
export const analytics = new AnalyticsService();

// Export default instance
export default analytics;
