"use client";

import { useEffect, useRef } from "react";
import { Stack, Text, Badge, Flex } from "@kui/foundations-react-external";
import { useACPLog, type ACPEvent, type ACPEventType } from "@/hooks/useACPLog";

/**
 * Get display info for event types
 */
function getEventTypeInfo(type: ACPEventType): {
  label: string;
  color: "green" | "blue" | "purple" | "yellow";
  icon: string;
} {
  switch (type) {
    case "session_create":
      return { label: "CREATE", color: "green", icon: "+" };
    case "session_update":
      return { label: "UPDATE", color: "blue", icon: "↻" };
    case "delegate_payment":
      return { label: "DELEGATE", color: "purple", icon: "🔐" };
    case "session_complete":
      return { label: "COMPLETE", color: "yellow", icon: "✓" };
  }
}

/**
 * Format timestamp to readable time
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Single ACP Event Item in the timeline
 */
function ACPEventItem({ event, isLast }: { event: ACPEvent; isLast: boolean }) {
  const typeInfo = getEventTypeInfo(event.type);
  const isPending = event.status === "pending";
  const isError = event.status === "error";

  return (
    <div className="relative flex gap-4 pb-7">
      {/* Timeline connector */}
      {!isLast && (
        <div
          className="absolute left-[11px] top-[28px] w-[2px] h-[calc(100%-14px)]"
          style={{
            background: isPending
              ? "linear-gradient(to bottom, #404040, transparent)"
              : "#333333",
          }}
        />
      )}

      {/* Timeline dot */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
            ${isPending ? "bg-[#333333] animate-pulse" : isError ? "bg-red-900/50 border border-red-700" : "bg-[#242424] border border-[#404040]"}`}
        >
          {isPending ? (
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
          ) : (
            <span className={isError ? "text-red-400" : "text-gray-400"}>
              {isError ? "!" : typeInfo.icon}
            </span>
          )}
        </div>
      </div>

      {/* Event content */}
      <div className="flex-1 min-w-0">
        {/* Header with badge and time */}
        <Flex justify="between" align="center" className="mb-2">
          <Badge
            kind="solid"
            color={isError ? "red" : typeInfo.color}
            className="text-xs"
          >
            {typeInfo.label}
          </Badge>
          <Text kind="body/regular/sm" className="text-subtle">
            {formatTime(event.timestamp)}
          </Text>
        </Flex>

        {/* Endpoint */}
        <Text kind="body/regular/md" className="text-secondary mb-1.5 font-mono">
          <span className="text-subtle">{event.method}</span>{" "}
          <span className="text-secondary">{event.endpoint}</span>
        </Text>

        {/* Request summary */}
        {event.requestSummary && (
          <Text kind="body/regular/sm" className="text-subtle mb-1.5">
            → {event.requestSummary}
          </Text>
        )}

        {/* Response summary */}
        {event.responseSummary && (
          <Flex align="center" gap="2">
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-medium
                ${isError ? "bg-red-900/30 text-red-400" : "bg-green-900/30 text-green-400"}`}
            >
              {event.statusCode ?? (isError ? "ERR" : "OK")}
            </span>
            <Text
              kind="body/regular/sm"
              className={isError ? "text-red-400" : "text-green-400"}
            >
              {event.responseSummary}
            </Text>
          </Flex>
        )}

        {/* Duration */}
        {event.duration && !isPending && (
          <Text kind="body/regular/sm" className="text-subtle mt-1.5">
            {event.duration}ms
          </Text>
        )}
      </div>
    </div>
  );
}

/**
 * Empty state with nice visual
 */
function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Stack gap="3" align="center" className="max-w-xs text-center">
        {/* Subtle icon placeholder */}
        <div className="w-12 h-12 rounded-xl bg-[#242424] border border-[#333333] flex items-center justify-center mb-2">
          <svg
            className="w-6 h-6 text-subtle"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <Text kind="label/semibold/md" className="text-secondary">
          No active session
        </Text>
        <Text kind="body/regular/sm" className="text-subtle">
          Select a product from the Agent panel to view merchant settings and
          start the ACP flow.
        </Text>
      </Stack>
    </div>
  );
}

/**
 * Active session view with event timeline
 */
function ActiveSession({ events }: { events: ACPEvent[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events.length]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Session header */}
      <div 
        className="border-b border-[#333333] bg-[#1a1a1a]"
        style={{ padding: '32px 32px 16px 32px', marginTop: '16px' }}
      >
        <Flex justify="between" align="center">
          <Text kind="label/semibold/md" className="text-secondary">
            ACP Communication
          </Text>
          <Flex align="center" gap="2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <Text kind="body/regular/sm" className="text-subtle">
              {events.length} request{events.length !== 1 ? "s" : ""}
            </Text>
          </Flex>
        </Flex>
      </div>

      {/* Event timeline */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 pl-8 bg-[#171717]"
      >
        <Stack gap="0">
          {events.map((event, index) => (
            <ACPEventItem
              key={event.id}
              event={event}
              isLast={index === events.length - 1}
            />
          ))}
        </Stack>
      </div>

      {/* Footer with legend */}
      <div 
        className="border-t border-[#333333] bg-[#1a1a1a]"
        style={{ padding: '16px 32px 16px 48px' }}
      >
        <Flex gap="6" wrap="wrap">
          <Flex align="center" gap="2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
            <Text kind="body/regular/sm" className="text-subtle whitespace-nowrap">Create</Text>
          </Flex>
          <Flex align="center" gap="2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
            <Text kind="body/regular/sm" className="text-subtle whitespace-nowrap">Update</Text>
          </Flex>
          <Flex align="center" gap="2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 flex-shrink-0" />
            <Text kind="body/regular/sm" className="text-subtle whitespace-nowrap">Delegate</Text>
          </Flex>
          <Flex align="center" gap="2">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 flex-shrink-0" />
            <Text kind="body/regular/sm" className="text-subtle whitespace-nowrap">Complete</Text>
          </Flex>
        </Flex>
      </div>
    </div>
  );
}

/**
 * Right panel showing merchant/retailer view with ACP communication log
 */
export function BusinessPanel() {
  const { state } = useACPLog();

  return (
    <section
      className="flex-1 flex flex-col h-full overflow-hidden bg-[#1e1e1e] border border-[#333333] rounded-2xl"
      aria-label="Merchant Panel"
    >
      {/* Clean header with badge - matches Agent panel */}
      <div className="px-6 pt-5 pb-6 border-b border-[#333333]">
        <Badge kind="solid" color="purple">
          Merchant Server
        </Badge>
      </div>

      {/* Content - either empty state or active session */}
      {state.events.length === 0 ? (
        <EmptyState />
      ) : (
        <ActiveSession events={state.events} />
      )}
    </section>
  );
}
