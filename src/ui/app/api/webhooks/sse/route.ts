/**
 * SSE Endpoint for Real-Time Webhook Events
 *
 * Provides Server-Sent Events (SSE) stream for webhook notifications.
 * Clients subscribe once and receive events pushed immediately when
 * merchants POST webhooks - no polling required.
 *
 * Production-like architecture:
 * - Client opens SSE connection
 * - When merchant POSTs webhook, event is pushed to all connected clients
 * - Client receives notification instantly
 */

import { webhookEmitter, WebhookEvent } from "@/lib/webhook-emitter";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const encoder = new TextEncoder();

  // Create a readable stream that pushes webhook events
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const connectMessage = `data: ${JSON.stringify({ type: "connected", timestamp: new Date().toISOString() })}\n\n`;
      controller.enqueue(encoder.encode(connectMessage));

      // Subscribe to webhook events
      const handleWebhook = (event: WebhookEvent) => {
        try {
          const message = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch {
          // Client disconnected, will be cleaned up
        }
      };

      // Subscribe and store unsubscribe function
      const unsubscribe = webhookEmitter.subscribe(handleWebhook);

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `data: ${JSON.stringify({ type: "heartbeat", timestamp: new Date().toISOString() })}\n\n`;
          controller.enqueue(encoder.encode(heartbeat));
        } catch {
          // Connection closed
          clearInterval(heartbeatInterval);
          unsubscribe();
        }
      }, 30000);

      // Cleanup on stream close
      // Note: This cleanup is approximate - the stream may be closed by the client
      // and the cleanup will happen when the next heartbeat or event fails
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
