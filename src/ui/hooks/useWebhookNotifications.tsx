"use client";

/**
 * useWebhookNotifications Hook
 *
 * Manages webhook notifications from the merchant for order lifecycle updates.
 * Polls the webhook API endpoint for new events and provides them to the UI.
 *
 * In a production scenario, this would use WebSockets or Server-Sent Events
 * for real-time updates instead of polling.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";

// Types matching the webhook API
export interface WebhookEvent {
  id: string;
  type: "order_created" | "order_updated" | "shipping_update";
  receivedAt: string;
  data: OrderEventData | ShippingUpdateData;
}

export interface OrderEventData {
  type: "order";
  checkout_session_id: string;
  order_id?: string;
  permalink_url: string;
  status: "created" | "manual_review" | "confirmed" | "canceled" | "shipped" | "fulfilled";
  refunds: Array<{
    type: "store_credit" | "original_payment";
    amount: number;
  }>;
}

export interface ShippingUpdateData {
  type: "shipping_update";
  checkout_session_id: string;
  order_id: string;
  status: "order_confirmed" | "order_shipped" | "out_for_delivery" | "delivered";
  language: "en" | "es" | "fr";
  subject: string;
  message: string;
  tracking_url?: string;
}

// Notification with display metadata
export interface Notification {
  id: string;
  event: WebhookEvent;
  read: boolean;
  displayedAt: string;
}

interface WebhookNotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isPolling: boolean;
  // Actions
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  setCheckoutSessionId: (sessionId: string | null) => void;
  // For manual refresh
  refreshNotifications: () => Promise<void>;
}

const WebhookNotificationsContext = createContext<WebhookNotificationsContextType | null>(null);

// Polling interval in milliseconds (5 seconds)
const POLL_INTERVAL = 5000;

interface WebhookNotificationsProviderProps {
  children: ReactNode;
  // Optional: initial checkout session ID to filter notifications
  initialCheckoutSessionId?: string;
  // Optional: disable polling (useful for testing)
  enablePolling?: boolean;
}

export function WebhookNotificationsProvider({
  children,
  initialCheckoutSessionId,
  enablePolling = true,
}: WebhookNotificationsProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(
    initialCheckoutSessionId || null
  );
  const [isPolling, setIsPolling] = useState(false);

  // Track last fetch timestamp to only get new events
  const lastFetchRef = useRef<string | null>(null);
  // Track seen event IDs to avoid duplicates
  const seenEventIds = useRef<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    try {
      // Build URL with query params
      const params = new URLSearchParams();
      if (checkoutSessionId) {
        params.set("checkout_session_id", checkoutSessionId);
      }
      if (lastFetchRef.current) {
        params.set("since", lastFetchRef.current);
      }

      const url = `/api/webhooks/acp${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error("[Webhook] Failed to fetch notifications:", response.status);
        return;
      }

      const data = await response.json();
      const newEvents: WebhookEvent[] = data.events || [];

      // Filter out events we've already seen
      const uniqueNewEvents = newEvents.filter((event) => !seenEventIds.current.has(event.id));

      if (uniqueNewEvents.length > 0) {
        // Add new event IDs to seen set
        uniqueNewEvents.forEach((event) => {
          seenEventIds.current.add(event.id);
        });

        // Create notifications from new events
        const newNotifications: Notification[] = uniqueNewEvents.map((event) => ({
          id: `notif_${event.id}`,
          event,
          read: false,
          displayedAt: new Date().toISOString(),
        }));

        setNotifications((prev) => [...newNotifications, ...prev]);

        // Update last fetch timestamp
        if (uniqueNewEvents.length > 0) {
          const latestEvent = uniqueNewEvents.reduce((latest, event) =>
            new Date(event.receivedAt) > new Date(latest.receivedAt) ? event : latest
          );
          lastFetchRef.current = latestEvent.receivedAt;
        }
      }
    } catch (error) {
      console.error("[Webhook] Error fetching notifications:", error);
    }
  }, [checkoutSessionId]);

  // Set up polling
  useEffect(() => {
    if (!enablePolling) return;

    setIsPolling(true);

    // Initial fetch
    fetchNotifications();

    // Set up interval
    const intervalId = setInterval(fetchNotifications, POLL_INTERVAL);

    return () => {
      clearInterval(intervalId);
      setIsPolling(false);
    };
  }, [enablePolling, fetchNotifications]);

  // Actions
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    seenEventIds.current.clear();
    lastFetchRef.current = null;
  }, []);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Compute unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: WebhookNotificationsContextType = {
    notifications,
    unreadCount,
    isPolling,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    setCheckoutSessionId,
    refreshNotifications,
  };

  return (
    <WebhookNotificationsContext.Provider value={value}>
      {children}
    </WebhookNotificationsContext.Provider>
  );
}

export function useWebhookNotifications() {
  const context = useContext(WebhookNotificationsContext);
  if (!context) {
    throw new Error("useWebhookNotifications must be used within a WebhookNotificationsProvider");
  }
  return context;
}

/**
 * Helper to get a human-readable status message
 */
export function getStatusDisplayText(
  status: OrderEventData["status"] | ShippingUpdateData["status"]
): string {
  const statusMap: Record<string, string> = {
    // Order statuses
    created: "Order Created",
    manual_review: "Under Review",
    confirmed: "Order Confirmed",
    canceled: "Order Canceled",
    shipped: "Order Shipped",
    fulfilled: "Order Delivered",
    // Shipping update statuses
    order_confirmed: "Order Confirmed",
    order_shipped: "Order Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
  };
  return statusMap[status] || status;
}

/**
 * Helper to get status badge color
 */
export function getStatusColor(
  status: OrderEventData["status"] | ShippingUpdateData["status"]
): string {
  const colorMap: Record<string, string> = {
    created: "bg-blue-100 text-blue-800",
    manual_review: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    canceled: "bg-red-100 text-red-800",
    shipped: "bg-purple-100 text-purple-800",
    fulfilled: "bg-green-100 text-green-800",
    order_confirmed: "bg-blue-100 text-blue-800",
    order_shipped: "bg-purple-100 text-purple-800",
    out_for_delivery: "bg-orange-100 text-orange-800",
    delivered: "bg-green-100 text-green-800",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
}
