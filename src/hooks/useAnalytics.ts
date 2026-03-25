import { useCallback, useRef } from "react";

interface AnalyticsEvent {
  event: string;
  properties: Record<string, string | number>;
  timestamp: number;
}

const eventQueue: AnalyticsEvent[] = [];

export function useAnalytics(username: string) {
  const sessionStart = useRef(Date.now());

  const track = useCallback(
    (event: string, properties: Record<string, string | number> = {}) => {
      const entry: AnalyticsEvent = {
        event,
        properties: {
          ...properties,
          username,
          session_duration_ms: Date.now() - sessionStart.current,
        },
        timestamp: Date.now(),
      };
      eventQueue.push(entry);

      // Log in dev for visibility
      if (import.meta.env.DEV) {
        console.log(`[Analytics] ${event}`, entry.properties);
      }
    },
    [username]
  );

  return { track };
}

// Helper to get event counts
export function getAnalyticsSummary() {
  const counts: Record<string, number> = {};
  eventQueue.forEach((e) => {
    counts[e.event] = (counts[e.event] || 0) + 1;
  });
  return { totalEvents: eventQueue.length, counts, events: eventQueue.slice(-50) };
}
